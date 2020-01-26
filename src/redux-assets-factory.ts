import { ResourceState, IdentifierKey, Gateway, Entity, Operation, ResourceAction, ResourceIntent, Identifier, Message } from './redux-typings';
import { makeDefaultMessageText } from './utils';

const initialState: ResourceState = {
  items: [],
  isCreating: false,
  isReadingBlindly: false,
  reading: [],
  updating: [],
  deleting: [],
  finishingLogs: [],
  currentMessage: null,
};

export type ResourceToolParams = {
  name: string;
  idKey: IdentifierKey;
  gateway: Gateway;
  makeMessageText?: (relating: Entity | Entity[], operation: Operation, isError: boolean) => string;
};
export default function makeReduxAssets(params: ResourceToolParams): any {
  const {
    name,
    idKey,
    gateway,
    makeMessageText = makeDefaultMessageText,
  } = params;

  const actionType = `RESOURCE_TOOlKIT__${name}`;

  type BoundResourceActon = ResourceAction<typeof actionType>;
  const makeAction = (payload: ResourceIntent): BoundResourceActon => {
    return {
      type: actionType,
      payload,
    };
  };

  type GatewayIdentifying = Identifier | Identifier[];
  type GatewayContent = Entity | Entity[];
  const plainActions = {
    setReading: (identifying: GatewayIdentifying = null) => makeAction({
      operation: 'READ',
      step: 'DOING',
      identifying,
    }),
    setRead: (identifying?: GatewayIdentifying, content?: GatewayContent) => makeAction({
      operation: 'READ',
      step: 'SUCCESS',
      identifying,
      content,
    }),
    setReadError: (identifying?: GatewayIdentifying, causedByError?: Error) => makeAction({
      operation: 'READ',
      step: 'ERROR',
      content: causedByError,
      identifying,
    }),
    clearItems: () => makeAction({
      operation: 'CLEAR_ITEMS',
      step: 'SUCCESS',
    }),
    clearCurrentMessage: () => makeAction({
      operation: 'CLEAR_CURRENT_MESSAGE',
      step: 'SUCCESS',
    }),
  };

  type BoundDispatch = (action: BoundResourceActon) => void;

  const actions = {
    ...plainActions,
    readOne: (identifying: Identifier = null, ...args: any[]) => async (dispatch: BoundDispatch) => {
      dispatch(plainActions.setReading(identifying));
      try {
        const content = await gateway.readOne(...args);
        dispatch(plainActions.setRead(identifying, content));
      } catch (error) {
        dispatch(plainActions.setReadError(identifying, error));
      }
    },
    readMany: (identifying: Identifier[] = null, ...args: any[]) => async (dispatch: BoundDispatch) => {
      dispatch(plainActions.setReading(identifying));
      try {
        const content = await gateway.readMany(...args);
        dispatch(plainActions.setRead(identifying, content));
      } catch (error) {
        dispatch(plainActions.setReadError(identifying, error));
      }
    },
    readAll: (...args: any[]) => async (dispatch: BoundDispatch) => {
      dispatch(plainActions.setReading());
      try {
        const content = await gateway.readMany(...args);
        dispatch(plainActions.clearItems());
        dispatch(plainActions.setRead(null, content));
      } catch (error) {
        dispatch(plainActions.setReadError(null, error));
      }
    },
  };

  const reducer = (state: ResourceState = initialState, action: BoundResourceActon): ResourceState => {
    if (!action || action.type !== actionType) {
      return state;
    }

    const { payload } = action;
    const {
      operation,
      step,
      identifying,
      content,
    } = payload;

    const isLoading = step === 'DOING';
    const isSuccess = step === 'SUCCESS';
    const isError = step === 'ERROR';
    const isFinished = isSuccess || isError;

    const updating = { ...state };

    if (operation === 'READ') {
      if (isLoading) {
        if (Array.isArray(identifying)) {
          updating.reading = [...state.reading, ...identifying];
        } else if (identifying) {
          updating.reading = [...state.reading, identifying];
        } else {
          updating.isReadingBlindly = true;
        }
      }

      if (isSuccess) {
        if (Array.isArray(content)) {
          updating.items = [...state.items, ...content];
        } else if (content) {
          updating.items = [...state.items, content];
        }
      }

      if (isFinished) {
        if (Array.isArray(identifying)) {
          updating.reading = state.reading.filter(id => !identifying.includes(id));
        } else if (identifying) {
          updating.reading = state.reading.filter(id => id !== identifying);
        } else {
          updating.isReadingBlindly = false;
        }
      }
    }

    if (operation === 'CLEAR_ITEMS') {
      updating.items = [];
    } else if (operation === 'CLEAR_CURRENT_MESSAGE') {
      updating.currentMessage = null;
    } else if (isFinished) {
      const message: Message = {
        text: makeMessageText(content, operation, isError),
        causedByError: content instanceof Error ? content : null,
        isError,
      };
      updating.finishingLogs = [...state.finishingLogs, message];
      updating.currentMessage = message;
    }

    return updating;
  };

  return {
    initialState: { ...initialState },
    actionType,
    makeAction,
    actions,
    reducer,
  };
}

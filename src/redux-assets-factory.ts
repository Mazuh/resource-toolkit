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

  const namespacedName = `RESOURCE_TOOlKIT__${name}`;

  type BoundResourceActon = ResourceAction<typeof namespacedName>;
  const makeAction = (payload: ResourceIntent): BoundResourceActon => {
    return {
      type: namespacedName,
      payload,
    };
  };

  type GatewayIdentifying = Identifier | Identifier[];
  type GatewayContent = Entity | Entity[];
  const plainActions = {
    setReading: (identifying?: GatewayIdentifying) => makeAction({
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
    clearCurrentMessage: () => makeAction({
      operation: 'CLEAR_CURRENT_MESSAGE',
      step: 'SUCCESS',
    }),
  };

  type BoundDispatch = (action: BoundResourceActon) => void;

  const actions = {
    ...plainActions,
    fetchOne: (identifying: Identifier) => async (dispatch: BoundDispatch) => {
      dispatch(plainActions.setReading(identifying));
      try {
        const content = await gateway.fetchOne();
        dispatch(plainActions.setRead(identifying, content));
      } catch (error) {
        dispatch(plainActions.setReadError(identifying, error));
      }
    },
    fetchMany: () => async (dispatch: BoundDispatch) => {
      dispatch(plainActions.setReading());
      try {
        const content = await gateway.fetchMany();
        dispatch(plainActions.setRead(null, content));
      } catch (error) {
        dispatch(plainActions.setReadError(null, error));
      }
    },
  };

  const reducer = (state: ResourceState = initialState, action: BoundResourceActon): ResourceState => {
    if (!action || action.type !== namespacedName) {
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

    /*
    if (operation === 'CREATE') {
      if (isLoading) {
        updating.isCreating = true;
      }

      if (isSuccess) {
        if (Array.isArray(content)) {
          updating.items = [...state.items, ...content];
        } else if (content) {
          updating.items = [...state.items, content];
        }
      }

      if (isFinished) {
        updating.isCreating = false;
        updating.currentMessage = { text: makeMessageText(content, operation, isError), isError };
      }
    }
    */

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

    /*
    if (operation === 'UPDATE') {
      if (isLoading) {
        if (Array.isArray(identifying)) {
          updating.updating = [...state.updating, ...identifying];
        } else if (identifying) {
          updating.updating = [...state.updating, identifying];
        }
      }

      if (isSuccess) {
        if (Array.isArray(identifying)) {
          updating.items = state.items.map((existing) => {
            const matching = content.find(it => it[idKey] === existing[idKey]);
            if (!matching) {
              return existing;
            }

            return { ...existing, ...matching };
          });
        } else if (identifying) {
          updating.items = state.items.map(it => it[idKey] === identifying
            ? { ...it, ...content }
            : it
          );
        }
      }

      if (isFinished) {
        if (Array.isArray(identifying)) {
          updating.updating = state.updating.filter(id => !identifying.includes(id));
        } else if (identifying) {
          updating.updating = state.updating.filter(id => id !== identifying);
        }
      }
    }

    if (operation === 'DELETE') {
      if (isLoading) {
        if (Array.isArray(identifying)) {
          updating.deleting = [...state.deleting, ...identifying];
        } else if (identifying) {
          updating.deleting = [...state.deleting, identifying];
        }
      }

      if (isSuccess) {
        if (Array.isArray(identifying)) {
          updating.items = state.items.filter(it => !identifying.includes(it[idKey]));
        } else if (identifying) {
          updating.items = state.items.filter(it => it[idKey] !== identifying);
        }
      }

      if (isFinished) {
        if (Array.isArray(identifying)) {
          updating.deleting = state.deleting.filter(id => !identifying.includes(id));
        } else if (identifying) {
          updating.deleting = state.deleting.filter(id => id !== identifying);
        }
      }
    }
    */

    if (operation === 'CLEAR_CURRENT_MESSAGE') {
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
    name: namespacedName,
    initialState: { ...initialState },
    makeAction,
    actions,
    reducer,
  };
}

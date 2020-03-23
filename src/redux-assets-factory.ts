import {
  ResourceState,
  IdentifierKey,
  Gateway,
  Entity,
  Operation,
  ResourceAction,
  ResourceIntent,
  Identifier,
  Message,
  RelatedType,
  RelatedToOne,
  RelatedToMany,
  DictKind,
  EntityWithMeta,
  EMPTY_INITIAL_STATE,
} from './redux-typings';
import {
  makeDefaultMessageText,
  blockNonIdentifying,
  blockNonIdentifier,
  blockNonDataWithMeta,
  blockNonEntityFn,
  blockNonEntitiesFn,
  minimalDelayedHOC,
} from '../src/utils';

export type ResourceToolParams = {
  name: string;
  idKey: IdentifierKey;
  relatedKeys: { [key: string]: RelatedType },
  gateway: Gateway;
  expectAllMeta?: boolean,
  makeMessageText?: (relating: Entity | Entity[], operation: Operation, isError: boolean) => string;
};
export default function makeReducerAssets(params: ResourceToolParams): any {
  const {
    name,
    idKey,
    gateway,
    relatedKeys = {},
    expectAllMeta = false,
    makeMessageText = makeDefaultMessageText,
  } = params;

  const actionType = `RESOURCE_TOOLKIT__${name}`;

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
    setCreating: () => makeAction({
      operation: 'CREATE',
      step: 'DOING',
    }),
    setReading: (identifying: GatewayIdentifying = null) => makeAction({
      operation: 'READ',
      step: 'DOING',
      identifying,
    }),
    setUpdating: (identifying: GatewayIdentifying) => makeAction({
      operation: 'UPDATE',
      step: 'DOING',
      identifying,
    }),
    setDeleting: (identifying: GatewayIdentifying) => makeAction({
      operation: 'DELETE',
      step: 'DOING',
      identifying,
    }),
    setRelatedLoading: (ownerIdentifier: Identifier, relationshipKey: string) => makeAction({
      operation: 'RELATED',
      step: 'DOING',
      identifying: ownerIdentifier,
      relationshipKey,
    }),
    setRead: (identifying?: GatewayIdentifying, content?: GatewayContent) => makeAction({
      operation: 'READ',
      step: 'SUCCESS',
      identifying,
      content,
    }),
    setUpdated: (identifying: GatewayIdentifying, content: GatewayContent) => makeAction({
      operation: 'UPDATE',
      step: 'SUCCESS',
      identifying,
      content,
    }),
    setCreated: (content: GatewayContent) => makeAction({
      operation: 'CREATE',
      step: 'SUCCESS',
      content,
    }),
    setDeleted: (identifying: GatewayIdentifying) => makeAction({
      operation: 'DELETE',
      step: 'SUCCESS',
      identifying,
    }),
    setRelatedCreated: (ownerIdentifier: Identifier, relationshipKey: string, content: GatewayContent) => makeAction({
      operation: 'RELATED_CREATED',
      step: 'SUCCESS',
      identifying: ownerIdentifier,
      relationshipKey,
      content,
    }),
    setRelatedRead: (ownerIdentifier: Identifier, relationshipKey: string, content: GatewayContent) => makeAction({
      operation: 'RELATED_READ',
      step: 'SUCCESS',
      identifying: ownerIdentifier,
      relationshipKey,
      content,
    }),
    setRelatedUpdated: (ownerIdentifier: Identifier, relationshipKey: string, content: GatewayContent) => makeAction({
      operation: 'RELATED_UPDATED',
      step: 'SUCCESS',
      identifying: ownerIdentifier,
      relationshipKey,
      content,
    }),
    setRelatedDeleted: (ownerIdentifier: Identifier, relationshipKey: string, content: GatewayContent) => makeAction({
      operation: 'RELATED_DELETED',
      step: 'SUCCESS',
      identifying: ownerIdentifier,
      relationshipKey,
      content,
    }),
    setCreateError: (causedByError?: Error) => makeAction({
      operation: 'CREATE',
      step: 'ERROR',
      content: causedByError,
    }),
    setReadError: (identifying?: GatewayIdentifying, causedByError?: Error) => makeAction({
      operation: 'READ',
      step: 'ERROR',
      content: causedByError,
      identifying,
    }),
    setUpdateError: (identifying: GatewayIdentifying, causedByError?: Error) => makeAction({
      operation: 'UPDATE',
      step: 'ERROR',
      content: causedByError,
      identifying,
    }),
    setDeleteError: (identifying?: GatewayIdentifying, causedByError?: Error) => makeAction({
      operation: 'DELETE',
      step: 'ERROR',
      content: causedByError,
      identifying,
    }),
    setRelatedError: (ownerIdentifier: Identifier, relationshipKey: string, causedByError?: Error) => makeAction({
      operation: 'RELATED',
      step: 'ERROR',
      content: causedByError,
      identifying: ownerIdentifier,
      relationshipKey,
    }),
    setMeta: (meta: DictKind) => makeAction({
      operation: 'SET_META',
      step: 'SUCCESS',
      content: meta,
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

  const blockNonEntity = blockNonEntityFn(idKey);
  const blockNonEntities = blockNonEntitiesFn(idKey);

  const actions = {
    ...plainActions,
    create: (...args: any[]) => async (dispatch: BoundDispatch) => {
      dispatch(plainActions.setCreating());
      const gracefullyDispatch = minimalDelayedHOC(dispatch);
      try {
        const content = await gateway.create(...args);
        blockNonEntity(content);

        gracefullyDispatch(plainActions.setCreated(content));
      } catch (error) {
        gracefullyDispatch(plainActions.setCreateError(error));
      }
    },
    readOne: (identifier: Identifier, ...args: any[]) => async (dispatch: BoundDispatch) => {
      blockNonIdentifier(identifier);

      dispatch(plainActions.setReading(identifier));

      const gracefullyDispatch = minimalDelayedHOC(dispatch);
      try {
        const content = await gateway.fetchOne(identifier, ...args);
        blockNonEntity(content);

        gracefullyDispatch(plainActions.setRead(identifier, content));
      } catch (error) {
        gracefullyDispatch(plainActions.setReadError(identifier, error));
      }
    },
    readMany: (identifers: Identifier[] = null, ...args: any[]) => async (dispatch: BoundDispatch) => {
      if (identifers !== null) {
        blockNonIdentifying(identifers);
      }

      dispatch(plainActions.setReading(identifers));

      const gracefullyDispatch = minimalDelayedHOC(dispatch);
      try {
        const content = await gateway.fetchMany(identifers, ...args);
        blockNonEntities(content);

        gracefullyDispatch(plainActions.setRead(identifers, content));
      } catch (error) {
        gracefullyDispatch(plainActions.setReadError(identifers, error));
      }
    },
    readAll: (...args: any[]) => async (dispatch: BoundDispatch) => {
      dispatch(plainActions.setReading());

      const gracefullyDispatch = minimalDelayedHOC(dispatch);
      try {
        const payload = await gateway.fetchMany(null, ...args);
        if (expectAllMeta) {
          blockNonDataWithMeta(payload);

          const { data, meta } = (payload as EntityWithMeta);
          blockNonEntities(data);

          dispatch(plainActions.clearItems());
          dispatch(plainActions.setMeta(meta));
          gracefullyDispatch(plainActions.setRead(null, data));
        } else {
          blockNonEntities(payload);

          dispatch(plainActions.clearItems());
          gracefullyDispatch(plainActions.setRead(null, payload));
        }
      } catch (error) {
        gracefullyDispatch(plainActions.setReadError(null, error));
      }
    },
    update: (identifier: Identifier, ...args: any[]) => async (dispatch: BoundDispatch) => {
      blockNonIdentifier(identifier);

      dispatch(plainActions.setUpdating(identifier));

      const gracefullyDispatch = minimalDelayedHOC(dispatch);
      try {
        const content = await gateway.update(identifier, ...args);
        blockNonEntity(content);

        gracefullyDispatch(plainActions.setUpdated(identifier, content));
      } catch (error) {
        gracefullyDispatch(plainActions.setUpdateError(identifier, error));
      }
    },
    delete: (identifier: Identifier, ...args: any[]) => async (dispatch: BoundDispatch) => {
      blockNonIdentifier(identifier);

      dispatch(plainActions.setDeleting(identifier));

      const gracefullyDispatch = minimalDelayedHOC(dispatch);
      try {
        await gateway.delete(identifier, ...args);
        gracefullyDispatch(plainActions.setDeleted(identifier));
      } catch (error) {
        gracefullyDispatch(plainActions.setDeleteError(identifier, error));
      }
    },
    readRelated: (ownerIdentifier: Identifier, relationshipKey: string, ...args: any[]) => async (dispatch: BoundDispatch) => {
      blockNonIdentifier(ownerIdentifier);

      dispatch(plainActions.setRelatedLoading(ownerIdentifier, relationshipKey));
      const gracefullyDispatch = minimalDelayedHOC(dispatch);
      try {
        const content = await gateway.fetchRelated(ownerIdentifier, relationshipKey, ...args);
        gracefullyDispatch(plainActions.setRelatedRead(ownerIdentifier, relationshipKey, content));
      } catch (error) {
        gracefullyDispatch(plainActions.setRelatedError(ownerIdentifier, relationshipKey, error));
      }
    },
    createRelated: (ownerIdentifier: Identifier, relationshipKey: string, ...args: any[]) => async (dispatch: BoundDispatch) => {
      blockNonIdentifier(ownerIdentifier);

      dispatch(plainActions.setRelatedLoading(ownerIdentifier, relationshipKey));

      const gracefullyDispatch = minimalDelayedHOC(dispatch);
      try {
        const content = await gateway.createRelated(ownerIdentifier, relationshipKey, ...args);
        gracefullyDispatch(plainActions.setRelatedCreated(ownerIdentifier, relationshipKey, content));
      } catch (error) {
        gracefullyDispatch(plainActions.setRelatedError(ownerIdentifier, relationshipKey, error));
      }
    },
    updateRelated: (ownerIdentifier: Identifier, relationshipKey: string, ...args: any[]) => async (dispatch: BoundDispatch) => {
      blockNonIdentifier(ownerIdentifier);

      dispatch(plainActions.setRelatedLoading(ownerIdentifier, relationshipKey));

      const gracefullyDispatch = minimalDelayedHOC(dispatch);
      try {
        const content = await gateway.updateRelated(ownerIdentifier, relationshipKey, ...args);
        gracefullyDispatch(plainActions.setRelatedUpdated(ownerIdentifier, relationshipKey, content));
      } catch (error) {
        gracefullyDispatch(plainActions.setRelatedError(ownerIdentifier, relationshipKey, error));
      }
    },
    deleteRelated: (ownerIdentifier: Identifier, relationshipKey: string, ...args: any[]) => async (dispatch: BoundDispatch) => {
      blockNonIdentifier(ownerIdentifier);

      dispatch(plainActions.setRelatedLoading(ownerIdentifier, relationshipKey));

      const gracefullyDispatch = minimalDelayedHOC(dispatch);
      try {
        const content = await gateway.deleteRelated(ownerIdentifier, relationshipKey, ...args);
        gracefullyDispatch(plainActions.setRelatedDeleted(ownerIdentifier, relationshipKey, content));
      } catch (error) {
        gracefullyDispatch(plainActions.setRelatedError(ownerIdentifier, relationshipKey, error));
      }
    },
  };

  const initialState = EMPTY_INITIAL_STATE;

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
      relationshipKey,
    } = payload;

    const isLoading = step === 'DOING';
    const isSuccess = step === 'SUCCESS';
    const isError = step === 'ERROR';
    const isFinished = isSuccess || isError;

    const updating = { ...state };

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
      }
    }

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
        const items = Array.isArray(content) ? content : [content];

        updating.items = [...state.items, ...items];

        const relatedValuesKeys = Object.keys(relatedKeys);
        if (relatedValuesKeys.length > 0) {
          items.forEach((item: Entity) => {
            const id = item[idKey];
            updating.relatedsTo[id] = relatedValuesKeys.reduce((acc, key) => {
              const valueType = relatedKeys[key];
              if (valueType === 'one') {
                acc[key] = {
                  item: {},
                  isLoading: false,
                } as RelatedToOne;
              } else if (valueType === 'many') {
                acc[key] = {
                  items: [],
                  isLoading: false,
                } as RelatedToMany;
              }
              return acc;
            }, {});
          });
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

    if (operation === 'UPDATE' && !Array.isArray(identifying) && identifying) {
      if (isLoading) {
        updating.updating = [...state.updating, identifying];
      }

      if (isSuccess) {
        updating.items = state.items.map(it => it[idKey] === identifying
          ? { ...it, ...content }
          : it
        );
      }

      if (isFinished) {
        updating.updating = state.updating.filter(id => id !== identifying);
      }
    }

    if (operation === 'DELETE' && !Array.isArray(identifying) && identifying) {
      if (isLoading) {
        updating.deleting = [...state.deleting, identifying];
      }

      if (isSuccess) {
        updating.items = state.items.filter(it => it[idKey] !== identifying);
      }

      if (isFinished) {
        updating.deleting = state.deleting.filter(id => id !== identifying);
      }
    }

    if (operation.startsWith('RELATED') && !Array.isArray(identifying) && updating.relatedsTo[identifying]) {
      updating.relatedsTo = { ...state.relatedsTo };
      updating.relatedsTo[identifying] = { ...updating.relatedsTo[identifying] };
      updating.relatedsTo[identifying][relationshipKey] = { ...updating.relatedsTo[identifying][relationshipKey] };

      if (operation === 'RELATED' && isLoading) {
        updating.relatedsTo[identifying][relationshipKey].isLoading = true;
      }

      if (isSuccess && !(content instanceof Error)) {
        if (operation === 'RELATED_CREATED' && !Array.isArray(content)) {
          const items = (state.relatedsTo[identifying][relationshipKey] as RelatedToMany).items;
          (updating.relatedsTo[identifying][relationshipKey] as RelatedToMany).items = [
            ...items,
            content,
          ];
        }

        if (operation === 'RELATED_READ') {
          if (Array.isArray(content)) {
            (updating.relatedsTo[identifying][relationshipKey] as RelatedToMany).items = content;
          } else {
            (updating.relatedsTo[identifying][relationshipKey] as RelatedToOne).item = content;
          }
        }

        if (operation === 'RELATED_UPDATED' && !Array.isArray(content)) {
          const items = (state.relatedsTo[identifying][relationshipKey] as RelatedToMany).items;
          (updating.relatedsTo[identifying][relationshipKey] as RelatedToMany).items = items.map(
            it => it[idKey] === content[idKey] ? { ...it, ...content } : it
          );
        }

        if (operation === 'RELATED_DELETED' && !Array.isArray(content)) {
          const items = (state.relatedsTo[identifying][relationshipKey] as RelatedToMany).items;
          (updating.relatedsTo[identifying][relationshipKey] as RelatedToMany).items = items.filter(
            it => it[idKey] !== content[idKey]
          );
        }
      }

      if (isFinished) {
        updating.relatedsTo[identifying][relationshipKey].isLoading = false;
      }
    }

    const isDoingSomethingOnItself = updating.isCreating
      || updating.isReadingBlindly
      || updating.reading.length > 0
      || updating.updating.length > 0
      || updating.deleting.length > 0;
    const isDoingSomethingOnRelateds = Object.keys(updating.relatedsTo).some((id) => {
      return Object.keys(updating.relatedsTo[id]).some((relatedKey) => {
        return updating.relatedsTo[id][relatedKey].isLoading;
      });
    });
    updating.isLoading = isDoingSomethingOnItself || isDoingSomethingOnRelateds;

    if (operation === 'SET_META') {
      updating.meta = content;
    } else if (operation === 'CLEAR_ITEMS') {
      updating.items = [];
      updating.meta = {};
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
    initialState,
    actionType,
    makeAction,
    actions,
    reducer,
  };
}

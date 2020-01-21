import { ResourceState, IdentifierKey, Gateway, Entity, Operation, ResourceAction } from './redux-typings';
import { makeDefaultMessageText } from './utils';

const initialState: ResourceState = {
  items: [],
  isCreating: false,
  isReadingBlind: false,
  reading: [],
  updating: [],
  deleting: [],
  lastMessage: null,
};

export type ResourceToolParams = {
  name: string;
  idKey: IdentifierKey;
  gateway: Gateway;
  makeMessageText?: (relating: Entity | Entity[], operation: Operation, isError: boolean) => string;
};
export default function makeReduxAssets(params: ResourceToolParams): any {
  const name = `RESOURCE_TOOlKIT__${params.name}`;
  const { makeMessageText = makeDefaultMessageText } = params;

  return {
    name,
    initialState,
    reducer: (state: ResourceState, action: ResourceAction<typeof name>): ResourceState => {
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
          updating.lastMessage = { text: makeMessageText(content, operation, isError), isError };
        }
      }

      if (operation === 'READ') {
        if (isLoading) {
          if (Array.isArray(identifying)) {
            updating.reading = [...state.reading, ...identifying];
          } else if (identifying) {
            updating.reading = [...state.reading, identifying];
          } else {
            updating.isReadingBlind = true;
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
            updating.isReadingBlind = false;
          }

          updating.lastMessage = { text: makeMessageText(content, operation, isError), isError };
        }
      }

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
              const matching = content.find(it => it[params.idKey] === existing[params.idKey]);
              if (!matching) {
                return existing;
              }

              return { ...existing, ...matching };
            });
          } else if (identifying) {
            updating.items = state.items.map(it => it[params.idKey] === identifying
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

          updating.lastMessage = { text: makeMessageText(content, operation, isError), isError };
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
            updating.items = state.items.filter(it => !identifying.includes(it[params.idKey]));
          } else if (identifying) {
            updating.items = state.items.filter(it => it[params.idKey] !== identifying);
          }
        }

        if (isFinished) {
          if (Array.isArray(identifying)) {
            updating.deleting = state.deleting.filter(id => !identifying.includes(id));
          } else if (identifying) {
            updating.deleting = state.deleting.filter(id => id !== identifying);
          }

          updating.lastMessage = { text: makeMessageText(content, operation, isError), isError };
        }
      }

      return updating;
    },
  };
}

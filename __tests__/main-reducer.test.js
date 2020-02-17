import { makeReduxAssets } from '../src';
import { MANY_RELATED, ONE_RELATED } from '../src/redux-typings';

const defaultState = {
  items: [],
  isCreating: false,
  isReadingBlindly: false,
  reading: [],
  updating: [],
  deleting: [],
  finishingLogs: [],
  currentMessage: null,
  relatedsTo: {},
};

describe('reducer factory: commons', () => {
  const userResource = makeReduxAssets({ name: 'USER' });

  it('has initial state', () => {
    expect(userResource.reducer()).toEqual(defaultState);
  });

  it('fallbacks as no-op if action is unknown by the resource lib', () => {
    const action = {
      type: 'invalid random type',
    };

    expect(userResource.reducer(defaultState, action)).toEqual(defaultState);
  });

  it('handles some error action by at least storing its log', () => {
    const error = new Error('Weird random programming error at reading');

    const action = userResource.actions.setReadError(null, error);

    const existingMessage = {
      text: 'Existing success message',
      isError: false,
      causedByError: null,
    };
    const expectedErrorMessage = {
      text: 'Failed to fetch data.',
      causedByError: error,
      isError: true,
    };
    const previousState = {
      ...defaultState,
      isReadingBlindly: true,
      finishingLogs: [existingMessage],
    };
    const expectedCurrentState = {
      ...defaultState,
      isReadingBlindly: false,
      finishingLogs: [existingMessage, expectedErrorMessage],
      currentMessage: expectedErrorMessage,
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles error action, defensively rejects non-Error types', () => {
    const error = { message: 'am I really an error? my programmer should explicit throw so' };
    const expectedMessage = {
      causedByError: null,
      isError: true,
      text: 'Failed to update.',
    };

    const action = userResource.actions.setUpdateError(42, error);

    const previousState = {
      ...defaultState,
    };
    const expectedCurrentState = {
      ...defaultState,
      finishingLogs: [expectedMessage],
      currentMessage: expectedMessage,
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('supports adapter of error messages', () => {
    const adapter = jest.fn(() => 'Any custom message here!');

    const customResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      makeMessageText: adapter,
    });

    const error = new Error('Weird random programming error at reading');
    const action = customResource.actions.setReadError([1, 2], error);

    const expectedErrorMessage = {
      text: 'Any custom message here!',
      causedByError: error,
      isError: true,
    };
    const previousState = {
      ...defaultState,
      reading: [1, 2],
    };
    const expectedCurrentState = {
      ...defaultState,
      reading: [],
      finishingLogs: [expectedErrorMessage],
      currentMessage: expectedErrorMessage,
    };

    expect(customResource.reducer(previousState, action)).toEqual(expectedCurrentState);

    const isError = true;
    expect(adapter).toBeCalledWith(error, 'READ', isError);
  });

  it('handles clear message action', () => {
    const action = userResource.actions.clearCurrentMessage();

    const previousState = {
      ...defaultState,
      finishingLogs: ['One', 'Two', 'Three'],
      currentMessage: 'Three',
    };
    const expectedCurrentState = {
      ...defaultState,
      finishingLogs: ['One', 'Two', 'Three'],
      currentMessage: null,
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles items clearing', () => {
    const action = userResource.actions.clearItems();

    const previousState = { ...defaultState, items: ['a', 'b', 'c'] };
    const expectedCurrentState = { ...defaultState, items: [] };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });
});

describe('reducer factory: create', () => {
  const userResource = makeReduxAssets({ name: 'USER', idKey: 'id' });

  it('handles loading action for creating', () => {
    const action = userResource.actions.setCreating();

    const previousState = { ...defaultState };
    const expectedCurrentState = {
      ...defaultState,
      isCreating: true,
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles success action for creating', () => {
    const expectedMessage = {
      causedByError: null,
      isError: false,
      text: 'Successfully created.',
    };

    const action = userResource.actions.setCreated({
      id: 42,
      name: 'Marcell',
      lastName: 'Guilherme',
    });

    const previousState = {
      ...defaultState,
      isCreating: true,
      items: [{ id: 23, name: 'Jane', lastName: 'Doe' }],
    };
    const expectedCurrentState = {
      ...defaultState,
      isCreating: false,
      items: [
        { id: 23, name: 'Jane', lastName: 'Doe' },
        { id: 42, name: 'Marcell', lastName: 'Guilherme' },
      ],
      currentMessage: expectedMessage,
      finishingLogs: [expectedMessage],
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles error action for creating', () => {
    const error = new Error('No creation here');
    const expectedMessage = {
      causedByError: error,
      isError: true,
      text: 'Failed to create.',
    };

    const action = userResource.actions.setCreateError(error);

    const previousState = {
      ...defaultState,
      isCreating: true,
      items: [{ id: 23, name: 'Jane', lastName: 'Doe' }],
    };
    const expectedCurrentState = {
      ...defaultState,
      isCreating: false,
      items: [{ id: 23, name: 'Jane', lastName: 'Doe' }],
      currentMessage: expectedMessage,
      finishingLogs: [expectedMessage],
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });
});

describe('reducer factory: read', () => {
  const userResource = makeReduxAssets({ name: 'USER', idKey: 'id' });

  it('handles loading action for reading blindly', () => {
    const action = userResource.actions.setReading();

    const previousState = { ...defaultState };
    const expectedCurrentState = {
      ...defaultState,
      isReadingBlindly: true,
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles success action for creating many', () => {
    const expectedMessage = {
      causedByError: null,
      isError: false,
      text: 'Successfully created. Related to 2 items.',
    };

    const action = userResource.actions.setCreated([
      {
        id: 42,
        name: 'Marcell',
        lastName: 'Guilherme',
      },
      {
        id: 12,
        name: 'Wallys',
        lastName: 'Lima',
      },
    ]);

    const previousState = {
      ...defaultState,
      isCreating: true,
      items: [{ id: 23, name: 'Jane', lastName: 'Doe' }],
    };
    const expectedCurrentState = {
      ...defaultState,
      isCreating: false,
      items: [
        { id: 23, name: 'Jane', lastName: 'Doe' },
        { id: 42, name: 'Marcell', lastName: 'Guilherme' },
        { id: 12, name: 'Wallys', lastName: 'Lima' },
      ],
      currentMessage: expectedMessage,
      finishingLogs: [expectedMessage],
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles success action for reading blindly', () => {
    const expectedReadData = [
      {
        id: 69,
        firstName: 'Marcell',
        lastName: 'Guilherme',
      },
      {
        id: 42,
        firstName: 'Crash',
        lastName: 'Bandicoot',
      },
    ];
    const expectedMessage = {
      causedByError: null,
      isError: false,
      text: 'Successfully fetched data. Related to 2 items.',
    };

    const action = userResource.actions.setRead(null, expectedReadData);

    const previousState = {
      ...defaultState,
      isReadingBlindly: true,
    };
    const expectedCurrentState = {
      ...defaultState,
      isReadingBlindly: false,
      items: expectedReadData,
      currentMessage: expectedMessage,
      finishingLogs: [expectedMessage],
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });
});

describe('reducer factory: update', () => {
  const userResource = makeReduxAssets({ name: 'USER', idKey: 'id' });

  it('handles loading action for updating', () => {
    const action = userResource.actions.setUpdating(42);

    const previousState = {
      ...defaultState,
      updating: [3],
    };
    const expectedCurrentState = {
      ...defaultState,
      updating: [3, 42],
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles success action for updating', () => {
    const expectedMessage = {
      causedByError: null,
      isError: false,
      text: 'Successfully updated.',
    };

    const action = userResource.actions.setUpdated(42, {
      id: 42,
      name: 'Marcell',
      lastName: 'Guilherme',
    });

    const previousState = {
      ...defaultState,
      updating: [23, 42],
      items: [
        { id: 23, name: 'Jane', lastName: 'Doe' },
        { id: 42, name: 'John', lastName: 'Doe' },
      ],
    };
    const expectedCurrentState = {
      ...defaultState,
      updating: [23],
      items: [
        { id: 23, name: 'Jane', lastName: 'Doe' },
        { id: 42, name: 'Marcell', lastName: 'Guilherme' },
      ],
      currentMessage: expectedMessage,
      finishingLogs: [expectedMessage],
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles error action for updating', () => {
    const error = new Error('Weird random programming error at reading');
    const expectedMessage = {
      causedByError: error,
      isError: true,
      text: 'Failed to update.',
    };

    const action = userResource.actions.setUpdateError(42, error);

    const previousState = {
      ...defaultState,
      updating: [23, 42],
    };
    const expectedCurrentState = {
      ...defaultState,
      updating: [23],
      finishingLogs: [expectedMessage],
      currentMessage: expectedMessage,
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });
});

describe('reducer factory: delete', () => {
  const userResource = makeReduxAssets({ name: 'USER', idKey: 'id' });

  it('handles loading action for deleting', () => {
    const action = userResource.actions.setDeleting(3);

    const previousState = { ...defaultState, deleting: [9, 4] };
    const expectedCurrentState = { ...defaultState, deleting: [9, 4, 3] };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles success action for deleting', () => {
    const expectedMessage = {
      causedByError: null,
      isError: false,
      text: 'Successfully deleted.',
    };

    const action = userResource.actions.setDeleted(42);

    const previousState = {
      ...defaultState,
      deleting: [23, 42],
      items: [
        { id: 23, name: 'Jane', lastName: 'Doe' },
        { id: 42, name: 'John', lastName: 'Doe' },
      ],
    };
    const expectedCurrentState = {
      ...defaultState,
      deleting: [23],
      items: [{ id: 23, name: 'Jane', lastName: 'Doe' }],
      currentMessage: expectedMessage,
      finishingLogs: [expectedMessage],
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles error action for deleting', () => {
    const error = new Error('No deleting here');
    const expectedMessage = {
      causedByError: error,
      isError: true,
      text: 'Failed to delete.',
    };

    const action = userResource.actions.setDeleteError(42, error);

    const previousState = {
      ...defaultState,
      deleting: [23, 42],
      items: [
        { id: 23, name: 'Jane', lastName: 'Doe' },
        { id: 42, name: 'John', lastName: 'Doe' },
      ],
    };
    const expectedCurrentState = {
      ...defaultState,
      deleting: [23],
      items: [
        { id: 23, name: 'Jane', lastName: 'Doe' },
        { id: 42, name: 'John', lastName: 'Doe' },
      ],
      currentMessage: expectedMessage,
      finishingLogs: [expectedMessage],
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });
});

describe('reducer factory: read relateds', () => {
  const userResource = makeReduxAssets({
    name: 'USER',
    idKey: 'id',
    relatedKeys: {
      address: ONE_RELATED,
      books: MANY_RELATED,
    },
  });

  it('sets initial values on relations dict for each read entity', () => {
    const expectedReadData = [
      {
        id: 69,
        firstName: 'Marcell',
        lastName: 'Guilherme',
      },
      {
        id: 42,
        firstName: 'Crash',
        lastName: 'Bandicoot',
      },
    ];
    const expectedMessage = {
      causedByError: null,
      isError: false,
      text: 'Successfully fetched data. Related to 2 items.',
    };

    const action = userResource.actions.setRead(null, expectedReadData);

    const previousState = {
      ...defaultState,
      isReadingBlindly: true,
    };
    const expectedCurrentState = {
      ...defaultState,
      isReadingBlindly: false,
      items: expectedReadData,
      currentMessage: expectedMessage,
      finishingLogs: [expectedMessage],
      relatedsTo: {
        42: {
          books: { items: [], isLoading: false },
          address: { item: {}, isLoading: false },
        },
        69: {
          books: { items: [], isLoading: false },
          address: { item: {}, isLoading: false },
        },
      },
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles loading action for reading', () => {
    const action = userResource.actions.setRelatedLoading(42, 'books');

    const previousState = {
      ...defaultState,
      relatedsTo: {
        42: {
          books: { items: [], isLoading: false },
          address: { item: {}, isLoading: false },
        },
        69: {
          books: { items: [], isLoading: false },
          address: { item: {}, isLoading: false },
        },
      },
    };
    const expectedCurrentState = {
      ...defaultState,
      relatedsTo: {
        42: {
          books: { items: [], isLoading: true },
          address: { item: {}, isLoading: false },
        },
        69: {
          books: { items: [], isLoading: false },
          address: { item: {}, isLoading: false },
        },
      },
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles success action for reading related', () => {
    const action = userResource.actions.setRelatedLoaded(42, 'books', [
      'fetched',
      'related',
      'stuff',
    ]);

    const expectedMessage = {
      causedByError: null,
      isError: false,
      text: 'Successful on related data.',
    };
    const previousState = {
      ...defaultState,
      relatedsTo: {
        42: {
          books: { items: ['previous', 'values'], isLoading: true },
          address: { item: {}, isLoading: false },
        },
        69: {
          books: { items: [], isLoading: false },
          address: { item: {}, isLoading: false },
        },
      },
    };
    const expectedCurrentState = {
      ...defaultState,
      relatedsTo: {
        42: {
          books: { items: ['fetched', 'related', 'stuff'], isLoading: false },
          address: { item: {}, isLoading: false },
        },
        69: {
          books: { items: [], isLoading: false },
          address: { item: {}, isLoading: false },
        },
      },
      currentMessage: expectedMessage,
      finishingLogs: [expectedMessage],
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles error action for reading', () => {
    const error = new Error('Weird error on reading related stuff');

    const action = userResource.actions.setRelatedError(42, 'books', error);

    const expectedErrorMessage = {
      causedByError: error,
      isError: true,
      text: 'Fail on related data.',
    };
    const previousState = {
      ...defaultState,
      relatedsTo: {
        42: {
          books: { items: ['previous', 'values'], isLoading: true },
          address: { item: {}, isLoading: false },
        },
        69: {
          books: { items: [], isLoading: false },
          address: { item: {}, isLoading: false },
        },
      },
    };
    const expectedCurrentState = {
      ...defaultState,
      relatedsTo: {
        42: {
          books: { items: ['previous', 'values'], isLoading: false },
          address: { item: {}, isLoading: false },
        },
        69: {
          books: { items: [], isLoading: false },
          address: { item: {}, isLoading: false },
        },
      },
      currentMessage: expectedErrorMessage,
      finishingLogs: [expectedErrorMessage],
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });
});

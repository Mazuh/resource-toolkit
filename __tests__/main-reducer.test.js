import { makeReducerAssets } from '../src';
import { ResourceToolkitError } from '../src/utils';

const defaultState = {
  items: [],
  isCreating: false,
  isReadingBlindly: false,
  isReadingAll: false,
  reading: [],
  updating: [],
  deleting: [],
  isLoading: false,
  finishingLogs: [],
  currentMessage: null,
  relatedsTo: {},
  meta: {},
};

describe('reducer factory: runtime validation', () => {
  it('fails to be created if no options are provided', () => {
    expect(() => makeReducerAssets()).toThrow(
      'Expected params object on assets factory, got something else of type undefined.',
    );
  });

  it('fails to be created if no truthy name string is provided', () => {
    expect(() => makeReducerAssets({})).toThrow(
      'Expected truthy "name" string on assets factory, got something else of type undefined.',
    );
    expect(() => makeReducerAssets({ name: null })).toThrow(
      'Expected truthy "name" string on assets factory, got something else of type object.',
    );
    expect(() => makeReducerAssets({ name: '' })).toThrow(
      'Expected truthy "name" string on assets factory, got something else of type string.',
    );
  });

  it('fails to be created if no truthy idKey string is provided', () => {
    expect(() => makeReducerAssets({ name: 'sample' })).toThrow(
      'Expected truthy "idKey" string on assets factory, got something else of type undefined.',
    );
    expect(() => makeReducerAssets({ name: 'sample', idKey: null })).toThrow(
      'Expected truthy "idKey" string on assets factory, got something else of type object.',
    );
    expect(() => makeReducerAssets({ name: 'sample', idKey: '' })).toThrow(
      'Expected truthy "idKey" string on assets factory, got something else of type string.',
    );
  });
});

describe('reducer factory: commons', () => {
  const userResource = makeReducerAssets({ name: 'USER', idKey: 'id' });

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
    const error = new ResourceToolkitError('Weird random programming error at reading');

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

  it('supports adapter of error messages (thus adapter must be aware of error instance)', () => {
    const adapter = jest.fn(() => 'Any custom message here!');

    const customResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      makeMessageText: adapter,
    });

    const error = new ResourceToolkitError('Weird random programming error at reading');
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

    expect(adapter).toBeCalledWith(error, 'READ', error);
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

  it('handles truthy flag for reading', () => {
    const action = userResource.actions.setIsReadingAll(true);

    const previousState = { ...defaultState, isReadingAll: false };
    const expectedCurrentState = { ...defaultState, isReadingAll: true };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles falsy flag for reading', () => {
    const action = userResource.actions.setIsReadingAll(false);

    const previousState = { ...defaultState, isReadingAll: true };
    const expectedCurrentState = { ...defaultState, isReadingAll: false };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles meta set', () => {
    const action = userResource.actions.setMeta({ page: 1, for: 'example' });

    const previousState = { ...defaultState, meta: { outdated: 'stuff' } };
    const expectedCurrentState = { ...defaultState, meta: { page: 1, for: 'example' } };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles items clearing', () => {
    const action = userResource.actions.clearItems();

    const previousState = { ...defaultState, items: ['a', 'b', 'c'], meta: { some: 'thing' } };
    const expectedCurrentState = { ...defaultState, items: [], meta: {} };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });
});

describe('reducer factory: create', () => {
  const userResource = makeReducerAssets({ name: 'USER', idKey: 'id' });

  it('handles loading action for creating', () => {
    const action = userResource.actions.setCreating();

    const previousState = { ...defaultState };
    const expectedCurrentState = {
      ...defaultState,
      isCreating: true,
      isLoading: true,
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
    const error = new ResourceToolkitError('No creation here');
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
  const userResource = makeReducerAssets({ name: 'USER', idKey: 'id' });

  it('handles loading action for reading blindly', () => {
    const action = userResource.actions.setReading();

    const previousState = { ...defaultState };
    const expectedCurrentState = {
      ...defaultState,
      isReadingBlindly: true,
      isLoading: true,
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
      isLoading: true,
      items: [{ id: 23, name: 'Jane', lastName: 'Doe' }],
    };
    const expectedCurrentState = {
      ...defaultState,
      isCreating: false,
      isLoading: false,
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
  const userResource = makeReducerAssets({ name: 'USER', idKey: 'id' });

  it('handles loading action for updating', () => {
    const action = userResource.actions.setUpdating(42);

    const previousState = {
      ...defaultState,
      updating: [3],
      isLoading: true,
    };
    const expectedCurrentState = {
      ...defaultState,
      updating: [3, 42],
      isLoading: true,
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
      isLoading: true,
      items: [
        { id: 23, name: 'Jane', lastName: 'Doe' },
        { id: 42, name: 'John', lastName: 'Doe' },
      ],
    };
    const expectedCurrentState = {
      ...defaultState,
      updating: [23],
      isLoading: true,
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
    const error = new ResourceToolkitError('Weird random programming error at reading');
    const expectedMessage = {
      causedByError: error,
      isError: true,
      text: 'Failed to update.',
    };

    const action = userResource.actions.setUpdateError(42, error);

    const previousState = {
      ...defaultState,
      updating: [23, 42],
      isLoading: true,
    };
    const expectedCurrentState = {
      ...defaultState,
      updating: [23],
      isLoading: true,
      finishingLogs: [expectedMessage],
      currentMessage: expectedMessage,
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });
});

describe('reducer factory: delete', () => {
  const userResource = makeReducerAssets({ name: 'USER', idKey: 'id' });

  it('handles loading action for deleting', () => {
    const action = userResource.actions.setDeleting(3);

    const previousState = { ...defaultState, deleting: [9, 4], isLoading: true };
    const expectedCurrentState = { ...defaultState, deleting: [9, 4, 3], isLoading: true };

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
      isLoading: true,
      items: [
        { id: 23, name: 'Jane', lastName: 'Doe' },
        { id: 42, name: 'John', lastName: 'Doe' },
      ],
    };
    const expectedCurrentState = {
      ...defaultState,
      deleting: [23],
      isLoading: true,
      items: [{ id: 23, name: 'Jane', lastName: 'Doe' }],
      currentMessage: expectedMessage,
      finishingLogs: [expectedMessage],
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles error action for deleting', () => {
    const error = new ResourceToolkitError('No deleting here');
    const expectedMessage = {
      causedByError: error,
      isError: true,
      text: 'Failed to delete.',
    };

    const action = userResource.actions.setDeleteError(42, error);

    const previousState = {
      ...defaultState,
      deleting: [23, 42],
      isLoading: true,
      items: [
        { id: 23, name: 'Jane', lastName: 'Doe' },
        { id: 42, name: 'John', lastName: 'Doe' },
      ],
    };
    const expectedCurrentState = {
      ...defaultState,
      isLoading: true,
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

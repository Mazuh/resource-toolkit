import { makeReducerAssets } from '../src';
import { MANY_RELATED, ONE_RELATED } from '../src/reducer-typings';
import { ResourceToolkitError } from '../src/utils';

const defaultState = {
  items: [],
  isCreating: false,
  isReadingBlindly: false,
  reading: [],
  updating: [],
  deleting: [],
  isLoading: false,
  finishingLogs: [],
  currentMessage: null,
  relatedsTo: {},
  meta: {},
};

describe('reducer factory: relateds', () => {
  const userResource = makeReducerAssets({
    name: 'USER',
    idKey: 'id',
    relatedKeys: {
      address: ONE_RELATED,
      books: MANY_RELATED,
    },
  });

  const expectedSuccessMessage = {
    causedByError: null,
    isError: false,
    text: 'Successful operation on related data.',
  };

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
    const expectedHosterMessage = {
      causedByError: null,
      isError: false,
      text: 'Successfully fetched data. Related to 2 items.',
    };

    const action = userResource.actions.setRead(null, expectedReadData);

    const previousState = {
      ...defaultState,
      isReadingBlindly: true,
      isLoading: true,
    };
    const expectedCurrentState = {
      ...defaultState,
      isReadingBlindly: false,
      isLoading: false,
      items: expectedReadData,
      currentMessage: expectedHosterMessage,
      finishingLogs: [expectedHosterMessage],
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

  it('handles loading action', () => {
    const action = userResource.actions.setRelatedLoading(42, 'books');

    const previousState = {
      ...defaultState,
      isLoading: false,
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
      isLoading: true,
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

  it('handles success action for creating related', () => {
    const action = userResource.actions.setRelatedCreated(42, 'books', { title: 'For Dummies' });

    const previousState = {
      ...defaultState,
      relatedsTo: {
        42: {
          books: { items: [{ title: 'Head First' }], isLoading: true },
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
          books: { items: [{ title: 'Head First' }, { title: 'For Dummies' }], isLoading: false },
          address: { item: {}, isLoading: false },
        },
        69: {
          books: { items: [], isLoading: false },
          address: { item: {}, isLoading: false },
        },
      },
      currentMessage: expectedSuccessMessage,
      finishingLogs: [expectedSuccessMessage],
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles success action for reading related', () => {
    const action = userResource.actions.setRelatedRead(42, 'books', [
      'fetched',
      'related',
      'stuff',
    ]);

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
      currentMessage: expectedSuccessMessage,
      finishingLogs: [expectedSuccessMessage],
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles success action for updating related', () => {
    const action = userResource.actions.setRelatedUpdated(42, 'books', {
      id: 24,
      fully: 'updated',
      chan: 'ged',
    });

    const previousState = {
      ...defaultState,
      relatedsTo: {
        42: {
          books: {
            items: [
              { id: 42, not: 'to touch, no' },
              { id: 24, old: 'data', chan: '?' },
            ],
            isLoading: true,
          },
          address: { item: {}, isLoading: false },
        },
        69: {
          books: { items: [{ id: 24, its: 'unrelated' }], isLoading: false },
          address: { item: { id: 24, its: 'too' }, isLoading: false },
        },
      },
    };
    const expectedCurrentState = {
      ...defaultState,
      relatedsTo: {
        42: {
          books: {
            items: [
              { id: 42, not: 'to touch, no' },
              { id: 24, old: 'data', chan: 'ged', fully: 'updated' },
            ],
            isLoading: false,
          },
          address: { item: {}, isLoading: false },
        },
        69: {
          books: { items: [{ id: 24, its: 'unrelated' }], isLoading: false },
          address: { item: { id: 24, its: 'too' }, isLoading: false },
        },
      },
      currentMessage: expectedSuccessMessage,
      finishingLogs: [expectedSuccessMessage],
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles success action for deleting related', () => {
    const action = userResource.actions.setRelatedDeleted(42, 'books', {
      id: 24,
    });

    const previousState = {
      ...defaultState,
      relatedsTo: {
        42: {
          books: {
            items: [
              { id: 42, not: 'to touch, no' },
              { id: 24, bad: 'data' },
            ],
            isLoading: true,
          },
          address: { item: {}, isLoading: false },
        },
        69: {
          books: { items: [{ id: 24, its: 'unrelated' }], isLoading: false },
          address: { item: { id: 24, its: 'too' }, isLoading: false },
        },
      },
    };
    const expectedCurrentState = {
      ...defaultState,
      relatedsTo: {
        42: {
          books: {
            items: [{ id: 42, not: 'to touch, no' }],
            isLoading: false,
          },
          address: { item: {}, isLoading: false },
        },
        69: {
          books: { items: [{ id: 24, its: 'unrelated' }], isLoading: false },
          address: { item: { id: 24, its: 'too' }, isLoading: false },
        },
      },
      currentMessage: expectedSuccessMessage,
      finishingLogs: [expectedSuccessMessage],
    };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });

  it('handles error action', () => {
    const error = new ResourceToolkitError('Weird error on reading related stuff');

    const action = userResource.actions.setRelatedError(42, 'books', error);

    const expectedErrorMessage = {
      causedByError: error,
      isError: true,
      text: 'Failed operation on related data.',
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

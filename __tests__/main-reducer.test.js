import { makeReduxAssets } from '../src';

const defaultState = {
  items: [],
  isCreating: false,
  isReadingBlindly: false,
  reading: [],
  updating: [],
  deleting: [],
  finishingLogs: [],
  currentMessage: null,
};

describe('reducer factory', () => {
  let userResource;

  beforeEach(() => {
    userResource = makeReduxAssets({ name: 'USER', idKey: 'id' });
  });

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

  it('supports adapter of error messages', () => {
    const adapter = jest.fn(() => 'Any custom message here!');

    userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      makeMessageText: adapter,
    });

    const error = new Error('Weird random programming error at reading');
    const action = userResource.actions.setReadError([1, 2], error);

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

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);

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

  it('handles loading action for reading blindly', () => {
    const action = userResource.actions.setReading();

    const previousState = { ...defaultState };
    const expectedCurrentState = {
      ...defaultState,
      isReadingBlindly: true,
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

  it('hamdles items clearing', () => {
    const action = userResource.actions.clearItems();

    const previousState = { ...defaultState, items: ['a', 'b', 'c'] };
    const expectedCurrentState = { ...defaultState, items: [] };

    expect(userResource.reducer(previousState, action)).toEqual(expectedCurrentState);
  });
});

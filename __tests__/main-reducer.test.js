import { makeReduxAssets } from '../src';

const defaultState = {
  items: [],
  isCreating: false,
  isReadingBlindly: false,
  reading: [],
  updating: [],
  deleting: [],
  finishingLogs: [],
  lastMessage: null,
};

describe('reducer factory', () => {
  it('has initial state', () => {
    const userResource = makeReduxAssets({ name: 'USER', idKey: 'id' });

    expect(userResource.reducer()).toEqual(defaultState);
  });

  it('fallsback as no-op if action is unknown by the resource lib', () => {
    const userResource = makeReduxAssets({ name: 'USER', idKey: 'id' });
    const action = {
      type: 'invalid random type',
    };

    expect(userResource.reducer(defaultState, action)).toEqual(defaultState);
  });
});

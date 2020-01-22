import { makeReduxAssets } from '../src';

describe('action factory with plain actions', () => {
  let userResource;

  beforeAll(() => {
    userResource = makeReduxAssets({ name: 'USER', idKey: 'id' });
  });

  it('has util for creating namespaced and private actions', () => {
    expect(userResource.makeAction({ my: 'payload' })).toEqual({
      type: 'RESOURCE_TOOlKIT__USER',
      payload: { my: 'payload' },
    });
  });

  it('has action for set reading blindly', () => {
    const action = userResource.actions.setReading();
    const expectedAction = userResource.makeAction({
      operation: 'READ',
      step: 'DOING',
    });

    expect(action).toEqual(expectedAction);
  });

  it('has action for set reading one', () => {
    const id = 1;
    const action = userResource.actions.setReading(id);
    const expectedAction = userResource.makeAction({
      operation: 'READ',
      step: 'DOING',
      identifying: id,
    });

    expect(action).toEqual(expectedAction);
  });

  it('has action for set reading many', () => {
    const ids = [1, 2, 3];
    const action = userResource.actions.setReading(ids);
    const expectedAction = userResource.makeAction({
      operation: 'READ',
      step: 'DOING',
      identifying: ids,
    });

    expect(action).toEqual(expectedAction);
  });

  it('has action for set reading error', () => {
    const error = new Error('Some error message');
    const action = userResource.actions.setReadError(null, error);
    const expectedAction = userResource.makeAction({
      operation: 'READ',
      step: 'ERROR',
      identifying: null,
      content: error,
    });

    expect(action).toEqual(expectedAction);
  });
});

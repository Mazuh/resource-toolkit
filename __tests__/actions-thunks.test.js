import { makeReduxAssets } from '../src';
import { makeMockedFetchFn, defaultEmptyMeta, defaultPaginatedMeta } from './utils';

describe('action factory with thunks, relying in other plain actions, for a working API', () => {
  let UserRestfulAPI;
  let dispatch;

  beforeEach(() => {
    UserRestfulAPI = {
      fetchOne: makeMockedFetchFn({
        data: {
          id: 69,
          firstName: 'Marcell',
          lastName: 'Guilherme',
        },
        meta: defaultEmptyMeta,
      }),
      fetchMany: makeMockedFetchFn({
        data: [
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
        ],
        meta: defaultPaginatedMeta,
      }),
    };

    dispatch = jest.fn();
  });

  it('on reading many blindly, dispatchs loading and done', async done => {
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        readMany: async () => {
          const response = await UserRestfulAPI.fetchMany();
          const body = await response.json();
          return body['data'];
        },
      },
    });
    const thunk = userResource.actions.readMany();
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

    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setReading(null));
    expect(dispatch).toBeCalledWith(userResource.actions.setRead(null, expectedReadData));

    done();
  });

  it('on reading many blindly, dispatchs loading and error', async done => {
    const error = new Error('Programming error');
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        readMany: () => Promise.reject(error),
      },
    });
    const thunk = userResource.actions.readMany();
    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setReading(null));
    expect(dispatch).toBeCalledWith(userResource.actions.setReadError(null, error));

    done();
  });

  it('on reading all, dispatchs loading, clear and done', async done => {
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        readMany: async () => {
          const response = await UserRestfulAPI.fetchMany();
          const body = await response.json();
          return body['data'];
        },
      },
    });
    const thunk = userResource.actions.readAll();
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

    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(3);
    expect(dispatch).toBeCalledWith(userResource.actions.setReading(null));
    expect(dispatch).toBeCalledWith(userResource.actions.clearItems());
    expect(dispatch).toBeCalledWith(userResource.actions.setRead(null, expectedReadData));

    done();
  });

  it('on reading all, dispatchs loading and error', async done => {
    const error = new Error('Programming error');
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        readMany: () => Promise.reject(error),
      },
    });
    const thunk = userResource.actions.readAll();
    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setReading(null));
    expect(dispatch).toBeCalledWith(userResource.actions.setReadError(null, error));

    done();
  });

  it('on reading one, dispatchs loading and done', async done => {
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        readOne: async () => {
          const response = await UserRestfulAPI.fetchOne();
          const body = await response.json();
          return body['data'];
        },
      },
    });
    const thunk = userResource.actions.readOne(69);
    const expectedReadData = {
      id: 69,
      firstName: 'Marcell',
      lastName: 'Guilherme',
    };

    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setReading(69));
    expect(dispatch).toBeCalledWith(userResource.actions.setRead(69, expectedReadData));

    done();
  });

  it('on reading one, dispatchs loading and error', async done => {
    const error = new Error('Programming error');
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        readOne: () => Promise.reject(error),
      },
    });
    const thunk = userResource.actions.readOne(69);
    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setReading(69));
    expect(dispatch).toBeCalledWith(userResource.actions.setReadError(69, error));

    done();
  });

  it('any thunk action creator must pass all its args thru its gateway', async done => {
    const gatewayFetchOne = jest.fn(() => Promise.resolve([]));
    const gatewayFetchMany = jest.fn(() => Promise.resolve([]));
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        readOne: gatewayFetchOne,
        readMany: gatewayFetchMany,
      },
    });

    await userResource.actions.readOne(null, { my: 'args' }, 'one', 123)(dispatch);
    expect(gatewayFetchOne).toBeCalledWith({ my: 'args' }, 'one', 123);
    gatewayFetchOne.mockClear();

    await userResource.actions.readMany(null, { my: 'args' }, 'many', 123)(dispatch);
    expect(gatewayFetchMany).toBeCalledWith({ my: 'args' }, 'many', 123);
    gatewayFetchMany.mockClear();

    await userResource.actions.readAll({ my: 'args' }, 'many', 123)(dispatch);
    expect(gatewayFetchMany).toBeCalledWith({ my: 'args' }, 'many', 123);
    gatewayFetchMany.mockClear();

    done();
  });
});

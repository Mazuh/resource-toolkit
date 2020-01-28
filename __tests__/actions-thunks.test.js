import { makeReduxAssets } from '../src';
import { makeMockedFetchFn, defaultEmptyMeta, defaultPaginatedMeta } from './mock-utils';

describe('action factory with thunks, relying in other plain actions, for a working API', () => {
  let UserRestfulAPI;
  let dispatch;

  beforeEach(() => {
    UserRestfulAPI = {
      fetchOne: makeMockedFetchFn(id => ({
        data: {
          id,
          firstName: 'Marcell',
          lastName: 'Guilherme',
        },
        meta: defaultEmptyMeta,
      })),
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
      fetchUpdate: makeMockedFetchFn((id, updated) => ({
        data: { id, ...updated },
      })),
      fetchDelete: makeMockedFetchFn(id => ({
        data: { id },
      })),
    };

    dispatch = jest.fn();
  });

  it('any thunk action creator must pass all its args thru its gateway', async done => {
    const gatewayFetchOne = jest.fn(() => Promise.resolve({}));
    const gatewayFetchMany = jest.fn(() => Promise.resolve([]));
    const gatewayUpdate = jest.fn(() => Promise.resolve({}));
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        readOne: gatewayFetchOne,
        readMany: gatewayFetchMany,
        update: gatewayUpdate,
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

    await userResource.actions.update(1, { my: 'args' }, 'many', 123)(dispatch);
    expect(gatewayUpdate).toBeCalledWith({ my: 'args' }, 'many', 123);
    gatewayUpdate.mockClear();

    done();
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
        readOne: async queryset => {
          const response = await UserRestfulAPI.fetchOne(queryset.id);
          const body = await response.json();
          return body['data'];
        },
      },
    });
    const thunk = userResource.actions.readOne(69, { id: 69 });
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

  it('on deleting one, dispatchs loading and done', async done => {
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        delete: async queryset => {
          await UserRestfulAPI.fetchDelete(queryset.id);
        },
      },
    });
    const thunk = userResource.actions.delete(666, { id: 666 });

    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setDeleting(666));
    expect(dispatch).toBeCalledWith(userResource.actions.setDeleted(666));

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

  it('on updating, dispatchs loading, clear and done', async done => {
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        update: async updating => {
          const response = await UserRestfulAPI.fetchUpdate(updating.id, updating);
          const body = await response.json();
          return body['data'];
        },
      },
    });
    const expectedUpdatedData = {
      id: 42,
      name: 'Updated',
      lastName: 'Doe',
    };
    const thunk = userResource.actions.update(42, expectedUpdatedData);

    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setUpdating(42));
    expect(dispatch).toBeCalledWith(userResource.actions.setUpdated(42, expectedUpdatedData));

    done();
  });

  it('on updating, dispatchs loading and error', async done => {
    const error = new Error('Programming error');
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        update: () => Promise.reject(error),
      },
    });
    const sillyUpdatingData = {
      id: 42,
      name: 'Updated',
      lastName: 'Doe',
    };
    const thunk = userResource.actions.update(42, sillyUpdatingData);

    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setUpdating(42));
    expect(dispatch).toBeCalledWith(userResource.actions.setUpdateError(42, error));

    done();
  });

  it('on deleting, dispatchs loading and error', async done => {
    const error = new Error('Programming error');
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        delete: () => Promise.reject(error),
      },
    });
    const thunk = userResource.actions.delete(42);

    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setDeleting(42));
    expect(dispatch).toBeCalledWith(userResource.actions.setDeleteError(42, error));

    done();
  });
});

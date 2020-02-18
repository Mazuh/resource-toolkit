import { makeReduxAssets } from '../src';
import { makeMockedFetchFn, defaultEmptyMeta, defaultPaginatedMeta } from './mock-utils';

describe('action creator factory for thunks: commons', () => {
  let dispatch;

  beforeEach(() => {
    dispatch = jest.fn();
  });

  it('any thunk action creator must pass all its args thru its gateway', async done => {
    const gatewayFetchOne = jest.fn(() => Promise.resolve({}));
    const gatewayFetchMany = jest.fn(() => Promise.resolve([]));
    const gatewayUpdate = jest.fn(() => Promise.resolve({}));
    const gatewayDelete = jest.fn(() => Promise.resolve({}));
    const gatewayFetchRelated = jest.fn(() => Promise.resolve([]));
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        readOne: gatewayFetchOne,
        readMany: gatewayFetchMany,
        update: gatewayUpdate,
        delete: gatewayDelete,
        readRelated: gatewayFetchRelated,
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

    await userResource.actions.delete(1, { my: 'args' }, 'many', 123)(dispatch);
    expect(gatewayDelete).toBeCalledWith({ my: 'args' }, 'many', 123);
    gatewayDelete.mockClear();

    await userResource.actions.readRelated(1, '?', { my: 'args' }, 'many', 123)(dispatch);
    expect(gatewayFetchRelated).toBeCalledWith(1, '?', { my: 'args' }, 'many', 123);
    gatewayFetchRelated.mockClear();

    done();
  });
});

describe('action creator factory for thunks: create', () => {
  let UserRestfulAPI;
  let dispatch;

  beforeEach(() => {
    UserRestfulAPI = {
      fetchCreate: makeMockedFetchFn(creation => ({
        data: { id: 123, ...creation },
      })),
    };

    dispatch = jest.fn();
  });

  it('on creating, dispatchs loading and done', async done => {
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        create: async creation => {
          const response = await UserRestfulAPI.fetchCreate(creation);
          const body = await response.json();
          return body['data'];
        },
      },
    });
    const data = { firstName: 'Crash', lastName: 'Bandicoot' };
    const expectedData = { ...data, id: 123 };
    const thunk = userResource.actions.create(data);

    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setCreating());
    expect(dispatch).toBeCalledWith(userResource.actions.setCreated(expectedData));

    done();
  });
});

describe('action creator factory for thunks: read', () => {
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
});

describe('action creator factory for thunks: update', () => {
  let UserRestfulAPI;
  let dispatch;

  beforeEach(() => {
    UserRestfulAPI = {
      fetchUpdate: makeMockedFetchFn((id, updated) => ({
        data: { id, ...updated },
      })),
    };

    dispatch = jest.fn();
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
});

describe('action creator factory for thunks: delete', () => {
  let UserRestfulAPI;
  let dispatch;

  beforeEach(() => {
    UserRestfulAPI = {
      fetchDelete: makeMockedFetchFn(id => ({
        data: { id },
      })),
    };

    dispatch = jest.fn();
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

describe('action creator factory for thunks: read relateds', () => {
  let UserBookRestfulAPI;
  let dispatch;

  beforeEach(() => {
    UserBookRestfulAPI = {
      fetchMany: makeMockedFetchFn({
        data: [
          {
            id: 1,
            title: 'Clean Coder',
          },
          {
            id: 42,
            title: 'Introduction to Algorithms',
          },
        ],
      }),
    };

    dispatch = jest.fn();
  });

  it('on reading relateds, dispatchs loading and done', async done => {
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      relatedKeys: {
        books: 'many',
      },
      gateway: {
        readRelated: async (userId, relationshipKey, queryset) => {
          const response = await UserBookRestfulAPI.fetchMany(userId, queryset);
          const body = await response.json();
          return body['data'];
        },
      },
    });

    const userId = 42;
    const thunk = userResource.actions.readRelated(userId, 'books');
    const expectedReadData = [
      {
        id: 1,
        title: 'Clean Coder',
      },
      {
        id: 42,
        title: 'Introduction to Algorithms',
      },
    ];

    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setRelatedLoading(42, 'books'));
    expect(dispatch).toBeCalledWith(
      userResource.actions.setRelatedRead(42, 'books', expectedReadData),
    );

    done();
  });

  it('on reading relateds, may dispatch loading and error', async done => {
    const error = new Error('oh no, error on fetching stuff');
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      relatedKeys: {
        books: 'many',
      },
      gateway: {
        readRelated: jest.fn(() => Promise.reject(error)),
      },
    });

    const userId = 42;
    const thunk = userResource.actions.readRelated(userId, 'books');
    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setRelatedLoading(42, 'books'));
    expect(dispatch).toBeCalledWith(userResource.actions.setRelatedError(42, 'books', error));

    done();
  });
});

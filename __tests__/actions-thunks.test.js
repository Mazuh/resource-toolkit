import { makeReducerAssets } from '../src';
import { makeMockedFetchFn, defaultEmptyMeta } from './mock-utils';
import { ResourceToolkitError } from '../src/utils';

describe('action creator factory for thunks: commons', () => {
  const realSetTimeout = global.setTimeout;

  beforeAll(() => {
    global.setTimeout = f => f();
  });

  afterAll(() => {
    global.setTimeout = realSetTimeout;
  });

  let dispatch;

  beforeEach(() => {
    dispatch = jest.fn();
  });

  it('any thunk action creator must pass all its args thru its gateway', async done => {
    const gatewayCreate = jest.fn(() => Promise.resolve());
    const gatewayFetchOne = jest.fn(() => Promise.resolve());
    const gatewayFetchMany = jest.fn(() => Promise.resolve());
    const gatewayUpdate = jest.fn(() => Promise.resolve());
    const gatewayDelete = jest.fn(() => Promise.resolve());
    const gatewayCreateRelated = jest.fn(() => Promise.resolve());
    const gatewayFetchRelated = jest.fn(() => Promise.resolve());
    const gatewayUpdateRelated = jest.fn(() => Promise.resolve());
    const gatewayDeleteRelated = jest.fn(() => Promise.resolve());
    const userResource = makeReducerAssets({
      name: 'MOCK',
      idKey: 'id',
      gateway: {
        create: gatewayCreate,
        fetchOne: gatewayFetchOne,
        fetchMany: gatewayFetchMany,
        update: gatewayUpdate,
        delete: gatewayDelete,
        createRelated: gatewayCreateRelated,
        fetchRelated: gatewayFetchRelated,
        updateRelated: gatewayUpdateRelated,
        deleteRelated: gatewayDeleteRelated,
      },
      logLibError: () => {},
    });

    const mockId = 22;

    await userResource.actions.create({ my: 'args' }, 'one', 123)(dispatch);
    expect(gatewayCreate).toBeCalledWith({ my: 'args' }, 'one', 123);
    gatewayCreate.mockClear();

    await userResource.actions.readOne(mockId, { my: 'args' }, 'one', 123)(dispatch);
    expect(gatewayFetchOne).toBeCalledWith(mockId, { my: 'args' }, 'one', 123);
    gatewayFetchOne.mockClear();

    await userResource.actions.readMany([mockId], { my: 'args' }, 'many', 123)(dispatch);
    expect(gatewayFetchMany).toBeCalledWith([mockId], { my: 'args' }, 'many', 123);
    gatewayFetchMany.mockClear();

    await userResource.actions.readAll({ my: 'args' }, 'many', 123)(dispatch);
    expect(gatewayFetchMany).toBeCalledWith(null, { my: 'args' }, 'many', 123);
    gatewayFetchMany.mockClear();

    await userResource.actions.update(mockId, { my: 'args' }, 'many', 123)(dispatch);
    expect(gatewayUpdate).toBeCalledWith(mockId, { my: 'args' }, 'many', 123);
    gatewayUpdate.mockClear();

    await userResource.actions.delete(mockId, { my: 'args' }, 'many', 123)(dispatch);
    expect(gatewayDelete).toBeCalledWith(mockId, { my: 'args' }, 'many', 123);
    gatewayDelete.mockClear();

    const relatedKey = 'books';

    await userResource.actions.createRelated(
      mockId,
      relatedKey,
      '?',
      { my: 'args' },
      'many',
      123,
    )(dispatch);
    expect(gatewayCreateRelated).toBeCalledWith(
      mockId,
      relatedKey,
      '?',
      { my: 'args' },
      'many',
      123,
    );
    gatewayCreateRelated.mockClear();

    await userResource.actions.readRelated(
      mockId,
      relatedKey,
      '?',
      { my: 'args' },
      'many',
      123,
    )(dispatch);
    expect(gatewayFetchRelated).toBeCalledWith(
      mockId,
      relatedKey,
      '?',
      { my: 'args' },
      'many',
      123,
    );
    gatewayFetchRelated.mockClear();

    await userResource.actions.updateRelated(
      mockId,
      relatedKey,
      '?',
      { my: 'args' },
      'many',
      123,
    )(dispatch);
    expect(gatewayUpdateRelated).toBeCalledWith(
      mockId,
      relatedKey,
      '?',
      { my: 'args' },
      'many',
      123,
    );
    gatewayUpdateRelated.mockClear();

    await userResource.actions.deleteRelated(
      mockId,
      relatedKey,
      '?',
      { my: 'args' },
      'many',
      123,
    )(dispatch);
    expect(gatewayDeleteRelated).toBeCalledWith(
      mockId,
      relatedKey,
      '?',
      { my: 'args' },
      'many',
      123,
    );
    gatewayDeleteRelated.mockClear();

    done();
  });
});

describe('action creator factory for thunks: create', () => {
  const realSetTimeout = global.setTimeout;

  beforeAll(() => {
    global.setTimeout = f => f();
  });

  afterAll(() => {
    global.setTimeout = realSetTimeout;
  });

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
    const userResource = makeReducerAssets({
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
  const realSetTimeout = global.setTimeout;

  beforeAll(() => {
    global.setTimeout = f => f();
  });

  afterAll(() => {
    global.setTimeout = realSetTimeout;
  });

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
      }),
    };

    dispatch = jest.fn();
  });

  it('on reading many blindly, dispatchs loading and done', async done => {
    const userResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        fetchMany: async () => {
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
    const error = new ResourceToolkitError('Programming error');
    const userResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        fetchMany: () => Promise.reject(error),
      },
      logLibError: () => {},
    });
    const thunk = userResource.actions.readMany();
    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setReading(null));
    expect(dispatch).toBeCalledWith(userResource.actions.setReadError(null, error));

    done();
  });

  it('on reading all, dispatchs loading, clear and done', async done => {
    const userResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        fetchMany: async () => {
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

    expect(dispatch).toBeCalledTimes(5);
    expect(dispatch).toBeCalledWith(userResource.actions.setIsReadingAll(true));
    expect(dispatch).toBeCalledWith(userResource.actions.setIsReadingAll(false));
    expect(dispatch).toBeCalledWith(userResource.actions.setReading(null));
    expect(dispatch).toBeCalledWith(userResource.actions.clearItems());
    expect(dispatch).toBeCalledWith(userResource.actions.setRead(null, expectedReadData));

    done();
  });

  it('on reading all, dispatchs loading and error', async done => {
    const error = new ResourceToolkitError('Programming error');
    const userResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        fetchMany: () => Promise.reject(error),
      },
      logLibError: () => {},
    });
    const thunk = userResource.actions.readAll();
    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(4);
    expect(dispatch).toBeCalledWith(userResource.actions.setIsReadingAll(true));
    expect(dispatch).toBeCalledWith(userResource.actions.setIsReadingAll(false));
    expect(dispatch).toBeCalledWith(userResource.actions.setReading(null));
    expect(dispatch).toBeCalledWith(userResource.actions.setReadError(null, error));

    done();
  });

  it('on reading one, dispatchs loading and done', async done => {
    const userResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        fetchOne: async (id, queryset) => {
          const response = await UserRestfulAPI.fetchOne(id, queryset);
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
    const error = new ResourceToolkitError('Programming error');
    const userResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        fetchOne: () => Promise.reject(error),
      },
      logLibError: () => {},
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
  const realSetTimeout = global.setTimeout;

  beforeAll(() => {
    global.setTimeout = f => f();
  });

  afterAll(() => {
    global.setTimeout = realSetTimeout;
  });

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
    const userResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        update: async (id, updating) => {
          const response = await UserRestfulAPI.fetchUpdate(id, updating);
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
    const error = new ResourceToolkitError('Programming error');
    const userResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        update: () => Promise.reject(error),
      },
      logLibError: () => {},
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
  const realSetTimeout = global.setTimeout;

  beforeAll(() => {
    global.setTimeout = f => f();
  });

  afterAll(() => {
    global.setTimeout = realSetTimeout;
  });

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
    const userResource = makeReducerAssets({
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
    const error = new ResourceToolkitError('Programming error');
    const userResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        delete: () => Promise.reject(error),
      },
      logLibError: () => {},
    });
    const thunk = userResource.actions.delete(42);

    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setDeleting(42));
    expect(dispatch).toBeCalledWith(userResource.actions.setDeleteError(42, error));

    done();
  });
});

describe('action creator factory for thunks: reading all including meta', () => {
  const realSetTimeout = global.setTimeout;

  beforeAll(() => {
    global.setTimeout = f => f();
  });

  afterAll(() => {
    global.setTimeout = realSetTimeout;
  });

  let dispatch;

  beforeEach(() => {
    dispatch = jest.fn();
  });

  it('gateway must retrieve object with data and meta, dispatching storage for both', async () => {
    const sampleResource = makeReducerAssets({
      name: 'sample',
      idKey: 'id',
      expectAllMeta: true,
      gateway: {
        fetchMany: async () => {
          return {
            data: [
              { id: 69, firstName: 'Marcell' },
              { id: 42, firstName: 'Crash' },
            ],
            meta: {
              page: 1,
              previous: null,
              next: 'example',
              anything: 'else here',
            },
          };
        },
      },
    });
    const thunk = sampleResource.actions.readAll();
    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(6);
    expect(dispatch).toBeCalledWith(sampleResource.actions.setIsReadingAll(true));
    expect(dispatch).toBeCalledWith(sampleResource.actions.setIsReadingAll(false));
    expect(dispatch).toBeCalledWith(sampleResource.actions.setReading(null));
    expect(dispatch).toBeCalledWith(sampleResource.actions.clearItems());
    expect(dispatch).toBeCalledWith(
      sampleResource.actions.setMeta({
        page: 1,
        previous: null,
        next: 'example',
        anything: 'else here',
      }),
    );
    expect(dispatch).toBeCalledWith(
      sampleResource.actions.setRead(null, [
        { id: 69, firstName: 'Marcell' },
        { id: 42, firstName: 'Crash' },
      ]),
    );
  });

  it('throws error if gateway cant retrieve object with data and meta, dispatching error', async () => {
    const sampleResource = makeReducerAssets({
      name: 'sample',
      idKey: 'id',
      expectAllMeta: true,
      gateway: {
        fetchMany: async () => {
          return [
            { id: 69, firstName: 'Marcell' },
            { id: 42, firstName: 'Crash' },
          ];
        },
      },
      logLibError: () => {},
    });
    const thunk = sampleResource.actions.readAll();
    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(4);
    expect(dispatch).toBeCalledWith(sampleResource.actions.setIsReadingAll(true));
    expect(dispatch).toBeCalledWith(sampleResource.actions.setIsReadingAll(false));
    expect(dispatch).toBeCalledWith(sampleResource.actions.setReading(null));
    expect(dispatch).toBeCalledWith(
      sampleResource.actions.setReadError(
        null,
        new ResourceToolkitError(
          'Expected Object instance as payload, but got something else of type object.',
        ),
      ),
    );
  });

  it('throws error if gateway returns payload with missing data, dispatching error', async () => {
    const sampleResource = makeReducerAssets({
      name: 'sample',
      idKey: 'id',
      expectAllMeta: true,
      gateway: {
        fetchMany: async () => {
          return { meta: {} };
        },
      },
      logLibError: () => {},
    });
    const thunk = sampleResource.actions.readAll();
    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(4);
    expect(dispatch).toBeCalledWith(sampleResource.actions.setIsReadingAll(true));
    expect(dispatch).toBeCalledWith(sampleResource.actions.setIsReadingAll(false));
    expect(dispatch).toBeCalledWith(sampleResource.actions.setReading(null));
    expect(dispatch).toBeCalledWith(
      sampleResource.actions.setReadError(
        null,
        new ResourceToolkitError(
          'Expected Array or Object instance as data, but got something else of type undefined.',
        ),
      ),
    );
  });

  it('throws error if gateway returns payload with missing meta, dispatching error', async () => {
    const sampleResource = makeReducerAssets({
      name: 'sample',
      idKey: 'id',
      expectAllMeta: true,
      gateway: {
        fetchMany: async () => {
          return { data: [] };
        },
      },
      logLibError: () => {},
    });
    const thunk = sampleResource.actions.readAll();
    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(4);
    expect(dispatch).toBeCalledWith(sampleResource.actions.setIsReadingAll(true));
    expect(dispatch).toBeCalledWith(sampleResource.actions.setIsReadingAll(false));
    expect(dispatch).toBeCalledWith(sampleResource.actions.setReading(null));
    expect(dispatch).toBeCalledWith(
      sampleResource.actions.setReadError(
        null,
        new ResourceToolkitError(
          'Expected Object instance as meta, but got something else of type undefined.',
        ),
      ),
    );
  });
});

describe('factory for thunks: may dispatch read after another operation', () => {
  const realSetTimeout = global.setTimeout;

  beforeAll(() => {
    global.setTimeout = f => f();
  });

  afterAll(() => {
    global.setTimeout = realSetTimeout;
  });

  let UserRestfulAPI;
  let dispatch;

  beforeEach(() => {
    UserRestfulAPI = {
      fetchCreate: makeMockedFetchFn({}),
      fetchMany: makeMockedFetchFn({
        data: [
          { id: 1, name: 'Jeff' },
          { id: 42, name: 'Mark' },
        ],
      }),
    };

    dispatch = jest.fn();
  });

  it('reads all after creating', async done => {
    const userResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      readAllToFinishOperations: true,
      gateway: {
        create: async creation => UserRestfulAPI.fetchCreate(creation),
        fetchMany: async () => (await UserRestfulAPI.fetchMany().then(res => res.json())).data,
      },
    });

    const thunk = userResource.actions.create({ name: 'Mark' });
    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(3);
    expect(dispatch).toBeCalledWith(userResource.actions.setCreating());
    expect(dispatch).toBeCalledWith(userResource.actions.clearItems());
    expect(dispatch).toBeCalledWith(
      userResource.actions.setRead(null, [
        { id: 1, name: 'Jeff' },
        { id: 42, name: 'Mark' },
      ]),
    );

    done();
  });
});

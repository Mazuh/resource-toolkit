import { makeReducerAssets } from '../src';
import { ResourceToolkitError } from '../src/utils';
import { makeMockedFetchFn } from './mock-utils';

describe('action creator factory for thunks: create relateds', () => {
  const realSetTimeout = global.setTimeout;

  beforeAll(() => {
    global.setTimeout = f => f();
  });

  afterAll(() => {
    global.setTimeout = realSetTimeout;
  });

  let UserBookRestfulAPI;
  let dispatch;

  beforeEach(() => {
    UserBookRestfulAPI = {
      create: makeMockedFetchFn((userId, creation) => ({
        data: { id: 123, ...creation },
      })),
    };

    dispatch = jest.fn();
  });

  it('on creating relateds, dispatchs loading and done', async done => {
    const userResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      relatedKeys: {
        books: 'many',
      },
      gateway: {
        createRelated: async (userId, relationshipKey, queryset) => {
          const response = await UserBookRestfulAPI.create(userId, queryset);
          const body = await response.json();
          return body['data'];
        },
      },
    });

    const userId = 42;
    const expectedCreatedData = { id: 123, title: 'The Mythical Man-month' };
    const thunk = userResource.actions.createRelated(userId, 'books', {
      title: 'The Mythical Man-month',
    });

    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setRelatedLoading(42, 'books'));
    expect(dispatch).toBeCalledWith(
      userResource.actions.setRelatedCreated(42, 'books', expectedCreatedData),
    );

    done();
  });

  it('on reading relateds, may dispatch loading and error', async done => {
    const error = new ResourceToolkitError('oh no, error on fetching stuff');
    const userResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      relatedKeys: {
        books: 'many',
      },
      gateway: {
        createRelated: jest.fn(() => Promise.reject(error)),
      },
    });

    const userId = 42;
    const thunk = userResource.actions.createRelated(userId, 'books');
    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setRelatedLoading(42, 'books'));
    expect(dispatch).toBeCalledWith(userResource.actions.setRelatedError(42, 'books', error));

    done();
  });
});

describe('action creator factory for thunks: read relateds', () => {
  const realSetTimeout = global.setTimeout;

  beforeAll(() => {
    global.setTimeout = f => f();
  });

  afterAll(() => {
    global.setTimeout = realSetTimeout;
  });

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
    const userResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      relatedKeys: {
        books: 'many',
      },
      gateway: {
        fetchRelated: async (userId, relationshipKey, queryset) => {
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
    const error = new ResourceToolkitError('oh no, error on fetching stuff');
    const userResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      relatedKeys: {
        books: 'many',
      },
      gateway: {
        fetchRelated: jest.fn(() => Promise.reject(error)),
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

describe('action creator factory for thunks: update relateds', () => {
  const realSetTimeout = global.setTimeout;

  beforeAll(() => {
    global.setTimeout = f => f();
  });

  afterAll(() => {
    global.setTimeout = realSetTimeout;
  });

  let UserBookRestfulAPI;
  let dispatch;

  beforeEach(() => {
    UserBookRestfulAPI = {
      update: makeMockedFetchFn((userId, updated) => ({
        data: { ...updated },
      })),
    };

    dispatch = jest.fn();
  });

  it('on updating relateds, dispatchs loading and done', async done => {
    const userResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      relatedKeys: {
        books: 'many',
      },
      gateway: {
        updateRelated: async (userId, relationshipKey, queryset) => {
          const response = await UserBookRestfulAPI.update(userId, queryset);
          const body = await response.json();
          return body['data'];
        },
      },
    });

    const userId = 42;
    const updatingData = {
      id: 42,
      title: 'Clean Coder',
      author: 'Uncle Bob',
    };
    const thunk = userResource.actions.updateRelated(userId, 'books', updatingData);

    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setRelatedLoading(42, 'books'));
    expect(dispatch).toBeCalledWith(
      userResource.actions.setRelatedUpdated(42, 'books', updatingData),
    );

    done();
  });

  it('on updating relateds, may dispatch loading and error', async done => {
    const error = new ResourceToolkitError('oh no, error on fetching stuff');
    const userResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      relatedKeys: {
        books: 'many',
      },
      gateway: {
        updateRelated: jest.fn(() => Promise.reject(error)),
      },
    });

    const userId = 42;
    const thunk = userResource.actions.updateRelated(userId, 'books', {});
    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setRelatedLoading(42, 'books'));
    expect(dispatch).toBeCalledWith(userResource.actions.setRelatedError(42, 'books', error));

    done();
  });
});

describe('action creator factory for thunks: delete relateds', () => {
  const realSetTimeout = global.setTimeout;

  beforeAll(() => {
    global.setTimeout = f => f();
  });

  afterAll(() => {
    global.setTimeout = realSetTimeout;
  });

  let UserBookRestfulAPI;
  let dispatch;

  beforeEach(() => {
    UserBookRestfulAPI = {
      delete: makeMockedFetchFn(id => ({
        data: { id },
      })),
    };

    dispatch = jest.fn();
  });

  it('on deleting relateds, dispatchs loading and done', async done => {
    const userResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      relatedKeys: {
        books: 'many',
      },
      gateway: {
        deleteRelated: async (userId, relationshipKey, queryset) => {
          const response = await UserBookRestfulAPI.delete(userId, queryset.id);
          const body = await response.json();
          return body['data'];
        },
      },
    });

    const userId = 42;
    const deletingQueryData = { id: 42 };
    const thunk = userResource.actions.deleteRelated(userId, 'books', deletingQueryData);

    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(
      userResource.actions.setRelatedDeleted(42, 'books', deletingQueryData),
    );
    expect(dispatch).toBeCalledWith(
      userResource.actions.setRelatedDeleted(42, 'books', deletingQueryData),
    );

    done();
  });

  it('on deleting relateds, may dispatch loading and error', async done => {
    const error = new ResourceToolkitError('oh no, error on fetching stuff');
    const userResource = makeReducerAssets({
      name: 'USER',
      idKey: 'id',
      relatedKeys: {
        books: 'many',
      },
      gateway: {
        deleteRelated: jest.fn(() => Promise.reject(error)),
      },
    });

    const userId = 42;
    const thunk = userResource.actions.deleteRelated(userId, 'books', {});
    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setRelatedLoading(42, 'books'));
    expect(dispatch).toBeCalledWith(userResource.actions.setRelatedError(42, 'books', error));

    done();
  });
});

import { makeReduxAssets } from '../src';
import { makeMockedFetchFn, defaultEmptyMeta, defaultPaginatedMeta } from './utils';

describe('action factory with thunks, relying in primitive actions, for a working API', () => {
  let UserRestfulAPI;
  let dispatch;

  beforeEach(() => {
    UserRestfulAPI = {
      getOne: makeMockedFetchFn({
        data: {
          id: 69,
          firstName: 'Marcell',
          lastName: 'Guilherme',
        },
        meta: defaultEmptyMeta,
      }),
      getMany: makeMockedFetchFn({
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

  it('on reading many, dispatchs loading and done', async done => {
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        getMany: async () => {
          const response = await UserRestfulAPI.getMany();
          const body = await response.json();
          return body['data'];
        },
      },
    });
    const thunk = userResource.actions.getMany();
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
    expect(dispatch).toBeCalledWith(userResource.actions.setReading());
    expect(dispatch).toBeCalledWith(userResource.actions.setRead(null, expectedReadData));

    done();
  });

  it('on reading many, dispatchs loading and error', async done => {
    const error = new Error('Programming error');
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        getMany: () => Promise.reject(error),
      },
    });
    const thunk = userResource.actions.getMany();
    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setReading());
    expect(dispatch).toBeCalledWith(userResource.actions.setReadError(null, error));

    done();
  });

  it('on reading one, dispatchs loading and done', async done => {
    const userResource = makeReduxAssets({
      name: 'USER',
      idKey: 'id',
      gateway: {
        getOne: async () => {
          const response = await UserRestfulAPI.getOne();
          const body = await response.json();
          return body['data'];
        },
      },
    });
    const thunk = userResource.actions.getOne(69);
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
        getOne: () => Promise.reject(error),
      },
    });
    const thunk = userResource.actions.getOne(69);
    await thunk(dispatch);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith(userResource.actions.setReading(69));
    expect(dispatch).toBeCalledWith(userResource.actions.setReadError(69, error));

    done();
  });
});

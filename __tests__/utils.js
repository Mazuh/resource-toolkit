export const makeMockedFetchFn = responseBody =>
  jest.fn(
    () =>
      new Promise(resolve => {
        const response = {
          status: 200,
          json: async () => responseBody,
        };

        setTimeout(() => resolve(response), 1000);
      }),
  );

export const defaultEmptyMeta = {};

export const defaultPaginatedMeta = {
  previous: 'https://previous-page',
  previous: 'https://next-page',
};

export const UserRestfulAPI = {
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

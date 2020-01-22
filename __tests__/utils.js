export const makeMockedFetchFn = responseBody =>
  jest.fn(async () => {
    const response = {
      status: 200,
      json: async () => responseBody,
    };

    return response;
  });

export const defaultEmptyMeta = {};

export const defaultPaginatedMeta = {
  previous: 'https://previous-page',
  previous: 'https://next-page',
};

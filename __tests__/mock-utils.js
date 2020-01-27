export const makeMockedFetchFn = responseBody =>
  jest.fn(async (...args) => {
    const body = typeof responseBody === 'function' ? responseBody(...args) : responseBody;
    const response = {
      status: 200,
      json: async () => body,
    };

    return response;
  });

export const defaultEmptyMeta = {};

export const defaultPaginatedMeta = {
  previous: 'https://previous-page',
  next: 'https://next-page',
};

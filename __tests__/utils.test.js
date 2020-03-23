import {
  makeDefaultMessageText,
  handleErrorFn,
  blockNonIdentifying,
  blockNonIdentifier,
  blockNonEntityFn,
  blockNonEntitiesFn,
  minimalDelayedHOC,
  ResourceToolkitError,
} from '../src/utils';

describe('makeDefaultMessageText', () => {
  it('is reliable for random stuff passed by', () => {
    const text = makeDefaultMessageText();
    expect(text).toBe('Success, but with unknown and unexpected response.');
  });

  it('is reliable for random stuff signaling error', () => {
    const isError = true;
    const text = makeDefaultMessageText('oeoe', 123, isError);
    expect(text).toBe('Unknown and unexpected error response.');
  });
});

describe('handleErrorFn (closure factory)', () => {
  let logMock = jest.fn();
  let handleError;

  beforeEach(() => {
    logMock = jest.fn();
    handleError = handleErrorFn('my-resource-namespace', logMock);
  });

  it('calls provided log when handling lib errors', () => {
    const libError = new ResourceToolkitError('Internal error');
    handleError(libError);
    expect(logMock).toBeCalledWith('[my-resource-namespace]', libError);
  });

  it('not call provided log when handling unknown type of errors', () => {
    const unknownError = new Error('Internal error');
    handleError(unknownError);
    expect(logMock).not.toBeCalled();
  });
});

describe('blockNonIdentifying', () => {
  it('throws error if the expression is not a string or a number', () => {
    expect(() => blockNonIdentifying()).toThrow(
      'Expected unique id to be string or number, but got undefined.',
    );
    expect(() => blockNonIdentifying({})).toThrow(
      'Expected unique id to be string or number, but got object.',
    );
    expect(() => blockNonIdentifying(null)).toThrow(
      'Expected unique id to be string or number, but got object.',
    );
  });

  it('throws error if the expression is array including non string nor number value', () => {
    expect(() => blockNonIdentifying([123, {}])).toThrow(
      'Expected ids as strings or numbers, but got an array with object',
    );
    expect(() => blockNonIdentifying(['123', {}])).toThrow(
      'Expected ids as strings or numbers, but got an array with object',
    );
    expect(() => blockNonIdentifying([{}])).toThrow(
      'Expected ids as strings or numbers, but got an array with object',
    );
    expect(() => blockNonIdentifying([[]])).toThrow(
      'Expected ids as strings or numbers, but got an array with object',
    );
  });

  it('throws error if the expression is a empty array', () => {
    expect(() => blockNonIdentifying([])).toThrow(
      'Expected ids with string or numbers, but got the array empty.',
    );
  });

  it('not throw error if the expression is a string or a number', () => {
    expect(() => blockNonIdentifying(123)).not.toThrow();
    expect(() => blockNonIdentifying('123')).not.toThrow();
  });

  it('not throw error if the expression is array including only string or number values', () => {
    expect(() => blockNonIdentifying([123, 321])).not.toThrow();
    expect(() => blockNonIdentifying(['123', '321'])).not.toThrow();
    expect(() => blockNonIdentifying(['123', 321])).not.toThrow();
  });
});

describe('blockNonIdentifier', () => {
  it('throws error if the expression is not a string or a number', () => {
    expect(() => blockNonIdentifier()).toThrow(
      'Expected unique id to be string or number, but got undefined.',
    );
    expect(() => blockNonIdentifier({})).toThrow(
      'Expected unique id to be string or number, but got object.',
    );
    expect(() => blockNonIdentifier(null)).toThrow(
      'Expected unique id to be string or number, but got object.',
    );
    expect(() => blockNonIdentifier([])).toThrow(
      'Expected unique id to be string or number, but got object.',
    );
  });

  it('not throw error if the expression is a string or a number', () => {
    expect(() => blockNonIdentifier(123)).not.toThrow();
    expect(() => blockNonIdentifier('123')).not.toThrow();
  });
});

describe('blockNonEntityFn (closure factory)', () => {
  const blockNonEntity = blockNonEntityFn('entityId');

  it('not throw anything if payload is a valid Entity', () => {
    expect(() => blockNonEntity({ entityId: 123 })).not.toThrow();
    expect(() => blockNonEntity({ entityId: '123' })).not.toThrow();
  });

  it('throws error if payload is not Object instance', () => {
    expect(() => blockNonEntity(undefined)).toThrow(
      'Expected Object instance as gateway return, but got something else of type undefined.',
    );
    expect(() => blockNonEntity(null)).toThrow(
      'Expected Object instance as gateway return, but got something else of type object.',
    );
  });

  it('throws error if payload is an array (cause this util is for single entities)', () => {
    expect(() => blockNonEntity([])).toThrow(
      'Expected single Object instance as gateway return, but got an Array.',
    );
    expect(() => blockNonEntity([{ entityId: 123 }])).toThrow(
      'Expected single Object instance as gateway return, but got an Array.',
    );
  });

  it('throw error if payload is an object with a missing idKey truthy value', () => {
    expect(() => blockNonEntity({ entityId: '' })).toThrow(
      'Expected truthy "entityId" in gateway return, but got something else of type string.',
    );
    expect(() => blockNonEntity({ entityId: null })).toThrow(
      'Expected truthy "entityId" in gateway return, but got something else of type object.',
    );
    expect(() => blockNonEntity({ typo: 'here' })).toThrow(
      'Expected truthy "entityId" in gateway return, but got something else of type undefined.',
    );
  });

  it('throw error if payload is an object with an invalid idKey value', () => {
    expect(() => blockNonEntity({ entityId: [] })).toThrow(
      'Expected string or number for "entityId" in gateway return, but got something else of type object.',
    );
    expect(() => blockNonEntity({ entityId: {} })).toThrow(
      'Expected string or number for "entityId" in gateway return, but got something else of type object.',
    );
  });
});

describe('blockNonEntitiesFn (closure factory)', () => {
  const blockNonEntities = blockNonEntitiesFn('entityId');

  it('not throw anything if payload is Array with a valid set of Entity', () => {
    expect(() => blockNonEntities([])).not.toThrow();
    expect(() => blockNonEntities([{ entityId: 123 }])).not.toThrow();
    expect(() => blockNonEntities([{ entityId: '123' }])).not.toThrow();
  });

  it('throws error if payload item is not Array instance', () => {
    expect(() => blockNonEntities()).toThrow(
      'Expected Array instance as gateway return, but got something else of type undefined.',
    );
    expect(() => blockNonEntities({ entityId: '123 (ops, no bracket!)' })).toThrow(
      'Expected Array instance as gateway return, but got something else of type object.',
    );
    expect(() => blockNonEntities(null)).toThrow(
      'Expected Array instance as gateway return, but got something else of type object.',
    );
  });

  it('throw error if payload has item not being an Object instance', () => {
    expect(() => blockNonEntities([{ entityId: 123 }, undefined])).toThrow(
      'Expected single Object instances in gateway items, but got something else of type undefined at index 1.',
    );
    expect(() =>
      blockNonEntities([[{ entityId: 123, typo: 'more brackets then it should' }]]),
    ).toThrow(
      'Expected single Object instances in gateway items, but got something else of type object at index 0.',
    );
  });

  it('throw error if payload has item with a missing idKey truthy value', () => {
    expect(() => blockNonEntities([{ entityId: 123 }, { entityId: '' }])).toThrow(
      'Expected truthy "entityId" in gateway items, but got something else of type string at index 1.',
    );
    expect(() => blockNonEntities([{ entityId: null }, {}])).toThrow(
      'Expected truthy "entityId" in gateway items, but got something else of type object at index 0.',
    );
    expect(() => blockNonEntities([{ entityId: 1 }, { entityId: 2 }, { typo: 'here' }])).toThrow(
      'Expected truthy "entityId" in gateway items, but got something else of type undefined at index 2.',
    );
  });

  it('throw error if payload has item with an invalid idKey value', () => {
    expect(() => blockNonEntities([{ entityId: [] }])).toThrow(
      'Expected string or number for "entityId" in gateway items, but got something else of type object at index 0.',
    );
    expect(() => blockNonEntities([{ entityId: {} }])).toThrow(
      'Expected string or number for "entityId" in gateway items, but got something else of type object at index 0.',
    );
  });
});

describe('assureMinimalDelay', () => {
  const realSetTimeout = global.setTimeout;

  beforeEach(() => {
    global.setTimeout = jest.fn(func => func());
  });

  afterEach(() => {
    global.setTimeout = realSetTimeout;
  });

  it('execute its bound thunk passing the same args, no timeout if is beyond the threshold', async () => {
    const dispatch = jest.fn();
    const gracefullyDispatch = minimalDelayedHOC(dispatch, -1);

    gracefullyDispatch({ my: 'args' }, 'here', 123);

    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch).toBeCalledWith({ my: 'args' }, 'here', 123);

    expect(global.setTimeout).not.toBeCalled();
  });

  it('execute its bound thunk passing the same args, has timeout if is before the threshold', async () => {
    const dispatch = jest.fn();
    const gracefullyDispatch = minimalDelayedHOC(dispatch, 999999);

    gracefullyDispatch({ my: 'args' }, 'here', 123);

    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch).toBeCalledWith({ my: 'args' }, 'here', 123);

    expect(global.setTimeout).toBeCalled();
  });
});

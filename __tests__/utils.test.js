import {
  makeDefaultMessageText,
  blockNonIdentifying,
  blockNonIdentifier,
  minimalDelayedHOC,
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

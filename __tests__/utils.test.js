import { makeDefaultMessageText, minimalDelayedHOC } from '../src/utils';

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

import { makeDefaultMessageText } from '../src/utils';

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

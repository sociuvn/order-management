import { generateQueryString } from '../../src/util/request';

describe('generateQueryString', () => {
  it('should return an empty string when the input is an empty object', () => {
    const result = generateQueryString({});
    expect(result).toBe('');
  });

  it('should return a query string with one parameter when the input is an object with one property', () => {
    const result = generateQueryString({ a: '1' });
    expect(result).toBe('a=1');
  });

  it('should return a query string with multiple parameters when the input is an object with multiple properties', () => {
    const result = generateQueryString({ a: '1', b: '2' });
    expect(result).toBe('a=1&b=2');
  });

  it('should return a query string with encoded parameters when the input is an object with special characters in the values', () => {
    const result = generateQueryString({ a: '1&2', b: '3=4' });
    expect(result).toBe('a=1%262&b=3%3D4');
  });
});

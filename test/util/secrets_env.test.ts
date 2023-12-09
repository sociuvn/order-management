import { ENVIRONMENT } from '../../src/util/secrets';

describe.skip('ENVIRONMENT', () => {
  const originalEnv = process.env;

  afterEach(() => {
    // Reset process.env after each test case
    process.env = originalEnv;
  });

  it('should be undefined when NODE_ENV is not set', () => {
    delete process.env.NODE_ENV;
    expect(ENVIRONMENT).toBeUndefined();
  });

  it('should be "development" when NODE_ENV is set to "development"', () => {
    process.env.NODE_ENV = 'development';
    expect(ENVIRONMENT).toBe('development');
  });

  it('should be "production" when NODE_ENV is set to "production"', () => {
    process.env.NODE_ENV = 'production';
    expect(ENVIRONMENT).toBe('production');
  });
});

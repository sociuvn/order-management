import logger from '../../src/util/logger';
import dotenv from 'dotenv';
import fs from 'fs';

jest.mock('../../src/util/logger');
jest.mock('dotenv');
jest.mock('fs');

describe('Environment Variables Loading', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loads from .env if file exists', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    require('../../src/util/secrets');
    expect(dotenv.config).toHaveBeenCalledWith({ path: '.env' });
    expect(logger.debug).toHaveBeenCalledWith('Using .env file to supply config environment variables');
  });

  it.skip('loads from .env.example if .env does not exist', () => {
    jest.mock('fs');
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    require('../../src/util/secrets');
    expect(dotenv.config).toHaveBeenCalledWith({ path: '.env.example' });
    expect(logger.debug).toHaveBeenCalledWith('Using .env.example file to supply config environment variables');
  });
});

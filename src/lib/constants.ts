
import path from 'path';

const PROJECT_BASE_DIR = path.resolve(__dirname, '..', '..');
const DATA_DIR_NAME = 'data';
const DATA_DIR_PATH = [
  PROJECT_BASE_DIR,
  DATA_DIR_NAME,
].join(path.sep);

const TEST_DATA_DIR_NAME = 'test-data';
const TEST_DATA_DIR_PATH = [
  PROJECT_BASE_DIR,
  TEST_DATA_DIR_NAME,
].join(path.sep);

export {
  DATA_DIR_PATH,
  TEST_DATA_DIR_PATH,
};

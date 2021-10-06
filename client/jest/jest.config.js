const getCacheDirectory = require('./webpack/getCacheDirectory');

module.exports = {
  verbose: true,
  setupFiles: ['./jest-setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testRegex: '(/spec/.*|\\.(test|spec))\\.(js)$',
  globals: {
    window: true,
  },
  cacheDirectory: getCacheDirectory('client')('jest'),
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
  }
};

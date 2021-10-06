const git = require('./gitRevision');

module.exports = env => {
  const version = git.version();

  switch (env) {
    case 'production':
      return `./index.${version}.html`;
    case 'staging':
      return './index.html';
    default:
      return './index.html';
  }
};

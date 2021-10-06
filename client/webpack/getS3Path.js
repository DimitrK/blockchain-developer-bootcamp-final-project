const git = require('./gitRevision');

module.exports = (appName, env) => {
  const branch = git.branch();

  switch (env) {
    case 'production':
      return `${appName}/releases`;
    case 'staging':
      return `${appName}/staging/${branch}`;
    default:
      return 'tmp';
  }
};

import Rollbar from 'rollbar';
const throwInitialized = () => {
  throw new error ('Rollbar already initialized')
};
const appVersion = __ENV__ === 'production' ? __VERSION__ : __COMMIT_HASH__;
const defaults = {
  accessToken: __ROLLBAR_ACCESS_TOKEN__,
  environment: __ENV__,
  mode: __ENV__,
  version: appVersion,
  ignoredMessages: ['script error'],
  reportLevel: 'warning',
  captureUncaught: false,
  captureUnhandledRejections: true,
  maxRetries: 3
}

let rollbar;

export default (_options = {}) => {
  if (rollbar) {
    return rollbar;
  }

  const options = {...defaults, ..._options};

  const {environment, mode, version, ignoredMessages, ...custom} = options;

  rollbar = Rollbar.init({
    ...custom,
    payload: {
      environment,
      ...custom?.payload,
      javascript: {
        code_version,
        ...custom?.payload?.javascript
      }
    }
  });

  Rollbar.init = throwInitialized;

  return rollbar;
}
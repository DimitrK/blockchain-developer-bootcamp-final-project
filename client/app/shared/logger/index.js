import initializeRollbar from '@/shared/helpers/initializeRollbar';

let logger = window.console;
if (__ENV__ === 'production' || __ENV__ === 'staging') {
  logger = initializeRollbar();
}

export default logger;
import initializeRollbar from '@/shared/helpers/initializeRollbar';
const noop = _ => _;
let logger = window.console;


// Make sure the table log will have meaningful content.
// E.g. BN numbers are objects, represent them as strings instead.
const table = logger.table;
logger.table = data => {
  try {
    table(JSON.parse(JSON.stringify(data)));
  } catch (e) {
    logger.log(data);
  }
};

if (__ENV__ === 'production' || __ENV__ === 'staging') {
  logger = initializeRollbar();
  logger.debug = noop;
  logger.log = noop;
  logger.warn = noop;
  logger.table = noop;
  logger.info = noop;
}


export default logger;

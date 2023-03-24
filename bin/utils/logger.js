const log4js = require('log4js');
const path = require('path');

// log file base path
const LOG_PATH = path.resolve(__dirname, '../../logs');

// error log file path
const ERROR_LOG_DIR = '/error';
const ERROR_LOG_FILE = 'error';
const ERROR_LOG_PATH = `${LOG_PATH}${ERROR_LOG_DIR}/${ERROR_LOG_FILE}`;
// response log file path
const RESPONSE_LOG_DIR = '/response';
const RESPONSE_LOG_FILE = 'response';
const RESPONSE_LOG_PATH = `${LOG_PATH}${RESPONSE_LOG_DIR}/${RESPONSE_LOG_FILE}`;

log4js.configure({
  appenders: {
    'console': {
      'type': 'console'
    },
    'errLogger': {
      type: 'dateFile',
      path: ERROR_LOG_DIR,
      filename: ERROR_LOG_PATH,
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      encoding: 'utf-8',
      maxLogSize: 1000
    },
    'resLogger': {
      type: 'dateFile',
      path: RESPONSE_LOG_DIR,
      filename: RESPONSE_LOG_PATH,
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      encoding: 'utf-8',
      maxLogSize: 1000
    }
  },
  categories: {
    'default': {
      appenders: ['console'],
      level: 'all'
    },
    'errLogger': {
      appenders: ['errLogger'],
      level: 'error'
    },
    'resLogger': {
      appenders: ['resLogger'],
      level: 'info'
    }
  },
  baseLogPath: LOG_PATH
});

module.exports = function (loggerName) {
  return log4js.getLogger(loggerName);
};
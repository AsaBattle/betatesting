// utils/alogger.js

const isProd = true;// process.env.NODE_ENV === 'production';

const log = (...args) => {
  if (!isProd) {
    console.log(...args);
  }
};

const error = (...args) => {
  if (!isProd) {
    console.error(...args);
  }
};

const warn = (...args) => {
  if (!isProd) {
    console.warn(...args);
  }
};

const info = (...args) => {
  if (!isProd) {
    console.info(...args);
  }
};

const alogger = log;
alogger.log = log;
alogger.error = error;
alogger.warn = warn;
alogger.info = info;

export default alogger;
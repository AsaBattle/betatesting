// utils/alogger.js

const isProd = false;


// Prints colored text to the console
// Called with: log(color, string, color, string, color, string, ...)
// Usage examples:
// log("red", "This is a red string");
// log("green", "This is green", "red", "This string is red", "white", "This string is white");
const log = (...args) => {
  if (isProd)
    return;
  const colorCodes = {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    brightBlack: '\x1b[30;1m',
    brightRed: '\x1b[31;1m',
    brightGreen: '\x1b[32;1m',
    brightYellow: '\x1b[33;1m',
    brightBlue: '\x1b[34;1m',
    brightMagenta: '\x1b[35;1m',
    brightCyan: '\x1b[36;1m',
    brightWhite: '\x1b[37;1m',
    // Background colors
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
    bgBrightBlack: '\x1b[40;1m',
    bgBrightRed: '\x1b[41;1m',
    bgBrightGreen: '\x1b[42;1m',
    bgBrightYellow: '\x1b[43;1m',
    bgBrightBlue: '\x1b[44;1m',
    bgBrightMagenta: '\x1b[45;1m',
    bgBrightCyan: '\x1b[46;1m',
    bgBrightWhite: '\x1b[47;1m',
  };
  
  let logString = '';

  for (let i = 0; i < args.length; i += 2) {
    const colors = Array.isArray(args[i]) ? args[i] : [args[i], ''];
    const string = args[i + 1];

    const textColorCode = colorCodes[colors[0].toLowerCase()] || colorCodes.white; // Default to white if text color not found
    const bgColorCode = colors[1] ? (colorCodes[colors[1].toLowerCase()] || '') : ''; // Use background color if provided

    logString += `${textColorCode}${bgColorCode}${string}\x1b[0m `;
  }

  console.log(logString);
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
module.exports = {
  error,
  warn,
  info,
  debug,
};

function error(message) {
  console.error(message);
}

function warn(message) {
  console.warn(message);
}

function info(message) {
  console.info(message);
}

function debug(message) {
  console.debug(message);
}

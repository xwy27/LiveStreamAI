const serve = require('koa-static');

module.exports = function (path) {
  return serve(path);
};
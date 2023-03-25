const fs = require('fs');
const PATH = require('path');
const router = require('koa-router')();
const Logger = require('../utils/logger')('default');

/**
 * Register the router from the router controller files
 *
 * @param {object} router: koa-router
 * @param {object} mapping: dictionary defining the router
 */
function addMapping(router, mapping) {
  for (let url in mapping) {
    if (url.startsWith('GET ')) {
      let path = url.substring(4);
      router.get(path, mapping[url]);
      Logger.info(`  [Register URL] GET ${path}`);
    } else if (url.startsWith('POST ')) {
      let path = url.substring(5);
      router.post(path, mapping[url]);
      Logger.info(`  [Register URL] POST ${path}`);
    } else if (url.startsWith('DELETE ')) {
      let path = url.substring(7);
      router.delete(path, mapping[url]);
      Logger.info(`  [Register URL] DELETE ${path}`);
    } else {
      Logger.info(`  [Register URL] INVALID ${url}`);
    }
  }
}


/**
 * Traverse the controllers folder and find all the
 * router controller js files
 *
 * @param {object} router: koa-router
 */
function addControllers(router) {
  let files = fs.readdirSync(PATH.resolve(__dirname, '../controllers'));
  let jsFiles = files.filter((f) => {
    return f.endsWith('.js');
  });

  for (let f of jsFiles) {
    Logger.info(`[Import Controller] ${f}`);
    let mapping = require(PATH.resolve(__dirname, '../controllers/' + f));
    addMapping(router, mapping);
  }
}

module.exports = function (dir) {
  let controllersDir = dir || 'controllers'; // default controller dir
  addControllers(router, controllersDir);
  return router.routes();
};
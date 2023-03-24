const nunjucks = require('nunjucks');
const PATH = require('path');

/**
 * @param {string} path:  filePath for html template
 * @param {object} opts:  options for nunjucks environment
 */
function createEnv(path, opts) {
    let autoescape = opts.autoescape === undefined ? true : opts.autoescape;
    let noCache = opts.noCache || false;
    let watch = opts.watch || false;
    let throwOnUndefined = opts.throwOnUndefined || false;
    let env = new nunjucks.Environment(
        new nunjucks.FileSystemLoader(path, {
            noCache: noCache,
            watch: watch,
        }), {
            autoescape: autoescape,
            throwOnUndefined: throwOnUndefined
        });
    if (opts.filters) {
        for (var f in opts.filters) {
            env.addFilter(f, opts.filters[f]);
        }
    }
    return env;
}

const env = createEnv(PATH.resolve(__dirname, '../views/'), {
    watch: true,
    filters: {
        hex: function (n) { // prevent the xss: script injection
            return '0x' + n.toString(16);
        }
    }
});

module.exports = function template() {
    return env; // Create template engine
};
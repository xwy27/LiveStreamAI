const path = require('path');
const cp = require('child_process');
const chokidar = require('chokidar');

const watcher = chokidar.watch(path.join(__dirname, '/bin'));

const app_path = path.join(__dirname, '/bin/app.js');

let app = cp.fork(app_path);

/**
 * Kill a child process and return a new one
 * @param {child process} app child process to be killed
 */
function reload(app) {
  app.kill('SIGINT'); // kill child process by sending keyboard interrupt
  return cp.fork(app_path);
}

watcher.on('ready', () => {
  // file change
  watcher.on('change', (path) => {
    app = reload(app);
  });

  // file create
  watcher.on('add', (path) => {
    app = reload(app);
  });

  // file remove
  watcher.on('unlink', (path) => {
    app = reload(app);
  });
});

process.on('SIGINT', () => {
  process.exit(0);
});
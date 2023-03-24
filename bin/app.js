// external library and middleware
const koa = require('koa');
const path = require('path');
// const cors = require('koa2-cors');

// custom middleware
const body = require('./middleware/body');
const router = require('./middleware/controller');
const static_serve = require('./middleware/static');

// custom utils and configuration
const config = require('./config/config');
const Logger = require('./utils/logger');

const app = new koa();

// fix cors request
// app.use(cors({
//     origin: function (ctx) {
//       return '*';
//     },
//     exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
//     maxAge: 5,
//     credentials: true,
//     allowMethods: ['GET', 'POST', 'DELETE'],
//     allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
// }));

// Add body middleware
app.use(body());
// Add router middleware
app.use(router());
// Route static resources
app.use(static_serve(path.join(__dirname, config.static_path)));

app.listen(config.port, () => {
  Logger('default').trace(`Server running at port:${config.port}`);
});
const koa = require('koa');
const app = new koa();

app.use(async (ctx) => {
  ctx.body = 'hello world';
});

app.listen(3000, () => {
  console.log('Koa running at port 3000...');
});
const template = require('../middleware/template')();

let index = async ctx => {
    ctx.body = template.render('index.html', {
        title: 'TEST'
    });
}

module.exports = {
    'GET /index': index
}
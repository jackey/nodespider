var Spider = require('../lib/spider');
var EventEmitter = require('events').EventEmitter;

// Fixed config.
var qq = {
        host: 'www.qq.com',
        method:'GET',
        path: '/',
        port: 80,
        charset: 'GB18030'
}

function QQSpider () {
   var spider = this.spider = new Spider(qq);
   var qqspider = this;
   spider.on('#NewsInfo a', function (news) {
       qqspider.emit('newslist', news);
   });
   spider.on('data', function (data) {
       qqspider.emit('data', data);
   });
}

QQSpider.prototype.__proto__ = EventEmitter.prototype;

module.exports = QQSpider;
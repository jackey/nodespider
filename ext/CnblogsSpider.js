var Spider = require('../lib/spider');
var $ = require('jQuery');
var EventEmitter = require('events').EventEmitter;

// Fixed config.
var source = {
        host: 'www.cnblogs.com',
        method:'GET',
        path: '/cate/mysql/',
        port: 80,
        charset: 'utf-8'
}

function CnblogsSpider () {
   var spider = this.spider = new Spider(source);
   var blogsSpider = this;
   spider.on('#post_list .post_item h3', function (blogs) {
       blogsSpider.emit('items', blogs);
   });
   spider.on('data', function (data) {
       blogsSpider.emit('data', data);
   });
}

CnblogsSpider.prototype.__proto__ = EventEmitter.prototype;

CnblogsSpider.source = source;

module.exports = CnblogsSpider;

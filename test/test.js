var $ = require('jQuery');
var file = require('fs');
var path = require('path');
var http = require('http');
var querystring = require('querystring');

module.exports.testQQSpider = function (beforeExit, assert) {
    var Spider = require('../index').QQSpider;
    var q = new Spider();
    q.on('newslist', function (list) {
        assert.isNotNull(list);
    });
}

module.exports.testCnblogsSpider = function (beforeExit, assert) {
    var CnblogsSpider = require('../index').CnblogsSpider;
    var Spider = require('../index').Spider;
    if (!path.existsSync('./blogs')) {
        file.mkdirSync('./blogs', '0777');
    }
    var blogs = new CnblogsSpider();
    blogs.on('items', function (blogs) {
        $(blogs).each(function () {
            var title = $('a', this).text();
            var url = $('a', this).attr('href').replace('http://', '');
            var path = url.replace(CnblogsSpider.source.host, '');
            var source = {
                host: CnblogsSpider.source.host,
                method: 'GET',
                path: path,
                port: CnblogsSpider.source.port
            };
            var s = new Spider(source);
            s.on('#cnblogs_post_body', function (data) {
                var content = $(data).html();
                var node = {
                    'title': title,
                    'body[und][0][value]': content,
                    'body[und][0][format]' : 'full_html',
                    'type': 'document'
                };
                
                // Save into drupal.
                var chunk = querystring.stringify(node);
                var req = http.request({
                    host: 'bonesdev.com',
                    path: '/node_resource/node',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': chunk.length,
                        'Accept': 'application/json'
                    }
                }, function (res) {
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        //console.log(chunk);
                    });
                    res.on('end', function () {
                        console.log('Inserted %s', title);
                    });
                });
                req.on('error', function (err) {
                    console.log(err);
                });
                req.write(chunk + '\n');
                req.end();
            });
        });
    });
}

//var source = {
//        host: 'www.cnblogs.com',
//        method:'GET',
//        path: '/cate/mysql/',
//        port: 80,
//        charset: 'utf-8'
//}
var util = require('util');
var $ = require('jQuery');
var journey = require('journey');
var QQspider = require('../ext/qqspider');

//
// Create a Router object with an associated routing table
//
var router = new(journey.Router);

router.map(function () {
    this.root.bind(function (req, res) { // GET '/'
        res.send(200, {}, "Welcome");
    });
    this.get('/version').bind(function (req, res) {
        res.send(200, {}, {
            version: journey.version.join('.')
        });
    });
    // /qq?type=newslist&callback=js_fn
    this.get('/qq').bind(function (req, res, params) {
        var type = params.type;
        var js_fn = params.callback;
        console.log(params);
        if (!type) {
            res.send({error: 'miss event type.'});
            return;
        }
        var spider = new QQspider();
        spider.on(type, function (data) {
            //res.send({data: $(data).html()});
            var list = [];
            data.each(function () {
                list.push($(this).text());
            });
            if (js_fn) {
                var param = '[';
                for (var i = 0; i < list.length; i++) {
                    param += ',' + list[i] +',';
                }
                param[param.length - 1] = ']';
                var output = callback + '(' + param+ ')';
                res.send({data: output});
            }
            else {
              res.send({data:list});
            }
        });
    });
});


exports.start = function () {
    require('http').createServer(function (request, response) {
        var body = "";

        request.addListener('data', function (chunk) {
            body += chunk
        });
        request.addListener('end', function () {
            //
            // Dispatch the request to the router
            //
            router.handle(request, body, function (result) {
                response.writeHead(result.status, result.headers);
                response.end(result.body);
            });
        });
    }).listen(8080);
}
util.puts('journey listening at http://127.0.0.1:8080');
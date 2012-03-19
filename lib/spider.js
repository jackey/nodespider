var http = require('http');
var Iconv = require('iconv').Iconv;
var Buffer = require('buffer').Buffer;
var $ = require('jQuery');
var EventEmitter = require('events').EventEmitter;

if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}

function Spider(source) {
    var spider = this;
    var charset = source.charset ? source.charset: 'UTF-8';
    var iconv = new Iconv(charset, 'UTF-8//IGNORE');
    var req = http.request(source, function (res) {
        var buffers = [], size = 0;
        res.on('data', function (chunk) {
            buffers.push(chunk);
            size += chunk.length
        });
        res.on('end', function () {
            var buffer = new Buffer(size), pos = 0;
            for (var i = 0; i < buffers.length; i++) {
                buffers[i].copy(buffer, pos);
                pos += buffers[i].length;
            }
            var data = iconv.convert(buffer).toString();
            // Emit events.
            spider.emit('data', data);
            spider.handleDomSelector(data);
        });
    });
    
    req.on('end', function (e) {
        if (e) {
            console.log();
        }
        else {
           spider.emit('end'); 
        }
    });
    req.end();
}

Spider.prototype.__proto__ = EventEmitter.prototype;

Spider.prototype.defaultEvents = ['data', 'end'];

Spider.prototype.handleDomSelector = function (data) {
    for (var selector in this._events) {
        // TODO: need high performance method.
        if (this.defaultEvents.indexOf(selector) == -1) {
            // Simple.
            var dom = $(selector, $(data));
            this.emit(selector, dom);
        }
    }
}

module.exports = Spider;
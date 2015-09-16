var _fs = require('fs');
var existsSync = _fs.existsSync;

var _path = require('path');
var resolve = _path.resolve;
var dirname = _path.dirname;

function searchUpSync(file, dir) {
    var prev;
    do {
        var filePath = resolve(dir, file);
        if (existsSync(filePath)) {
            return filePath;
        }
        prev = dir;
        dir = dirname(dir);
    } while(dir !== prev);
    return undefined;
}

module.exports = {
    searchUpSync: searchUpSync
};
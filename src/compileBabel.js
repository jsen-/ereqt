"use strict";
var _fs = require('fs');
var readFileSync = _fs.readFileSync;

var _path = require('path');
var dirname = _path.dirname;

var assign = Object.assign || require('object-assign');
var stripBom = require('strip-bom');

var babel = require('babel');

var _utils = require('./utils');
var searchUpSync = _utils.searchUpSync;

var CONFIG_FILE_NAME = '.babelrc';

module.exports = function compileBabel(source, inputFileName) {
    var configFile = searchUpSync(CONFIG_FILE_NAME, dirname(inputFileName));
    var options = configFile ? JSON.parse(stripBom(readFileSync(configFile, 'utf8'))) : {};

    var optionsBabel = assign({ ast: false }, options, {
        sourceMaps: true,
        code: true,
        filename: inputFileName
    });

    return babel.transform(source, optionsBabel);
};

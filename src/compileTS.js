"use strict";
var _fs = require('fs');
var readFileSync = _fs.readFileSync;

var _path = require('path');
var dirname = _path.dirname;

var stripBom = require('strip-bom');
var ts = require("typescript");

var _utils = require('./utils');
var searchUpSync = _utils.searchUpSync;

var CONFIG_FILE_NAME = 'tsconfig.json';

module.exports = function compileTS(source, inputFileName) {

    var configFile = searchUpSync(CONFIG_FILE_NAME, dirname(inputFileName));
    var config = configFile ? JSON.parse(stripBom(readFileSync(configFile, 'utf8'))) : { compilerOptions: {} };

    var options = config.compilerOptions;
    options.sourceMap = true;
    options.target = ts.ScriptTarget.ES6;
    
    var t = ts.transpileModule(source, { compilerOptions: options, fileName: inputFileName, reportDiagnostics: true });
    var code = t.outputText;
    var map = t.sourceMapText;

    (t.diagnostics || []).forEach(function (diagnostic) {
        var _diag = diagnostic.file ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start) : { };
        var line = _diag.line || '';
        var character = _diag.character || '';
        var fileName = diagnostic.file ? diagnostic.file.fileName : '';
        var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

        console.error(fileName + "(" + (line + 1) + "," + (character + 1) + "): " + message);
    });

    if (code === undefined) {
        throw new Error('Output generation failed for "' + inputFileName + '"\n');
    }

    return {
        code: code,
        map: JSON.parse(map)
    };

};

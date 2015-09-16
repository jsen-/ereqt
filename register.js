"use strict";

var minimatch = require('minimatch');
var path = require('path');
var _fs = require('fs');
var Module = require('module');
var mkdirpSync = require('mkdirp').sync;
var stripBom = require('strip-bom');
var runInThisContext = require('vm').runInThisContext;

var inlineSourceMapComment = require('inline-source-map-comment');

var transpile = require('./src/transpile');

var basename = path.basename;
var dirname = path.dirname;
var resolve = path.resolve;
var relative = path.relative;

var readFileSync = _fs.readFileSync;
var writeFileSync = _fs.writeFileSync;
var statSync = _fs.statSync;
var existsSync = _fs.existsSync;

var _utils = require('./src/utils');
var searchUpSync = _utils.searchUpSync;

var PACKAGE_NAME = require('./package.json').name;
var CONFIG_FILE_NAME = '.' + PACKAGE_NAME + '.json';

require.extensions['.ts'] = function loader(module, filename) {

    var configFile = searchUpSync(CONFIG_FILE_NAME, dirname(filename));
    var config = configFile ? JSON.parse(stripBom(readFileSync(configFile, 'utf8'))) : { };
    var filenameCached;

    if (config.cacheDir) {
        var projectRoot = dirname(configFile);
        var cacheRoot = resolve(projectRoot, config.cacheDir);
        var projectRootRelativeFileName = relative(projectRoot, filename);
        filenameCached = resolve(cacheRoot, projectRootRelativeFileName) + '.js';
        
        if (existsSync(filenameCached)) {
            if (statSync(filenameCached).mtime.getTime() >= statSync(filename).mtime.getTime()) {
                return compile.call(module, readFileSync(filenameCached, 'utf8'), filename, filenameCached);
            }
        } else {
            mkdirpSync(dirname(filenameCached));
        }
    } else {
        console.warn('ereqt: "cacheDir" not specified for "' + filename + '", debugging might not work properly');
    }

    var source = readFileSync(filename, 'utf8');
    var relFileName = basename(filename);
    var t = transpile(source, filename);
    var content;

    if (config.cacheDir) {
        var filenameMap = filenameCached + '.map';
        // map file and source file, both reside in the same directory, so basename is enough
        t.map.file = basename(filenameCached);
        
        // fix for Sorcery windows bug - replace all backslashes with forward ones
        t.map.sources.forEach(function (src, index, sources) {
            var filenameSrc = resolve(dirname(filename), src);
            var filenameSrcRelativeToCache = relative(dirname(filenameCached), filenameSrc);
            sources[index] = filenameSrcRelativeToCache.replace(/\\/g, '/');
        });
        
        // FIXME: the sourceMappingURL will show up twice
        content = t.code + '\r\n//# sourceMappingURL=' + basename(filenameMap);
        
        writeFileSync(filenameCached, content);
        writeFileSync(filenameMap, t.map.toString());
    } else {
        // use inline source map, but debugging will most likely not work
        content = t.code + '\r\n' + inlineSourceMapComment(t.map);
    }

    compile.call(module, content, filename, filenameCached);
};

// as much copy paste from node source as possible
function compile(content, filename, realFileName) {
    var self = this;
    // remove shebang
    content = content.replace(/^\#\!.*/, '');
    
    function require(path) {
        return self.require(path);
    }
    
    require.resolve = function (request) {
        return Module._resolveFilename(request, self);
    };
    
    Object.defineProperty(require, 'paths', {
        get: function () {
            throw new Error('require.paths is removed. Use ' +
                    'node_modules folders, or the NODE_PATH ' +
                    'environment variable instead.');
        }
    });
    
    require.main = process.mainModule;
    
    // Enable support to add extra extension types
    require.extensions = Module._extensions;
    require.registerExtension = function () {
        throw new Error('require.registerExtension() removed. Use ' +
                    'require.extensions instead.');
    };
    
    require.cache = Module._cache;
    
    var dirname = path.dirname(filename);
    
    // create wrapper function
    var wrapper = Module.wrap(content);
    
    var compiledWrapper = runInThisContext(wrapper, { filename: realFileName });
    //if (global.v8debug) {
    //    if (!resolvedArgv) {
    //        // we enter the repl if we're not given a filename argument.
    //        if (process.argv[1]) {
    //            resolvedArgv = Module._resolveFilename(process.argv[1], null);
    //        } else {
    //            resolvedArgv = 'repl';
    //        }
    //    }
        
    //    // Set breakpoint on module start
    //    if (filename === resolvedArgv) {
    //        global.v8debug.Debug.setBreakPoint(compiledWrapper, 0, 0);
    //    }
    //}
    var args = [self.exports, require, self, filename, dirname];
    return compiledWrapper.apply(self.exports, args);
};

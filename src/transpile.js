"use strict";

var stripBom = require('strip-bom');

var compileTS = require('./compileTS');
var compileBabel = require('./compileBabel');
var sorcery = require('./sorcery');

module.exports = function transpile(source, tsFileName) {
    var es6 = compileTS(source, tsFileName);
    es6.code = es6.code.replace(/\.js\.map$/, '.es6.js.map');
    var es6fileName = tsFileName.replace(/\.ts$/, '.es6.js');
    var es6mapName = es6fileName + '.map';

    var es5 = compileBabel(es6.code.replace(/\/\/# sourceMappingURL=.+$/, ''), es6fileName);
    var es5fileName = tsFileName.replace(/\.ts/, '.js');
    var es5mapName = es5fileName + '.map';
    delete es5.map.sourcesContent;

    var optionsSorcery = {
        content: {},
        sourcemaps: {}
    };
    optionsSorcery.content[tsFileName] = source;
    optionsSorcery.content[es6fileName] = es6.code;
    optionsSorcery.content[es5fileName] = es5.code;

    optionsSorcery.sourcemaps[es6fileName] = es6.map;
    optionsSorcery.sourcemaps[es5fileName] = es5.map;

    var chain = sorcery.loadSync(es5fileName, optionsSorcery)
    var map = chain.apply({ includeContent: false, inline: true });
    delete map.file;
    delete map.sourcesContent;

    return {
        code: es5.code.replace(/\/\/# sourceMappingURL=.+$/, ''),
        map: map
    };
};

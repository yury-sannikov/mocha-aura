'use strict';

var path = require('path');
var fs = require('fs');
module.exports = function ensurePath() {
    if (ensurePath.__registered) {
        return;
    }

    var dirName = path.dirname(module.parent.id);
    var fileName = void 0;
    do {
        dirName = path.join(dirName, '..');
        fileName = path.join(dirName, 'package.json');
    } while (dirName !== path.sep && !fs.existsSync(fileName));

    if (dirName === path.sep) {
        throw Error('Unable to find parent package.json file');
    }

    var packageJson = module.parent.require(fileName);

    if (!packageJson || !packageJson.auraPath) {
        throw Error('package.json should have auraPath parameter');
    }

    var auraFullPath = path.join(path.dirname(fileName), packageJson.auraPath);
    require('app-module-path').addPath(auraFullPath);
    ensurePath.__registered = true;
};
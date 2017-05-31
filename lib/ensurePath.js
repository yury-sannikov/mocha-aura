const path = require('path');
const fs = require('fs');
module.exports = function ensurePath() {
    if (ensurePath.__registered) {
        return;
    }

    let dirName = path.dirname(module.parent.id);
    let fileName;
    do {
        dirName = path.join(dirName, '..');
        fileName = path.join(dirName, 'package.json');
    } while (dirName !== path.sep && !fs.existsSync(fileName));
    
    if (dirName === path.sep) {
        throw Error('Unable to find parent package.json file');
    }

    const packageJson = module.parent.require(fileName);

    if (!packageJson || !packageJson.auraPath) {
        throw Error('package.json should have auraPath parameter');
    }

    const auraFullPath = path.join(path.dirname(fileName), packageJson.auraPath);
    require('app-module-path').addPath(auraFullPath);
    ensurePath.__registered = true;
}
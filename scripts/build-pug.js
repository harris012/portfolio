'use strict';
const upath = require('upath');
const sh = require('shelljs');
const renderPug = require('./render-pug');

const srcPath = upath.resolve(upath.dirname(__filename), '../src');

const files = sh.find(srcPath).filter(filePath =>
    filePath.match(/\.pug$/)
    && !filePath.match(/include/)
    && !filePath.match(/mixin/)
    && !filePath.match(/\/pug\/layouts\//)
);

Promise.all(files.map(f => renderPug(f))).catch(err => {
    console.error(err);
    process.exit(1);
});

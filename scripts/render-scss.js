"use strict";
const autoprefixer = require("autoprefixer");
const fs = require("fs");
const upath = require("upath");
const postcss = require("postcss");
const sass = require("sass");
const sh = require("shelljs");

const stylesPath = upath.resolve(upath.dirname(__filename), "../src/scss/styles.scss");
const destPath = upath.resolve(upath.dirname(__filename), "../dist/css/styles.css");

module.exports = function renderSCSS() {
    const results = sass.compile(stylesPath, {
        loadPaths: [upath.resolve(upath.dirname(__filename), "../node_modules")],
        // Bootstrap 5.3.x uses legacy @import and color APIs internally — silence until Bootstrap 6
        silenceDeprecations: ["import", "global-builtin", "color-functions", "if-function"],
    });

    const destPathDirname = upath.dirname(destPath);
    if (!sh.test("-e", destPathDirname)) {
        sh.mkdir("-p", destPathDirname);
    }

    postcss([autoprefixer]).process(results.css, { from: "styles.css", to: "styles.css" }).then(result => {
        result.warnings().forEach(warn => {
            console.warn(warn.toString());
        });
        fs.writeFileSync(destPath, result.css);
    });
};

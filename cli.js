#!/usr/bin/env node

"use strict";

/** @param {string[]} args  */
async function init(args) {
    if (args[0].endsWith('node')) {
        args = args.slice(1);
    }
    // console.log('args', args);

    var index = require('./dist/index');
    await index.combine(args[1] || '.', args[2] || '.');

    console.log('');
    // throw new Error("?? cli not found??", args);
}
init(process.argv);

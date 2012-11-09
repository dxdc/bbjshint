#!/usr/local/bin/node
'use strict';
/*jslint stupid:true, node:true */

var fs = require('fs'),
    exec = require('child_process').exec,
    hint = require('jshint').JSHINT,
    ascr = require('applescript'),
    fref = process.env.BB_DOC_PATH,
    fname = process.env.BB_DOC_NAME;


function logerr(err) {
    if (err) {
        console.log(err);
    }
}

function errorObj(results) {
    var out = [];
    results.forEach(function (res) {
        var item = [
                '{result_kind: "Error"',
                'result_file: "' + fref + '"',
                'result_line: ' + res.line,
                'message: "' + res.reason.replace(/"/g, '\\"') + '"}'
            ].join();
        out.push(item);
    });
    return '{' + out.join() + '}';
}

function errorScriptStr(listobj, fname) {
    return [
        'tell application "BBEdit"',
        'set errs to ' + listobj,
        'make new results browser with data errs with properties {name:"lint"}',
        'end tell'
    ].join('\n');
}

function notify(msg, cb) {
    exec('terminal-notifier -title bbedit -message "' + msg + '"');
}

function run(jsstr) {
    var list;
    if (hint(jsstr)) {
        notify('no lint in ' + fname);
    } else {
        list = errorObj(hint.errors);
        ascr.execString(errorScriptStr(list), logerr);
    }
}

run(fs.readFileSync(fref, 'utf-8'));

/*
    console.log(hint.errors)
    [ { id: '(error)',
        raw: 'Missing semicolon.',
        evidence: '        if (err) console.log(err)',
        line: 14,
        character: 34,
        scope: '(main)',
        a: undefined,
        b: undefined,
        c: undefined,
        d: undefined,
        reason: 'Missing semicolon.' } ]

    http://apple.stackexchange.com/questions/42497
*/

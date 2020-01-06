/* eslint-disable no-empty */
/* global describe, it, beforeEach */

const chai = require('chai');
const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname, '.');
const expect = chai.expect;

let Xapp;

describe('Xapp VMap tests', () => {
  beforeEach(() => {
    const jsdom = require('jsdom');
    const dom = new jsdom.JSDOM('<body></body>');
    const { window } = dom;
    const { document } = dom.window;

    global.window = window;
    global.document = document;
    global.CustomEvent = window.CustomEvent;
    global.HTMLElement = window.HTMLElement;

    Xapp = require('../../dist/x-app.js');

    global.window = window;
    global.document = document;
  });

  fs.readdirSync(dir).forEach(doTestDir);
});

function doTestDir(name) {
  let options = {
    method: 'getVMap',
    args: []
  };

  const dirname = path.join(dir, name);

  if (!fs.lstatSync(dirname).isDirectory()) return;

  const source = fs.readFileSync(path.join(dirname, 'source.html'), 'utf8');

  let expected = fs.readFileSync(path.join(dirname, 'expected.json'), 'utf8');
  expected = JSON.parse(expected);

  try {
    options = fs.readFileSync(path.join(dirname, 'options.json'), 'utf8');
    options = JSON.parse(options);
  } catch (e) {}

  it(name, () => {
    const xt = new Xapp(source);
    const actual = xt[options.method].apply(xt, options.args);

    expect(actual).to.be.eql(expected);
  });
}

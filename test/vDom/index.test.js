/* eslint-disable no-empty */
/* global describe, it, beforeEach */

const chai = require('chai');
const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname, '.');
const expect = chai.expect;

let Xapp;

const data = {
  var1: 'value 1',
  var2: 'value 2',
  html: '<b>ok</b>',
  path: '/image.png',
  groups: [
    {
      name: 'group A',
      items: [ 'A1', 'A2', 'A3' ]
    },
    {
      name: 'group B',
      items: [ 'B1', 'B2', 'B3' ]
    },
    {
      name: 'group C',
      items: []
    },
    {
      name: 'group D'
    }
  ],
  items: [
    {
      name: 'itemA',
      children: [
        {
          name: 'itemA1',
          children: [
            { name: 'itemA1A' },
            { name: 'itemA1B' },
            { name: 'itemA1C' }
          ]
        }
      ]
    },
    {
      name: 'itemB',
      children: [
        { name: 'itemB1' },
        {
          name: 'itemB2',
          children: [
            { name: 'itemB2A' },
            { name: 'itemB2B' },
            { name: 'itemB2C' }
          ]
        }
      ]
    }
  ]
};
describe('Xapp VDom tests', () => {
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
  const dirname = path.join(dir, name);

  if (!fs.lstatSync(dirname).isDirectory()) return;

  const sourceHTML = fs.readFileSync(path.join(dirname, 'source.html'), 'utf8');
  const expectedHTML = fs.readFileSync(path.join(dirname, 'expected.html'), 'utf8');

  let expected = fs.readFileSync(path.join(dirname, 'expected.json'), 'utf8');

  expected = JSON.parse(expected);

  it(name, () => {
    const xt = new Xapp(cleanHTML(sourceHTML));

    const actualHTML = xt.render(data);
    const actualVDom = xt.getVDom();

    expect(actualVDom).to.be.eql(expected);
    expect(cleanHTML(actualHTML)).to.be.equal(cleanHTML(expectedHTML));
  });
}

function cleanHTML(string) {
  return string
    .replace(/[\t\r\n]/g, '')
    .replace(/ {2,}/g, '')
    .replace(/> </g, '><')
    .trim();
}

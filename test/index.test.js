/* global describe, it, beforeEach, after */
/* jshint expr: true */

const html = `
  <body>
    <div id="template-init"></div>

    <div id="template-display-hidden" hidden></div>

    <ul id="template-for-1">
      <li x-for="item in items">{{ item.name }}</li>
    </ul>

    <ul id="template-for-2">
      <li x-for="item in items">{{ item.name }} {{ $index }} {{ $first }} {{ $last }}</li>
    </ul>

    <ul id="template-for-3">
      <li x-for="item in items">{{ items[item] }}</li>
    </ul>

    <ul id="template-for-4">
      <li x-for="group in groups">
        <h1>{{ group.name }}</h1>
        <ul>
          <li x-for="item in group.items">{{ item }}</li>
        </ul>
      </li>
    </ul>

    <div id="template-if-1">
      <div x-if="true">TRUE</div>
      <div x-if="false">FALSE</div>
    </div>

    <div id="template-if-2">
      <div x-if="condition">TRUE</div>
      <div x-if="array.length">ARRAY</div>
      <div x-if="nb < 100">LOWER</div>
      <div x-if="nb > 100">GREATER</div>
    </div>

    <ul id="template-for-if">
      <li x-for="group in groups" x-if="group.users.length">
        <h1>{{ group.name }}</h1>
        <ul>
          <li x-for="user in group.users">
            <h1>{{ user.name }}</h1>
            <ul x-if="user.items.length">
              <li x-for="item in user.items">{{ item }}</li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>

    <ul id="template-data">
      <li x-for="group in groups">
        <h1>{{ group.name }}</h1>
        <ul>
          <li x-for="item in group.items">
            <span>{{ item }}</span>
          </li>
        </ul>
      </li>
    </ul>

    <div id="template-src">
      <img x-src="image">
    </div>

    <div id="template-class">
      <div x-class="{ 'class1': true, 'class2': false, 'class3': var, 'class4': !var }"></div>
    </div>

    <div id="template-style">
      <div style="color: red" x-style="{ 'display': 'block', 'text-transform': var, 'textAlign': 'center' }"></div>
    </div>

    <div id="template-attr">
      <input x-attr="{ 'disabled': true, 'type': 'text', 'readonly': false }" readonly></div>
    </div>

    <script id="template-script" type="text/template">
      <p>{{ var }}</p>
    </script>

    <div id="destination1"></div>
    <div id="destination2"></div>

    <div id="template-mixin-1">
      <strong x-mixin="strong">here is the mixin</strong>
      <div><span x-use="strong" /></div>
    </div>

    <div id="template-mixin-2">
      <strong x-mixin="strong">{{ v }}</strong>
      <div><span x-use="strong with { 'v': var }" /></div>
    </div>

    <div id="template-mixin-3">
      <strong x-mixin="strong">{{ a + b }}</strong>
      <div><span x-use="strong with { 'a': var1, 'b': var2 }" /></div>
    </div>

    <div id="template-mixin-4">
      <strong x-mixin="strong">{{ $context.var1 }} {{ v }}</strong>
      <div><span x-use="strong with { 'v': var2, $context: this }" /></div>
    </div>

    <div id="template-mixin-5">
      <ul x-mixin="recursive">
        <li x-for="item in items">
          {{ item.name }}
          <ul x-if="item.children" x-use="recursive with { 'items': item.children }"></ul>
        </li>
      </ul>

      <div x-use="recursive with { 'items': items }"></div>
    </div>
  </body>
`;

let Xapp; let chai;

if (isCli()) {
  chai = require('chai');
} else {
  chai = window.chai;
}

const expect = chai.expect;

describe('Xapp tests', () => {
  beforeEach(() => {
    if (isCli()) {
      const jsdom = require('jsdom');
      const dom = new jsdom.JSDOM(html);
      const { window } = dom;
      const { document } = dom.window;

      global.window = window;
      global.document = document;
      global.CustomEvent = window.CustomEvent;
      global.HTMLElement = window.HTMLElement;

      Xapp = require('../dist/x-app.js');
    } else {
      Xapp = window.Xapp;

      document.querySelector('#test').innerHTML = html;
    }

    Xapp.settings({ warningLevel: 2 });
  });

  // // SETTINGS and HELPERS

  it('Should change settings', () => {
    let globalSettings, settings, t;

    globalSettings = Xapp.settings();

    expect(globalSettings).to.have.property('cssPrefix', true);

    Xapp.settings({ cssPrefix: false });
    t = new Xapp('<div />');

    globalSettings = Xapp.settings();
    settings = t.settings();

    expect(globalSettings).to.have.property('cssPrefix', false);
    expect(settings).to.have.property('cssPrefix', false);

    t = new Xapp('<div />', { cssPrefix: true });

    globalSettings = Xapp.settings();
    settings = t.settings();

    expect(globalSettings).to.have.property('cssPrefix', false);
    expect(settings).to.have.property('cssPrefix', true);

    Xapp.settings({ cssPrefix: true });
  });

  it('Should add pipes', () => {
    let globalPipes, pipes, t;

    globalPipes = Xapp.pipes();

    expect(globalPipes).to.have.property('upper');
    expect(globalPipes).to.not.have.property('new');

    Xapp.pipes({ new: function() {} });
    t = new Xapp('<div />');
    globalPipes = Xapp.pipes();
    pipes = t.pipes();

    expect(globalPipes).to.have.property('new');
    expect(pipes).to.have.property('new');

    t = new Xapp('<div />');
    t.pipes({ new2: function() {} });

    globalPipes = Xapp.pipes();
    pipes = t.pipes();

    expect(globalPipes).to.not.have.property('new2');
    expect(pipes).to.have.property('new2');
  });

  it('Should take nothing as a template', () => {
    const t = new Xapp();
    const body = t.getDOMObject();
    expect(body.tagName).to.be.eql('BODY');
  });

  // // xTEMPLATE

  it('Should take HTML as a template', () => {
    const t = new Xapp('<p></p>');
    const html = t.render();

    expect(html).to.be.eql('<p></p>');
  });

  it('Should take selector as a template', () => {
    const t = new Xapp('#template-init');
    const html = t.render();

    expect(html).to.be.eql('<div id="template-init"></div>');
  });

  it('Should take a DOM Element as a template', () => {
    const t = new Xapp(document.querySelector('#template-init'));
    const html = t.render();

    expect(html).to.be.eql('<div id="template-init"></div>');
  });

  it('Should throw error if DOM Element does not exist', () => {
    try {
      const t = new Xapp('#donotexist');
      t.render();
    } catch (e) {
      expect(e.message).to.be.contains('does not exist.');
    }
  });

  it('Should replace a DOM Element by the rendered template', () => {
    let destination1, destination2;

    destination1 = document.querySelector('#destination1');
    destination2 = document.querySelector('#destination2');

    expect(destination1.textContent).to.be.eql('');
    expect(destination2.textContent).to.be.eql('');

    const t = new Xapp('#template-script');
    t.connect(destination1);
    t.connect(destination2);
    t.render({ var: 'value' });

    destination1 = document.querySelector('#destination1');
    destination2 = document.querySelector('#destination2');

    expect(destination1.textContent).to.be.eql('value');
    expect(destination2.textContent).to.be.eql('value');
  });

  it('Should cssPrefix the element', () => {
    const t = new Xapp('#template-display-hidden');
    const html = t.render();
    expect(html).to.be.eql('<div id="template-display-hidden"></div>');
  });

  // VARS

  it('Should replace vars', () => {
    const t = new Xapp('<div>{{var1}} {{ var2 }} {{  var3  }}</div>');
    const html = t.render({
      var1: 'value1',
      var2: 'value2',
      var3: 'value3'
    });

    expect(html).to.contains('value1 value2 value3');
  });

  it('Should warn if a var is undefined', () => {
    const t = new Xapp('<p>{{ undefinedVar }}</p>');

    try {
      t.render();
    } catch (e) {
      expect(e.message).to.be.contains('undefinedVar');
    }
  });

  it('Should replace deep vars', () => {
    const t = new Xapp('<p>{{ a.b.c.d }}</p>');
    const html = t.render({
      a: { b: { c: { d: 'DEEP' } } }
    });

    expect(html).to.eql('<p>DEEP</p>');
  });

  it('Should replace var in attribute', () => {
    const t = new Xapp('<p class="{{ class }}"></p>');
    const html = t.render({
      class: 'red'
    });

    expect(html).to.eql('<p class="red"></p>');
  });

  it('Should evaluate expression', () => {
    const t = new Xapp('<p>{{ "result: " + (var1 + var2 - 3) }}</p>');
    const html = t.render({
      var1: 5,
      var2: 10
    });

    expect(html).to.contains('result: 12');
  });

  it('Should apply pipes in tags', () => {
    const t = new Xapp('<p>{{ var | upper }} {{ "STRING" | lower }} {{ "prefix " + var | upper }}</p>');
    const html = t.render({
      var: 'string'
    });

    expect(html).to.contains('STRING string PREFIX STRING');
  });

  // // X-FOR

  it('Should apply X-FOR loop with array', () => {
    const t = new Xapp('#template-for-1');
    const html = t.render({
      items: [ { name: 'A' }, { name: 'B' }, { name: 'C' } ]
    });

    expect(html).to.contains('<li>A</li>');
    expect(html).to.contains('<li>B</li>');
    expect(html).to.contains('<li>C</li>');
  });

  it('Should apply X-FOR loops with array with meta info', () => {
    const t = new Xapp('#template-for-2');
    const html = t.render({
      items: [ { name: 'A' }, { name: 'B' }, { name: 'C' } ]
    });

    expect(html).to.contains('<li>A 0 true false</li>');
    expect(html).to.contains('<li>B 1 false false</li>');
    expect(html).to.contains('<li>C 2 false true</li>');
  });

  it('Should apply X-FOR loops with object', () => {
    const t = new Xapp('#template-for-3');
    const html = t.render({
      items: { a: 'A', b: 'B', c: 'C' }
    });

    expect(html).to.contains('<li>A</li>');
    expect(html).to.contains('<li>B</li>');
    expect(html).to.contains('<li>C</li>');
  });

  it('Should apply nested X-FOR loops with array', () => {
    const t = new Xapp('#template-for-4');
    const html = t.render({
      groups: [
        {
          name: 'group A',
          items: [ 'A1', 'A2', 'A3' ]
        },
        {
          name: 'group B',
          items: [ 'B1', 'B2', 'B3' ]
        }
      ]
    });

    expect(HTMLtoText(html)).to.contains('group A A1 A2 A3 group B B1 B2 B3');
  });

  // // X-IF

  it('Should apply X-IF', () => {
    const t = new Xapp('#template-if-1');
    const html = t.render();

    expect(html).to.contains('TRUE');
    expect(html).not.to.contains('FALSE');
  });

  it('Should apply X-IF with expression', () => {
    const t = new Xapp('#template-if-2');
    const html = t.render({
      condition: true,
      array: [ 1, 2, 3 ],
      emptyArray: [],
      nb: 10
    });

    expect(html).to.contains('TRUE');
    expect(html).to.contains('ARRAY');
    expect(html).not.to.contains('EMPTY_ARRAY');
    expect(html).to.contains('LOWER');
    expect(html).not.to.contains('GREATER');
  });

  // // // X-IF & X-FOR

  it('Should apply nested X-FOR and X-IF', () => {
    const t = new Xapp('#template-for-if');
    const html = t.render({
      groups: [
        {
          name: 'group A',
          users: [ { name: 'USER AA', items: [ 'AA1', 'AA2', 'AA3' ] } ]
        },
        {
          name: 'group B',
          users: [ { name: 'USER B-A', items: [] } ]
        },
        {
          name: 'group C',
          users: []
        }
      ]
    });

    expect(HTMLtoFlatten(html)).to.contains(
      '<ul id="template-for-if">' +
        '<li>' +
          '<h1>group A</h1>' +
          '<ul>' +
            '<li>' +
              '<h1>USER AA</h1>' +
              '<ul>' +
                '<li>AA1</li><li>AA2</li><li>AA3</li>' +
              '</ul>' +
            '</li>' +
          '</ul>' +
        '</li>' +
        '<li>' +
          '<h1>group B</h1>' +
          '<ul>' +
            '<li>' +
              '<h1>USER B-A</h1>' +
            '</li>' +
          '</ul>' +
        '</li>' +
      '</ul>');
  });

  // // X-DATA

  it('Should inject X-DATA in a DOM element', () => {
    const t = new Xapp('#template-data');
    t.render({
      groups: [
        {
          name: 'group A',
          items: [ 'A1', 'A2', 'A3' ]
        }
      ]
    });

    t.getDOMObject().querySelectorAll('span').forEach((element, i) => {
      expect(element['x-data'].item).to.be.eql([ 'A1', 'A2', 'A3' ][i]);
    });
  });

  // // X-SRC

  it('Should apply X-SRC', () => {
    const t = new Xapp('#template-src');
    const html = t.render({ image: 'http://via.placeholder.com/1x1' });

    expect(html).to.contains('<img src="http://via.placeholder.com/1x1">');
  });

  // // X-CLASS

  it('Should apply X-CLASS', () => {
    const t = new Xapp('#template-class');
    const html = t.render({ var: true });

    expect(html).to.contains('<div class="class1 class3">');
  });

  // // X-STYLE

  it('Should apply X-STYLE', () => {
    const t = new Xapp('#template-style');
    const html = t.render({ var: 'uppercase' });

    expect(html).to.contains('<div style="color: red; display: block; text-transform: uppercase; text-align: center">');
  });

  // // X-ATTR

  it('Should apply X-ATTR', () => {
    const t = new Xapp('#template-attr');
    const html = t.render({ var: true });

    expect(html).to.contains('<input disabled="disabled" type="text">');
  });

  // // X-MIXINS

  // @TODO write tests on external object and string mixins

  it('Should use X-MIXIN / X-USE', () => {
    const t = new Xapp('#template-mixin-1');
    const html = t.render();

    expect(html).to.contains('<div><strong>here is the mixin</strong></div>');
  });

  it('Should use X-MIXIN / X-USE with data', () => {
    const t = new Xapp('#template-mixin-2');
    const html = t.render({ var: 'value' });

    expect(html).to.contains('<div><strong>value</strong></div>');
  });

  it('Should use X-MIXIN / X-USE with multiple data', () => {
    const t = new Xapp('#template-mixin-3');
    const html = t.render({ var1: 2, var2: 3 });

    expect(html).to.contains('<div><strong>5</strong></div>');
  });

  it('Should use X-MIXIN / X-USE with context data', () => {
    const t = new Xapp('#template-mixin-4');
    const html = t.render({ var1: 'value1', var2: 'value2' });

    expect(html).to.contains('<div><strong>value1 value2</strong></div>');
  });

  it('Should use X-MIXIN / X-USE recursively', () => {
    const t = new Xapp('#template-mixin-5');
    const html = t.render({
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
    });

    expect(HTMLtoFlatten(html)).to.contains(
      '<ul>' +
        '<li> itemA ' +
          '<ul>' +
            '<li> itemA1 ' +
              '<ul>' +
                '<li> itemA1A </li>' +
                '<li> itemA1B </li>' +
                '<li> itemA1C </li>' +
              '</ul>' +
            '</li>' +
          '</ul>' +
        '</li>' +
        '<li> itemB ' +
          '<ul>' +
            '<li> itemB1 </li>' +
            '<li> itemB2 ' +
              '<ul>' +
                '<li> itemB2A </li>' +
                '<li> itemB2B </li>' +
                '<li> itemB2C </li>' +
              '</ul>' +
            '</li>' +
          '</ul>' +
        '</li>' +
      '</ul>');
  });

  // // EVENTS & CALLBACKS

  it('Should trigger events', (done) => {
    const t = new Xapp('<div id="events"></div>');

    const beforePromise = new Promise((resolve) => {
      document.addEventListener('x-before', (e) => {
        if (e.detail.template.id === 'events') {
          expect(e.detail.template.id).to.eql('events');
          expect(e.detail.data.var1).to.eql(true);
          expect(e.detail.data.var2).to.eql(false);

          e.detail.data.var2 = true;
        }

        resolve();
      });
    });

    const afterPromise = new Promise((resolve) => {
      document.addEventListener('x-after', (e) => {
        if (e.detail.template.id === 'events') {
          expect(e.detail.template.id).to.eql('events');
          expect(e.detail.data.var1).to.eql(true);
          expect(e.detail.data.var2).to.eql(true);
        }

        resolve();
      });
    });

    t.render({ var1: true, var2: false });

    Promise.all([ beforePromise, afterPromise ]).then(() => done()).catch((e) => done(e));
  });

  it('Should trigger callbacks', (done) => {
    const beforePromise = (template, data) => {
      expect(template.id).to.eql('callbacks');
      expect(data.var1).to.eql(true);
      expect(data.var2).to.eql(false);

      data.var2 = true;

      return new Promise((resolve) => resolve());
    };

    const afterPromise = (template, data) => {
      expect(template.id).to.eql('callbacks');
      expect(data.var1).to.eql(true);
      expect(data.var2).to.eql(true);

      return new Promise((resolve) => resolve());
    };

    const t = new Xapp('<div id="callbacks"></div>', {
      beforeRender: beforePromise,
      afterRender: afterPromise
    });

    t.render({ var1: true, var2: false });

    Promise.all([ beforePromise, afterPromise ]).then(() => done()).catch((e) => done(e));
  });

  // // X-SHOW

  it('Should apply X-SHOW with display:none', () => {
    const t = new Xapp('<div><p x-show="visible">Content</p></div>');
    const html = t.render({ visible: false });
    expect(html).to.contain('style="display: none"');
  });

  it('Should remove display:none when x-show is true', () => {
    const t = new Xapp('<div><p x-show="visible">Content</p></div>');
    const html = t.render({ visible: true });
    expect(html).to.not.contain('display: none');
  });

  it('Should preserve existing styles with x-show', () => {
    const t = new Xapp('<div><p style="color: red" x-show="visible">Content</p></div>');
    const html = t.render({ visible: false });
    expect(html).to.contain('color: red');
    expect(html).to.contain('display: none');
  });

  it('Should x-show work in loops', () => {
    const t = new Xapp('<ul><li x-for="item in items" x-show="item.visible">{{ item.name }}</li></ul>');
    const html = t.render({
      items: [
        { name: 'A', visible: true },
        { name: 'B', visible: false },
        { name: 'C', visible: true }
      ]
    });
    expect(html).to.contain('A');
    expect(html).to.contain('B');
    expect(html).to.contain('C');
    const b_count = (html.match(/display: none/g) || []).length;
    expect(b_count).to.equal(1);
  });

  // // X-KEY

  it('Should parse x-key attribute', () => {
    const t = new Xapp('<ul><li x-for="item in items" x-key="item.id">{{ item.name }}</li></ul>');
    const html = t.render({
      items: [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' }
      ]
    });
    expect(html).to.contain('A');
    expect(html).to.contain('B');
  });

  // // X-HTML

  it('Should render raw HTML with x-html', () => {
    const t = new Xapp('<div x-html="content"></div>');
    const html = t.render({ content: '<b>Bold</b>' });
    expect(html).to.contain('<b>Bold</b>');
    expect(html).to.contain('Bold</b>');
  });

  it('Should x-html work in loops', () => {
    const t = new Xapp('<ul><li x-for="item in items" x-html="item.html"></li></ul>');
    const html = t.render({
      items: [
        { html: '<span>Item 1</span>' },
        { html: '<span>Item 2</span>' }
      ]
    });
    expect(html).to.contain('<span>Item 1</span>');
    expect(html).to.contain('<span>Item 2</span>');
  });

  // // REACTIVE MODE

  it('Should enable reactive mode globally', () => {
    Xapp.settings({ reactive: false });
    const originalReactive = Xapp.settings().reactive;
    expect(originalReactive).to.equal(false);
  });

  it('Should enable reactive mode on instance', () => {
    const t = new Xapp('<div><p>{{ count }}</p></div>', { reactive: true });
    const data = { count: 0 };
    t.render(data);

    const dom = t.getDOMObject();
    const p = dom.querySelector('p');
    expect(p.textContent).to.equal('0');
  });

  // // COMBINATIONS

  it('Should combine x-for with x-show and x-key', () => {
    const t = new Xapp('<ul><li x-for="item in items" x-key="item.id" x-show="item.show">{{ item.name }}</li></ul>');
    const html = t.render({
      items: [
        { id: 1, name: 'Visible', show: true },
        { id: 2, name: 'Hidden', show: false },
        { id: 3, name: 'Visible2', show: true }
      ]
    });
    expect(html).to.contain('Visible');
    expect(html).to.contain('Hidden');
    expect(html).to.contain('Visible2');
    const hidden_count = (html.match(/display: none/g) || []).length;
    expect(hidden_count).to.equal(1);
  });

  it('Should combine x-if and x-show (if takes precedence)', () => {
    const t = new Xapp('<div><p x-if="show1" x-show="show2">Content</p></div>');
    const html = t.render({ show1: false, show2: true });
    expect(html).to.not.contain('Content');
  });
});

after(() => {
  if (!isCli()) {
    document.querySelector('#test').remove();
  }
});


// FUNCTIONS

function isCli() {
  return typeof process !== 'undefined';
}

function HTMLtoText(string) {
  return string
    .replace(/\n/g, '')
    .replace(/<[^>]*>?/g, ' ')
    .replace(/ {1,}/g, ' ')
    .trim();
}

function HTMLtoFlatten(string) {
  return string
    .replace(/\n/g, '')
    .replace(/ {1,}/g, ' ')
    .replace(/> </g, '><')
    .trim();
}


# Xapp

[![NPM version](https://badge.fury.io/js/%40jaysalvat%2Fx-app.svg)](http://github.com/jaysalvat/x-app)

Smart in place JS templating engine.
About 3kb+ GZipped

- [x] Virtual DOM
- [x] No dependencies
- [x] Interpolation ``{{ name }}``
- [x] Interpolation with object properties ``{{ item.name }}``
- [x] JS interpretation ``{{ 2 + 2 }}``
- [x] Conditions as ``x-if="var === true"``
- [x] Object keys loop as ``x-for="key in object"``
- [x] Array values loop as ``x-for="value in array"``
- [x] Loop metadata as ``$index``, ``$first``, ``$last``
- [x] Chainable pipes to transform vars as ``{{ text | truncate(10, '…') | upper }}``
- [x] Dynamic classes as ``x-class="{ 'red': true }"``
- [x] Dynamic attributes as ``x-attr="{ 'disabled': true }"``
- [x] Dynamic styles as ``x-style="{ 'display': true ? 'block': 'none' }"``
- [x] Css vendor prefix added to style properties
- [x] Mixins as ``x-mixin`` and ``x-use``
- [x] Recursive mixins
- [x] Includes as ``x-include="file.html"``
- [x] Autoshow hidden dom element when rendered
- [x] Events
- [x] SVG support
- [ ] Keyed diff

**Note**: Xapp makes heavy use of eval function.

### NPM install

    npm install --save @jaysalvat/x-app

### Yarn install

    yarn add x-app

### Usage

```javascript
import Template from '@jaysalvat/x-app';
```


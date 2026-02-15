# x-app

[![NPM version](https://badge.fury.io/js/%40jaysalvat%2Fx-app.svg)](http://github.com/jaysalvat/x-app)

Smart in-place JS templating engine for micro-apps.
**~4KB gzipped** | Virtual DOM | No dependencies

## Features

- [x] Virtual DOM with keyed diffing
- [x] No external dependencies
- [x] Interpolation: `{{ name }}`, `{{ item.name }}`, `{{ 2 + 2 }}`
- [x] Conditions: `x-if="condition"`
- [x] Visibility toggle: `x-show="visible"` (CSS-based)
- [x] Loops: `x-for="item in items"` or `x-for="key in object"`
- [x] Loop metadata: `$index`, `$first`, `$last`
- [x] Keyed lists: `x-key="item.id"` for optimized rendering
- [x] Dynamic attributes: `x-attr="{ 'disabled': true }"`
- [x] Dynamic classes: `x-class="{ 'active': isActive }"`
- [x] Dynamic styles: `x-style="{ 'color': color }"`
- [x] Chainable pipes: `{{ text | truncate(50) | upper }}`
- [x] Components: `x-mixin` and `x-use`
- [x] Includes: `x-include="file.html"`
- [x] Reactive mode with Proxy (optional, disabled by default)
- [x] SVG support
- [x] Form binding: `x-value`, `x-src`
- [x] Raw HTML: `x-html`

**Note**: x-app uses `eval()` for expression evaluation. Use only with trusted templates.

## Installation

### NPM

```bash
npm install --save @jaysalvat/x-app
```

### Yarn

```bash
yarn add @jaysalvat/x-app
```

### CDN

```html
<script src="https://unpkg.com/@jaysalvat/x-app"></script>
```

## Quick Start

```html
<div id="app">
  <h1>{{ title }}</h1>
  <ul>
    <li x-for="user in users" x-key="user.id">
      {{ user.name | firstcap }}
    </li>
  </ul>
</div>

<script src="x-app.js"></script>
<script>
  const app = new Xapp('#app');
  app.render({
    title: 'Users',
    users: [
      { id: 1, name: 'john' },
      { id: 2, name: 'jane' }
    ]
  });
</script>
```

## Documentation

### Tags & Directives

| Tag | Description | Example |
|-----|-------------|---------|
| `{{ variable }}` | Interpolation | `{{ user.name }}` |
| `{{ var \| pipe }}` | With filter | `{{ name \| upper }}` |
| `x-for` | Loop | `<div x-for="item in items">{{ item }}</div>` |
| `x-if` | Conditional (removes from DOM) | `<div x-if="user.logged">Welcome</div>` |
| `x-show` | Toggle visibility (CSS) | `<div x-show="visible">Content</div>` |
| `x-key` | Key for list optimization | `<div x-for="item in items" x-key="item.id">` |
| `x-attr` | Dynamic attributes | `<input x-attr="{ 'disabled': !active }">` |
| `x-class` | Dynamic classes | `<div x-class="{ 'active': isActive }">` |
| `x-style` | Dynamic styles | `<div x-style="{ 'color': color }">` |
| `x-value` | Form input binding | `<input x-value="name">` |
| `x-html` | Raw HTML | `<div x-html="content"></div>` |
| `x-src` | Dynamic src | `<img x-src="imagePath">` |
| `x-use` | Component/mixin | `<div x-use="header with data"></div>` |
| `x-mixin` | Define mixin | `<template x-mixin="header">...` |
| `x-include` | Include file | `<div x-include="header.html"></div>` |
| `x-verbatim` | Disable parsing | `<div x-verbatim="on">{{ notParsed }}</div>` |

### Pipes (Filters)

Chain multiple filters: `{{ name | upper | truncate(20) }}`

| Pipe | Usage |
|------|-------|
| `upper` | Uppercase | `{{ name \| upper }}` |
| `lower` | Lowercase | `{{ name \| lower }}` |
| `title` | Title Case | `{{ name \| title }}` |
| `firstcap` | Capitalize first letter | `{{ name \| firstcap }}` |
| `truncate(n)` | Limit length | `{{ text \| truncate(50) }}` |
| `json` | JSON format | `{{ obj \| json }}` |

### x-if vs x-show

**`x-if`**: Removes/creates element in DOM (heavier for frequent changes)
```html
<div x-if="showDetails">Details are visible</div>
```

**`x-show`**: Toggles CSS `display: none` (better for frequent toggles)
```html
<div x-show="isOpen">Menu</div>
```

### x-key for Lists

When rendering lists with add/remove/reorder operations, use `x-key` for performance:

```html
<!-- ❌ Without x-key (all items re-render if reordered) -->
<ul>
  <li x-for="user in users">{{ user.name }}</li>
</ul>

<!-- ✅ With x-key (only changed items re-render) -->
<ul>
  <li x-for="user in users" x-key="user.id">{{ user.name }}</li>
</ul>
```

Use stable unique identifiers (IDs) as keys, not array indices.

### API

```javascript
// Create instance
const app = new Xapp(selector, settings);

// Render with data
app.render(data, callback);

// Get internals
app.getHTML();           // Get rendered HTML
app.getVDom();           // Get virtual DOM
app.getVMap();           // Get virtual map

// Add custom filters
app.pipes({
  reverse: (str) => str.split('').reverse().join('')
});

// Add custom components
app.mixins({
  header: '<div>...</div>'
});

// Global configuration
Xapp.settings({
  cssPrefix: true,      // Add vendor prefixes
  warningLevel: 1,      // 1=warn, 2=throw
  reactive: false,      // Enable Proxy reactivity
  beforeRender: fn,     // Lifecycle hook
  afterRender: fn       // Lifecycle hook
});
```

### Reactive Mode

Enable automatic re-rendering with Proxy (disabled by default):

```javascript
// Global
Xapp.settings({ reactive: true });

// Per instance
const app = new Xapp('#template', { reactive: true });
app.render(data);

// Changes auto-trigger render
data.name = 'new value';  // Automatically renders
```

*Disabled by default to keep library lightweight.*

### Includes & Components

Load external HTML templates:

```html
<!-- Load HTML file -->
<div x-include="components/header.html"></div>

<!-- Define component -->
<template x-mixin="button-primary" class="btn btn-primary">
  {{ text }}
</template>

<!-- Use component -->
<div x-use="button-primary with { text: 'Click me' }"></div>
```

### Event Handling

Use `x-data` attribute to access context in event handlers:

```html
<button onclick="removeTodo(this)">Delete</button>

<script>
  window.removeTodo = (elmt) => {
    const { todo } = elmt['x-data'];  // Access loop context
    data.todos = data.todos.filter(t => t.id !== todo.id);
    app.render(data);
  };
</script>
```

## Examples

See [examples/](./examples/) folder for 15 detailed examples:

- **01-hello**: Basic interpolation
- **02-for**: Array and object loops
- **03-if**: Conditionals
- **04-show**: CSS visibility toggle
- **05-key**: Keyed list rendering
- **06-class**: Dynamic classes
- **07-style**: Dynamic styles
- **08-attr**: Dynamic attributes
- **09-value**: Form binding
- **10-src**: Image sources
- **11-html**: Raw HTML content
- **12-pipes**: Text filters
- **13-mixin**: Components
- **14-reactive**: Reactive mode
- **15-todo-app**: Complete todo app demo

## Demos

Interactive demos in [demo/](./demo/):
- **kanban**: Kanban board with drag-and-drop
- **favorites**: User favorites with API integration
- **todos**: TodoMVC implementation

## Browser Support

All modern browsers (ES6+). For IE11, requires transpilation.

## Development

```bash
# Install dependencies
npm install

# Watch & rebuild
npm run watch

# Run tests
npm test

# Build production bundle
npm run build

# Run tests in watch mode
npm run test:watch

# Linting
npm run lint
npm run lint:fix
```

## License

MIT © Jay Salvat

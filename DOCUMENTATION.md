# x-app Documentation

Template engine qui transforme le HTML en vues dynamiques avec un binding de données simple.

## Installation

```javascript
const app = new Xapp('#template', { cssPrefix: true });
app.render(data);
```

## Tags & Directives

| Tag | Description | Exemple |
|-----|-------------|---------|
| `{{ variable }}` | Interpolation | `{{ user.name }}` |
| `{{ var \| pipe }}` | Avec transformation | `{{ name \| upper }}` |
| `x-for` | Boucle | `<div x-for="item in items">{{ item }}</div>` |
| `x-if` | Conditionnel | `<div x-if="user.logged">Bienvenue</div>` |
| `x-show` | Afficher/masquer (CSS) | `<div x-show="visible">Contenu</div>` |
| `x-key` | Clé unique pour listes | `<div x-for="item in items" x-key="item.id">` |
| `x-attr` | Attributs dynamiques | `<input x-attr="{ 'disabled': !active }">`  |
| `x-class` | Classes dynamiques | `<div x-class="{ 'active': isActive }">` |
| `x-style` | Styles dynamiques | `<div x-style="{ 'color': color }">` |
| `x-value` | Valeur input | `<input x-value="name">` |
| `x-html` | HTML brut | `<div x-html="content"></div>` |
| `x-src` | Source dynamique | `<img x-src="imagePath">` |
| `x-use` | Mixin/composant | `<div x-use="header with data"></div>` |
| `x-mixin` | Définir un mixin | `<template x-mixin="header">...` |
| `x-include` | Fichier externe | `<div x-include="header.html"></div>` |
| `x-verbatim` | Désactiver parsing | `<div x-verbatim="on">{{ notParsed }}</div>` |

## Pipes (Filtres)

| Pipe | Usage |
|------|-------|
| `upper` | Uppercase `{{ name \| upper }}` |
| `lower` | Lowercase `{{ name \| lower }}` |
| `title` | Title Case `{{ name \| title }}` |
| `firstcap` | 1ère lettre majuscule `{{ name \| firstcap }}` |
| `truncate(n)` | Limiter longueur `{{ text \| truncate(50) }}` |
| `json` | Format JSON `{{ obj \| json }}` |

Pipes chaînables : `{{ name | upper | truncate(20) }}`

## x-show vs x-if

**`x-if`** : Supprime/crée l'élément du DOM (plus lourd)
```html
<div x-if="showDetails">Détails visibles</div>
```

**`x-show`** : Toggle style `display: none` (mieux pour on/off fréquent)
```html
<div x-show="isOpen">Menu</div>
```

## x-key pour Listes

Quand rendu d'une liste avec réorganisation/suppression/ajout, utilisez `x-key` pour améliorer la performance :

```html
<!-- ❌ Sans x-key (tous les items re-rendent si réorganisés) -->
<ul>
  <li x-for="user in users">{{ user.name }}</li>
</ul>

<!-- ✅ Avec x-key (seuls les items changés re-rendent) -->
<ul>
  <li x-for="user in users" x-key="user.id">{{ user.name }}</li>
</ul>
```

La clé doit être unique par item. Utilisez une propriété stable (ID) plutôt que l'index.

## Exemple Minimal

```html
<div id="app">
  <h1>{{ title }}</h1>

  <ul>
    <li x-for="user in users" x-attr="{ 'data-id': user.id }">
      {{ user.name | firstcap }}
    </li>
  </ul>

  <p x-if="users.length === 0">Aucun utilisateur</p>
</div>

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

## API Principales

```javascript
// Créer instance
const app = new Xapp(selector, settings);

// Rendre avec données
app.render(data, callback);

// Récupérer données
app.getHTML();
app.getVDom();
app.getVMap();

// Ajouter pipes/filtres custom
app.pipes({
  reverse: (str) => str.split('').reverse().join('')
});

// Ajouter mixins custom
app.mixins({
  header: '<div>...</div>'
});

// Configurer globalement
Xapp.settings({ cssPrefix: true, warningLevel: 1, reactive: false });
Xapp.pipes({ customPipe: fn });
Xapp.mixins({ customMixin: html });
```

## Réactivité

Activez la réactivité automatique avec Proxy (désactivée par défaut) :

```javascript
// Global
Xapp.settings({ reactive: true });

// Instance
const app = new Xapp('#template', { reactive: true });
app.render(data);

// Les changements re-rendent automatiquement
data.name = 'new value'; // Trigger render()
```

*Note : Désactivée par défaut pour garder la lib légère. À utiliser quand nécessaire.*

## Inclusions

Charger des templates HTML externes :

```html
<div x-include="components/header.html"></div>
```

La lib load automatiquement et mergeL les mixins.

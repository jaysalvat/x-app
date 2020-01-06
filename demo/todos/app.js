
/* globals Xapp */

const loaded = load();

const data = {
  tasks: loaded.length ? loaded : [
    { name: 'Win to the lottery', done: false },
    { name: 'Buy milk', done: true }
  ],
  filter: null,
  filterTasks: (filter) => {
    return data.tasks.filter((t) => filter == null || t.done === filter);
  }
};

const xt = new Xapp('.todoapp');
xt.render(data);

// eslint-disable-next-line no-unused-vars
const app = {
  addTask: (e) => {
    const input = e.target;

    data.tasks.push({ name: input.value, done: false });
    input.value = '';

    xt.render();
    save();
  },

  editTask: (e) => {
    const task = e.target['x-data'].task;

    data.tasks.map((item) => (item.editing = false) && item);

    task.editing = true;

    xt.render((dom) => {
      dom.querySelector('.edit').select();
    });
  },

  updateTask: (e) => {
    const task = e.target['x-data'].task;

    if (e.key !== 'Enter' && e.key !== 'Escape') {
      return;
    }

    if (e.key === 'Enter') {
      task.name = e.target.value;
    }

    task.editing = false;
    xt.render();
    save();
  },

  removeTask: (e) => {
    const task = e.target['x-data'].task;

    data.tasks = data.tasks.filter((item) => item !== task);

    xt.render();
    save();
  },

  toggleTask: (e) => {
    const task = e.target['x-data'].task;

    task.done = !task.done;

    xt.render();
    save();
  },

  toggleAllTasks() {
    const state = data.tasks.every((task) => task.done);

    data.tasks.map((task) => (task.done = !state) && task);

    xt.render();
    save();
  },

  clearDoneTasks: (e) => {
    data.tasks = data.tasks.filter((item) => !item.done);

    xt.render();
    save();
  }
};

// Local storage

function save() {
  return localStorage.setItem('tasks', JSON.stringify(data.tasks));
}

function load() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}

// Hast in URL

function hashToFilter() {
  const filter = location.hash.replace('#/', '');

  if (filter) {
    data.filter = (filter === 'completed');
  } else {
    data.filter = null;
  }

  xt.render();
}

window.onhashchange = (e) => {
  hashToFilter();
};
hashToFilter();

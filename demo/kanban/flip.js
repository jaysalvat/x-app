/* eslint-disable no-unused-vars */
/* globals Xapp, axios */

const data = load() || {
  columns: {
    todo: {
      id: 'todo',
      name: 'Todo',
      tasks: [
        { id: 'a1', name: 'Fix all the bugs' },
        { id: 'a2', name: 'Work on a key diff' },
        { id: 'a3', name: 'Write more tests' }
      ]
    },
    doing: {
      id: 'doing',
      name: 'Doing',
      tasks: [
        { id: 'b1', name: 'Make more Xapp demos' }
      ]
    },
    done: {
      id: 'done',
      name: 'Done',
      tasks: [
        { id: 'c1', name: 'Develop Xapp' },
        { id: 'c2', name: 'Write tests' },
        { id: 'c3', name: 'Release Xapp' }
      ]
    }
  }
};

const xt = new Xapp();
xt.render(data);

function addColumn(e) {
  const id = makeId();

  data.columns[id] = {
    id: id,
    name: '',
    tasks: []
  };

  renderAndSave(($dom) => {
    $dom.querySelector(`#${id} h2`).focus();
  });
}

function addTask(e) {
  const id = makeId();
  const xData = e.currentTarget['x-data'];

  xData.column.tasks.push({
    id: id,
    name: ''
  });

  renderAndSave(($dom) => {
    $dom.querySelector(`#${id} span`).focus();
  });
}

function deleteColumn(e) {
  const xData = e.currentTarget['x-data'];

  delete xData.columns[xData.column.id];

  renderAndSave();
}

function deleteTask(e) {
  const xData = e.currentTarget['x-data'];

  xData.column.tasks = xData.column.tasks.filter((task) => task.id !== xData.task.id);

  renderAndSave();
}

function updateColumn(e) {
  const $input = e.target;
  const xData = $input['x-data'];
  updateField(e, $input, xData.column);
}

function updateTask(e) {
  const $input = e.target;
  const xData = $input['x-data'];
  updateField(e, $input, xData.task);
}

function updateField(e, $input, entity) {
  if (e.key === 'Enter') {
    entity.name = $input.innerText;
    $input.blur();
  }
  if (e.key === 'Escape') {
    $input.innerText = entity.name;
    $input.blur();
  }
  renderAndSave();
}

function renderAndSave(callback) {
  flipRead();
  xt.render(callback);
  flipPlay();

  save();
}

function drag(e) {
  const $el = e.target;
  const xData = {
    task: $el['x-data'].task,
    fromId: $el.closest('.column').id
  };

  e.dataTransfer.setData('text/plain', JSON.stringify(xData));
}

function drop(e) {
  const payload = JSON.parse(e.dataTransfer.getData('text/plain'));
  const fromId = payload.fromId;
  const toId = e.currentTarget.id;
  const task = payload.task;
  const listTo = data.columns[toId].tasks;
  let listFrom = data.columns[fromId].tasks;

  if (fromId === toId) return;

  listFrom = listFrom.filter((item) => item.id !== task.id);
  listTo.push(task);

  renderAndSave();
}

function dragover(e) {
  e.preventDefault();
}

// Utils, noting to see here

let flips;

function flipRead() {
  flips = [];
  document.querySelectorAll('.column, .task').forEach(($el) => {
    const pos = $el.getBoundingClientRect();
    pos.id = $el.id;
    flips.push(pos);
  });
}

function flipPlay() {
  flips.forEach((first, i) => {
    const $animate = document.getElementById(first.id);
    if (!$animate) return;

    const last = document.getElementById(first.id).getBoundingClientRect();
    const invertX = first.left - last.left;
    const invertY = first.top - last.top;

    $animate.animate([
      { transform: `translate(${invertX}px, ${invertY}px)` },
      { transform: 'none' }
    ], {
      duration: 250,
      ease: 'ease-in-out'
    });
  });
}

function makeId() {
  return 'x' + new Date().getTime();
}

// Local storage

function save() {
  // return localStorage.setItem('kanban', JSON.stringify(data));
}

function load() {
  return JSON.parse(localStorage.getItem('kanban'));
}

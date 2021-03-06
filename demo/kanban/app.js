/* eslint-disable no-unused-vars */
/* globals Xapp */

const data = load() || {
  columns: {
    todo: {
      id: 'todo',
      name: 'Todo',
      tasks: [
        { id: 'a1', name: 'Fix all the bugs' },
        { id: 'a2', name: 'Work on a keyed diff' },
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

const xt = new Xapp('#app');
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
    console.log('enter');

  }
  if (e.key === 'Escape') {
    $input.innerText = entity.name;
    $input.blur();
    console.log('Escape');
  }
  console.log(e.key);

  renderAndSave();
}

function renderAndSave(callback) {
  xt.render(callback);
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
  const task = payload.task;
  const fromId = payload.fromId;
  const fromCol = data.columns[fromId];
  const toId = e.currentTarget.id;
  const toCol = data.columns[toId];

  if (fromId === toId) return;

  fromCol.tasks = fromCol.tasks.filter((item) => item.id !== task.id);
  toCol.tasks.push(task);

  renderAndSave();
}

function dragover(e) {
  e.preventDefault();
}

// Utils

function makeId() {
  return 'x' + new Date().getTime();
}

function save() {
  return localStorage.setItem('kanban', JSON.stringify(data));
}

function load() {
  return JSON.parse(localStorage.getItem('kanban'));
}

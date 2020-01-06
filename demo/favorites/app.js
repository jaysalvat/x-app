/* eslint-disable no-unused-vars */
/* globals Xapp, axios */

const data = {
  loading: false,
  users: [],
  favorites: []
};

// Users

const xUsers = new Xapp('#users');
xUsers.render(data);

function fetchUsers() {
  data.loading = true;
  xUsers.render();

  axios.get('https://randomuser.me/api/?results=9').then((res) => {
    data.loading = false;
    data.users = res.data.results;

    xUsers.render();
  });
}

fetchUsers();

// Favorites

const xFavorites = new Xapp('#favorites');

xFavorites.render(data);

function addToFavorites(elmt) {
  const user = elmt['x-data'].user;

  user.favorited = true;
  data.favorites.push(user);

  xFavorites.render();
  xUsers.render();
}

function removeFromFavorites(elmt) {
  const user = elmt['x-data'].user;

  data.favorites = data.favorites.filter(
    (item) => item.login.uuid !== user.login.uuid
  );

  data.users.map((item) => {
    if (item.login.uuid === user.login.uuid) {
      item.favorited = false;
    }
    return item;
  });

  xFavorites.render();
  xUsers.render();
}

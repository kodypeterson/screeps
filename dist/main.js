module.exports.loop = function () {
  require('manager_memory')();

  for (var room in Game.rooms) {
    require('manager_room')(Game.rooms[room]);
    require('manager_creep')(Game.rooms[room]);
  }
};

module.exports.loop = function () {
  require('manager/memory')();

  for (var room in Game.rooms) {
    require('manager/room')(Game.rooms[room]);
    require('manager/tower')(Game.rooms[room]);
    require('manager/creep')(Game.rooms[room]);
  }
};

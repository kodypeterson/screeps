var spawner = require('spawner');

module.exports.loop = function () {
  // Have mine manager update values
  require('helper/mine_manager')();

  var counts = {};

  for(var i in Game.creeps) {
    var creep = Game.creeps[i];
    if (counts[creep.memory.role] === undefined) {
      counts[creep.memory.role] = 1;
    } else {
      counts[creep.memory.role]++;
    }

    require('creep_role_' + creep.memory.role)(creep);
  }

  spawner(counts);
};

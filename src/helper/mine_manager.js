module.exports = function() {
  Memory.minesInUse = [];
  Memory.beingRepaired = [];
  for (var i in Game.creeps) {
    var creep = Game.creeps[i];
    if (creep.memory.role == 'miner') {
      if (Memory.minesInUse.indexOf(creep.memory.source) > -1) {
        creep.memory.source = null;
      } else {
        Memory.minesInUse.push(creep.memory.source);
      }
    }
    if (creep.memory.role == 'healer') {
      if (Memory.beingRepaired.indexOf(creep.memory.repairing) > -1) {
        creep.memory.repairing = null;
      } else {
        Memory.beingRepaired.push(creep.memory.repairing);
      }
    }
  }

  var found = false;
  for (var i in Game.spawns) {
    if (!found) {
      var spawn = Game.spawns[i];
      if (spawn.energy !== spawn.energyCapacity) {
        Memory.energyDropoff = spawn.id;
        found = true;
      }
    }
  }
};

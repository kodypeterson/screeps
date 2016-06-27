module.exports = function (creep) {
  // TODO: Can I do more in one game tick??
  if (!creep.memory.status) {
    creep.memory.status = 'harvest'
  }

  var actions = {};
  // TODO: Move these actions into seperate files
  actions.harvest = function() {
    if (creep.carry.energy >= creep.carryCapacity) {
      creep.memory.status = 'transfer';
      return actions.transfer();
    }
    var sources = creep.room.find(FIND_SOURCES);
    var result = creep.harvest(sources[1]);

    switch (result) {
      case ERR_NOT_IN_RANGE:
        creep.moveTo(sources[1]);
        break;
    }
  };
  actions.transfer = function() {
    // TODO: Make this more dynamic
    if (creep.carry.energy === 0) { // TODO: Do I need energy for fatigue?
      creep.memory.status = 'harvest';
      return actions.harvest();
    }
    var targets = [
      Game.spawns.Spawn1
    ];
    if (creep.memory.target === undefined) {
      creep.memory.target = 0;
    } else if (creep.memory.target > targets.length-1) {
      creep.memory.target = 0;
    }
    var target = targets[creep.memory.target];
    var result = creep.transfer(target, RESOURCE_ENERGY);

    switch (result) {
      case ERR_NOT_IN_RANGE:
        creep.moveTo(Game.spawns.Spawn1);
        break;

      case ERR_FULL:
        creep.memory.target++;
        break;
    }
  };

  if (actions[creep.memory.status]) {
    actions[creep.memory.status]();
  } else {
    console.warn('Unknown harvester status: ' + creep.memory.status);
  }
};

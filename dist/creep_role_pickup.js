var cache = require('helper_cache');

module.exports = function (creep) {
  if (!creep.memory.miner) {
    // This pickup is not attached to a miner
    // Find one in the room to attach to
    for(var i in Game.creeps) {
      var activeCreep = Game.creeps[i];
      if (!creep.memory.miner &&
          activeCreep.memory.role === 'miner' &&
          activeCreep.room.name === creep.room.name &&
          (!activeCreep.memory.attachedPickups ||
          activeCreep.memory.attachedPickups.length < 2)) {
        // We can attach to this miner
        creep.memory.miner = activeCreep.id;
        if (!activeCreep.memory.attachedPickups) activeCreep.memory.attachedPickups = [];
        activeCreep.memory.attachedPickups.push(creep.id);
      }
    }
  }

  if (creep.memory.miner) {
    if (!creep.memory.status) {
      creep.memory.status = 'pickup';
    } else if (creep.memory.status === 'pickup') {
      pickup();
    } else if (creep.memory.status === 'dropoff') {
      dropoff();
    }
  }

  function dropoff() {
    var target = Game.getObjectById(getDropOff());
    var result = creep.transfer(target, RESOURCE_ENERGY);
    switch (result) {
      case ERR_NOT_IN_RANGE:
        creep.moveTo(target);
        break;
      case ERR_NOT_ENOUGH_RESOURCES:
        creep.memory.status = 'pickup';
        pickup();
        break;
    }
  }

  function pickup() {
    if (!creep.memory.target) {
      creep.memory.target = getTarget();
    }

    if (creep.memory.target) {
      var target = Game.getObjectById(creep.memory.target);
      var result = creep.pickup(target);
      switch (result) {
        case ERR_NOT_IN_RANGE:
          creep.moveTo(target);
          break;

        case ERR_FULL:
          creep.memory.status = 'dropoff';
          dropoff();
          break;

        case ERR_INVALID_TARGET:
          delete creep.memory.target;
          creep.memory.status = 'dropoff';
          dropoff();
          break;
      }
    }
  }

  function getDropOff() {
    for (var i in Game.spawns) {
      var spawn = Game.spawns[i];
      if (spawn.energy !== spawn.energyCapacity) {
        return spawn.id;
      }
    }
    var extensions = creep.room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_EXTENSION }
    });
    for (var i in extensions) {
      var extension = extensions[i];
      if (extension.energy !== extension.energyCapacity) {
        return extension.id;
      }
    }
  }

  function getTarget() {
    var miner = Game.getObjectById(creep.memory.miner);
    if (miner) {
      var target = creep.room.lookForAt(LOOK_RESOURCES, miner);
      if (target && target[0]) {
        return target[0].id;
      }
    }

    return undefined;
  }
};

var cache = require('helper_cache');

module.exports = function(creep) {
  if (!creep.memory.status) {
    creep.memory.status = 'pickup';
  }

  if (creep.memory.status === 'pickup') {
    pickup();
  } else {
    building();
  }

  function pickup() {
    if (!canBuild()) return;

    var target = getPickupTarget();
    var result = target.transferEnergy(creep);
    switch (result) {
      case ERR_NOT_IN_RANGE:
        creep.moveTo(target);
        break;

      case ERR_NOT_ENOUGH_ENERGY:
      case ERR_FULL:
        creep.memory.status = 'building';
        building();
        break;
    }
  }

  function getPickupTarget() {
    var extensions = creep.room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_EXTENSION }
    });
    for (var i in extensions) {
      var extension = extensions[i];
      if (extension.energy !== extension.energyCapacity) {
        return extension;
      }
    }
    return Game.spawns.Spawn1; // TODO: Make this dynamic
  }

  function building() {
    var targets = cache.get('construction_sites');
    if (!targets) {
      targets = updateTargets();
    }

    if (targets.length) {
      var target = Game.getObjectById(targets[0]);
      if (target === null) {
        targets = updateTargets();
        return building();
      }
      if (target.level !== undefined) {
        var result = creep.upgradeController(target);
        switch (result) {
          case ERR_NOT_IN_RANGE:
            creep.moveTo(target);
            break;

          case ERR_NOT_ENOUGH_RESOURCES:
            creep.memory.status = 'pickup';
            pickup();
            break;
        }
      } else {
        var result = creep.build(target);
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
    }
  }

  function updateTargets() {
    if (creep.room.controller.level < 2) {
      return [creep.room.controller.id];
    }
    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    if (targets.length === 0) {
      targets.push(creep.room.controller);
    }
    var targetIds = [];
    targets.forEach(function(target) {
      targetIds.push(target.id);
    });
    targets = targetIds;
    cache.set('construction_sites', targetIds);

    return targets;
  }

  function canBuild() {
    if (Memory.needsSpawn) {
      return false;
    }

    if (Memory.repairNowCount > 0) {
      return false;
    }

    return true;
  }
};

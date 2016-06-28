// TODO: Have the pickup be attached to a miner location

var cache = require('../../helper/cache');

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

  if (!creep.memory.status) {
    creep.memory.status = 'pickup';
  } else if (creep.memory.status === 'pickup') {
    pickup();
  } else if (creep.memory.status === 'dropoff') {
    dropoff();
  }

  function dropoff() {
    var target = Game.getObjectById(Memory.energyDropoff);
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
          creep.memory.status = 'dropoff';
          dropoff();
          delete creep.memory.target;
          break;
      }
    }
  }


  function getTarget() {
    var miner = Game.getObjectById(creep.memory.miner);
    var target = creep.room.lookForAt(LOOK_RESOURCES, miner);
    if (target && target[0]) {
      return target[0].id;
    }

    return undefined;
  }








  //var result;
  //if (creep.memory.unload) {
  //  unload();
  //} else {
  //  load();
  //}
  //
  //function load() {
  //  var sources = cache.get('energy_resources');
  //  if (!sources) {
  //    sources = updateSources();
  //  }
  //  if (!sources[0]) return;
  //  var target = Game.getObjectById(sources[0]);
  //  result = creep.pickup(target);
  //
  //  switch (result) {
  //    case ERR_NOT_IN_RANGE:
  //      creep.moveTo(target);
  //      break;
  //
  //    case ERR_FULL:
  //      creep.memory.unload = true;
  //      unload();
  //      break;
  //
  //    case ERR_INVALID_TARGET:
  //      creep.memory.unload = true;
  //      unload();
  //      sources = updateSources();
  //      break;
  //  }
  //}
  //
  //function unload() {
  //  var target = Game.getObjectById(Memory.energyDropoff);
  //  result = creep.transfer(target, RESOURCE_ENERGY);
  //
  //  switch (result) {
  //    case ERR_NOT_IN_RANGE:
  //      creep.moveTo(target);
  //      break;
  //    case ERR_NOT_ENOUGH_RESOURCES:
  //      creep.memory.unload = false;
  //      load();
  //      break;
  //  }
  //}
  //
  //
  //function updateSources() {
  //  var sources = creep.room.find(FIND_DROPPED_RESOURCES);
  //  var dropoff = Game.getObjectById(Memory.energyDropoff);
  //  var sourcesIds = [];
  //  var distance = [];
  //  var shortest = 99999999;
  //  sources.forEach(function(source) {
  //    var path = creep.room.findPath(dropoff.pos, source.pos);
  //    if (path.length < shortest) {
  //      shortest = path.length;
  //      sourcesIds = [source.id];
  //    }
  //  });
  //  sources = sourcesIds;
  //  cache.set('energy_resources', sourcesIds);
  //
  //  return sources;
  //}
};

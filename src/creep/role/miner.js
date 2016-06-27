var cache = require('../../helper/cache');

module.exports = function (creep) {
  if (creep.memory.source && creep.memory.source !== null) {
    var target = Game.getObjectById(creep.memory.source);
  } else {
    var target = Game.getObjectById(getSource());
  }
  var result = creep.harvest(target);
  switch (result) {
    case ERR_NOT_IN_RANGE:
      creep.moveTo(target);
      break;
  }


  function getSource() {
    var sources = creep.room.find(FIND_SOURCES);
    var dropoff = Game.getObjectById(Memory.energyDropoff);
    var sourceId = null;
    var shortest = 99999999;
    sources.forEach(function (source) {
      if (Memory.minesInUse.indexOf(source.id) === -1) {
        // This is static.. Maybe a job for mine manager(???)
        var path = creep.room.findPath(dropoff.pos, source.pos);
        if (path.length < shortest) {
          shortest = path.length;
          sourceId = source.id;
        }
      }
    });
    creep.memory.source = sourceId;

    return sourceId;
  }
};

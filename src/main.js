var spawner = require('spawner');
var harvester = require('creep/role/harvester');
var builder = require('creep/role/builder');
var miner = require('creep/role/miner');
var pickup = require('creep/role/pickup');

module.exports.loop = function () {
  console.log('test');
  // Just expose some methods to the console
  Game.public = require('helper/public');
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

    if (creep.memory.role === 'miner') {
      miner(creep);
    }

    if (creep.memory.role === 'pickup') {
      pickup(creep);
    }

    if(creep.memory.role == 'harvester') {
      harvester(creep);
    }

    if(creep.memory.role == 'guard') {
      var targets = creep.room.find(FIND_HOSTILE_CREEPS);
      if(targets.length) {
        if(creep.attack(targets[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0]);
        }
      }
    }

    if(creep.memory.role == 'builder') {
      builder(creep);
    }
  }

  spawner(counts);
};

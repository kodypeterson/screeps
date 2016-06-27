var spawner = require('spawner');
var harvester = require('creep_role_harvester');
var builder = require('creep_role_builder');
var miner = require('creep_role_miner');
var pickup = require('creep_role_pickup');

module.exports.loop = function () {
	// Just expose some methods to the console
	Game.public = require('helper_public');
	// Have mine manager update values
	require('helper_mine_manager')();

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

module.exports = function(room) {
    // Update/Instruct every x ticks
    var ticksToWait = 30;
    if (room.memory.lastUpdate && (Game.time - room.memory.lastUpdate) < ticksToWait) {
        return;
    }

    var job = require('./job')(room);
    if (room.memory.emptyRoom && !room.memory.spawnedEmptyRoom) {
        // The room is empty - Spawn initial stuff
        var Queue = require('../helper/queue');
        var queue = new Queue('creep', {
            priority: true,
            room: room
        });

        var needQueue = [
            {role: 'miner', priority: 0},
            {role: 'pickup', priority: 1},
            {role: 'pickup', priority: 1},
            {role: 'healer', priority: 2},
            {role: 'healer', priority: 2},
            {role: 'builder', priority: 3},
            {role: 'builder', priority: 3}
        ];

        needQueue.forEach(function(item) {
            queue.push('spawn', item.priority, {
                role: item.role,
                room: room.name
            });
        });
        room.memory.spawnedEmptyRoom = true;
    }

    if (!room.memory.sources) {
        var sources = room.find(FIND_SOURCES);
        room.memory.sources = [];
        sources.forEach(function(source) {
            room.memory.sources.push({
                id: source.id
            });
        });
    }
    room.memory.sources.forEach(function(source, idx) {
       if (!source.miner && !job.exists('mine', 'miner', {source: source.id})) {
           job.create('mine', 'miner', 0, {
               source: source.id,
               index: idx
           });
       } else if (source.miner && !Game.creeps[source.miner]) {
           delete source.miner;
       }
    });

    if (!room.memory.repairing) {
        room.memory.repairing = [];
    }

    var structures = room.find(FIND_STRUCTURES);
    structures.forEach(function(structure) {
        if (structure.hits !== structure.hitsMax && !job.exists('repair', 'healer', {structure: structure.id}) && room.memory.repairing.indexOf(structure.id) === -1) {
            var minHealthNeeded = (50 / 100) * structure.hitsMax;
            var params = {
                fullRepair: true,
                structure: structure.id
            };
            if (structure.hits < minHealthNeeded) {
                params.fullRepair = false;
            }
            // Priorities
            var ten = (10 / 100) * structure.hitsMax;
            var twenty = (20 / 100) * structure.hitsMax;
            var thirty = (30 / 100) * structure.hitsMax;
            var forty = (40 / 100) * structure.hitsMax;

            var priority = 5;
            if (structure.hits <= ten) {
                priority = 0;
            } else if (structure.hits <= twenty) {
                priority = 1;
            } else if (structure.hits <= thirty) {
                priority = 2;
            } else if (structure.hits <= forty) {
                priority = 3;
            }
            job.create('repair', 'healer', priority, params);
        }
    });

    if (!room.memory.collecting) {
        room.memory.collecting = [];
    }

    var resources = room.find(FIND_DROPPED_ENERGY);
    resources.forEach(function(resource) {
        if (!job.exists('pickup', 'pickup', {resource: resource.id}) && room.memory.collecting.indexOf(resource.id) === -1) {
            job.create('pickup', 'pickup', 0, {
                resource: resource.id
            });
        }
    });
    for(var i = room.memory.collecting.length -1; i >= 0 ; i--){
        var isFound = false;
        resources.forEach(function(resource) {
            if (resource.id === room.memory.collecting[i]) {
                isFound = true;
            }
        });
        if (!found) {
            room.memory.collecting.splice(i, 1);
        }
    }

    if (!room.memory.building) {
        room.memory.building = [];
    }

    var building = [];
    for (var i in Game.creeps) {
        var activeCreep = Game.creeps[i];
        if (activeCreep.memory.activeJob) {
            if (activeCreep.memory.role === 'builder' && activeCreep.memory.activeJob.params.site) {
                building.push(creep.memory.activeJob.params.site);
            }
        }
    }

    var sites = room.find(FIND_CONSTRUCTION_SITES);
    sites.forEach(function(site) {
        if (!job.exists('build', 'builder', {site: site.id}) && building.indexOf(site.id) === -1) {
            job.create('build', 'builder', 0, {
                site: site.id
            });
        }
    });

    room.memory.lastUpdate = Game.time;
};

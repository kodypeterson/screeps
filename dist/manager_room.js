module.exports = function(room) {
    // Update/Instruct every x ticks
    var ticksToWait = 30;
    if (room.memory.lastUpdate && !room.memory.refreshStructures && (Game.time - room.memory.lastUpdate) < ticksToWait) {
        return;
    }

    var Cache = require('helper_cache');
    var job = require('manager_job')(room);
    var Queue = require('helper_queue');
    var creepQueue = new Queue('creep', {
        priority: true,
        room: room
    });
    job.cleanup();
    if (!room.memory.towerMemory) room.memory.towerMemory = {};
    if (room.memory.emptyRoom && !room.memory.spawnedEmptyRoom) {
        // The room is empty - Spawn initial stuff
        // TODO: Make this more dynamic
        console.log('Room is empty - Spawning!');
        var needQueue = [
            {role: 'miner', priority: 0},
            {role: 'miner', priority: 0},
            {role: 'pickup', priority: 1},
            {role: 'pickup', priority: 1},
            {role: 'healer', priority: 2},
            {role: 'healer', priority: 2},
            {role: 'builder', priority: 3},
            {role: 'builder', priority: 3}
        ];

        needQueue.forEach(function(item) {
            creepQueue.push('spawn', item.priority, {
                role: item.role,
                room: room.name
            });
        });
        room.memory.spawnedEmptyRoom = true;
    }

    var repairing = [];
    var building = [];
    var collecting = [];
    for (var i in Game.creeps) {
        var activeCreep = Game.creeps[i];
        if (activeCreep.memory.activeJob) {
            if (activeCreep.memory.role === 'builder' && activeCreep.memory.activeJob.params.site) {
                building.push(activeCreep.memory.activeJob.params.site);
            }
            if (activeCreep.memory.healer === 'builder' && activeCreep.memory.activeJob.params.structure) {
                repairing.push(activeCreep.memory.activeJob.params.structure);
            }
            if (activeCreep.memory.healer === 'pickup' && activeCreep.memory.activeJob.params.resource) {
                collecting.push(activeCreep.memory.activeJob.params.resource);
            }
        }
    }

    var sources = room.find(FIND_SOURCES);
    sources.forEach(function(source) {
        if (!job.exists('mine', 'miner', {source: source.id})) {
            job.create('mine', 'miner', 0, {
                source: source.id
            });
        }
    });
    if (!Cache.get(room, 'structures') || room.memory.refreshStructures) {
        delete room.memory.refreshStructures;
        require('helper_refreshStructureCache')(room);
    }
    var structures = room.find(FIND_STRUCTURES); //TODO: use cache
    structures.forEach(function(structure) {
        if (!job.exists('repair', 'healer', {structure: structure.id}) && structure.hits !== structure.hitsMax) {
            var params = {
                fullRepair: true,
                structure: structure.id,
                neededCreeps: 2 //make dynamic
            };
            var minHealthNeeded = (50 / 100) * structure.hitsMax;
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

    var resources = room.find(FIND_DROPPED_ENERGY);
    resources.forEach(function(resource) {
        if (!job.exists('pickup', 'pickup', {resource: resource.id})) {
            job.create('pickup', 'pickup', 0, {
                resource: resource.id
            });
        }
    });

    var sites = room.find(FIND_CONSTRUCTION_SITES);
    sites.forEach(function(site) {
        if (!job.exists('build', 'builder', {site: site.id})) {
            job.create('build', 'builder', 0, {
                site: site.id,
                neededCreeps: 99 //make this dynamic
            });
        }
    });
    if (!job.exists('build', 'builder', {site: room.controller.id})) {
        job.create('build', 'builder', 100, {
            site: room.controller.id,
            isIdleJob: true,
            neededCreeps: 99
        });
    }


    var queueItems = creepQueue.items();
    var neededCreeps = {};
    var creepCount = {};
    var creepsInQueue = {};

    for (var id in Game.creeps) {
        var creep = Game.creeps[id];
        if (!creepCount[creep.memory.role]) creepCount[creep.memory.role] = 0;
        creepCount[creep.memory.role]++;
    }
    queueItems.forEach(function(item) {
        if (!creepsInQueue[item.params.role]) creepsInQueue[item.params.role] = 0;
        creepsInQueue[item.params.role]++;
    });

    for (var i in job.Jobs.list) {
        var j = job.Jobs.list[i];
        if (!neededCreeps[j.role]) neededCreeps[j.role] = 0;
        if (j.params.neededCreeps !== 99) {
            neededCreeps[j.role] += j.params.neededCreeps;
        } else {
            neededCreeps[j.role]++;
        }
    }

    for (var role in neededCreeps) {
        if (!creepCount[role]) creepCount[role] = 0;
        if (!creepsInQueue[role]) creepsInQueue[role] = 0;
        var need = neededCreeps[role] - creepCount[role];
        need -= creepsInQueue[role];
        if (need > 0) {
            var c = 0;
            while (c !== need) {
                // TODO: Ensure there is enough energy to queue this up
                //creepQueue.push('spawn', 1, {
                //    role: role,
                //    room: room.name,
                //    memory: {
                //        temporary: true
                //    }
                //});
                c++;
            }
        }
    }

    room.memory.lastUpdate = Game.time;
};

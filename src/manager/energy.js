module.exports = function(room) {
    var Cache = require('../helper/cache');
    function dropOff() {
        for (var id in Game.spawns) {
            var spawn = Game.spawns[id];
            if (spawn.energy !== spawn.energyCapacity && spawn.room.name === room.name) {
                return spawn;
            }
        }

        var extensions = Cache.get(room, 'structures')[STRUCTURE_EXTENSION];
        if (extensions) {
            for (var i = 0; i < extensions.length; i++) {
                var extension = Game.getObjectById(extensions[i]);
                if (extension.energy !== extension.energyCapacity) {
                    return extension;
                }
            }
        }

        var towers = Cache.get(room, 'structures')[STRUCTURE_TOWER];
        if (towers) {
            for (var i = 0; i < towers.length; i++) {
                var tower = Game.getObjectById(towers[i]);
                if (tower.energy !== tower.energyCapacity) {
                    return tower;
                }
            }
        }

        var containers = Cache.get(room, 'structures')[STRUCTURE_CONTAINER];
        if (containers) {
            for (var i = 0; i < containers.length; i++) {
                var container = Game.getObjectById(containers[i]);
                if (container.energy !== container.energyCapacity) {
                    return container;
                }
            }
        }
    }

    function pickup(isBuilder, isForController) {
        var containers = Cache.get(room, 'structures')[STRUCTURE_CONTAINER];
        if (containers) {
            for (var i = 0;i < containers.length;i++) {
                var container = Game.getObjectById(containers[i]);
                if (container.energy !== 0) {
                    return container;
                }
            }
            // We have containers but they are empty
            // Don't pull from extensions then
            return;
        }
        // If they are not a builder or this energy is for a controller,
        // don't pull from others
        if (!isBuilder || isForController) return;

        var Queue = require('../helper/queue');
        var creepQueue = new Queue('creep', {
            priority: true,
            room: room
        });
        if (creepQueue.items().length > 0) {
            // We have stuff awaiting spawn
            // Don't pull from spwan/extensions
            return;
        }

        var extensions = Cache.get(room, 'structures')[STRUCTURE_EXTENSION];
        if (extensions) {
            for (var i = 0;i < extensions.length;i++) {
                var extension = Game.getObjectById(extensions[i]);
                if (extension.energy !== 0) {
                    return extension;
                }
            }
            // We have extensions but they are empty
            // Don't pull from spawn then
            return;
        }
        var spawns = Cache.get(room, 'structures')[STRUCTURE_SPAWN];
        if (spawns) {
            for (var i = 0;i < spawns.length;i++) {
                var spawn = Game.getObjectById(spawns[i]);
                if (spawn.energy !== 0) {
                    return spawn;
                }
            }
        }
    }

    return {
        dropOff: dropOff,
        pickup: pickup
    }
};
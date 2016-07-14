module.exports = function(room) {
    var Cache = require('helper_cache');
    function dropOff() {
        for (var id in Game.spawns) {
            var spawn = Game.spawns[id];
            if (spawn.energy !== spawn.energyCapacity && spawn.room.name === room.name) {
                return spawn;
            }
        }

        var structures = Cache.get(room, 'structures') || {};
        var extensions = structures[STRUCTURE_EXTENSION];
        if (extensions) {
            for (var i = 0; i < extensions.length; i++) {
                var extension = Game.getObjectById(extensions[i]);
                if (!extension) {
                    require('helper_refreshStructureCache')(room);
                } else if (extension.energy !== extension.energyCapacity) {
                    return extension;
                }
            }
        }

        var containers = structures[STRUCTURE_CONTAINER];
        if (containers) {
            for (var i = 0; i < containers.length; i++) {
                var container = Game.getObjectById(containers[i]);
                if (!container) {
                    require('helper_refreshStructureCache')(room);
                } else if (_.sum(container.store) !== container.storeCapacity) {
                    return container;
                }
            }
        }

        var storages = structures[STRUCTURE_STORAGE];
        if (storages) {
            for (var i = 0; i < storages.length; i++) {
                var storage = Game.getObjectById(storages[i]);
                if (!storage) {
                    require('helper_refreshStructureCache')(room);
                } else if (_.sum(storage.store) !== storage.storeCapacity) {
                    return storage;
                }
            }
        }

        var towers = structures[STRUCTURE_TOWER];
        if (towers) {
            for (var i = 0; i < towers.length; i++) {
                var tower = Game.getObjectById(towers[i]);
                if (!tower) {
                    require('helper_refreshStructureCache')(room);
                } else if (tower.energy !== tower.energyCapacity) {
                    return tower;
                }
            }
        }
    }

    function pickup(isBuilder, isForController) {
        var structures = Cache.get(room, 'structures') || {};
        var storages = structures[STRUCTURE_STORAGE];
        if (storages) {
            for (var i = 0; i < storages.length; i++) {
                var storage = Game.getObjectById(storages[i]);
                if (!storage) {
                    require('helper_refreshStructureCache')(room);
                } else if (storage.store[RESOURCE_ENERGY] && storage.store[RESOURCE_ENERGY] !== 0) {
                    return storage;
                }
            }
        }

        var containers = structures[STRUCTURE_CONTAINER];
        if (containers) {
            for (var i = 0;i < containers.length;i++) {
                var container = Game.getObjectById(containers[i]);
                if (!container) {
                    require('helper_refreshStructureCache')(room);
                } else if (container.store[RESOURCE_ENERGY] && container.store[RESOURCE_ENERGY] !== 0) {
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

        var Queue = require('helper_queue');
        var creepQueue = new Queue('creep', {
            priority: true,
            room: room
        });
        if (creepQueue.items().length > 0) {
            // We have stuff awaiting spawn
            // Don't pull from spwan/extensions
            return;
        }

        var extensions = structures[STRUCTURE_EXTENSION];
        if (extensions) {
            for (var i = 0;i < extensions.length;i++) {
                var extension = Game.getObjectById(extensions[i]);
                if (!extension) {
                    require('helper_refreshStructureCache')(room);
                } else if (extension.energy !== 0) {
                    return extension;
                }
            }
            // We have extensions but they are empty
            // Don't pull from spawn then
            return;
        }
        var spawns = structures[STRUCTURE_SPAWN];
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

module.exports = function(name, options) {
    var memoryAccess;
    if (options.room) {
        memoryAccess = options.room.memory;
    } else if (options.roomName) {
        memoryAccess = Game.room[options.roomName].memory;
    } else {
        memoryAccess = Memory;
    }
    if (!memoryAccess.queues) memoryAccess.queues = {};
    if (!memoryAccess.queues[name]) memoryAccess.queues[name] = [];
    if (!memoryAccess.queues[name+"-data"]) memoryAccess.queues[name+"-data"] = {};
    var queue = this;

    queue.queue = memoryAccess.queues[name];
    queue.data = memoryAccess.queues[name+"-data"];
    queue.name = name;
    queue.options = options;
    queue.items = function() {
        return _.compact(_.flattenDeep(queue.queue));
    };
    queue.push = function(action, priority, params) {
        if (!queue.options.priority) {
            params = priority;
        }

        var item = {
            id: Math.floor((1 + Math.random()) * 0x10000).toString(8),
            action: action,
            params: params
        };

        if (queue.options.priority) {
            item.priority = priority;
            if (!queue.queue[priority]) {
                queue.queue[priority] = [];
            }
            queue.queue[priority].push(item);
        } else {
            queue.queue.push(item);
        }
    };
    queue.run = function() {
        if (queue.data.lastRan !== Game.time) {
            queue.data.lastRan = Game.time;

            var item = queue.items()[0];

            if (item) {
                var action = require('actions_' + item.action)(item.params);
                if (action === true) {
                    queue.remove(item.id);
                }
            }
        }
    };
    queue.remove = function(id) {
        for(var i = queue.queue.length -1; i >= 0 ; i--){
            if (_.isArray(queue.queue[i])) {
                for(var ix = queue.queue[i].length -1; ix >= 0 ; ix--){
                    if (queue.queue[i][ix].id == id){
                        queue.queue[i].splice(ix, 1);
                    }
                }
            } else if(queue.queue[i] && queue.queue[i].id == id){
                queue.queue.splice(i, 1);
            }
        }
    };

    if (!queue.options.dontAutoRun) {
        queue.run();
    }

    return this;
};

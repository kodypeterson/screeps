module.exports = function(room) {
    var Cache = require('../helper/cache');
    var towers = Cache.get(room, 'towers');
    if (!towers) {
        towers = [];
        var t = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_TOWER }
        });
        for (var i in t) {
            towers.push(t[i].id);
        }
        Cache.set(room, 'towers', towers, -1);
    }

    towers.forEach(function(towerID) {
        var tower = Game.getObjectById(towerID);
        tower.memory = {
            role: 'healer',
            isTower: true
        };
        var jobs = require('./job')(room);
        var job = jobs.getJob(tower);
        if (job) {
            require('jobs_' + jobs.Jobs.list[job].name)(tower, jobs.Jobs.list[job]);
        }
    })
};
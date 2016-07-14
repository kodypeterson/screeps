module.exports = function(req, res) {
  var Promise = require('bluebird');
  var screeps = require('../helpers/screeps-api')();

  if (!req.query.room) {
    return res.status(500).send({
      error: 'Missing room param'
    })
  }

  var promises = [
    screeps.memory({path: 'creeps'}),
    screeps.memory({path: 'rooms.' + req.query.room + '.jobs.list'}),
    screeps.memory({path: 'rooms.' + req.query.room + '.cache'})
  ];

  Promise.all(promises).spread(function(creeps, jobList, cache) {
    for (var i in jobList.data) {
      var job = jobList.data[i];
      if (job.creeps) {
        job.creeps.forEach(function(name) {
          if (creeps.data[name]) {
            creeps.data[name].job = job;
            if (job.params && typeof job.params.structure === "string") {
              var type = 'N/A';
              for (var i in cache.data.structures.data) {
                if (i.indexOf('_details') === -1 && cache.data.structures.data[i].indexOf(job.params.structure) > -1) {
                  type = i;
                }
              }
              job.params.structure = {
                type: type,
                id: job.params.structure
              }
            }

            if (job.params && typeof job.params.site === "string") {
              var type = 'N/A';
              for (var i in cache.data.sites.data) {
                if (cache.data.sites.data[i].indexOf(job.params.site) > -1) {
                  type = i;
                }
              }
              job.params.site = {
                type: type,
                id: job.params.site
              }
            }
          }
        })
      }
    }

    for (var i in creeps.data) {
      var creep = creeps.data[i];
      if (creep.role === 'pickup') {
        if (creep.status === 'pickup') {
          creep.icon = 'upload';
        } else if (creep.status === 'dropoff') {
          creep.icon = 'download';
        }
      }
      if (creep.role === 'builder') {
        creep.icon = 'gavel';
        if (!creep.job || !creep.job.params.site) {
          creep.job = {
            params: {
              site: {
                type: 'controller'
              }
            }
          }
        }
      }
      if (creep.role === 'miner') {
        creep.icon = 'bullseye';
      }
      if (creep.role === 'healer') {
        creep.icon = 'life-ring';
      }

      if (creep.holdStatus) {
        creep.icon = 'spinner fa-pulse';
      }
    }

    res.send(creeps.data);
  });
};

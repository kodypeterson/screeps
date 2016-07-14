module.exports = function(req, res) {
  var screeps = require('../helpers/screeps-api')();

  screeps.memory({
    path: 'rooms.' + req.query.room + '.cache.sites.data'
  }).then(function(data) {
    res.send(data.data);
  })
};

module.exports = function(req, res) {
  var screeps = require('../helpers/screeps-api')();

  if (!req.query.room) {
    return res.status(500).send({
      error: 'Missing room param'
    })
  }

  screeps.memory({
    path: 'rooms.' + req.query.room + '.jobs.list'
  }).then(function(data) {
    res.send(data.data);
  })
};

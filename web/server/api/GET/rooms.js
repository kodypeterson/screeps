module.exports = function(req, res) {
  var screeps = require('../helpers/screeps-api')();

  screeps.memory({
    path: 'rooms'
  }).then(function(data) {
    res.send(Object.keys(data.data));
  })
};

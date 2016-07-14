module.exports = function(req, res) {
  var screeps = require('../helpers/screeps-api')();

  screeps.memory({
    path: 'rooms.' + req.query.room + '.cache'
  }).then(function(data) {
    var storage = [];
    for (var i in data.data.structures.data) {
      if (i.indexOf('details') > -1) {
        var st = {
          type: i.replace('_details', ''),
          count: 0,
          holding: 0,
          capacity: 0,
          full: 0,
          store: {}
        };
        for (var l in data.data.structures.data[i]) {
          var s = data.data.structures.data[i][l];
          st.count++;
          st.holding += s.holding;
          st.capacity += s.capacity;
          for (var t in s.store) {
            if (!st.store[t]) {
              st.store[t] = s.store[t];
            } else {
              st.store[t] += s.store[t];
            }
          }
          st.full = (st.holding/st.capacity)*100;
        }

        storage.push(st);
      }
    }
    res.send(storage);
  })
};

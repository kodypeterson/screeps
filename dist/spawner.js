module.exports = function(counts) {
  var maxSpawned = {
    miner: 1,
    pickup: 2,
    builder: 2,
    healer: 2
  };
  var priority = ['miner', 'pickup', 'builder', 'healer'];

  priority.forEach(function(role) {
    if (counts[role] === undefined || counts[role] < maxSpawned[role]) {
      spawn(role);
    }
  });

  function spawn(role) {
    var attributes = {
      'miner': [WORK, WORK, MOVE],
      'pickup': [CARRY, CARRY, WORK, MOVE, MOVE],
      'builder': [WORK, WORK, MOVE, CARRY],
      'healer': [CARRY, CARRY, WORK, MOVE, CARRY]
    };

    var name = role + "_" + Math.floor(Math.random() * (1 - 9999999 + 1) + 9999999);
    var spawn = null;
    for (var i in Game.spawns) {
      var canCreate = Game.spawns[i].canCreateCreep(attributes[role], name);
      if (spawn === null && canCreate === OK) {
        spawn = Game.spawns[i];
      } else {
        //console.log(canCreate);
      }
    }

    if (spawn !== null) {
      Game.spawns.Spawn1.createCreep(attributes[role], name, {
        role: role
      });
    }
  }
};

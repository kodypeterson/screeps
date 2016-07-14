module.exports = function() {
  var Promise = require("bluebird");
  var request = Promise.promisifyAll(require("request"));
  var screepsP = require("screeps-p");
  var prefix = 'https://screeps.com/api/';
  var username = screepsP.screeps.username;
  var password = screepsP.screeps.password;
  var token = null;

  function makeRequest(method, endpoint, params) {
    var defaultParams = this;
    params = params || {};
    for (var key in defaultParams) {
      if (!params[key]) {
        params[key] = defaultParams[key];
      }
    }
    return new Promise(function (resolve, reject) {
      getToken().then(function() {
        var options = {
          uri: prefix + endpoint
        };
        if (method === 'get') {
          options.qs = params;
        } else {
          options.json = params;
        }
        _request(method, options).then(function (res) {
          resolve(res);
        })
      })
    });
  }

  function getToken() {
    return new Promise(function (resolve, reject) {
      if (!token) {
        var options = {
          uri: prefix + 'auth/signin',
          json: {
            email: username,
            password: password
          }
        };
        _request('post', options).then(function (res) {
          token = res.token;
          resolve(token);
        })
      } else {
        resolve(token);
      }
    });
  }

  function _request(method, options) {
    if (token) {
      options.headers = {
        'X-Token': token,
        'X-Username': token
      }
    }
    return request[method + 'Async'](options).then(function(res) {
      if (typeof res.body !== 'object') {
        res.body = JSON.parse(res.body);
      }
      if (options.uri.indexOf('memory') > -1) {
        var zlib = require("zlib");
        if (res.body.data === 'Incorrect memory path') {
          return res.body;
        }
        var mem = new Buffer(res.body.data.substr(3), 'base64');
        var unzipped = zlib.gunzipSync(mem);
        res.body.data = JSON.parse(unzipped.toString());
      }
      return res.body;
    });
  }

  return {
    me: makeRequest.bind({}, 'get', 'auth/me'),
    overview: makeRequest.bind({
      interval: 8,
      statName: 'energyHarvested'
    }, 'get', 'user/overview'),
    stats: makeRequest.bind({
      id: '',
      interval: 8
    }, 'get', 'user/stats'),
    user_find: makeRequest.bind({
      username: ''
    }, 'get', 'user/find'),
    memory: makeRequest.bind({
      path: ''
    }, 'get', 'user/memory'),
    room_overview: makeRequest.bind({
      interval: 8,
      room: ''
    }, 'get', 'game/room-overview'),
    room_status: makeRequest.bind({
      room: ''
    }, 'get', 'game/room-status'),
    time: makeRequest.bind({
    }, 'get', 'game/time')
  };
};

var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();

app.use('/static', express.static(__dirname + '/../public'));
app.use('/static', express.static(__dirname + '/../client'));

app.use('/api', function(req, res) {
  var file = path.resolve(__dirname + '/api/' + req.method + '/' + req.url.split('?')[0] + '.js');
  fs.stat(file, function(err, stats) {
    if (stats) {
      require(file)(req, res);
    } else {
      res.status(404).send({
        error: 'Endpoint not found'
      });
    }
  });
});

app.use(function(req, res) {
  if (req.url.indexOf('/static') > -1) {
    res.status(404).send('404');
  } else {
    res.sendFile(path.resolve(__dirname + '/../public/index.htm'));
  }
});

app.listen(4576, function() {
  console.log('Web listening on port 4576...');
});

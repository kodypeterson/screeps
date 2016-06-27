var fs = require('fs');

module.exports = function(grunt) {
  var dist = 'dist';

  grunt.registerTask('copy', 'Copies and renames', function() {
    // remove the dist
    if (fs.existsSync(dist)) {
      grunt.file.delete(dist);
    }
    // create the dist
    grunt.file.mkdir(dist);

    var files = grunt.file.expand('src/**/*.js');
    var replacementMappings = {};
    files.forEach(function(file) {
      replacementMappings[file.replace('src/', '').replace('.js', '')] = file.replace('src/', '').replace(/\//g, '_').replace('.js', '');
    });

    files.forEach(function(file) {
      var distFileName = file.replace('src/', '').replace(/\//g, '_');
      var fileContents = grunt.file.read(file);
      for (var i in replacementMappings) {
        var regex = new RegExp('require\\(\'(.*)' + i + '\'\\)', 'gm');
        fileContents = fileContents.replace(regex, 'require(\'' + replacementMappings[i] + '\')');
      }
      grunt.file.write(dist + '/' + distFileName, fileContents);
    });
  });

  grunt.registerTask('default', ['copy']);

};

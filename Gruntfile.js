var fs = require('fs');
var hostname = require('os').hostname();

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-watch');
  var dist = 'dist';
  var localCopy = {
    "DESKTOP-KFL1PIH": "C:\\Users\\headw\\AppData\\Local\\Screeps\\scripts\\screeps.com\\default"
  };

  grunt.registerTask('copy', 'Copies and renames', function() {
    // remove the dist
    if (fs.existsSync(dist)) {
      grunt.file.delete(dist);
    }
    // create the dist
    grunt.file.mkdir(dist);

    var files = grunt.file.expand('src/**/*.js');
    var replacementMappings = {
      'creep/role/\' + creep.memory.role': 'creep_role_\' + creep.memory.role'
    };
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
      if (localCopy[hostname]) {
        grunt.file.write(localCopy[hostname] + '/' + distFileName, fileContents);
      }
    });
  });

  grunt.initConfig({
    watch: {
      src: {
        files: ['src/**/*.js'],
        tasks: ['copy'],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.registerTask('default', ['copy', 'watch:src']);

};

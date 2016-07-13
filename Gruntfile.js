var fs = require('fs');
var hostname = require('os').hostname();

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-injector');

  var dist = 'dist';
  var localCopy = {
    "DESKTOP-KFL1PIH": "C:\\Users\\headw\\AppData\\Local\\Screeps\\scripts\\screeps.com\\default"
  };

  grunt.registerTask('copyRename', 'Copies and renames', function() {
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
      var parts = file.split('/');
      replacementMappings['./' + parts[parts.length-1].replace('.js', '')] = file.replace('src/', '').replace(/\//g, '_').replace('.js', '');
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
    ts: {
      default: {
        tsconfig: true,
        options: {
          fast: 'never'
        }
      }
    },
    copy: {
      web: {
        files: [
          {
            expand: true,
            cwd: 'web/client/',
            src: ['**'],
            dest: 'web/public'
          }
        ]
      },
      vendor: {
        files: [

        ]
      }
    },
    clean: {
      web: ['web/public'],
      webPublicTS: ['web/public/**/*.ts'],
      webPublicLess: ['web/public/**/*.less']
    },
    watch: {
      src: {
        files: ['src/**/*.js'],
        tasks: ['copyRename'],
        options: {
          spawn: false
        }
      },
      web: {
        files: ['web/client/**'],
        tasks: ['build-web'],
        options: {
          spawn: false
        }
      }
    },
    concurrent: {
      dev: {
        tasks: ['nodemon:dev', 'watch:src', 'watch:web'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    nodemon: {
      dev: {
        script: 'web/server/index.js',
        options: {
          watch: [
            'web/server'
          ]
        }
      }
    },
    less: {
      web: {
        files: {
          'web/public/app.css': 'web/public/app/screeps.less'
        }
      }
    },
    injector: {
      web: {
        files: {
          'web/public/index.htm': [
            'web/public/vendor/*.js',
            'web/public/app/**/*.module.js',
            'web/public/app/**/*.js'
          ]
        },
        options: {
          ignorePath: 'web/public/',
          prefix: '/static'
        }
      }
    }
  });

  grunt.registerTask('build-web', ['clean:web', 'copy:web', 'copy:vendor', 'less:web', 'ts', 'injector:web', 'clean:webPublicTS', 'clean:webPublicLess']);
  grunt.registerTask('default', ['copyRename', 'build-web', 'concurrent:dev']);

};

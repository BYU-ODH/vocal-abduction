module.exports = function(grunt) {
  var ASSET_DIR = 'app/assets/';
  var BUILD_DIR = 'build/';
  var SPRITE_DIR = ASSET_DIR + 'sprites/';
  var SPRITE_PDF = ASSET_DIR + 'sprites/sprites.pdf'

  grunt.initConfig({
    wiredep: {
      target: {
        src: [
          'app/index.html'
        ]
      }
    },
    texturepacker: {
      sprites: {
        options: {
          trimMode: 'None',
          multipack: false,
          pngOptLevel: 0,
          sizeConstraints: 'AnySize', 
          algorithm: 'Basic',
          disableRotation: true,
          output: {
            sheet: {
              file: SPRITE_DIR + '<%= grunt.task.current.args[0] %>/sheet.png',
              format: 'png'
            },
            data: {
              file: SPRITE_DIR + '<%= grunt.task.current.args[0] %>/sheet.json',
              format: 'json'
            }
          }
        },
        src: [BUILD_DIR + '<%= grunt.task.current.args[0] %>/*.png'],
      }
    },
    responsive_images: {
      sprites: {
        options: {
          newFilesOnly: false,
          sizes: [
            {
              dir: 'large',
              width: '20%'
            },
            {
              dir: 'medium',
              width: '15%'
            },
            {
              dir: 'small',
              width: '10%'
            }
          ]
        },
        files: [{
          cwd: SPRITE_DIR + 'orig/',
          expand: true,
          src: ['*.png'],
          custom_dest: BUILD_DIR + '{%= dir %}'
        }]
      }
    },
    img: {
      sprites: {
        src: [
          SPRITE_DIR + '/small/sheet.png',
          SPRITE_DIR + '/medium/sheet.png',
          SPRITE_DIR + '/large/sheet.png'
        ]
      }
    },
    clean: {
      build: [BUILD_DIR+'/*'],
      sprites: [SPRITE_DIR + '/*/sheet.{png,json}']
    }
  });
  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-texturepacker');
  grunt.loadNpmTasks('grunt-img');
  grunt.loadNpmTasks('grunt-responsive-images');

  grunt.registerTask('sprites',
    [
      'clean:sprites',
      'responsive_images:sprites',
      'texturepacker:sprites:small',
      'texturepacker:sprites:medium',
      'texturepacker:sprites:large',
      'img:sprites',
      'clean:build'
    ]
  );
  grunt.registerTask('default', 'wiredep')
};

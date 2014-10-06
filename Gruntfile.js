module.exports = function(grunt) {
  var ASSET_DIR = 'app/assets/';
  var BUILD_DIR = 'build/';
  var SPRITE_DIR = ASSET_DIR + 'sprites/';
  var SPRITE_PDF = ASSET_DIR + 'sprites/sprites.pdf'
  var SPRITE_SIZE = 90; // DPI. Defaults to 90 in Inkscape

  var pdfmap = [ // map filenames to page numbers in the sprites.pdf file
    'cow-aerial.pdf:1',
    'ship1.pdf:2',
    'ship2.pdf:3',
    'ship3.pdf:4',
    'ship4.pdf:5',
    'profile1.pdf:6',
    'profile2.pdf:7',
    'profile3.pdf:8',
    'profile4.pdf:9',
    'profile4.pdf:9',
    'cow-side.pdf:10',
    'ship-glow1.pdf:11',
    'ship-glow2.pdf:12',
    'ship-glow3.pdf:13',
    'ship-glow4.pdf:14',
    'barn-aerial.pdf:15',
    'barn-side.pdf:16'
  ];

  grunt.initConfig({
    wiredep: {
      target: {
        src: [
          'app/index.html'
        ]
      }
    },
    shell: {
      pdftk: {
        command: 'pdftk ' + SPRITE_PDF + ' cat <%= grunt.task.current.args[1] %> output ' + BUILD_DIR + '<%= grunt.task.current.args[0] %>'
      }
    },
    inkscape: {
      sprites: {
        options: {
          density: "<%= grunt.task.current.args[1] %>"
        },
        files: [{
          expand: true,
          src: [BUILD_DIR + '*.pdf'],
          dest: BUILD_DIR + '<%= grunt.task.current.args[0] %>/',
          ext: '.png',
          rename: function(dest, matchedSrcPath, options) {
            var newpath = dest + '/' + matchedSrcPath.replace(BUILD_DIR,'');
            return newpath;
          }
        }]
      }
    },
    texturepacker: {
      sprites: {
        options: {
          trimMode: 'Trim',
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
    'imagemagick-convert': {
      trimSprites: {
        args: [SPRITE_DIR + '<%= grunt.task.current.args[0] %>/sheet.png', '-trim', '-quality', '100', SPRITE_DIR + '<%= grunt.task.current.args[0] %>/sheet.png' ]
      },
      shift2px: { // to make up for texturepacker's PNG oFFs chunk
        args: [
          SPRITE_DIR + '<%= grunt.task.current.args[0] %>/sheet.png',
          '-virtual-pixel',
          'background',
          '-distort',
          'Affine',
          '2,2 4,4',
          SPRITE_DIR + '<%= grunt.task.current.args[0] %>/sheet.png'
        ]
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
      build: [BUILD_DIR+'/*']
    }
  });
  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-inkscape');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-texturepacker');
  grunt.loadNpmTasks('grunt-imagemagick');
  grunt.loadNpmTasks('grunt-img');

  grunt.registerTask('sprites',
    pdfmap.map(function(item){return 'shell:pdftk:'+item})
    .concat([
        'inkscape:sprites:small:' + SPRITE_SIZE/2,
        'inkscape:sprites:medium:' + SPRITE_SIZE,
        'inkscape:sprites:large:' + SPRITE_SIZE*2,
        'texturepacker:sprites:small',
        'texturepacker:sprites:medium',
        'texturepacker:sprites:large',
        'imagemagick-convert:shift2px:small',
        'imagemagick-convert:shift2px:medium',
        'imagemagick-convert:shift2px:large',
        /*
        'imagemagick-convert:trimSprites:small',
        'imagemagick-convert:trimSprites:medium',
        'imagemagick-convert:trimSprites:large',
        */
        'img:sprites',
        'clean:build'
    ])
  );
  grunt.registerTask('default', 'wiredep')
};

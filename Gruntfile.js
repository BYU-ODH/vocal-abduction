module.exports = function(grunt) {
  grunt.initConfig({
    wiredep: {
      target: {
        src: [
          'app/index.html'
        ]
      }
    }
  });
  grunt.loadNpmTasks('grunt-wiredep');
  grunt.registerTask('default', ['wiredep'])
};

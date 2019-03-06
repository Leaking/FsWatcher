var chokidar = require('chokidar')
const watchedDir = __dirname + '/resources'

// One-liner for current directory, ignores .dotfiles
chokidar.watch(watchedDir, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
  console.log(event, path);
});
chokidar.watch
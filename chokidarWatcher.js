var chokidar = require('chokidar')
const watchedDir = __dirname + '/resources'
const file1 = '/Users/quinn/Downloads/wedisk'
const file2 = '/Users/quinn/Downloads/wedisk/广州研发部/test空间1/11.png'
const file3 = '/Users/quinn/Downloads/wedisk/广州研发部/test空间1/20180110 20-40-42.log'

// One-liner for current directory, ignores .dotfiles
chokidar.watch(file1, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
  console.log(event, path);
});
// chokidar.watch(file2, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
//   console.log(event, path);
// });
// chokidar.watch(file3, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
//   console.log(event, path);
// });

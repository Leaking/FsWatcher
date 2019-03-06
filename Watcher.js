const fs = require('fs');
const watchedDir = __dirname + '/resources/room2/dir1/ff.txt'

function watchDir(directory, callback) {
console.log('start to watch dir ', directory)
  const watcher = fs.watch(directory, {recursive: true}, (event, filename) => {
    console.log(`watch file event = ${event} filename = ${filename}`)
    const targetFile = directory + '/' + filename
        if('rename' === event) {
            const targetFileIsExist = fs.existsSync(targetFile)
            if(targetFileIsExist) {
                //const isDirectory = fs.statSync(targetFile).isDirectory
                callback('create', targetFile)
            } else {
                callback('delete', targetFile)
                watcher.close
            }
        } else {
            callback('modify', targetFile)
        }
    })
}
watchDir(watchedDir, function (event, filename) {
    console.log(event, filename);
})
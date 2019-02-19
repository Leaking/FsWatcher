const fs = require('fs');
const watchedDir = __dirname + '/resources'

function watchDir(directory, callback) {
    console.log('start to watch dir ', directory)
    fs.watch(directory, {recursive: true}, (event, filename) => {
        const targetFile = directory + '/' + filename
        if('rename' === event) {
            const targetFileIsExist = fs.existsSync(targetFile)
            if(targetFileIsExist) {
                const isDirectory = fs.statSync(targetFile).isDirectory
                callback('create', targetFile)
            } else {
                callback('delete', targetFile)
            }
        } else {
            callback('modify', targetFile)
        }
    })
}
watchDir(watchedDir, function (event, filename) {
    console.log(event, filename);
})
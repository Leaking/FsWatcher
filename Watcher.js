const fs = require('fs');
const watchedDir = __dirname + '/resources'
console.log('start to watch dir ', watchedDir)
fs.watch(watchedDir, {recursive: true}, (event, filename) => {
    const targetFile = watchedDir + '/' + filename
    if('rename' === event) {
        const targetFileIsExist = fs.existsSync(targetFile)
        if(targetFileIsExist) {
            const isDirectory = fs.statSync(targetFile).isDirectory
            console.log('Create a', isDirectory ? 'file' : 'directory', targetFile)
        } else {
            console.log('Delete file/dir', targetFile)
        }
    } else {
        console.log('Modify file', targetFile)
    }
})


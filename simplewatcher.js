const fs = require('fs')
const path = require('path')
const EventEmitter = require('events')

const file1 = '/Users/quinn/Downloads/wedisk/广州研发部/fengjian的共享空间/abc.txt'
const file2 = '/Users/quinn/Downloads/wedisk/广州研发部/test空间1/11.png'
const file3 = '/Users/quinn/Downloads/wedisk/广州研发部/test空间1/20180110 20-40-42.log'
const dir1 = '/Users/quinn/Downloads/wedisk'
const dir2 = '/Users/quinn/Downloads/typeorm/extra'
const dir3 = '/Users/quinn/Downloads/typeorm/resources'


// fs.watch(file1, { recursive: false },(event, filename) => {
//   console.log(`event ${event} filename =${filename}`)
// })

// fs.watch(file2, { recursive: false },(event, filename) => {
//   console.log(`event ${event} filename =${filename}`)
// })

// fs.watch(file3, { recursive: false },(event, filename) => {
//   console.log(`event ${event} filename =${filename}`)
// })

fs.watch(dir1, { recursive: true },(event, filename) => {
  const isExist = fs.existsSync(path.join(dir1, filename))
  console.log(`dir event ${event} filename =${filename} exist = ${isExist}`)
})

// fs.watch(dir2, { recursive: true },(event, filename) => {
//   console.log(`dir event ${event} filename =${filename}`)
// })

// fs.watch(dir3, { recursive: true },(event, filename) => {
//   console.log(`dir event ${event} filename =${filename}`)
// })



/**
 * 结论、
 * fs.watch一个文件时，部分软件（vim、Mac自带的文本编辑器），在文件修改时，是触发rename事件
 * （我们判断为create），并且后续的文件变化将收不到监听回调，所以对于文件，此时我们可以close监听，
 * 然后重新触发fs.watch
 * 
 * 
 * fs.watch一个文件夹时，则没有上面这种问题
 * 
 * 
 */

const fsevents = require('fsevents')
const dir1 = '/Users/quinn/Downloads/wedisk'
// const stop = fsevents.on(dir1, (path, flags, id)=>{
//   const info = fsevents.getInfo(path, flags, id)
//   console.log(`path = ${path}`)
// })
new fsevents(dir1).on('fsevent', (path, flags, id)=>{
  const info = fsevents.getInfo(path, flags, id)
  console.log(`path = ${path} flags = ${flags} id = ${id}`)
}).start()

const fs = require('fs')
const path = require('path')
const EventEmitter = require('events')
/**
 * 监听本地文件/文件夹变化，暂时支持create，delete，change三种事件，change事件支持防抖动
 * 
 * 调用方式
 *  const nodeFsWatcher = NodeFsWatcher.getInstance()
    nodeFsWatcher.on('change', (filename) => {
      console.log(`received[change] ${filename}`)
    } 
    )

    nodeFsWatcher.on('delete', (filename) => {
      console.log(`received[delete] ${filename}`)
    } 
    )

    nodeFsWatcher.on('create', (filename) => {
      console.log(`received[create] ${filename}`)
    } 
    )
    const file1 = __dirname + '/resources/room2/ddd2.txt'
    const file2 = __dirname + '/resources/room2/dir2/folder/ff2.txt'
    nodeFsWatcher.watch(file1)
    nodeFsWatcher.watch(file2)
 **/

const DEBOUNCE_INTERVAL_OF_CHANGE = 400 // 文件修改防抖动的时间差，xxx毫秒以内的修改，只当做一次
class NodeFsWatcher extends EventEmitter {
  constructor() {
    super()
    this.pathToWatcherMap = new Map()
    this.pathToMd5Map = new Map()
    this.pathToEventDetailList = new Map()
  }

  async watch(watchPath) {
    const isExist = fs.existsSync(watchPath)
    const isWatchingDirectory = fs.statSync(watchPath).isDirectory()
    // const initMd5 = await this.fileMd5(watchPath)
    const initMd5 = ''
    console.log(
      `Start watching file[${watchPath}], exist[${isExist}], isWatchingDirectory[${isWatchingDirectory}], initMD5 = [${initMd5}]`
    )
    // this.pathToMd5Map.set(watchPath, initMd5)
    var eventDetailList = []
    if (this.pathToEventDetailList.has(watchPath)) {
      eventDetailList = this.pathToEventDetailList.get(watchPath)
    } else {
      this.pathToEventDetailList.set(watchPath, eventDetailList)
    }

    const fswatcher = fs.watch(
      watchPath,
      { recursive: isWatchingDirectory },
      async (event, filename) => {
        const changeFilePath = isWatchingDirectory
          ? path.join(watchPath, filename)
          : watchPath
        const changeFileExist = fs.existsSync(changeFilePath)
        if (event === 'rename') {
          if (!isWatchingDirectory) {
            if (changeFileExist) {
              // 如果是纯粹因为delete后重新新建文件后产生的create事件，因为delete事件后就结束坚挺了，所以这里的create是部分软件，在保存文件时触发的create事件
              this.tryToSendChangeEvent(changeFilePath)
              fswatcher.close()
              this.watch(changeFilePath) // changeFilePath === watchPath
            } else {
              this.emit('delete', changeFilePath)
              fswatcher.close()
            }
          } else {
            this.emit(changeFileExist ? 'create' : 'delete', changeFilePath)
          }
        } else if (event === 'change') {
          this.tryToSendChangeEvent(changeFilePath)
        }
      }
    )
    this.pathToWatcherMap.set(watchPath, fswatcher)
  }

  async tryToSendChangeEvent(changeFilePath) {
    const eventDetailList = this.pathToEventDetailList.get(changeFilePath)
    const debounce = await this.debounceForChange(
      eventDetailList,
      changeFilePath
    )
    if (debounce) {
      eventDetailList.push({
        filePath: changeFilePath,
        event: 'change',
        time: new Date().getTime()
      })
      setTimeout(() => {
        console.log('>>>>> emit change event')
        this.emit('change', changeFilePath)
        this.pathToEventDetailList.set(changeFilePath, []) // clear list
      }, DEBOUNCE_INTERVAL_OF_CHANGE)
    } else {
    }
  }

  /**
   * 防抖动，如果发现是频繁修改文件，
   * 则返回false，则事件不用加入队列，直接忽略即可
   * 如果返回true，则事件加入队列，并且发送通知
   */
  async debounceForChange(eventDetailList, changeFilePath) {
    const fileMd5Change = await this.checkFileMd5Changed(changeFilePath)
    if (!fileMd5Change) {
      console.log('debounceForChange skp change for md5')
      return false
    }
    const lastEventDetail = this.lastEventDetail(eventDetailList)
    if (
      lastEventDetail.event === 'change' &&
      lastEventDetail.filePath === changeFilePath
    ) {
      const interval = new Date().getTime() - lastEventDetail.time
      if (interval < DEBOUNCE_INTERVAL_OF_CHANGE) {
        console.log('debounceForChange skp change for time frequence')
        return false
      } else {
        return true
      }
    }
    return true
  }

  lastEventDetail(eventDetailList) {
    if (eventDetailList.length > 0) {
      return eventDetailList[eventDetailList.length - 1]
    } else {
      return { filePath: '', event: '', time: 0 }
    }
  }

  closeWatcherByPath(path) {
    if (this.pathToWatcherMap.has(path)) {
      const watcher = this.pathToWatcherMap.get(path)
      watcher.close()
      this.pathToWatcherMap.delete(path)
    }
  }

  closeAllWatchers() {
    var keyIter = this.pathToWatcherMap.keys()
    for (const key of keyIter) {
      this.pathToWatcherMap.get(key).close()
    }
  }

  getAllWatchedFiles() {
    return this.pathToWatcherMap.keys()
  }

  async checkFileMd5Changed(filepath) {
    return true
    // const isDirectory = fs.statSync(filepath).isDirectory()
    // if (isDirectory) {
    //   return true
    // }
    // const prewMd5 = await this.pathToMd5Map.get(filepath)
    // const currMd5 = await this.fileMd5(filepath)
    // const change = prewMd5 !== currMd5
    // console.log(
    //   `checkFileMd5Changed filepath = ${filepath} prewMd5 = ${prewMd5} currMd5 = ${currMd5} change = ${change}`
    // )
    // if (change) {
    //   this.pathToMd5Map.set(filepath, currMd5)
    // }
    // return change
  }

  async fileMd5(filePath) {
    // const BUFFER_SIZE = 8192
    // const crypto = require('crypto')
    // const fd = fs.openSync(filePath, 'r')
    // const hash = crypto.createHash('md5')
    // const buffer = Buffer.alloc(BUFFER_SIZE)
    // try {
    //   let bytesRead
    //   do {
    //     bytesRead = fs.readSync(fd, buffer, 0, BUFFER_SIZE)
    //     hash.update(buffer.slice(0, bytesRead))
    //   } while (bytesRead === BUFFER_SIZE)
    // } finally {
    //   fs.closeSync(fd)
    // }
    // const md5 = hash.digest('hex')
    // console.log(`fileMd5 > ${filePath} > `,md5)
    // return md5
  }
}


const nodeFsWatcher = new NodeFsWatcher()
nodeFsWatcher.on('change', (filename) => {
  console.log(`>>>>>>>>>>>>>>>received[change] ${filename}`)
} 
)

nodeFsWatcher.on('delete', (filename) => {
  console.log(`received[delete] ${filename}`)
} 
)

nodeFsWatcher.on('create', (filename) => {
  console.log(`received[create] ${filename}`)
} 
)
// const file1 = '/Users/quinn/Desktop/untitled.txt'
const file1 = '/Users/quinn/Downloads/wedisk/广州研发部'
nodeFsWatcher.watch(file1)

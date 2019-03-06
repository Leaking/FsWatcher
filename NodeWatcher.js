const fs = require('fs')
const path = require('path')
const EventEmitter = require('events')
/**
 * 
 * 
 * 调用方式
 *  const nodeWatcher = NodeWatcher.getInstance()
    nodeWatcher.on('change', (filename) => {
      console.log(`received[change] ${filename}`)
    } 
    )

    nodeWatcher.on('delete', (filename) => {
      console.log(`received[delete] ${filename}`)
    } 
    )

    nodeWatcher.on('create', (filename) => {
      console.log(`received[create] ${filename}`)
    } 
    )
    const file1 = __dirname + '/resources/room2/ddd2.txt'
    const file2 = __dirname + '/resources/room2/dir2/folder/ff2.txt'
    nodeWatcher.watch(file1)
    nodeWatcher.watch(file2)
 */
// 文件修改防抖动的时间差，xxx毫秒以内的修改，只当做一次
const DEBOUNCE_INTERVAL_OF_CHANGE = 400
let instance = null
class NodeWatcher extends EventEmitter {

  static getInstance() {
    return new NodeWatcher()
  }

  constructor(){
    super()
    if(instance == null){
      instance = this
      instance.watchersMap = new Map()
    }
    return instance
  }

  watch(watchPath){
    const isExist = fs.existsSync(watchPath)
    const isWatchingDirectory = fs.statSync(watchPath).isDirectory()
    var eventDetailList = []
    console.log(`Start watching file[${watchPath}], exist[${isExist}], isWatchingDirectory[${isWatchingDirectory}]`)
    const fswatcher = fs.watch(watchPath, {recursive: isWatchingDirectory}, (event, filename) => {
      const changeFilePath = isWatchingDirectory ? path.join(watchPath, filename) : watchPath
      const changeFileExist = fs.existsSync(changeFilePath)
      // this.emit(event, changeFilePath)
      if('rename' === event) {
        if(!isWatchingDirectory) {
          this.emit(changeFileExist ? 'rename' : 'delete', changeFilePath)
        } else {
          this.emit(changeFileExist ? 'create' : 'delete', changeFilePath)            
        }
      } else if('change' === event){
        if(this.debounceForChange(eventDetailList, changeFilePath)) {
          eventDetailList.push({filePath: changeFilePath, event: 'change', time: new Date().getTime()})
          setTimeout(() => {
            this.emit('change', changeFilePath)
            eventDetailList = [] //clear list
          }, DEBOUNCE_INTERVAL_OF_CHANGE)
        } else {
          console.log('debounce, skp change')
        }
      }
    })
    this.watchersMap.set(watchPath, fswatcher)
  }

  /**
   * 防抖动，如果发现是频繁修改文件，则返回false，则事件不用加入队列，直接忽略即可
   * 如果返回true，则事件加入队列，并且发送通知
   */
  debounceForChange(eventDetailList, changeFilePath) {
    const lastEventDetail = this.lastEventDetail(eventDetailList)
    if(lastEventDetail.event === 'change' && lastEventDetail.filePath === changeFilePath) {
      const interval = new Date().getTime() - lastEventDetail.time
      if(interval < DEBOUNCE_INTERVAL_OF_CHANGE) {
        return false
      } else {
        return true
      }
    }
    return true
  }

  lastEventDetail(eventDetailList) {
    if(eventDetailList.length > 0) {
      return eventDetailList[eventDetailList.length-1]
    } else {
      return {filePath: '', event: '', time: 0}
    }
  }

  closeWatcherByPath(path) {
    if(this.watchersMap.has(path)) {
      const watcher = this.watchersMap.get(path)
      watcher.close()
      this.watchersMap.delete()
    }
  }

  closeAllWatchers() {
    var keyIter = this.watchersMap.keys()
    for(const key of keyIter) {
      this.watchersMap.get(key).close()
    }
  }

  getAllWatchedFiles() {
    return this.watchersMap.keys()
  }
}

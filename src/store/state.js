// state状态树
// 必须通过 mutation 来修改

// 定义state 与组件/模块/项目 相关的底层数据
// getters 则是对数据的一层映射 可以是函数 类似于计算属性 也可以写复杂的判断逻辑
// 定义对数据修改的逻辑 就是定义mutations
// 在此之前可以定义mutation-types 具体的修改操作
// actions在有需要时再使用
// 通过这几个文件 可以定义数据 并将其映射到组件中 以及修改这些数据的方法
// state -> getters -> (actions) -> mutation-type -> mutations -> state
import {playMode} from '../common/js/config'
import {loadSearch, loadPlay} from '../common/js/cache'

const state = {
  singer: {},
  // 播放列表
  playing: false,
  // 是否缩小
  fullScreen: false,
  // 播放列表
  playlist: [],
  // 根据播放模式改变的播放列表
  sequenceList: [],
  // 播放模式
  mode: playMode.sequence,
  // 当前播放歌曲index
  // 初始不播放 所以-1
  currentIndex: -1,
  disc: {},
  topList: {},
  // searchHistory: []
  // 替换成从本地存储读取初始值
  searchHistory: loadSearch(),
  // 读写都从缓存里操作
  playHistory: loadPlay()
}

export default state
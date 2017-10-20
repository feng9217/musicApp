// 定义修改操作
import * as types from './mutation-types'

// 相关修改方法
const mutations = {
  // 方法名 SET_SINGER
  // 第一个参数 state 就是当前获取到的状态树
  // 第二个参数是提交mutations时传的参数
  [types.SET_SINGER](state, singer) {
    state.singer = singer
  },
  [types.SET_PLAYING_STATE](state, flag) {
    // 布尔值一般都用flag
    state.playing = flag
  },
  [types.SET_FULL_SCREEN](state, flag) {
    state.fullScreen = flag
  },
  [types.SET_PLAYLIST](state, list) {
    state.playlist = list
  },
  [types.SET_SEQUENCE_LIST](state, list) {
    state.sequenceList = list
  },
  [types.SET_PLAY_MODE](state, mode) {
    state.mode = mode
  },
  [types.SET_CURRENT_INDEX](state, index) {
    state.currentIndex = index
  },
  [types.SET_DISC](state, disc) {
    state.disc = disc
  },
  [types.SET_TOP_LIST](state, topList) {
    state.topList = topList
  },
  [types.SET_SEARCH_HISTORY](state, history) {
    state.searchHistory = history
  },
  [types.SET_PLAY_HISTORY](state, history) {
    state.playHistory = history
  }
}

export default mutations
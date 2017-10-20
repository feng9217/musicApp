// 1.执行异步的修改
// 不异步的话 直接由组件通过mutation修改state即可
// 2.对mutation的封装 一个action触发多个mutation

// 直接修改mutation有mapMutation
// actions则有mapActions语法糖供组件使用
// 直接在 methods 中注入

import * as types from './mutation-types'
import {playMode} from '../common/js/config'
import {shuffle} from '../common/js/utill'
import {saveSearch, deleteSearch, clearSearch, savePlay} from 'common/js/cache'

function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

// 点击的列表和索引
export const selectPlay = function({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list)
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    // 找到同首歌在两个列表对应的 index
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  // 出错不要急 慢慢找原因
  // 刚开始是chrome报错默认事件
  // 后来在APP.vue上加了@touchmove.prevent防止冲突 结果并没有解决
  // console.log后发现点击是正常的
  // 那就猜测没有触发点击事件
  // 回来找 CNM _PLAYLIST写错了 结果没触发PLAYLIST的值
  // 那还弹出个毛线的播放页面啊
  // commit(types.SET_PLAYLIST, list)
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 点击随机播放全部 按钮触发的mutation
export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 插入一首歌 需要改变playlist sequenceList currentIndex
// 而且playlist中之前就有同支歌的话 还要把之前的删除
// 要对state进行操作 肯定需要state
export const insertSong = function ({commit, state}, song) {
  // 存储当前值
  // 不能直接调用state里值来操作
  // 可以用 .slice() 返回一个副本
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 记录当前歌曲
  let currentSong = playlist[currentIndex]
  // 查看当前列表是否有选中的歌曲 并返回其索引
  // arrayObj.findIndex(callbackfn [, thisArg])
  let fpIndex = findIndex(playlist, song)
  // 插入 索引+1
  currentIndex++
  // 插入歌到当前索引位置
  playlist.splice(currentIndex, 0, song)
  // 如果已经包含这首歌
  if (fpIndex > -1) {
    // 插入索引 > 列表中的索引
    if (currentIndex > fpIndex) {
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      playlist.splice(fpIndex + 1, 1)
    }
  }
  // 获取当前 sequenceList 索引
  let currentSIndex = findIndex(sequenceList, currentSong) + 1

  let fsIndex = findIndex(sequenceList, song)

  sequenceList.splice(currentSIndex, 0, song)

  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const saveSearchHistory = function ({commit}, query) {
  // 把query写到storage中 且返回一个存储了query的新列表
  // 并commit到 SET_SEARCH_HISTORY 这个mutation中
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

// 删除一条数据
// 不仅要通过mutation修改state 还要修改本地缓存
export const deleteSearchHistory = function ({commit}, query) {
  // 把 query 从 searchList 中删除 再返回删除后的数组
  // 再提交到 mutation
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

// 全部删除
export const clearSearchHistory = function ({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

export const deleteSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex

  let pIndex = findIndex(playlist, song)
  playlist.splice(pIndex, 1)

  let sIndex = findIndex(sequenceList, song)
  sequenceList.splice(sIndex, 1)

  // 如果当前播放歌曲在删除索引之后
  // 删掉后当前播放歌曲的index也要随之-- 不然就切歌了
  // 还有就是删的是最后一首
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--
  }

  // 设置好逻辑后就可以提交mutation
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)

  // 如果删完了就要停止播放
  if (!playlist.length) {
    commit(types.SET_PLAYING_STATE, false)
  }
  // 个人觉得可以不加 不播放的时候编辑列表
  // playstate可以保持在原来状态
  // else {
  //   commit(types.SET_PLAYING_STATE, true)
  // }
}

export const deleteSongList = function ({commit}) {
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}

export const savePlayHistory = function({commit}, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}
// 在 getters 中包装后
// 组件中就可以在 computed: {} 中
// 通过 ...MapGetters语法糖 拿到数据
// 同时可以作为计算属性

// singer就是state下的singer
export const singer = state => state.singer

export const playing = state => state.playing

export const fullScreen = state => state.fullScreen

export const playlist = state => state.playlist

export const sequenceList = state => state.sequenceList

export const mode = state => state.mode

export const currentIndex = state => state.currentIndex

// 计算属性
// state不加()会怎么样??
export const currentSong = (state) => {
  return state.playlist[state.currentIndex] || {}
}

export const disc = state => state.disc

export const topList = state => state.topList

export const searchHistory = state => state.searchHistory

export const playHistory = state => state.playHistory
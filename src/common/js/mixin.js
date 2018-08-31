// 多个组件都需要写相同逻辑的共用JS代码段

import {mapGetters, mapMutations, mapActions} from 'vuex'
import {playMode} from 'common/js/config'
import {shuffle} from '../../common/js/utill'

export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  // 组件 DOM ready 的时候
  mounted() {
    this.handlePlaylist(this.playlist)
  },
  // keep-alive组件 触发的
  activated() {
    this.handlePlaylist(this.playlist)
  },
  methods: {
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    }
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(newVal)
    }
  }
}

export const playerMixin = {
  computed: {
    // 图标根据播放模式改变的class
    iconMode() {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      // getter 包装后的state
      // 注册后可以直接 this.xxxx 访问到当前值
      'playlist',
      'currentSong',
      'mode',
      'sequenceList',
      'favoriteList'
    ])
  },
  methods: {
    // 播放模式切换
    changeMode() {
      // 通过 getters 获取
      const mode = (this.mode + 1) % 3
      // 通过 mutation 修改
      this.setPlayMode(mode)
      // 实际改变播放列表内容
      // 随机播放 把数组打乱 洗牌函数
      let list = null
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      // 这两个顺序不能换
      // 换了就会切歌
      this.resetCurrentIndex(list)
      this.setPlayList(list)
      // 但是由于 currentSong 是经 playlist 计算来的
      // 改变了 playlist 但不想改变 currentSong
      // 所以当前播放的 currentIndex 也要跟着改变
    },
    resetCurrentIndex(list) {
      // 找到处理后 list 中 song 对应的 索引Index
      // findIndex() 会让 list 中每个元素执行回调函数
      // 没有返回任何元素 则返回 -1
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    // 共同的收藏icon逻辑
    getFavoriteIcon(song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite'
      }
      return 'icon-not-favorite'
    },
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteList(song)
      } else {
        this.saveFavoriteList(song)
      }
    },
    // 判断当前送是否 favorite
    // 也就是 favoriteList 中是否有
    isFavorite(song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.id === song.id
      })
      // > -1 说明歌曲就是favorite的
      return index > -1
    },
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST'
    }),
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  }
}

export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 100
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    onQueryChange(query) {
      this.query = query
    },
    blurInput() {
      this.$refs.searchBox.blur()
    },
    saveSearch() {
      this.saveSearchHistory(this.query)
    },
    addQuery(query) {
      this.$refs.searchBox.setQuery(query)
    },
    ...mapActions([
      // PS: 其实这就已经相当于在methods上加载方法了
      // 可以直接在DOM上调用的
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}
<template>
  <transition name="slide">
    <div class="user-center">
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <switches @switch="switchItem" :switches="switches" :currentIndex="currentIndex"></switches>
      </div>
      <div class="play-btn" ref="playBtn" @click="random">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div class="list-wrapper" ref="listWrapper">
        <!-- 和 add-song 的 html结构十分类似 可以直接copy -->
        <!-- 只用更改 ref 还有传入的:data -->
        <scroll ref="favoriteList" class="list-scroll" v-if="currentIndex===0" :data="favoriteList">
          <div class="list-inner">
            <song-list :songs="favoriteList" @select="selectSong"></song-list>
          </div>
        </scroll>
        <scroll ref="playList" class="list-scroll" v-if="currentIndex===1" :data="playHistory">
          <div class="list-inner">
            <song-list :songs="playHistory" @select="selectSong"></song-list>
          </div>
        </scroll>
      </div>
      <div class="no-result-wrapper" v-show="noResult">
        <no-result :title="noResultDesc"></no-result>
      </div>
    </div>
  </transition>
</template>

<script type="text/javascript">
  import Switches from 'base/switches/switches'
  import {mapGetters, mapActions} from 'vuex'
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'
  import Song from 'common/js/song'
  import {playlistMixin} from 'common/js/mixin'
  import NoResult from 'base/no-result/no-result'

  export default {
    // 来实现列表和底部播放器 show or not 的 高度 自适应
    mixins: [ playlistMixin ],
    data() {
      return {
        currentIndex: 0,
        switches: [
        {name: 'my favor'},
        {name: 'lates play'}
        ]
      }
    },
    computed: {
      // localStorage.clear()的边界条件
      noResult() {
        // 先判断在哪个列表下
        if (this.currentIndex === 0) {
          // 再判断列表长度
          // 因为是在 v-show 下的
          // 所以需要返回的是 Boolean值
          return !this.favoriteList.length
        } else {
          return !this.playHistory.length
        }
      },
      noResultDesc() {
        if (this.currentIndex === 0) {
          return '暂无收藏歌曲'
        } else {
          return '赶紧去选几首歌听听吧!!'
        }
      },
      ...mapGetters([
        'favoriteList',
        'playHistory'
      ])
    },
    methods: {
      // 解决底部高度能否自适应问题
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.listWrapper.style.bottom = bottom
        // 因为带有 v-if 有可能不存在 所以用前需要要判断一下
        this.$refs.favoriteList && this.$refs.favoriteList.refresh()
        this.$refs.playList && this.$refs.playList.refresh()
      },
      back() {
        this.$router.back()
      },
      random() {
        let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
        // 边界条件 列表是空的
        // 加了判断以后 可以阻止mutation在此时的派发
        if (list.length === 0) {
          console.log('list是空的 装点歌进来先啦!!')
          return
        }
        list = list.map((song) => {
          // 有些方法是只有Song类才能适用的
          // 所以对传回来的不是Song类的歌曲数据 都进行转换
          return new Song(song)
        })
        this.randomPlay({
          list
        })
      },
      switchItem(index) {
        this.currentIndex = index
      },
      selectSong(song) {
        // 从历史数据读取的 所以要new Song
        this.insertSong(new Song(song))
      },
      ...mapActions([
        'insertSong',
        // 之前一直做好的点击随机播放 直接复用
        'randomPlay'
      ])
    },
    components: {
      Switches,
      Scroll,
      SongList,
      NoResult
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .user-center
    position: fixed
    top: 0
    bottom: 0
    z-index: 100
    width: 100%
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      box-sizing: border-box
      width: 135px
      padding: 7px 0
      margin: 0 auto
      text-align: center
      border: 1px solid  $color-text-l
      color: $color-text-l
      border-radius: 100px
      font-size: 0
      .icon-play
        display: inline-block
        vertical-align: middle
        margin-right: 6px
        font-size: $font-size-medium-x
      .text
        display: inline-block
        vertical-align: middle
        font-size: $font-size-small
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
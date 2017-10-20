<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h2 class="title" v-html="title"></h2>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div class="play" v-show="songs.length>0" ref="playBtn" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <!-- 遮罩层 -->
      <div class="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <!-- 传入songs使其获得正确高度 -->
    <scroll :data="songs"
            class="list" ref="list"
            :probe-type="probeType"
            :listen-scroll="listenScroll"
            @scroll="scroll">
      <div class="song-list-wrapper">
        <song-list @select="selectItem" :songs="songs" :rank="rank"></song-list>
      </div>
      <div class="loading-container" v-show="!songs.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type="text/javascript">
  import Scroll from '../../base/scroll/scroll'
  import SongList from '../../base/song-list/song-list'
  import Loading from '../../base/loading/loading'
  import {mapActions} from 'vuex'
  import {playlistMixin} from 'common/js/mixin'

  const RESERVED_HEIGHT = 40

  // 没有做 blur 和 js的类prefix处理

  export default {
    mixins: [playlistMixin],
    // 接收组件外传来的参数
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: []
      },
      title: {
        type: String,
        default: ''
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        scrollY: 0
      }
    },
    computed: {
      bgStyle() {
        return `background-image:url(${this.bgImage})`
      }
    },
    created() {
      // 监听滚动距离
      this.probeType = 3
      this.listenScroll = true
    },
    mounted() {
      // 缓存好最大滚动高度 不变的 不用每次都加载
      this.imageHeight = this.$refs.bgImage.clientHeight
      // 预留一个高度常量 不让滚动到最顶
      this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
      // top为背景图高度
      this.$refs.list.$el.style.top = `${this.$refs.bgImage.clientHeight}px`
    },
    methods: {
      // 处理有mini播放器时底部高度问题
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()
      },
      scroll(pos) {
        this.scrollY = pos.y
      },
      back() {
        this.$router.back()
      },
      selectItem(item, index) {
        // 点击后就要触发各种mutations 可以使用一个action来封装
        // 传入一个对象
        this.selectPlay({
          list: this.songs,
          index
        })
        console.log('点击点击')
      },
      random() {
        this.randomPlay({
          list: this.songs
        })
      },
      ...mapActions([
        'selectPlay',
        'randomPlay'
      ])
    },
    watch: {
      // 实时更新滚动值 layer层跟随滚动遮挡
      scrollY(newY) {
        // ------- 滚动遮罩layer部分 ---------
        // 要对layer滚动做个限制 不是无限滚动 因为css布局是100% 高度有限
        let translateY = Math.max(this.minTranslateY, newY)
        // js访问css属性: el.style.["attr"]
        this.$refs.layer.style['transform'] = `translate3d(0,${translateY}px,0)`
        this.$refs.layer.style['webkitTransform'] = `translate3d(0,${translateY}px,0)`
        let zIndex = 0
        // 当滚动到顶部
        if (newY < this.minTranslateY) {
          zIndex = 10
          // 因为是按宽高比布局 要写死就置0
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
          this.$refs.playBtn.style.display = 'none'
        } else {
          // 还没滚动到顶部 重置到默认样式
          // zIndex 这句可以不写 每次变化都是重新运行一次scrollY
          // 只要没滚动到顶部 zIndex值就是 0
          zIndex = 0
          this.$refs.bgImage.style.paddingTop = `70%`
          this.$refs.bgImage.style.height = 0
          this.$refs.playBtn.style.display = ''
        }
        // 写在 if 外面
        this.$refs.bgImage.style.zIndex = zIndex
        // ------ 滚动时 bgImage 缩放部分
        let scale = 1
        // scale缩放公式
        const percent = Math.abs(newY / this.imageHeight)
        if (newY > 0) {
          // 放大 随滚动无缝贴合
          scale = 1 + percent
          zIndex = 10
        }
        this.$refs.bgImage.style.zIndex = zIndex
        this.$refs.bgImage.style['transform'] = `scale(${scale})`
        this.$refs.bgImage.style['webkitTransform'] = `scale(${scale})`
      }
    },
    components: {
      Scroll,
      SongList,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"
  @import "../../common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
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
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
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
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
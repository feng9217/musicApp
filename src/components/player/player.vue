<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="nomal"
    @enter="enter"
    @after-enter="afterEnter"
    @leave="leave"
    @after-leave="afterLeave">
    <div class="normal-player" v-show="fullScreen">
      <div class="background">
        <img width="100%" height="100%" :src="currentSong.image">
      </div>
      <div class="top">
        <div class="back" @click="back">
          <i class="icon-back"></i>
        </div>
        <h1 class="title" v-html="currentSong.name"></h1>
        <h2 class="subtitle" v-html="currentSong.singer"></h2>
      </div>
      <div class="middle"
           @touchstart.prevent="middleTouchStart"
           @touchmove.prevent="middleTouchMove"
           @touchend="middleTouchEnd"
      >
        <div class="middle-l" ref="middleL">
          <div class="cd-wrapper" ref="cdWrapper">
            <div class="cd" :class="cdRotateClass">
              <img class="image" :src="currentSong.image"></img>
            </div>
          </div>
          <div class="playing-lyric-wrapper">
            <div class="playing-lyric">{{playingLyric}}</div>
          </div>
        </div>
        <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
          <div class="lyric-wrapper">
            <div v-if="currentLyric">
              <p class="text"
                 ref="lyricLine"
                 :class="{'current': currentLineNum === index}"
                 v-for="(line,index) in currentLyric.lines"
              >{{line.txt}}</p>
            </div>
          </div>
        </scroll>
      </div>
      <div class="bottom">
        <div class="dot-wrapper">
          <span class="dot" :class="{'active':currentShow === 'cd'}"></span>
          <span class="dot" :class="{'active':currentShow === 'lyric'}"></span>
        </div>
        <div class="progress-wrapper">
          <span class="time time-l">{{format(currentTime)}}</span>
          <div class="progress-bar-wrapper">
            <progress-bar :percent="percent" @percentChange="afterProgressBarChange"></progress-bar>
          </div>
          <span class="time time-r">{{format(currentSong.duration)}}</span>
        </div>
        <div class="operators">
          <div class="icon i-left" @click="changeMode">
            <i :class="iconMode"></i>
          </div>
          <div class="icon i-left" :class="disableClass">
            <i @click="pre" class="icon-prev"></i>
          </div>
          <div class="icon i-center" :class="disableClass">
            <i @click="togglePlaying" :class="playIcon"></i>
          </div>
          <div class="icon i-right" :class="disableClass">
            <i @click="next" class="icon-next"></i>
          </div>
          <div class="icon i-right">
            <!-- 由于播放内核和播放收藏列表关于这个收藏ICON的逻辑和操作都相通 所以可以mixin复用 -->
            <i class="icon" :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
          </div>
        </div>
      </div>
    </div>
    </transition>
    <transition name="mini">
    <div class="mini-player" v-show="!fullScreen" @click="open">
      <div class="icon">
        <img width="40" height="40" :src="currentSong.image" :class="cdRotateClass">
      </div>
      <div class="text">
        <h2 class="name" v-html="currentSong.name"></h2>
        <p class="desc" v-html="currentSong.singer"></p>
      </div>
      <div class="control">
        <!-- 包裹后 标签里的内容将作为slot插槽 插入编写的位置 -->
        <progress-circle :radius="radius" :percent="percent">
          <i @click.stop="togglePlaying" class="icon-mini" :class="playIconMini"></i>
        </progress-circle>
      </div>
      <div class="control" @click.stop="showPlaylist">
        <i class="icon-playlist"></i>
      </div>
    </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <audio ref="audio" :src="currentSong.url"
           @canplay="ready"
           @error="error"
           @timeupdate="updateTime"
           @ended="end"></audio>
  </div>
</template>

<script type="text/javascript">
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import animations from 'create-keyframe-animation'
  import ProgressBar from '../../base/progress-bar/progress-bar'
  import ProgressCircle from '../../base/progress-circle/progress-circle'
  import {playMode} from '../../common/js/config'
  import Lyric from 'lyric-parser'
  import Scroll from '../../base/scroll/scroll'
  import {prefixStyle} from '../../common/js/prefixStyle'
  import Playlist from '../playlist/playlist'
  import {playerMixin} from 'common/js/mixin'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    mixins: [playerMixin],
    data() {
      return {
        // 控制点击 只有歌曲ready的时候才能点击上/下一首
        // 为 true 时才能进行点击操作
        songReady: false,
        // 歌曲播放时间
        currentTime: 0,
        // 传入progress-circle的 虽然为定值
        // 但直接传入会报错 type check failed for prop "radius"
        // 是因为 32 被转换成字符串了
        radius: 32,
        currentLyric: null,
        currentLineNum: 0,
        currentShow: 'cd',
        playingLyric: ''
      }
    },
    created() {
      this.touch = {}
    },
    computed: {
      playIcon() {
        // playing 为 true 时 显示pause图标
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      playIconMini() {
        // 注意mini的play图标 点击以后会冒泡
        // 触发父元素的 @click="open"
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      cdRotateClass() {
        return this.playing ? 'play' : 'play pause'
      },
      disableClass() {
        return this.songReady ? '' : 'diasble'
      },
      percent() {
        return this.currentTime / this.currentSong.duration
      },
      // 图标根据播放模式改变的class
      // 撸去 mixin 里了
      // iconMode() {
      //   return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
      // },
      // state 中需要全局调用的变量
      ...mapGetters([
        // getter 包装后的state
        // 注册后可以直接 this.xxxx 访问到当前值
        'fullScreen',
        'playlist',
        'currentSong',
        'playing',
        'currentIndex',
        'mode',
        'sequenceList'
      ])
    },
    methods: {
      back() {
        // 把 fullScreen 设为 false 但不能直接修改
        // 只能通过mutations来修改
        // 然后通过映射好的函数来传递参数
        // 不能直接 fullScreen = false
        this.setFullScreen(false)
      },
      open() {
        this.setFullScreen(true)
      },
      // nomal-player和mini-player互动的动画实现
      // 从mini唱片图片飞出到normal
      // 这里使用的是 create-keyframe-animation 来进行JS编程实现CSS3动画效果
      // 简单点的也可以使用 animation.css
      enter(el, done) {
        const {x, y, scale} = this._getPosAndScale()

        // 先定义animation
        let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }

        // create-keyframe-animation的api
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'Linear'
          }
        })

        // 需要 DOM
        // 动画执行完毕调用 done 函数 则跳到afterEnter
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter() {
        // 结束后清空
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        // 最终运行到的位置
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`
        // 监听动画完成
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave() {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style.transform = ''
      },
      // PS: transform没考虑类似prefix的兼容性
      // 如果做了兼容性 就封装成变量
      // const transform = prefixStyle('transform')
      // .style[transform] = ''
      _getPosAndScale() {
        // mini的小CD
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        // normal的大CD
        const paddingTop = 80
        // innerWidth 窗口的文档显示区的宽度
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        // 初始 x 坐标
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerWidth - paddingTop - width / 2 - paddingBottom
        return {
          x,
          y,
          scale
        }
      },
      // 每次点击都会对 playing 的值取反
      // 但是还要根据 playing 的状态来控制
      // 所以需要实时的 watch
      togglePlaying() {
        if (!this.songReady) {
          return
        }
        this.setPlayingState(!this.playing)
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      next() {
        // 加上点击控制 放置鬼畜点击
        if (!this.songReady) {
          return
        }
        // 歌单只有一首歌的边界情况
        if (this.playlist.length === 1) {
          this.loop()
        }
        // 下一首 到最后一首的时候回跳到第一首
        let index = this.currentIndex + 1
        if (index === this.playlist.length) {
          index = 0
        }
        this.setCurrentIndex(index)
        console.log(this.currentIndex)
        if (!this.playing) {
          this.togglePlaying()
        }
        // 还原标志位
        this.songReady = false
      },
      pre() {
        // 加上点击控制 放置鬼畜点击
        if (!this.songReady) {
          return
        }
        // 歌单只有一首歌的边界情况
        if (this.playlist.length === 1) {
          this.loop()
        }
        // 上一首 到第一首的时候 跳转到最后一首
        let index = this.currentIndex - 1
        if (index === -1) {
          index = this.playlist.length - 1
        }
        this.setCurrentIndex(index)
        console.log(this.currentIndex)
        if (!this.playing) {
          this.togglePlaying()
        }
        // 还原标志位
        this.songReady = false
      },
      // canplay error timeupdate ended
      // 都是audio标签播放的时候自带的派发事件
      ready() {
        this.songReady = true
        this.savePlayHistory(this.currentSong)
      },
      error() {
        // 当歌曲加载失败
        // 如网络问题 url有效性问题
        this.songReady = true
      },
      updateTime(event) {
        // target就是audio标签
        // 含有一个currentTime属性
        // 但是得到的是一个时间戳 还需要自己处理成分:秒的形式
        this.currentTime = event.target.currentTime
      },
      format(interval) {
        // | 0 就是向下取整操作
        interval = interval | 0
        const minute = interval / 60 | 0
        const second = this._pad(interval % 60)
        return `${minute}:${second}`
      },
      // format出来的时间只有个位数
      // 为了好看还要补零处理
      _pad(num, n = 2) {
        // toString 把数字转换成字符串
        // 还可以传递参数 2 8 16 ··· 表示进制
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len++
        }
        return num
      },
      // 手动拖动进度条到末尾 并转到下一首
      // audio 并不会切歌 只会派发ended事件
      // 所以要自己实现
      end() {
        // 判断播放模式
        // 单曲循环继续播放当前song
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
      loop() {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        if (this.currentLyric) {
          this.currentLyric.seek(0)
        }
      },
      // 监听拖动完成后派发的事件 接收新传递来的percent参数
      afterProgressBarChange(percent) {
        // currentTime是一个可读可写的属性
        this.$refs.audio.currentTime = this.currentSong.duration * percent
        // 实现暂停后拖动完成 继续播放
        if (!this.playing) {
          this.togglePlaying()
        }
        if (this.currentLyric) {
          this.currentLyric.seek(this.$refs.audio.currentTime * 1000)
        }
      },
      // // 播放模式切换
      // 撸去 mixin 了
      // changeMode() {
      //   // 通过 getters 获取
      //   const mode = (this.mode + 1) % 3
      //   // 通过 mutation 修改
      //   this.setPlayMode(mode)
      //   // 实际改变播放列表内容
      //   // 随机播放 把数组打乱 洗牌函数
      //   let list = null
      //   if (mode === playMode.random) {
      //     list = shuffle(this.sequenceList)
      //   } else {
      //     list = this.sequenceList
      //   }
      //   this.resetCurrentIndex(list)
      //   this.setPlayList(list)
      //   // 但是由于 currentSong 是经 playlist 计算来的
      //   // 改变了 playlist 但不想改变 currentSong
      //   // 所以当前播放的 currentIndex 也要跟着改变
      // },
      // resetCurrentIndex(list) {
      //   // 找到处理后 list 中 song 对应的 索引Index
      //   // findIndex() 会让 list 中每个元素执行回调函数
      //   // 没有返回任何元素 则返回 -1
      //   let index = list.findIndex((item) => {
      //     return item.id === this.currentSong.id
      //   })
      //   this.setCurrentIndex(index)
      // },
      getLyric() {
        // 把获取回来的长字符串装进 类 里
        // 当前实例
        this.currentSong.getLyric().then((lyric) => {
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          if (this.playing) {
            this.currentLyric.play()
          }
          // console.log(this.currentLyric)
        }).catch(() => {
          // 特殊情况 出错时清空处理
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLineNum = 0
        })
      },
      handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum
        // 保持歌词scroll
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          // 直接滚动到顶部
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        // api 回调 当前播放的歌词
        this.playingLyric = txt
      },
      // 同 progressBar 移动差不多
      // touchstart touchmove touchend
      // 这3个监听事件都是小写的 ............
      middleTouchStart(event) {
        this.touch.initiated = true
        this.touch.startX = event.touches[0].pageX
        this.touch.startY = event.touches[0].pageY
      },
      middleTouchMove(event) {
        if (!this.touch.initiated) {
          return
        }
        // 因为歌词滚动的时候会需要监听 Y轴方向的移动
        // 所以需要计算 Y 值
        const deltaX = event.touches[0].pageX - this.touch.startX
        const deltaY = event.touches[0].pageY - this.touch.startY
        // 纵轴偏移 > 横轴偏移 就应当作误操作 不应该滚动
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return
        }
        // 初始状态 .style.left 值有两种情况 要么在CD最左 要么在Lyric最右
        // 从左往右/从上往下滑 坐标值增大
        // console.log('pageX:' + event.touches[0].pageX)
        // console.log('pageY:' + event.touches[0].pageY)
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        // 定义一个 touch.percent 判断是否触发切换页面效果
        // 可以当做灵敏度
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        // lyricList 也就是 scroll 是一个vue组件 不能直接操作 DOM
        // 所以需要访问 $el 才能访问 DOM
        // 这里的transform也一定要prefix
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        // percent越大 透明度越小
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style[transitionDuration] = 0
      },
      // 决定滚到 CD 还是滚到 Lyric
      middleTouchEnd(event) {
        // 当在 CD 页面 从右往左滑动
        let offsetWidth
        let opacity
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth
            opacity = 0
            this.currentShow = 'lyric'
          } else {
            offsetWidth = 0
            opacity = 1
          }
        } else {
          // 在 lyric 页面 从左往右滑
          if (this.touch.percent < 0.9) {
            offsetWidth = 0
            this.currentShow = 'cd'
            opacity = 1
          } else {
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        const time = 300
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
      },
      showPlaylist() {
        this.$refs.playlist.show()
      },

      // 经过包装的 需要改变 state 中量时而使用的操作
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
        setPlayingState: 'SET_PLAYING_STATE',
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setPlayMode: 'SET_PLAY_MODE',
        setPlayList: 'SET_PLAYLIST'
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    },
    watch: {
      currentSong(newSong, oldSong) {
        if (!newSong.id) {
          return
        }
        // 加个判断 不然暂停后改变播放列表
        // 歌没变 但会继续播放
        if (newSong.id === oldSong.id) {
          return
        }
        // 清空之前歌词及其计时器
        if (this.currentLyric) {
          this.currentLyric.stop()
        }
        // 直接调用play()的同时还会请求src 会报错
        // 所以要加个延时 确保DOM获取了src后才play()
        // $nextTick $nextTick $nextTick
        // 手机后台切到前台 需要更大延时保证能继续播放
        // 所以把 this.$nextTick 改成 setTimeout
        setTimeout(() => {
          this.$refs.audio.play()
          // 返回来的歌词是一个base64字符串
          // 需要第三方库解码
          this.getLyric()
        }, 1000)
      },
      // 每次点击 playing的值就会改变
      playing(newPlaying) {
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      Playlist
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              // CD旋转样式
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          // CD旋转样式
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  // 定义CD旋转的实现
  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
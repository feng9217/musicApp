<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
  import {prefixStyle} from '../../common/js/prefixStyle'

  const progressBtnWidth = 16
  const transform = prefixStyle('transform')

  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    created() {
      // 创建一个实例上的touch对象
      // 来维护在不同回调函数间touch的数据共享
      this.touch = {}
    },
    methods: {
      // 监听进度条的 touch 事件
      // event 里都存有 touch 相关的信息
      progressTouchStart(event) {
        // 手动设置初始化标志位
        this.touch.initiated = true
        // 第一个touch点击位置
        this.touch.startX = event.touches[0].pageX
        console.log(event.touches[0])
        // 已经滚动的进度条宽度 (初始值)
        this.touch.left = this.$refs.progress.clientWidth
      },
      progressTouchMove(event) {
        if (!this.touch.initiated) {
          return
        }
        // 偏移量
        const deltaX = event.touches[0].pageX - this.touch.startX
        console.log(event.touches[0])
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        // 0 < 移动宽度(初始+偏移) < bar的宽度
        const offsetWidth = Math.min(barWidth, Math.max(0, this.touch.left + deltaX))
        // 计算好 offsetWidth 后就可以
        // 设置 progress 的 width 和 Btn 的 transform
        // 方法同下 可以封装
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      },
      progressTouchEnd(event) {
        this.touch.initiated = false
        // 拖动到位置后停不下来
        // 因为拖完后init就为false了
        // watch仍然还是percent 还是继续设到之前位置
        // 所以拖动完成后 需要派发一个事件
        // 告诉外层播放器拖动到的进度
        // 然后把进度设置成新的percent
        this._triggerPercent()
      },
      _triggerPercent() {
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        // 拖动后的宽度 / 进度条宽度
        const percent = this.$refs.progress.clientWidth / barWidth
        this.$emit('percentChange', percent)
      },
      progressClick(event) {
        // 当点击 btn 的时候 event.offsetX 获取错误
        // 换成 pageX 点击位置到屏幕左边距离
        // 但需要处理一段 bar 以外的距离
        // const offsetWidth = event.offsetX
        // getBoun.... 获取到屏幕边缘距离
        const rect = this.$refs.progressBar.getBoundingClientRect()
        const offsetWidth = event.pageX - rect.left
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this._triggerPercent()
      }
    },
    watch: {
      percent(newPercent) {
        // 只有在不是拖动的情况下才重新计算 否则会冲突
        if (newPercent >= 0 && !this.touch.initiated) {
          // 进度条宽度
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
          // 偏移宽度 歌曲播放比例 * 总宽度
          const offsetWidth = newPercent * barWidth
          this.$refs.progress.style.width = `${offsetWidth}px`
          // 小球的 ref 是加在 wrapper 里的 ....
          // 不加prefix竟然跑不动 ..
          // transform 要经过prefix处理
          this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        }
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
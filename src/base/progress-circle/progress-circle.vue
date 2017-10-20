<template>
  <div class="progress-circle">
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray"
        :stroke-dashoffset="dashOffset"/>
    </svg>
    <slot></slot>
  </div>
</template>

<script type="text/javascript">
  export default {
    props: {
      radius: {
        type: Number,
        default: 32
      },
      percent: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        // 表示描边距离
        // 覆盖整个圆的边的话 就是周长2πr
        dashArray: Math.PI * 100
      }
    },
    computed: {
      // 表示描边偏移 覆盖在描边距离上
      // 搭配起来就是圆形进度条的效果
      // 如 array=100 offset=50 就是盖了一半
      dashOffset() {
        return (1 - this.percent) * this.dashArray
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-circle
    position: relative
    circle
      stroke-width: 8px
      transform-origin: center
      &.progress-background
        transform: scale(0.9)
        stroke: $color-theme-d
      &.progress-bar
        transform: scale(0.9) rotate(-90deg)
        stroke: $color-theme
</style>
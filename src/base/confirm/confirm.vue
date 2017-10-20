<template>
  <transition name="confirm-fade">
    <!-- 单纯的阻止冒泡用 @click.stop -->
    <div class="confirm" v-show="showFlag" @click.stop>
      <div class="confirm-wrapper">
        <div class="confirm-content">
          <p class="text">{{text}}</p>
          <div class="operate">
            <div @click="cancel" class="operate-btn left">{{cancelBtnText}}</div>
            <div @click="confirm" class="operate-btn">{{confimBtnText}}</div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script type="text/javascript">
// 弹窗组件 提升用户体验用的
// 可以放到根组件
// 或者放到需要使用的组件中
  export default {
    props: {
      text: {
        type: String,
        default: ''
      },
      confimBtnText: {
        type: String,
        default: '确定'
      },
      cancelBtnText: {
        type: String,
        default: '取消'
      }
    },
    data() {
      return {
        showFlag: false
      }
    },
    methods: {
      show() {
        this.showFlag = true
      },
      hide() {
        this.showFlag = false
      },
      cancel() {
        this.hide()
        this.$emit('cancel')
      },
      confirm() {
        this.hide()
        this.$emit('confirm')
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .confirm
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 998
    background-color: $color-background-d
    &.confirm-fade-enter-active
      animation: confirm-fadein 0.3s
      .confirm-content
        animation: confirm-zoom 0.3s
    .confirm-wrapper
      // 垂直水平居中弹窗
      position: absolute
      top: 50%
      left: 50%
      transform: translate(-50%, -50%)
      z-index: 999
      .confirm-content
        width: 270px
        border-radius: 13px
        background: $color-highlight-background
        .text
          padding: 19px 15px
          line-height: 22px
          text-align: center
          font-size: $font-size-large
          color: $color-text-l
        .operate
          display: flex
          align-items: center
          text-align: center
          font-size: $font-size-large
          .operate-btn
            flex: 1
            line-height: 22px
            padding: 10px 0
            border-top: 1px solid $color-background-d
            color: $color-text-d
            &.left
              border-right: 1px solid $color-background-d

  @keyframes confirm-fadein
  // 背景透明遮罩
    0%
      opacity: 0
    100%
      opacity: 1

  @keyframes confirm-zoom
  // 内容区缩放 从0~1.1~1
    0%
      transform: scale(0)
    50%
      transform: scale(1.1)
    100%
      transform: scale(1)
</style>
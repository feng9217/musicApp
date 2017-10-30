<template>
  <!-- 加 ref 引用是为了可以在 methods中直接 $ref 操作 -->
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <!-- slot插槽 slider包裹的dom都会被插入这个插槽内 -->
      <slot></slot>
    </div>
    <div class="dots">
      <span class="dot"
            v-for="(item, index) in dots"
            :class="{active: currentPageIndex === index}">
      </span>
    </div>
  </div>
</template>

<script type="text/javascript">
  import BScroll from 'better-scroll'
  import {addClass} from '../../common/js/dom.js'

  export default {
    name: 'slider',
    data() {
      return {
        dots: [],
        currentPageIndex: 0
      }
    },
    // 设置props 使组件可以由外部数据控制
    // 这里用第三方库 better-scroll 实现轮播
    props: {
      // 循环轮播与否
      loop: {
        type: Boolean,
        default: true
      },
      // 自动轮播与否
      autoPlay: {
        type: Boolean,
        default: true
      },
      // 自动轮播间隔
      interval: {
        type: Number,
        default: 4000
      }
    },
    // 要保证正确的初始化第三方库就应该使用 mounted钩子
    mounted() {
    // 为了保证DOM能成功渲染 一般都会加个延时
    // 可以用this.$nexttick
    // 也可以用原生JS的 setTimeout
    // 浏览器刷新一般是17ms一次 所以这里取20
      setTimeout(() => {
        this._setSliderWidth()
        // dots和children.length保持一致
        // 所以在slider初始化前初始化dots
        this._initDots()
        this._initSlider()
        // 判断是否需要自动播放
        if (this.autoPlay) {
          this._play()
        }
      }, 20)
      // 视窗被改变大小后 之前的sliderWidth并没有改变
      // 就会造成轮播图尬播
      // 所以就要监听窗口大小重新设置sliderWidth的值
      window.addEventListener('resize', () => {
        if (!this.slider) {
          return
        }
        // 还要注意 因为方法中有给 width = 2 * sliderWidth
        // 不能每次改变窗口大小都再 *2
        // 所以需要设置一个标志位
        this._setSliderWidth(true)
        // 宽度重新设置后就需要刷新slider
        // better-scroll 自带方法
        this.slider.refresh()
      })
    },
    methods: {
      _setSliderWidth(isResize) {
        let width = 0
        // 确保每个元素宽度都相同
        this.children = this.$refs.sliderGroup.children
        let sliderWidth = this.$refs.slider.clientWidth
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          // 给子元素加上class 确保正确渲染样式
          addClass(child, 'slider-item')
          // 确保宽度
          // child宽度等于父容器宽度
          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }
        // 如果 loop为true 则左右还需要加一块sliderWidth
        // 确保轮播的时候无缝链接
        if (this.loop && !isResize) {
          width += 2 * sliderWidth
        }
        console.log('refs引用:' + this.$refs.sliderGroup)
        this.$refs.sliderGroup.style.width = width + 'px'
      },
      _initDots() {
        this.dots = new Array(this.children.length)
      },
      // 用第三方库初始化slider
      _initSlider() {
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true,
          scrollY: false,
          // 惯性
          momentum: false,
          snap: true,
          snapLoop: this.loop,
          snapThreshold: 0.3,
          snapSpeed: 400
          // 手机模式下 点击不能跳转
          // 原因是和 fastclick 冲突
          // click: true
        })
        // better-scroll 在每次滚动到下一张的时候会派发一个事件
        this.slider.on('scrollEnd', () => {
          // 自带方法 获取当前为第几个子元素
          let pageIndex = this.slider.getCurrentPage().pageX
          if (this.loop) {
            // 循环模式下 默认往第一个元素前添加一个拷贝
            // 所以和实际的 index 是相差 1 的
            pageIndex -= 1
          }
          this.currentPageIndex = pageIndex
          // 由于setTimeout就自己运行了一次
          // 所以自动播放时很尴尬
          if (this.autoPlay) {
            // 防止手拖时和自动轮播时间冲突 结果拖了还接着自动轮播
            // 所以每次自动轮播前要clear一次
            clearTimeout(this.timer)
            this._play()
          }
        })
      },
      _play() {
        // 就是让页面自动跳到下一张图片
        // 改变 currentPageIndex 即可
        let pageIndex = this.currentPageIndex + 1
        if (this.loop) {
          pageIndex += 1
        }
        this.timer = setTimeout(() => {
          // 也是 better-scroll 自带的方法
          // 第二个参数是Y方向的 第三个是速度 和snapspeed保持一致
          this.slider.goToPage(pageIndex, 0, 400)
        }, this.interval)
      }
    }
    // 做好资源回收 释放内存
    // destroyed() {
    //   clearTimeout(this.timer)
    // }
  }
  // mounted 的时候调用 sliderWidth 但slot里的DOM未被已经生成
  // 在 created 的时候获取 recommend 的数据
  // 因为是个异步过程 就会有延迟
  // 可能在还没获取到 recommend 数据的时候 mounted 可能就执行了
  // 而此时 slot 里的内容不一定有
  // 就会导致渲染错误
  // 所以就要在 slider的父容器上加个 v-if 判断
  // 确保数据获取完了 才开始渲染 slider部分
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      // 规定段落中的文本不换行 和overflow:hidden搭配使用
      // 多用于多个元素在同一行内布局 如轮播
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display:block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
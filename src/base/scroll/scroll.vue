<template>
  <div ref="wrapper">
    <!-- 内层套上DOM元素 就可以让这些DOM滚动 -->
    <slot></slot>
  </div>
</template>

<script type="text/javascript">
  import BScroll from 'better-scroll'

  export default {
    props: {
      probeType: {
        type: Number,
        default: 1
      },
      click: {
        type: Boolean,
        default: true
      },
      // 获取data 应对动态数据 有refresh需要
      data: {
        type: Array,
        default: null
      },
      // 用不用监听滚动事件
      // 如 推荐列表 就不用关心滚动位置
      listenScroll: {
        type: Boolean,
        default: false
      },
      pullup: {
        type: Boolean,
        default: false
      },
      beforeScroll: {
        type: Boolean,
        default: false
      },
      refreshDelay: {
        type: Number,
        default: 20
      }
    },
    mounted() {
      // 确保DOM已经渲染
      // discList加载完了 获取了高度再加载scroll
      setTimeout(() => {
        this._initScroll()
      }, 20)
    },
    methods: {
      _initScroll() {
        // 没生成就不初始化 防报错
        if (!this.$refs.wrapper) {
          return
        }
        this.scroll = new BScroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click
        })
        if (this.listenScroll) {
          // 保留vue实例
          // scroll.vue就能监听滚动并派发一个scroll事件
          // 返回一个position信息值
          let _this = this
          this.scroll.on('scroll', (pos) => {
            _this.$emit('scroll', pos)
          })
        }
        if (this.pullup) {
          this.scroll.on('scrollEnd', () => {
            // 小于这个值的时候就是快滚动到底部了
            // 监听这个事件 就知道什么时候可以继续获取数据
            if (this.scroll.y <= this.scroll.maxScrollY + 50) {
              this.$emit('scrollToEnd')
            }
          })
        }
        // 优化手机端用的 滚动前让input失去焦点
        // 从而收起虚拟键盘
        if (this.beforeScroll) {
          this.scroll.on('beforeScrollStart', () => {
            this.$emit('beforeScroll')
          })
        }
      },
      // 下面是几个常用的方法代理
      enable() {
        this.scroll && this.scroll.enable()
      },
      disable() {
        this.scroll && this.scroll.disable()
      },
      refresh() {
        this.scroll && this.scroll.refresh()
      },
      scrollTo() {
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
      },
      scrollToElement() {
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
      }
    },
    // 监控data变化 执行刷新
    watch: {
      data() {
        setTimeout(() => {
          this.refresh()
        }, this.refreshDelay)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus"></style>
<template>
  <!-- 类通讯录组件 -->
  <!-- 使用scoll组件 同时传入data -->
  <scroll class="listview"
          @scroll="scroll"
          :listen-scroll="listenScroll"
          :probe-type="probeType"
          :data="data"
          ref="listview">
    <!-- slot -->
    <!-- 两层数组 -->
    <ul>
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <!-- 监听点击事件 传入点击对象 触发selectItem方法 -->
          <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
            <!-- 图片太多 没必要一次加载完 可以用懒加载 不用 :src -->
            <img v-lazy="item.avatar" class="avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!-- 阻止默认事件 不让下面元素跟着一起滚动 -->
    <div class="list-shortcut"
         @touchstart.stop.prevent="onShortcutTouchStart"
         @touchmove.stop.prevent="onShortcutTouchMove"
         @touchend.stop>
      <ul>
      	<li class="item"
      	v-for="(item, index) in shortcutList"
      	:data-index="index"
        :class="{'current': currentIndex === index}"
      	>{{item}}</li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <div class="fixed-title">{{fixedTitle}}</div>
    </div>
    <div class="loading-container" v-show="!data.length">
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/javascript">
  // 会滚动的列表 所以会用到scroll组件
  import Scroll from '../scroll/scroll.vue'
  import Loading from '../../base/loading/loading.vue'
  import {getData} from '../../common/js/dom.js'

  // list-view中每个元素的高度
  // 字体高度 + padding值
  const ANCHOR_HEIGHT = 18
  // 做上拉时fixed顶替效果的
  const TITLE_HEIGHT = 30

  export default {
    created() {
      // 滚动时能实时获取滚动位置
      this.probeType = 3
      this.touch = {}
      this.listenScroll = true
      this.listHeight = []
    },
    data() {
      return {
        scrollY: -1,
        // 对应到shortcut中哪个该高亮
        // 默认0 就是第一个
        currentIndex: 0,
        diff: -1
      }
    },
    // 异步获取后再通过props传入
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    computed: {
      // 获取数据中 title 的第一个字符: 热 A-Z
      shortcutList() {
        // Array.prototype.map() 数组的 map 方法
        // 返回一个新数组 数组中的元素为原始数组元素调用函数处理后的值
        return this.data.map((group) => {
          // stringObject.substr(start,length)
          // 可在字符串中抽取从 start 下标开始的指定数目的字符
          // console.log(group)
          return group.title.substr(0, 1)
        })
      },
      fixedTitle() {
        // 还要判断边界
        if (this.scrollY > 0) {
          return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    methods: {
      refresh() {
        this.$refs.listview.refresh()
      },
      // 点击时触发 传入item
      // 把select事件 及item参数派发出去
      // $emit 把事件沿着作用域链向上派送
      selectItem(item) {
        console.log(item)
        this.$emit('select', item)
      },
      // 实现了点击小列表大写 跳到list大写分块
      onShortcutTouchStart(e) {
        let anchorIndex = getData(e.target, 'index')
        // 第一次触碰手指位置
        let firstTouch = e.touches[0]
        // console.log(firstTouch)
        // 自编属性 touch是在组件中通用的 所以就把这个值保存并传出去了
        this.touch.y1 = firstTouch.pageY
        // 记录当前点击时的索引
        this.touch.anchorIndex = anchorIndex
        this._scrollTo(anchorIndex)
      },
      // touchstart记录一个Y值 move以后再记录一个Y值
      // 就能得到touch飞了多远
      onShortcutTouchMove(e) {
        let firstTouch = e.touches[0]
        this.touch.y2 = firstTouch.pageY
        // 计算Y轴上的偏移
        // | 0 相当于向下取整 math.floor
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
        // 对比第一次后移动了几个索引
        // 这里其实是字符串和数字相加了
        // 所以需要一个parseInt
        let anchorIndex = parseInt(this.touch.anchorIndex + delta)
        // console.log(anchorIndex)
        this._scrollTo(anchorIndex)
      },
      scroll(pos) {
        // 实时获取better-scroll滚动Y轴的距离
        this.scrollY = pos.y
      },
      // 实现 <联动> 滚动的思路
      // 记录整体高度 和 每个区间高度
      // 监听滚动拿到 实时Y坐标
      // 对比坐标落到哪个区间
      // 得到联动此时应该高亮的索引值
      // 再使用vue的 class绑定 :class把高亮效果写出来
      // 拿到数据 DOM更新后 再计算高度
      _scrollTo(index) {
        // listview两头的区块不理
        if (!index && index !== 0) {
          return
        }
        // 处理index边界情况
        if (index < 0) {
          index = 0
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        // 把高亮弄到上限位置
        this.scrollY = -this.listHeight[index]
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      },
      // 私有方法 当传给listview的data发生变化 就重新计算高度
      // 获取每个listGroup的高度
      // 递增的区间数组
      _calculateHeight() {
        this.listHeight = []
        // 左边每组元素的高度
        const list = this.$refs.listGroup
        let height = 0
        // this.listHeight.push(height)
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          // DOM接口
          height += item.clientHeight
          this.listHeight.push(height)
        }
        // console.log(this.listHeight)
      }
    },
    watch: {
      // 延时计算 数据变化到 DOM变化是有延时的
      // 一般浏览器20ms刷新一次
      data() {
        setTimeout(() => {
          this._calculateHeight()
        }, 20)
      },
      scrollY(newY) {
        const listHeight = this.listHeight
        // 滚动到顶部 newY>0
        // 高亮的就是第一个
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        // 在中间部分滚动 去头去尾
        // 不遍历到最后一个 也就是遍历到倒数第二个
        for (let i = 0; i < listHeight.length - 1; i++) {
          // 判断上限下限 看在哪个区间
          let height1 = listHeight[i]
          let height2 = listHeight[i + 1]
          // 一定要是>=
          if (-newY >= height1 && -newY < height2) {
            this.currentIndex = i
            this.diff = height2 + newY
            return
          }
        }
        // 当滚动到底部 -newY > height1(上限)
        this.currentIndex = listHeight.length - 2
      },
      diff(newVal) {
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        // 减少 DOM 操作的频率
        // 到点再 transform
        if (this.fixedTop === fixedTop) {
          return
        }
        this.fixedTop = fixedTop
        // 开始进行 DOM 操作
        // 让 fixTop 往Y轴向上滚动
        this.$refs.fixed.style.transform = `translate3D(0, ${fixedTop}px, 0)`
      }
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable.styl"

  .listview
    position: absolute
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: fixed
      z-index: 30
      right: 0
      top: 60%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
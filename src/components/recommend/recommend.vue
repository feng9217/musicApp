<template>
  <div class="recommend" ref="recommend">
    <!-- 渲染过后还要监听歌单变化 重新加载scroll -->
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <!-- better-scroll的第一个子级才能滚动 所以使用一个div包完 slider + recommendList-->
      <div>
        <div class="slider-wrapper" v-if="recommends.length" ref="sliderWrapper">
        <slider>
        <!-- 这些 dom节点 都会生成在 slot插槽中 -->
        <!-- 遍历获取的recommend数据 -->
          <div v-for="item in recommends">
          <!-- 根据返回的数据写的 linkUrl 和 picUrl -->
            <a :href="item.linkUrl">
            <!-- 注意这里的 src 是 v-bind 的 -->
            <!-- 组件冲突 各种和fastclick 所以加个class来解决 -->
              <!-- fastclick监听到点击事件 发现class上有needsclick
              就不会去拦截这个过程 -->
              <img class="needsclick" @load="loadImage" :src="item.picUrl">
            </a>
          </div>
        </slider>
        </div>
        <div class="recommend-list">
        <h1 class="list-title">热门歌曲推荐</h1>
        <ul>
          <li @click="selecItem(item)" class="item" v-for="item in discList">
          <!-- 左边图标 右边文本 -->
            <div class="icon">
              <!-- 使用懒加载后 :src="item.imgurl" 换成 v-lazy -->
              <img v-lazy="item.imgurl" width="60" height="60">
            </div>
            <div class="text">
              <!-- 返回数据中有一些HTML字符 所以需要v-html转意 -->
              <h2 class="name" v-html="item.creator.name"></h2>
              <p class="desc" v-html="item.dissname"></p>
            </div>
          </li>
        </ul>
        </div>
      </div>
      <!-- loading组件容器 -->
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script type="text/javascript">
  import Slider from '../../base/slider/slider.vue'
  import Scroll from '../../base/scroll/scroll.vue'
  import Loading from '../../base/loading/loading.vue'
  import {getRecommend, getDiscList} from '../../api/recommend.js'
  import {ERR_OK} from '../../api/config.js'
  import {playlistMixin} from 'common/js/mixin'
  import {mapMutations} from 'vuex'

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        recommends: [],
        discList: [],
        checkLoaded: false
      }
    },
    created() {
      // 最好不要在钩子里写复杂的函数
      // 函数方法都集中写在 methods 中比较好
      this._getRecommend()
      this._getDiscList()
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.recommend.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      // 模板中 @click="selecItem(item)"
      // 因为是遍历的 所以记得传递item
      selecItem(item) {
        this.$router.push({
          path: `/recommend/${item.dissid}`
        })
        // 传递给mutation
        this.setDisc(item)
      },
      // 获取轮播图的后台数据
      _getRecommend() {
        getRecommend().then((res) => {
          if (res.code === ERR_OK) {
            console.log(res.data.slider)
            this.recommends = res.data.slider
          }
        })
      },
      // hmp 是在歌单页里抓的歌单!!
      // https://y.qq.com/portal/playlist.html
      // 是这里!!!
      // fuck
      _getDiscList() {
        getDiscList().then((res) => {
          if (res.code === ERR_OK) {
            console.log(res.data.list)
            this.discList = res.data.list
          }
        })
      },
      // 确保每次载入slide图片后 scroll的高度是正确的
      loadImage() {
        if (!this.checkLoaded) {
          this.$refs.scroll.refresh()
          this.checkLoaded = true
        }
      },
      ...mapMutations({
        setDisc: 'SET_DISC'
      })
    },
    components: {
      Slider,
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"

  // 记得加载reset重置样式消除默认padding和margin
  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-item: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        width: 100%
        position: absolute
        top: 50%
        transform: translateY(-50%)
</style>
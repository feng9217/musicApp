<template>
  <scroll class="suggest"
          :data="result"
          :pullup="pullup"
          @scrollToEnd="searchMore"
          :beforeScroll="beforeScroll"
          @beforeScroll="listScroll"
          ref="suggest"
  >
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="item in result">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div class="no-result-wrapper">
      <no-result v-show="!hasMore && !result.length" title="sorry 换个内容试试吧??"></no-result>
    </div>
  </scroll>
</template>

<script type="text/javascript">
  import {search} from 'api/search'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import Singer from 'common/js/singer'
  import {mapMutations, mapActions} from 'vuex'
  import NoResult from 'base/no-result/no-result.vue'

  const TYPE_SINGER = 'singer'
  const perpage = 20

  export default {
    props: {
      // 搜索关键字
      query: {
        type: String,
        default: ''
      },
      showSinger: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        page: 1,
        result: [],
        // 上拉刷新
        pullup: true,
        // 判断能否继续加载的标志位
        beforeScroll: true,
        hasMore: true
      }
    },
    methods: {
      search() {
        // 在已经搜索的情况下变更搜索关键字
        // 要重置scroll和page
        this.page = 1
        this.hasMore = true
        this.$refs.suggest.scrollTo(0, 0)
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            // console.log(res.data)
            this.result = this._genResult(res.data)
            this._checkMore(res.data)
          }
        })
      },
      searchMore() {
        if (!this.hasMore) {
          return
        }
        // 请求新数据
        this.page++
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            // 不能再直接 _genResult 而应拼接搜索结构
            // concat() 数组拼接
            this.result = this.result.concat(this._genResult(res.data))
            this._checkMore(res.data)
          }
        })
      },
      getDisplayName(item) {
        if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.name}-${item.singer}`
        }
      },
      getIconCls(item) {
        if (item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      _genResult(data) {
        let ret = []
        if (data.zhida && data.zhida.singerid) {
          // 扩展运算符 把所有符合 data.zhida 的值push到 ret中
          // 并添加一个 type : 'singer'
          // 区分数据到底是歌手还是歌曲用的
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        if (data.song) {
          ret = ret.concat(this._normalizeSongs(data.song.list))
        }
        return ret
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((musciData) => {
          if (musciData.songid && musciData.albumid) {
            ret.push(createSong(musciData))
          }
        })
        return ret
      },
      _checkMore(data) {
        const song = data.song
        // 当前取得的值 + 已有的page*每页获取条数 = 现已搜索总数
        if (!song.list.length || (song.curunm + song.curpage * perpage) >= song.totalnum) {
          this.hasMore = false
        }
      },
      selectItem(item) {
        if (item.type === TYPE_SINGER) {
          const singer = new Singer({
            id: item.singermid,
            name: item.singername
          })
          this.$router.push({
            path: `/search/${singer.id}`
          })
          this.setSinger(singer)
        } else {
          this.insertSong(item)
        }
        this.$emit('select')
      },
      refresh() {
        this.$refs.suggest.refresh()
      },
      listScroll() {
        this.$emit('listScroll')
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ])
    },
    watch: {
      query() {
        // 监听变化后就请求服务端
        this.search()
      }
    },
    components: {
      Scroll,
      Loading,
      NoResult,
      befortScroll: true,
      hasMore: true
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
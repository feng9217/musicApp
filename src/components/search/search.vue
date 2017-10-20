<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div ref="shortcutWrapper" class="shortcut-wrapper" v-show="!query">
      <scroll :refreshDelay="refreshDelay" class="shortcut" :data="shortCutHeight" ref="shortcut">
          <!-- 因为scroll只会根据第一个子内容的高度判断是否应该滚动
          所以只能再包个div -->
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li @click="addQuery(item.k)" class="item" v-for="item in hotkey">
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list @delete="deleteOne" @select="addQuery" :searches="searchHistory"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div ref="searchResult" class="search-result" v-show="query">
      <suggest ref="suggest" :query="query" @listScroll="blurInput" @select="saveSearch"></suggest>
    </div>
    <confirm ref="confirm" text="确认清空所有历史??" confimBtnText="yes/确定/oui" @confirm="deleteAll"></confirm>
    <router-view></router-view>
  </div>
</template>

<script type="text/javascript">
  import SearchBox from 'base/search-box/search-box'
  import {getHotKey} from 'api/search'
  import {ERR_OK} from 'api/config'
  import Suggest from 'components/suggest/suggest'
  import {mapActions} from 'vuex'
  import SearchList from 'base/search-list/search-list'
  import Confirm from 'base/confirm/confirm'
  import Scroll from 'base/scroll/scroll'
  import {playlistMixin, searchMixin} from 'common/js/mixin'

  export default {
    mixins: [playlistMixin, searchMixin],
    created() {
      this._getHotKey()
    },
    data() {
      return {
        hotkey: []
        // refreshDelay: 100
        // mixin了
        // query: ''
      }
    },
    computed: {
      shortCutHeight() {
        // 把两个数组合并 重新计算高度 传给scroll
        return this.hotkey.concat(this.searchHistory)
      }
      // mixin了
      // ...mapGetters([
      //   'searchHistory'
      // ])
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.shortcutWrapper.style.bottom = bottom
        this.$refs.shortcut.refresh()
        this.$refs.searchResult.style.bottom = bottom
        this.$refs.suggest.refresh()
      },
      _getHotKey() {
        getHotKey().then((res) => {
          if (res.code === ERR_OK) {
            console.log(res.data.hotkey)
            // 需要检索前多少个 就用slice分割
            this.hotkey = res.data.hotkey.slice(0, 10)
          }
        })
      },
      // 将点击的 item 传递到子组件内容中
      addQuery(query) {
        this.$refs.searchBox.setQuery(query)
      },
      // mixin了
      // onQueryChange(query) {
      //   this.query = query
      // },
      // // 手机优化 移出虚拟键盘
      // blurInput() {
      //   this.$refs.searchBox.blur()
      // },
      // saveSearch() {
      //   this.saveSearchHistory(this.query)
      // },
      deleteOne(item) {
        this.deleteSearchHistory(item)
      },
      deleteAll() {
        this.clearSearchHistory()
      },
      showConfirm() {
        this.$refs.confirm.show()
      },
      ...mapActions([
        // PS: 其实这就已经相当于在methods上加载方法了
        // 可以直接在DOM上调用的
        // mixin了
        // 'saveSearchHistory',
        // 'deleteSearchHistory',
        'clearSearchHistory'
      ])
    },
    watch: {
      query(newQuery) {
        // 从搜索列表切换到主页
        // 及时切换DOM 滚动顺利
        if (!newQuery) {
          setTimeout(() => {
            this.$refs.shortcut.refresh()
          }, 20)
        }
      }
    },
    components: {
      SearchBox,
      Suggest,
      SearchList,
      Confirm,
      Scroll
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input ref="query" class="box" v-model="query" :placeholder="placeholder"></input>
    <i class="icon-dismiss" v-show="query" @click="clear"></i>
  </div>
</template>

<script type="text/javascript">
  import {debounce} from 'common/js/utill'

  export default {
    props: {
      placeholder: {
        type: String,
        default: 'Ride - twenty one pilots'
      }
    },
    data() {
      return {
        query: ''
      }
    },
    methods: {
      clear() {
        this.query = ''
      },
      setQuery(query) {
        this.query = query
      },
      blur() {
        this.$refs.query.blur()
      }
    },
    created() {
      // created 的时候就监听 query
      // 并派发 query事件和 newQuery
      // 可以做个延时执行 节省流量 不用每改个字符都产生请求
      // 节流函数
      this.$watch('query', debounce((newQuery) => {
        this.$emit('query', newQuery)
      }, 200))
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .search-box
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    padding: 0 6px
    height: 40px
    background: $color-highlight-background
    border-radius: 6px
    .icon-search
      font-size: 24px
      color: $color-background
    .box
      flex: 1
      margin: 0 5px
      line-height: 18px
      background: $color-highlight-background
      color: $color-text
      font-size: $font-size-medium
      &::placeholder
        color: $color-text-d
    .icon-dismiss
      font-size: 16px
      color: $color-background
</style>
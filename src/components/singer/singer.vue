<template>
  <!-- 加上v-if 确保有数据能撑开后再渲染 滚动就不会有事了 -->
  <div class="singer" v-if="this.rests" ref="singer">
    <list-view
    :data="singers"
    @select="selectSinger"
    ref="list"></list-view>
    <router-view></router-view>
  </div>
</template>

<script type="text/javascript">
  import {getSingerList} from '../../api/singer.js'
  import {ERR_OK} from '../../api/config.js'
  import Singer from '../../common/js/singer.js'
  import ListView from '../../base/listview/listview.vue'
  import {mapMutations} from 'vuex'
  import {playlistMixin} from 'common/js/mixin'

  const HOT_NAME = '热门'
  const HOT_SINGER_LEN = 10

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        singers: [],
        rests: []
      }
    },
    created() {
      this._getSingerList()
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.singer.style.bottom = bottom
        this.$refs.list.refresh()
      },
      // PS: 下面的map有 id: item.Fsinger_mid
      selectSinger(singer) {
        // router编程式的跳转接口
        this.$router.push({
          // 一个是参数 一个不是参数
          // 因为是引用参数 所以要用字符串模板 ``
          path: `/singer/${singer.id}`
        })
        // 在mapMutations做了映射后 实现对mutation的提交
        this.setSinger(singer)
      },
      _getSingerList() {
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
            console.log(res.data)
            // 把获得的数据归类
            this.singers = this._normalizeSinger(res.data.list)
            console.log('↑ 把一堆数组做成按title分类的对象 ↓')
            console.log(this.singers)
          }
        })
      },
      _normalizeSinger(list) {
        // 装热门用的
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        }
        // 把热门歌手都填充好
        list.forEach((item, index) => {
          // 在设定的十条之内 都添加到
          // new Singer 是common/js中写的类
          // export default class Singer {
          //   constructor({id, name}) {
          //     this.id = id
          //     this.name = name
          //     this.avatar = `https://y.gtimg.cn/music/photo_new/T001R150x150M000${id}.jpg?max_age=2592000`
          //   }
          // }
          if (index < HOT_SINGER_LEN) {
            map.hot.items.push(new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name
            })
            )
          }
          // 开始分类 以 Findex 区分
          // 没有这个 Findex 类的话就创建
          // 有的话就直接 push 进去
          const key = item.Findex
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          // 由于avatar重复了 所以创建了一个类 传递{id, name}
          // 使用的时候直接 new 类 实例化就行
          // 设置好默认参数的
          map[key].items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          })
          )
        })
        // console.log(map)
        // console.log(map.hot.items)
        // 但是得到的对象 遍历的时候是无序的
        // 让其变为有序 只能再经一道工序
        let hot = []
        let rest = []
        for (let key in map) {
          let val = map[key]
          // 正则 title match到字母的话
          if (val.title.match(/[a-zA-Z]/)) {
            // 这里得到的是需要排序的
            rest.push(val)
          } else if (val.title === HOT_NAME) {
            hot.push(val)
          }
        }
        // 数组的排序方法 不另起新的内存
        // a b表示数组中的任意两个元素
        // return>0 b前a后 return<0 a前b后
        // 也可以 a-b:小到大 b-a:大到小
        rest.sort((a, b) => {
          // 首字母比大小 大就返回
          // 就是 a-z 的比较
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        // console.log(rest)
        this.rests = rest
        // concat() 方法用于连接两个或多个数组
        // 该方法不会改变现有的数组 而仅仅会返回被连接数组的一个副本
        return hot.concat(rest)
      },
      // 做mutation-types里的映射
      ...mapMutations({
        setSinger: 'SET_SINGER'
      })
    },
    components: {
      ListView
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    positon: absolute
    top: 88px
    bottom: 0
    width: 100%
    // 设定父容器高度才能滚
    // height: 100%
</style>
<template>
  <transition name="slide">
    <!-- <div class="singer-detail"></div> -->
    <music-list
    :songs="songs"
    :title="title"
    :bg-image="bgImage"></music-list>
  </transition>
</template>

<script type="text/javascript">
  import {mapGetters} from 'vuex'
  import {getSingerDetail} from '../../api/singer.js'
  import {ERR_OK} from '../../api/config.js'
  import {createSong} from '../../common/js/song.js'
  import MusicList from '../music-list/music-list.vue'

  export default {
    data() {
      return {
        songs: []
      }
    },
    computed: {
      title() {
        return this.singer.name
      },
      bgImage() {
        return this.singer.avatar
      },
      // 语法糖
      ...mapGetters([
        'singer'
      ])
    },
    created() {
      console.log(this.singer)
      this._getDetail()
    },
    methods: {
      _getDetail() {
        // 直接进到路由页是没有相关信息的
        // 所以加个判断跳转
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            console.log(res.data.list)
            this.songs = this._normalizeSongs(res.data.list)
            // 最后生成 Song 类型的数组
            console.log('↑ 取里面的musicData 处理后得到Song类型的数组 ↓')
            console.log(this.songs)
          }
        })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          // 对象结构赋值 取的是list下的musicData
          let {musicData} = item
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    components: {
      MusicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"

  // .singer-detail
  //   position: fixed
  //   z-index: 100
  //   top: 0
  //   left: 0
  //   right: 0
  //   bottom: 0
  //   background: $color-background
  .slide-enter-active,.slide-leave-active
    transition: all 0.3s
  .slide-enter,.slide-leave-to
    // 从右向左划入
    // translate3D(x,y,z)
    transform: translate3D(100%, 0, 0)
</style>
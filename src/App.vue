<template>
  <div id="app" @touchmove.prevent>
    <m-header></m-header>
    <tab></tab>
    <!-- 没keep-alive 每次切换 组件的生命周期就重新走一次 -->
    <!-- keep-alive包裹的 DOM 都直接缓存在内存中 不用再从网络加载 -->
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
import mHeader from './components/m-header/m-header'
import Tab from './components/tab/tab'
import Player from 'components/player/player'

export default {
  components: {
    // 这里驼峰 标签用 - 模式
    mHeader,
    Tab,
    // 不是路由相关组件 切换路由并不影响组件功能
    // 业务组件 所以丢在App下
    Player
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>

// store的入口函数
import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger'

// 注册插件
Vue.use(Vuex)

// 自带调试工具 检测是否通过mutations修改 配置开发环境使用(npm run dev)
// production 生产环境
const debug = process.env.NODE_ENV !== 'production'

// export一个 Vuex.Store的实例
export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  // 检测state修改是否来自于mutation
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
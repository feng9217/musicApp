// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import fastclick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'
import store from './store'

// 导入就报错
// import 'common/stylus/index.styl'
import './common/stylus/base.styl'
// 字体图标务必在入口导入
import './common/stylus/icon.styl'

// 取消移动端点击300ms的延时
fastclick.attach(document.body)

// 微信前端团队开源的vconsole
// 移动端也能有console.log信息
// import后腰规避ES6语法检查 不然引入不用会报错
// 代理了浏览器的 console.log 不需要在手机端调试则直接注释掉
/* eslint-disable no-unused-vars */
// import vConsole from 'vconsole'
// console.log('this is for mobile')

// 调用 传参 默认图片
// 使用的时候使用指令 v-lazy
Vue.use(VueLazyLoad, {
  loading: require('common/image/default.png')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  store,
  router
})

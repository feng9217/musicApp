# music-app-demo

> A Vue.js project

## Build Setup

# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).  

唉 不得不说 撸这个仿App页面真的要学太多东西
不过不得不说SPA真是厉害
丢给别人一个页面总比丢给别人一个App更容易接受吧????

推荐页组件演示:  
![image](https://github.com/feng9217/musicApp/blob/master/demoGif/%E6%8E%A8%E8%8D%90%E9%A1%B5.gif)  

歌手页组件演示:  
![image](https://github.com/feng9217/musicApp/blob/master/demoGif/%E6%AD%8C%E6%89%8B%E9%A1%B5.gif)  

歌手详情页组件演示:  
![image](https://github.com/feng9217/musicApp/blob/master/demoGif/%E6%AD%8C%E6%89%8B%E9%A1%B5-%E8%AF%A6%E6%83%85%2B%E6%92%AD%E6%94%BE.gif)  

排行页组件演示:  
![image](https://github.com/feng9217/musicApp/blob/master/demoGif/%E6%8E%92%E8%A1%8C%2B%E6%92%AD%E6%94%BE.gif)  

搜索页组件演示:  
![image](https://github.com/feng9217/musicApp/blob/master/demoGif/%E6%90%9C%E7%B4%A2%2B%E6%92%AD%E6%94%BE.gif)  

mini播放组件演示:  
![image](https://github.com/feng9217/musicApp/blob/master/demoGif/mini%E6%92%AD%E6%94%BE%E6%8E%A7%E5%88%B6%E5%8F%B0.gif)  

个人中心页组件演示:  
![image](https://github.com/feng9217/musicApp/blob/master/demoGif/%E4%B8%AA%E4%BA%BA%E4%B8%AD%E5%BF%83.gif)  

_<h1>App页</h1>_

***
_<h2>结构</h2>_

***
App > [ m-header + ( tab > recommend + singer + rank + search ) ]  
  
_<h1>Recommend页</h1>_

***
_<h2>结构</h2>_

***
除了m-header 整个页面都可以滚动  
所以使用了better-scroll第三方库包裹整个页面  
又因 better-scroll 只有第一个子元素能滚动 所以用一个div将 slider + recommend-list 包裹起来  

recommend > scroll.recommend-content > (slider + recommend-list)
_<h2>slider part</h2>_
***
<h3>数据来源/处理</h3>
***

接口部分: 取的是QQ音乐的数据 有来自PC端网页版的 也有来自手机端的  

首先是 Recommend.vue 的数据  

轮播图由组件 slider.vue 实现 数据来源为:  
https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg?g_tk=1928093487&format=jsonp&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&uin=0&needNewCode=1&jsonpCallback=__jp0  
  
结构为:  
{  
  code: 0,  
  data: {  
    slider: [{}, {}, {}, {}, ......],  
    radioList: [{}, {}, {}, {}, ......],  
    songList: [{}, {}, {}, {}, ......]  
  }  
}  
  
封装了函数 _getRecommend() 来获取返回的数据, getRecommend() 是封装好的处理函数, 返回的是一个jsonp方法(带有Promise)  
  
因为是跨域获取数据, 所以使用了 第三方库jsonp, 以及拼接url的方法param, 使用了 Promise 进行封装, 做成异步的返回数据  
  
***
<h3>结构</h3>
***  
div.slider-wrapper v-if > div.slider = new BS(el, { param }) > div.sliderGroup > ( div v-for="item in data" > a > img )  
div.sliderGroup{ position: relative } > div.dots > span.dot v-for="(item, index) in dots"
括号内就是 slot 的内容  
  
<h3>功能实现</h3>  
  
<h4>slider轮播图</h4>  
  
之后通过 this.recommends = res.data.slider 接收返回的数据进行遍历
而 slider.vue 的<strong>轮播滑动效果 是通过第三方库 better-scroll 实现的, 使用该库的关键点是初始化时计算的高度和宽度要正确, 即渲染时机要正确,</strong> 所以要:  
  mounted() {  
    setTimeout(() => {  
      this._setSliderWidth()  
      this._initSlider()  
    }, 20)  
  }  
PS: 其中20是浏览器刷新时间, 也可以用this.$nextstick, 而且一定要设置好宽/高后才能init better-scroll, 不然滚不了的  
  
因为是用div遍历生成的轮播图, 所以要在样式上 float: left  
让所有遍历出来的div都在同一行, 为了动态添加, 所以需要自己封装一个 addClass()函数, 添加样式的同时还要赋予宽度  
  
在轮播元素(不管是li还是div)都在同一行后, 就可以通过dom操作:  
child.style.width = sliderWidth + 'px'  
width += sliderWidth  
this.$refs.sliderGroup.style.width = width + 'px'  
来设置宽度, 只要 sliderGroup.clientWidth > slider.clientWidth 就能实现滚动啦!!!  
  
当然还需要 this.slider = new BScroll(dom, {param}) 进行初始化  
param就是控制滚动的参数  
  
实现滚动后, 就是要实现轮播。better-scroll每次滚动结束都会派发一个事件: scrollEnd, 轮播就是对这个事件进行监听, 并码回调函数。  
轮播, 就是由当前页滚动至下一页, better-scroll有获取当前页的api, 对中间变量赋值:  
<strong>let pageIndex = this.slider.getCurrentPage().pageX</strong>  
之后就进行操作, 让页面滚动到下一页, 执行_play():  
`this.currentPageIndex = pageIndex`  
`if (this.autoPlay) {`  
  `clearTimeout(this.timer)`  
  `this._play()`  
`}`  
  
_play()执行的就是滚动到下一页的操作, 每次执行, let pageIndex = this.currentPageIndex + 1, 在loop模式下, pageIndex += 1  
之后使用一个 this.timer = setTimeout( () => {}, this.interval )  
回调函数中, 执行了better-scroll的方法: goToPage(pageIndex, 0, 400) 对应的是: (X, Y, 切换时间)  
  
还有一个功能上的完善, 就是在改变视窗大小的时候, slider组件还能正常工作, 则要对之前设置的宽/高进行更新  
实现这个功能就需要对改变视窗大小的事件进行监听:  
<strong>window.addEventListener('resize', () => {})</strong>  
在回调中, 执行了this._setSliderWidth()方法, 但和初始化不同, 不能在 this.loop === true 时继续在两头添加宽度, 所以设置了一个标志位 isResize 进行判断  
重新设置好宽后, 使用better-scroll方法: this.slider.refresh() 就会对宽/高重新计算  
  
***
这样就完成了轮播操作, 其实整个 slider 部分都是可以封装起来复用的, 只要传入想要轮播的数据就OK。  
PS: 当前项目用的 better-scroll 版本为 '0.1.X' , 在 better-scroll 正式版本 '1.X.X' 中, snap已经由Boolean改成了Object, 具体参考其API文档中slider的部分:  
https://github.com/ustbhuangyi/better-scroll/blob/master/example/components/slide/slide.vue  

<h4>dots区块</h4>

对于轮播图小点的控制  
首先是初始化, 确定小点的个数, 在生命周期钩子函数 mounted(){} 中, 执行 _initDots(), 初始化dots, 因为数组带有index信息, 所以选择生成数组:  
  
  _initDots() {  
    this.dots = new Array(this.children.length)  
  }  
  
而此处的 children 就是: this.children = this.$refs.sliderGroup.children 即轮播图的个数。  
  
当轮播图滚动, 会给对应的dot绑定上 active 样式:  
`:class="{active: currentPageIndex === index}"`  
这也就是vue+better-scroll省心的地方, 关于dot这块不用过多操作  
  
***
_<h2>RecommendList part</h2>_  
---
<h3>数据来源/处理</h3>  
***
api: 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
推荐列表RecommendList的实现, 倒是挺简单的。  
  
<h3>结构</h3>  
***
对获取回来的数据进行遍历, 结构为:  
div.recommend-list > ul > li v-for="item in discList"  
  
<h3>功能实现</h3>  

在数据渲染时, 注意有些文本需要使用v-html, 同时使用了lazy-load对图片实现了懒加载。  
  
当点击item时, 会执行绑定的函数: @click="selecItem(item)"  
判断点击的是哪个item, 同时进行路由跳转:  
this.$router.push({  
  path: `/recommend/${item.dissid}`  
})  
页面跳转到选中的推荐歌单中  
  
同时为了使屏幕能滚动而又不使用 overflow: auto 出现原生的滚动条, 使用了一个第三方库 better-scroll 封装成了一个滚动组件包裹需要滚动的部分  
又由于better-scroll只有第一个子元素才能滚动, 所以用了一个大的div把 slider + recommend-list 都包裹在一起  
  
_<h1>Singer页</h1>_

***
_<h2>结构</h2>_
  
***
实现 list-view 及 singer 联动(类通讯录组件)  
先在遍历的时候赋予一个 data-index="index" 属性  
同时给scroll组件扩展两个方法, scrollTo() 和 scrollToElement()
唉 不得不说 撸这个仿App页面真的要学太多东西
不过不得不说SPA真是厉害
丢给别人一个页面总比丢给别人一个App更容易接受吧????


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
_<h3>数据来源/处理</h3>_
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
  
因为是跨域获取数据 所以需要使用跨域, 使用了 第三方库jsonp , 以及拼接url的方法param, 使用了 Promise 进行封装, 做成异步的返回数据  
  
***
_<h3>结构</h3>_
***
slider组件使用了slot插槽, 由:
  `<div class="slider" ref="slider">`  
    `<div class="slider-group" ref="sliderGroup">`  
      `<slot></slot>`  
    `</div>`  
    `<div class="dots">`  
      `<span class="dot"`  
            `v-for="(item, index) in dots"`  
            `:class="{active: currentPageIndex === index}">`  
      `</span>`  
    `</div>`  
  `</div>`  
构成, 而在 recommend.vue 中, slot插入了:
  `<div v-for="item in recommends">`  
    `<a :href="item.linkUrl">`  
      `<!-- 组件冲突 各种和fastclick 所以加个class来解决 -->`  
        `<!-- fastclick监听到点击事件 发现class上有needsclick`  
        `就不会去拦截这个过程 -->`  
      `<img class="needsclick" @load="loadImage" :src="item.picUrl">`  
    `</a>`  
  `</div>`  
  
把slot替换掉, 整体结构就为:

`<div class="slider-wrapper" v-if="recommends.length" ref="sliderWrapper">`  
  `<div class="slider" ref="slider">`  
    `<div class="slider-group" ref="sliderGroup">`  
      `<!-- slot插槽 slider包裹的dom都会被插入这个插槽内 -->`  
      `<div v-for="item in recommends">`  
        `<a :href="item.linkUrl">`  
          `<!-- 组件冲突 各种和fastclick 所以加个class来解决 -->`  
            `<!-- fastclick监听到点击事件 发现class上有needsclick`  
            `就不会去拦截这个过程 -->`  
          `<img class="needsclick" @load="loadImage" :src="item.picUrl">`  
        `</a>`  
      `</div>`  
    `</div>`  
    `<div class="dots">`  
      `<span class="dot"`  
            `v-for="(item, index) in dots"`  
            `:class="{active: currentPageIndex === index}">`  
     ` </span>`  
    `</div>`  
  `</div>`  
`</div>`  

div.slider-wrapper > div.slider > div.sliderGroup > div v-for="item in data" > a > img
  
_<h3>功能实现</h3>_

_<h4>slider轮播图</h4>_

之后通过 this.recommends = res.data.slider 接收返回的数据进行遍历
而 slider.vue 的轮播滑动效果 是通过第三方库 better-scroll 实现的, 使用该库的关键点是初始化时计算的高度和宽度要正确, 即渲染时机要正确, 所以要:
  mounted() {
    setTimeout(() => {
      this._setSliderWidth()
      this._initSlider()
    }, 20)
  }

  其中20是浏览器刷新时间

_<h4>dots区块</h4>_

对于轮播图小点的控制
首先是初始化, 确定小点的个数, 在生命周期钩子函数 mounted(){} 中, 执行 _initDots(), 初始化dots, 因为数组带有index信息, 所以选择生成数组:

  _initDots() {
    this.dots = new Array(this.children.length)
  }

而此处的 children 就是: this.children = this.$refs.sliderGroup.children 即轮播图的个数。sliderGroup是引用ref绑定的虚拟节点, 就是slot的外层标签元素, 包裹着整个轮播图, 轮播图滑动就是控制其宽度的移动。
接着就是控制 dots区块 的移动


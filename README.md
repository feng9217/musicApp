唉 不得不说 撸这个仿App页面真的要学太多东西
不过不得不说SPA真是厉害
丢给别人一个页面总比丢给别人一个App更容易接受吧????

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
  
因为是跨域获取数据 所以需要使用跨域, 使用了 第三方库jsonp , 以及拼接url的方法param, 使用了 Promise 进行封装, 做成异步的返回数据  
  
***
<h3>结构</h3>
***
div.slider-wrapper v-if > div.slider = new BS(el, { param }) > div.sliderGroup > ( div v-for="item in data" > a > img )  
div.sliderGroup{ position: relative } > div.dots > span.dot v-for="(item, index) in dots"
括号内就是 slot 的内容  
  
<h3>功能实现</h3>

<h4>slider轮播图</h4>

之后通过 this.recommends = res.data.slider 接收返回的数据进行遍历
而 slider.vue 的<em>轮播滑动效果 是通过第三方库 better-scroll 实现的, 使用该库的关键点是初始化时计算的高度和宽度要正确, 即渲染时机要正确,</em> 所以要:  
  mounted() {  
    setTimeout(() => {  
      this._setSliderWidth()  
      this._initSlider()  
    }, 20)  
  }  
PS: 其中20是浏览器刷新时间, 也可以用this.$nextstick, 而且一定要设置好宽/高后才能init better-scroll, 不然滚不了的  
  
因为是用div遍历生成的轮播图, 所以要在样式上 float: left  
让所有遍历出来的div都在同一行, 为了动态添加, 所以需要自己封装一个 addClass()函数, 添加样式的同时赋予宽度  
  
在轮播元素(不管是li还是div)都在同一行后, 就可以通过dom操作:
child.style.width = sliderWidth + 'px'  
width += sliderWidth  
this.$refs.sliderGroup.style.width = width + 'px'  
来设置宽度, 只要 sliderGroup.clientWidth > slider.clientWidth 就能实现滚动啦!!!  
  
当然还需要 this.slider = new BScroll(dom, {param}) 进行初始化  
param就是控制滚动的参数  

<h4>dots区块</h4>

对于轮播图小点的控制  
首先是初始化, 确定小点的个数, 在生命周期钩子函数 mounted(){} 中, 执行 _initDots(), 初始化dots, 因为数组带有index信息, 所以选择生成数组:  
  
  _initDots() {  
    this.dots = new Array(this.children.length)  
  }  
  
而此处的 children 就是: this.children = this.$refs.sliderGroup.children 即轮播图的个数。  

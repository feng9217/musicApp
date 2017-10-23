// 项目编译用到的文件
// 小型的server
// 先 npm run build

var express = require('express')
var config = require('./config/index')
var axios = require('axios')

// 自己做的ajax请求 axios配置 要从dev-server.js拿过来
var app = express()

// 代理服务器请求
apiRoutes = express.Router()

apiRoutes.get('/getDiscList', function(req, res) {
  // 需要代理的地址
  var url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
  axios.get(url, {
    headers: {
      // 骗服务器用的 自己加的 header信息
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.query
  }).then((response) => {
    // response 是从服务器拿到的
    // 接着暴露给前端
    res.json(response.data)
  }).catch((e) => {
    console.log(e)
  })
})

apiRoutes.get('/lyric', function(req, res) {
  // 需要代理的地址
  var url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'
  axios.get(url, {
    headers: {
      // 骗服务器用的 自己加的 header信息
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.query
  }).then((response) => {
    // response 是从服务器拿到的
    // 接着暴露给前端
    var ret = response.data
    if (typeof ret === 'string') {
      var reg = /^\w+\(({[^()]+})\)$/
      // 匹配正则
      var matches = ret.match(reg)
      if (matches) {
        ret = JSON.parse(matches[1])
      }
    }
    res.json(ret)
  }).catch((e) => {
    console.log(e)
  })
})

app.use('/api', apiRoutes)

// 静态资源
// 把 dist 目录作为其入口
app.use(express.static('./dist'))

// 开启一个服务(端口)
// 端口在 config/index.js中
// dev环境下是8080
// 在build下可以自己添加新的端口
var port = process.env.PORT || config.build.port
// 报错返回信息
module.export = app.listen(port, function(err) {
  if (err) {
    console.log(err)
    return
  }
  console.log('Listening an http://localhost:' + '\')
})

// npm run build好了以后 就可以 node prod.server.js 来启动服务器
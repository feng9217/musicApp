// 封装通用的jsonp方法
// 抓取数据用
import OriginJsonp from 'jsonp'

// 对外暴露一个 jsonp()方法
// 且封装成一个Promise
export default function jsonp(url, data, option) {
  // 没有 ? 就要先拼一个 ? 否则就是 & 最后 +data
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
  // 成功调用resolve 失败调用reject
  return new Promise((resolve, reject) => {
    OriginJsonp(url, option, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}

// 把传入的data与url拼接
function param(data) {
  let url = ''
  // data一般为json对象 所以要遍历处理
  for (let i in data) {
    // 如果不为undefined就传进当前data[key] 否则为空(因为不能传undefined给后端)
    let value = data[i] !== undefined ? data[i] : ''
    // 开始拼接url ES6拼接语法
    // & + key值 = encoreURI处理后的value
    // 其中 ${} 为占位符 可以是任何js表达式或模板字符串 结果都作为字符串输出
    url += `&${i}=${encodeURIComponent(value)}`
  }
  // 如果该url有data的话就要把第一个&去掉 没有就返回空
  return url ? url.substring(1) : ''
}

import jsonp from '../common/js/jsonp'
import {commonParams, options} from './config.js'

export function getSingerList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg'

  // 属性复制 Object.assign(target, ...sources) 目标对象 多个源对象
  // 返回目标对象
  const data = Object.assign({}, commonParams, {
    channel: 'singer',
    page: 'list',
    key: 'all_all_all',
    pagesize: 100,
    pagenum: 1,
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq',
    // 第三个参数会覆盖第二个参数中的内容 所以OK
    g_tk: 486186461
  })
  return jsonp(url, data, options)
}

export function getSingerDetail(singerId) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'

  const data = Object.assign({}, commonParams, {
    hostUin: 0,
    platform: 'yqq',
    needNewCode: 0,
    singermid: singerId,
    order: 'listen',
    begin: 0,
    num: 60,
    songstatus: 1,
    g_tk: 486186461
  })
  return jsonp(url, data, options)
}
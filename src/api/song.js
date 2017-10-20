import {commonParams} from './config.js'
import axios from 'axios'

export function getLyric(mid) {
  const url = '/api/lyric'
  const data = Object.assign({}, commonParams, {
    songmid: mid,
    // 当前时间戳
    pcachetime: +new Date(),
    platform: 'yqq',
    needNewCode: 0,
    hostUin: 0,
    g_tk: 486186461,
    format: 'json'
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

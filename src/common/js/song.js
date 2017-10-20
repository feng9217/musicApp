import {getLyric} from '../../api/song'
import {ERR_OK} from '../../api/config'
import {Base64} from 'js-base64'
// 组件上都有歌曲详情
// 所以把歌曲数据 musicData抽象出来
// 提取需要的部分

// 使用class声明一个类 不用再用构造函数做一个对象了
// 传统就是 先 var 一个 DEMO 再 DEMO.prototype = {属性, 方法}
// 实例化的时候就 var demo = new Demo().方法
// 把类拿来遍历就可得到一个实例对象
// 不需要再重复写大量代码 把代码都集中在一个地方维护
// 类的扩展性要比对象强
export default class Song {
  constructor({id, mid, singer, name, album, duration, image, url}) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }
  getLyric() {
    // 优化
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }

    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric)
          // console.log(this.lyric)
          resolve(this.lyric)
        } else {
          reject('no lyric')
        }
      })
    })
  }
}

// 不直接调用new 返回一个实例
export function createSong(musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    // 歌曲的播放地址 歌曲的图片
    url: `http://ws.stream.qqmusic.qq.com/${musicData.songid}.m4a?fromtag=46`,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`
  })
}

// 多歌手情况
function filterSinger(singer) {
  let ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((person) => {
    ret.push(person.name)
  })
  // 把数组转换成字符串 用 / 分隔
  return ret.join('/')
}
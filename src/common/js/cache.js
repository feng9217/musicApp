// 要使用locaLStorage和sessionStorage
// 借助第三方库 good-storage
import storage from 'good-storage'

// 可以分类存储 搜索记录 播放记录 等....
const SEARCH_KEY = '__seach__'
const SEARCH_MAX_LENGTH = 15

const PLAY_KEY = '__play__'
const PLAY_MAX_LENGTH = 200

const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LENGTH = 200

// 每插入一个数据都会放到数组前面
// 所以要进行各种边界判断
// 是否有重复数据 然后删除
// 要存储的数组 要存的值 比较函数 最大值
function insertArray(arr, val, compare, maxLen) {
  // 查找当前数组中是否有 符合 compare 的元素
  const index = arr.findIndex(compare)
  // 就是数组中的第一条数据 不用操作
  if (index === 0) {
    return
  }
  // 数组中存在该数据 且不是第一位
  // 则删除之前数据 并 unshift() 插入
  if (index > 0) {
    arr.splice(index, 1)
  }
  // unshift() 方法可向数组的开头添加一个或更多元素
  // 并返回新的长度(返回值)
  // 栈数据结构的访问规则是LIFO(后进先出)
  // 所以从数组前端取得项 就需要 shift()
  // unshift() 就是shift()的相反用途
  // 是往前端添加 并返回新数组长度
  arr.unshift(val)
  // 并且弹出超过数组长度的元素
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

export function saveSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, query, (item) => {
    // compare 参数
    return item === query
  }, SEARCH_MAX_LENGTH)
  storage.set(SEARCH_KEY, searches)
  return searches
}

// 应该从本地缓存读取存储的初始值
export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}

// 删除存储中的一条数据
export function deleteSearch(query) {
  // 先获取存储列表
  let searches = storage.get(SEARCH_KEY, [])
  // 匹配 删除
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function clearSearch() {
  storage.remove(SEARCH_KEY)
  return []
}

export function savePlay(song) {
  // 获取当前列表 没有就得到[]
  let songs = storage.get(PLAY_KEY, [])
  // 执行插入操作
  insertArray(songs, song, (item) => {
    return item.id === song.id
  }, PLAY_MAX_LENGTH)
  // 重新存储
  storage.set(PLAY_KEY, songs)
  return songs
}

export function loadPlay() {
  return storage.get(PLAY_KEY, [])
}

export function saveFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LENGTH)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function deleteFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return song.id === item.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

// 初始加载所有的 FavoriteList
export function loadFavorite() {
  return storage.get(FAVORITE_KEY, [])
}
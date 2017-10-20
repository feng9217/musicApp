function getRandomInt(min, max) {
  // 返回 min~max 间的一个数 且包括max
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle(arr) {
  // 洗牌函数 打乱数组
  // 先做个副本 不打乱原来传入的参数
  let _arr = arr.slice()
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  // 随机抽序号 数组间交换
  // 遍历一次就打乱得很彻底
  return _arr
}

// 节流函数
export function debounce(func, delay) {
  let timer
  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
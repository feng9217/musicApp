// export 一些公共的参数用的
export const commonParams = {
  g_tk: 1928093487,
  // 这里 json 还是 jsonp 都不影响结果 但还是按网页上的信息来
  format: 'jsonp',
  inCharset: 'utf-8',
  outCharset: 'utf-8',
  notice: 0
}

export const options = {
  // jsonpCallback: jsonp2
  // 但是此处 param 设为空 就会报错
  // 明明 format 从jsonp变为json了
  param: 'jsonpCallback'
}

// 错误码
export const ERR_OK = 0
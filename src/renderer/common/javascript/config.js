import electron from 'electron'
const path = require('path').posix
const userData = electron.remote.app.getPath('userData')
const config = path.join(userData, `config.json`)

export const PATH = {
  userData,
  config
}

export const supportEamil = ['qq', '163', 'aliyun']

export function getPersonalPath (email) {
  return getEmailDetailPath(email, 'index')
}

export function getEmailDetailPath (email, id) {
  return path.join(userData, Buffer.from(email).toString('base64'), id)
}

export function getPersonalDirPath (email) {
  return path.join(userData, Buffer.from(email).toString('base64'))
}

export function base64ImgPrefix (type = 'png') {
  return `data:image/${type};base64,`
}
export const cidPrefix = `cid:`

/* eslint-disable*/
export const mailReg = new RegExp(/^[^@]+@([^\.]+)\..*$/)
export const htmlTypeReg = new RegExp(/text\/html/)
export const plainTypeReg = new RegExp(/text\/plain/)
export const multipartType = new RegExp(/multipart\//)
export const charsetReg = new RegExp(/charset=([^]+)/) //修改过 contentType的字符串可以，但是长串字符串不行
export const contentTypeReg = new RegExp(/Content-Type:([^]+?);/)
export const sentContentTypeReg = new RegExp(/Content-Type:([^]+?(\r|\n))/)  //发件箱的ContentType没有分号结尾
export const boundaryReg = new RegExp(/boundary="([^]+?)"/)
export const blankLineReg = new RegExp(/\n\n|\r\r|\r\n\r\n/)
export const blankSpaceStartReg = new RegExp(/^\s+/)
export const mixedMultipart = new RegExp(/multipart\/mixed/)
export const relatedMultipart = new RegExp(/multipart\/related/)
export const alternativeMultipart = new RegExp(/multipart\/alternative/)
export const applicationType = new RegExp(/application\//)
export const secondChartsetReg = new RegExp(/charset="?([^]+?)?"?(\n|\r)/)
export const contentTransferEncodingReg = new RegExp(/Content-Transfer-Encoding:([^]+?(\n|\r))/i)
export const contentDispositionReg = new RegExp(/Content-Disposition: ([^]+?(\n|\r))/i)
export const fileNameReg = new RegExp(/filename="([^]+?)"/)
export const sentFileNameReg = new RegExp(/filename=([^]+?(\r|\n))/) //发件箱的fileName没有双引号
export const encodeFileNameReg = new RegExp(/=\?[^?]+\?[^?]\?+([^]+)/) //匹配包含编码的fileName的名字部分 ?..?.?(  )
export const suffixReg = new RegExp(/\.([^]+)/)
export const twoCodeReg = new RegExp(/=\?([^]+?)\?([^]+?)\?/)
export const utf8Reg = new RegExp(/utF-8|utf8/i)
export const contentIdReg = new RegExp(/Content-ID: <([^]+)>/i)
export const imgReg = new RegExp(/jpg|gif|bmp|png/)

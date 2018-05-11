// import electron from 'electron'
// import User from '../../../models/user'
import { PATH, getPersonalPath, getPersonalDirPath, getEmailDetailPath, htmlTypeReg, mixedMultipart } from './config'
import User from '../../../models/user'
const fs = require('fs')
// const iconv = require('iconv-lite')
// import { getEmailList } from './getEmail'
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

// 从硬盘获取邮件列表
export function _getDiskMailList (_box) {
  let box = 'emailList'
  if (_box === 'sent') {
    box = 'sentList'
  } else if (_box === 'draft') {
    box = 'draftList'
  }
  const email = _getUser().email
  if (!email) {
    // 没有已登录的账户
    return null
  } else {
    const userData = low(new FileSync(getPersonalPath(email)))
    return userData.get(box).write()
  }
}

export function _getDiskAdressList () {
  const email = _getUser().email
  if (!email) {
    // 没有已登录的账户
    return null
  } else {
    const userData = low(new FileSync(getPersonalPath(email)))
    return userData.get('addressList').write()
  }
}
export function _getDiskGroupList () {
  const email = _getUser().email
  if (!email) {
    // 没有已登录的账户
    return null
  } else {
    const userData = low(new FileSync(getPersonalPath(email)))
    return userData.get('groupList').write()
  }
}
// 保存通讯录列表
export function _saveAddressList (list) {
  const email = _getUser().email
  const userData = low(new FileSync(getPersonalPath(email)))
  userData.set('addressList', list).write()
  return list
}
// 保存通讯录分组列表
export function _saveGroupList (list) {
  const email = _getUser().email
  const userData = low(new FileSync(getPersonalPath(email)))
  userData.set('groupList', list).write()
  return list
}

// 保存收件箱列表
export function _saveEmailList (list) {
  const email = _getUser().email
  const userData = low(new FileSync(getPersonalPath(email)))
  userData.set('emailList', list).write()
  return list
}
// 保存发件箱列表
export function _saveSentEmailList (list) {
  const email = _getUser().email
  const userData = low(new FileSync(getPersonalPath(email)))
  userData.set('sentList', list).write()
  return list
}
// 保存草稿箱列表
export function _saveDraftsEmailList (list) {
  const email = _getUser().email
  const userData = low(new FileSync(getPersonalPath(email)))
  userData.set('draftList', list).write()
  return list
}

// 从硬盘获取一封邮件信息,若没有此文件则自动创建
export function _getDiskEmail (id) {
  const email = _getUser().email
  const emailDetail = low(new FileSync(getEmailDetailPath(email, id)))
  return emailDetail.getState()
}
// 将网络获取的邮件存储在硬盘
export function _saveDiskEmail (detail) {
  delete detail.emailText
  const email = _getUser().email
  const contentType = detail.header['content-type'].join('')
  let db
  let _detail = {
    ...detail
  }
  db = low(new FileSync(getEmailDetailPath(email, `${_detail.attr.uid}`)))
  if (contentType.match(htmlTypeReg)) {
    fs.writeFileSync(getEmailDetailPath(email, `${_detail.attr.uid}.html`), _detail.body.bodyHtml.replace(/charset=([^]+?")/, '"'))
    // 单独存了html，就不用再重复存了，bodyHtml属性存地址
    _detail = {
      ..._detail,
      body: {
        ..._detail.body,
        bodyHtml: getEmailDetailPath(email, `${_detail.attr.uid}.html`)
      }
    }
  } else if (contentType.match(mixedMultipart)) {
    const prefix = `${Math.random()}`.substr(2)
    _detail.body.attachment.forEach(item => {
      fs.writeFileSync(getEmailDetailPath(email, `${prefix}${item.name.trim()}`), Buffer.from(item.content, 'base64'))
    })
    _detail = {
      ..._detail,
      body: {
        ..._detail.body,
        attachment: _detail.body.attachment.map(x => ({name: x.name, location: getEmailDetailPath(email, `${prefix}${x.name.trim()}`)}))
      }
    }
  }
  // 添加：将html也单独为一个文件
  if (!contentType.match(htmlTypeReg)) {
    const html = _detail.body.bodyHtml
    if (html && html.length > 100 && (html.match(/<style/) || html.length > 1000)) {
      fs.writeFileSync(getEmailDetailPath(email, `${_detail.attr.uid}.html`), _detail.body.bodyHtml.replace(/charset=([^]+?")/, '"'))
      // 单独存了html，就不用再重复存了，bodyHtml属性存地址
      _detail = {
        ..._detail,
        body: {
          ..._detail.body,
          bodyHtml: getEmailDetailPath(email, `${_detail.attr.uid}.html`)
        }
      }
    }
  }
  db.setState(_detail).write()
  return _detail
}
// 从硬盘获取用户信息
export function _getUser () {
  const config = low(new FileSync(PATH.config))
  const currentUser = config.get('currentUser').write()
  return currentUser || {}
}

export function _getUserList () {
  const config = low(new FileSync(PATH.config))
  const userList = config.get('userList').write()
  return userList
}

export function _saveUser (user) {
  return new Promise((resolve, reject) => {
    const config = low(new FileSync(PATH.config))
    config.set('currentUser', user).write()
    // 创建用户文件夹
    fs.stat(getPersonalDirPath(user.email), err => {
      if (err) {
        fs.mkdirSync(getPersonalDirPath(user.email))
      }
      const newUser = new FileSync(getPersonalPath(user.email))
      const db = low(newUser)
      db.defaults(new User()).write()
      // 添加到userList
      const userList = config.get('userList').write()
      let isInList = false
      userList.forEach(item => {
        if (item.email === user.email) {
          isInList = true
        }
      })
      if (!isInList) {
        config.get('userList').push(user).write()
      }
      resolve()
    })
  })
}

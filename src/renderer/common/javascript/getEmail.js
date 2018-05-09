// const fs = require('fs')
import { mailReg } from './config'
import { matchBody } from './parseEmail'
import store from '@/store/index'
import EmailList from '@src/models/email_list'
const Imap = require('imap')
// inspect = require('util').inspect
const iconv = require('iconv-lite')

export function _getEmailList (user, _box = 'inbox', start) {
  let box
  switch (_box) {
    case 'inbox':
      box = 'INBOX'
      break
    case 'sent':
      box = 'Sent Messages'
      break
    case 'draft':
      box = 'Drafts'
      break
    default:
      box = _box
  }
  return new Promise((resolve, reject) => {
    const type = user.email.match(mailReg)[1]
    const imap = new Imap({
      user: user.email,
      password: user.password,
      host: `imap.${type}.com`,
      port: 993,
      tls: true
    })
    function openInbox (cb) {
      imap.openBox(box, true, cb)
    }
    imap.once('error', function (err) {
      imap.end()
      if (err.code === 'ENOTFOUND' || err.source === 'timeout') {
        // 无网络
        resolve([])
      } else {
        reject(err)
      }
      return false
    })
    imap.once('ready', function () {
      openInbox(function (err, box) {
        if (err) throw err
        imap.search(['ALL'], function (err, results) {
          if (err) throw err
          if (!results.length) {
            imap.end()
            resolve([])
            return
          }
          let result = {headers: [], attrs: []}
          let f
          let HEADER = 'HEADER.FIELDS (TO FROM SUBJECT)'
          if (type === 'aliyun') {
            // 发现阿里云邮箱要用这个才能获取列表
            HEADER = 'HEADER'
          }
          if (start) {
            results = results.filter(item => (item >= start))
            f = imap.fetch(results, { bodies: [HEADER] })
          } else {
            f = imap.fetch(results, { bodies: [HEADER] })
          }
          f.on('message', function (msg) {
            let chunks = []
            let size = 0
            let buf
            msg.on('body', function (stream, info) {
              stream.on('data', function (chunk) {
                chunks.push(chunk)
                size += chunk.length
                buf = Buffer.concat(chunks, size)
              })
            })
            msg.once('attributes', function (attrs) {
              const str = iconv.decode(buf, 'gb18030')
              result.headers.push(Imap.parseHeader(str))
              result.attrs.push(attrs)
            })
          })
          f.once('end', function () {
            imap.end()
            const emailList = result.headers.map((item, index) => {
              return new EmailList(
                result.attrs[index]['uid'],
                result.headers[index]['from'].map(ite => (ite.replace(/"/g, ''))),
                result.headers[index]['to'], result.attrs[index]['date'],
                result.headers[index]['subject']
              )
            })
            resolve(emailList)
          })
        })
      })
    })
    imap.connect()
  })
}

export function _getEmailDetail (user, id, _box) {
  let box
  switch (_box) {
    case 'inbox':
      box = 'INBOX'
      break
    case 'sent':
      box = 'Sent Messages'
      break
    case 'draft':
      box = 'Drafts'
      break
    default:
      box = _box
  }
  return new Promise((resolve, reject) => {
    const type = user.email.match(mailReg)[1]
    const imap = new Imap({
      user: user.email,
      password: user.password,
      host: `imap.${type}.com`,
      port: 993,
      tls: true
    })
    function openInbox (cb) {
      imap.openBox(box, false, cb)
    }
    imap.once('error', function (err) {
      imap.end()
      if (err.code === 'ENOTFOUND' || err.source === 'timeout') {
        // 无网络
        resolve([])
      } else {
        reject(err)
      }
      return false
    })
    imap.once('ready', function () {
      openInbox(function (err, box) {
        if (err) throw err
        let f = imap.fetch([id], { bodies: '', markSeen: true })
        let result = {header: {}, attr: {}, body: {}}
        f.on('message', function (msg) {
          let chunks = []
          let size = 0
          let buf
          msg.on('body', function (stream, info) {
            stream.on('data', function (chunk) {
              chunks.push(chunk)
              size += chunk.length
              buf = Buffer.concat(chunks, size)
            })
          })
          msg.once('attributes', function (attrs) {
            const str = iconv.decode(buf, 'gb18030')
            result.attr = attrs
            result.header = Imap.parseHeader(str)
            if (!result.header.from) {
              // 出现过解析不出from，subject的情况，此时将emailList的header拿过来
              let header = store.state.inboxMail.find(item => (item.id === +id))
              result.header = {
                ...header,
                ...result.header
              }
            }
            result.body = matchBody(str, result.header)
            result.emailText = str
          })
        })
        f.once('end', function () {
          imap.end()
          const detail = {
            header: result.header,
            attr: result.attr,
            body: result.body,
            emailText: result.emailText
          }
          resolve(detail)
        })
      })
    })
    imap.connect()
  })
}

export function _testAccount (user) {
  return new Promise((resolve, reject) => {
    const type = user.email.match(mailReg)[1]
    const imap = new Imap({
      user: user.email,
      password: user.password,
      host: `imap.${type}.com`,
      port: 993,
      tls: true
    })
    function openInbox (cb) {
      imap.openBox('INBOX', false, cb)
    }
    imap.once('error', function (err) {
      imap.end()
      reject(err)
      return false
    })
    imap.once('ready', function () {
      openInbox(function (err, box) {
        if (err) {
          reject(err)
          return false
        }
        imap.search(['ALL'], () => {
          resolve()
        })
      })
    })
    imap.connect()
  })
}

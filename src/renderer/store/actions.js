import * as types from './mutations-type'
import store from './index'
import { _saveEmailList, _saveSentEmailList, _saveDiskEmail, _saveUser, _getDiskEmail, _getDiskMailList, _getDiskAdressList, _getDiskGroupList, _saveGroupList, _saveAddressList, _saveDraftsEmailList } from '@/common/javascript/cache'
import { _getEmailList, _getEmailDetail, _testAccount } from '@/common/javascript/getEmail'
import { _sendEmail } from '@/common/javascript/sendEmail'
import Friends from '@src/models/address_list'
import Groups from '@src/models/address_group'
import EmailList from '@src/models/email_list'
const { shell } = require('electron')
export function updateEmailList ({commit, state}) {
  commit(types.SET_UPDATING, true)
  let inboxResult = [].concat(state.inboxMail)
  let sentResult = [].concat(state.sentMail)
  let draftResult = [].concat(state.draftMail)
  const user = state.user
  let done = 0
  _getEmailList(user, 'inbox', inboxResult[0] && inboxResult[0].id).then(res => {
    res.forEach(item => {
      let add = true
      state.inboxMail.forEach(email => {
        if (email.id === item.id) {
          add = false
        }
      })
      if (add) {
        inboxResult = [item].concat(inboxResult)
      }
    })
    commit(types.UPDATE_MAIL_LIST, _saveEmailList(inboxResult))
    done++
    if (done === 3) {
      commit(types.SET_UPDATING, false)
    }
  }).catch(err => {
    alert(err)
  })
  _getEmailList(user, 'sent').then(res => {
    res.forEach(item => {
      let add = true
      state.sentMail.forEach(email => {
        if (email.id === item.id) {
          add = false
        }
      })
      if (add) {
        sentResult = [item].concat(sentResult)
      }
    })
    commit(types.SET_SENT_MAIL_LIST, _saveSentEmailList(sentResult))
    done++
    if (done === 3) {
      commit(types.SET_UPDATING, false)
    }
  }).catch(err => {
    alert(err)
  })
  _getEmailList(user, 'draft').then(res => {
    res.forEach(item => {
      let add = true
      state.draftMail.forEach(email => {
        if (email.id === item.id) {
          add = false
        }
      })
      if (add) {
        draftResult = [item].concat(draftResult)
      }
    })
    commit(types.SET_DRAFTS_MAIL_LIST, _saveDraftsEmailList(draftResult))
    done++
    if (done === 3) {
      commit(types.SET_UPDATING, false)
    }
  }).catch(err => {
    alert(err)
  })
}

export function getEmailDetail ({commit, state}, {id, type}) {
  const email = _getDiskEmail(id)
  if (email.body && (email.body.bodyHtml || email.body.bodyText)) {
    commit(types.SET_EMAIL_DETAIL, email)
  } else {
    const user = state.user
    _getEmailDetail(user, id, type).then(res => {
      if (!res.body.bodyHtml && !res.header.to) {
        alert('该邮件已过期，无法获取')
        window.history.back()
      } else {
        commit(types.SET_EMAIL_DETAIL, _saveDiskEmail(res))
      }
    })
  }
}

export function sendEmail ({commit, state}, {emailData, fileList}) {
  commit(types.SET_SENDING_STATUS, {
    sending: true
  })
  const user = state.user
  _sendEmail(user, emailData, fileList).then(res => {
    commit(types.SET_SENDING_STATUS, {
      sending: false,
      err: null
    })
  }).catch(err => {
    commit(types.SET_SENDING_STATUS, {
      sending: false,
      err
    })
  })
}

export function saveDraft ({commit, state}, {emailData}) {
  const id = `${Math.random()}`.substr(2)
  const item = new EmailList(id, state.user.email, emailData.to, new Date(), emailData.subject)
  const draftResult = [item].concat(state.draftMail)
  commit(types.SET_DRAFTS_MAIL_LIST, _saveDraftsEmailList(draftResult))
}

export function addOneAddress ({commit, state}, form) {
  form = new Friends(form.name, form.email, form.group)
  let result = [].concat(state.addressList)
  let add = true
  state.addressList.forEach(item => {
    if (form.email === item.email) {
      add = false
    }
  })
  if (add) {
    result = [form].concat(result)
    commit(types.SET_ADDRESS_LIST, _saveAddressList(result))
  } else {
    alert(`邮箱${form.email} 已经在通讯录`)
  }
}
export function delOneAddress ({commit, state}, item) {
  const email = item.email
  let result = [].concat(state.addressList)
  result = result.filter(x => (x.email !== email))
  commit(types.SET_ADDRESS_LIST, _saveAddressList(result))
}
export function addGroup ({commit, state}, name) {
  const group = new Groups(name)
  let result = [].concat(state.groupList)
  let add = true
  state.groupList.forEach(item => {
    if (name === item.name) {
      add = false
    }
  })
  if (add) {
    result = [group].concat(result)
    commit(types.SET_GROUP_LIST, _saveGroupList(result))
  } else {
    alert(`已经存在"${name}"分组`)
  }
}
export function removeGroup ({commit, state}, tag) {
  const id = tag.id
  let result = [].concat(state.groupList)
  result = result.filter(x => (x.id !== id))
  commit(types.SET_GROUP_LIST, _saveGroupList(result))
}

export function testAccount ({commit, state}, user) {
  _testAccount(user).then(res => {
    store.dispatch('changeUser', user)
    store.dispatch('hideLogin')
  }).catch(eee => {
    if (user.email.match(/163/) && eee.message.match(/unsafe/i)) {
      const url = `http://config.mail.163.com/settings/imap/index.jsp?uid=${user.email}`
      shell.openExternal(url)
    } else {
      alert('登录失败:' + eee.message)
    }
    store.dispatch('hideLogin')
  })
}

export function showLogin ({commit, state}) {
  commit(types.SET_SHOW_LOGIN, true)
}

export function hideLogin ({commit, state}) {
  commit(types.SET_SHOW_LOGIN, false)
}

export function changeUser ({commit, state}, user) {
  _saveUser(user).then(() => {
    commit(types.SET_USER, user)
    commit(types.UPDATE_MAIL_LIST, _getDiskMailList('inbox'))
    commit(types.SET_SENT_MAIL_LIST, _getDiskMailList('sent'))
    commit(types.SET_DRAFTS_MAIL_LIST, _getDiskMailList('draft'))
    commit(types.SET_ADDRESS_LIST, _getDiskAdressList())
    commit(types.SET_GROUP_LIST, _getDiskGroupList())
    store.dispatch('updateEmailList')
  })
}

export function markReaded ({commit, state}, type) {
  if (type === 'in') {
    commit(types.MARK_INBOX_EMAIL)
  }
}

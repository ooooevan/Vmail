import * as types from './mutations-type'
import { _saveEmailList, _saveSentEmailList, _saveDraftsEmailList } from '@/common/javascript/cache'

const mutations = {
  [types.UPDATE_MAIL_LIST] (state, list) {
    state.inboxMail = list || state.inboxMail || []
  },
  [types.SET_UPDATING] (state, bool) {
    state.updating = bool
  },
  [types.SET_USER_LIST] (state, list) {
    state.userList = list
  },
  [types.SET_EMAIL_DETAIL] (state, email) {
    state.emailDetail = email
  },
  [types.STAR_EMAIL_IN_LIST] (state, id) {
    let isInbox = false
    let isSentBox = false
    state.inboxMail.forEach(email => {
      if (email.id === +id) {
        isInbox = true
        email.isStar = !email.isStar
      }
    })
    if (isInbox) {
      _saveEmailList(state.inboxMail)
    } else {
      state.sentMail.forEach(email => {
        if (email.id === +id) {
          isSentBox = true
          email.isStar = !email.isStar
        }
      })
      if (isSentBox) {
        _saveSentEmailList(state.sentMail)
      } else {
        state.draftMail.forEach(email => {
          if (email.id === +id) {
            email.isStar = !email.isStar
          }
        })
        _saveDraftsEmailList(state.draftMail)
      }
    }
  },
  [types.READ_EMAIL_IN_LIST] (state, id) {
    state.inboxMail.forEach(email => {
      if (email.id === +id) {
        if (!email.isRead) {
          email.isRead = true
          _saveEmailList(state.inboxMail)
        }
      }
    })
  },
  [types.SET_SENDING_STATUS] (state, {sending, err}) {
    state.sendingStatus = {
      sending,
      err
    }
  },
  [types.SET_SENT_MAIL_LIST] (state, list) {
    state.sentMail = list
  },
  [types.SET_DRAFTS_MAIL_LIST] (state, list) {
    state.draftMail = list
  },
  [types.SET_ADDRESS_LIST] (state, list) {
    state.addressList = list
  },
  [types.SET_GROUP_LIST] (state, list) {
    state.groupList = list
  },
  [types.SET_USER] (state, user) {
    state.user = user
  },
  [types.SET_SHOW_LOGIN] (state, bool) {
    state.isShowLogin = bool
  },
  [types.MARK_INBOX_EMAIL] (state) {
    state.inboxMail.forEach(mail => {
      mail.isRead = true
    })
    _saveEmailList(state.inboxMail)
  },
  [types.SET_UNLOAD_LIST] (state, list) {
    state.unLoadList = list
  }
}
export default mutations


export const inboxMail = state => state.inboxMail

export const user = state => state.user

export const starMail = state => state.inboxMail.filter(item => item.isStar).concat(state.sentMail.filter(item => item.isStar)).concat(state.draftMail.filter(item => item.isStar))

export const updating = state => state.updating

export const emailDetail = state => state.emailDetail

export const sendingStatus = state => state.sendingStatus

export const sentMail = state => state.sentMail

export const draftMail = state => state.draftMail

export const addressList = state => state.addressList

export const groupList = state => state.groupList

export const isShowLogin = state => state.isShowLogin

export const userList = state => state.userList

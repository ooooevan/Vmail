// import { _getAdminInfo, _getShopTypeList } from 'common/javascript/cache'
import { _getDiskMailList, _getUser, _getUserList, _getDiskAdressList, _getDiskGroupList } from '@/common/javascript/cache'
const state = {
  user: _getUser() || {},
  userList: _getUserList() || [],
  inboxMail: _getDiskMailList('inbox') || [],
  sentMail: _getDiskMailList('sent') || [],
  draftMail: _getDiskMailList('draft') || [],
  updating: false,
  addressList: _getDiskAdressList() || [],
  groupList: _getDiskGroupList() || [],
  sendingStatus: {sending: false, err: null},
  emailDetail: {},
  isShowLogin: false,
  unLoadList: []
}

export default state

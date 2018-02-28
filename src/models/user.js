export default class User {
  constructor (email = '', name = '', password = '', sentList = [], emailList = [], draftList = [], addressList = [], groupList = [], updateAt = new Date()) {
    this.email = email
    this.name = name
    this.password = password
    this.emailList = emailList
    this.sentList = sentList
    this.draftList = draftList
    this.addressList = addressList
    this.groupList = groupList
    this.updateAt = updateAt
  }
}

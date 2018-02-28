import User from './user'
export default class Config {
  constructor (currentUser = User, userList = []) {
    this.currentUser = currentUser
    this.userList = userList
  }
}

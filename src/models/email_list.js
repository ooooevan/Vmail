export default class EmailList {
  constructor (id, from, to, date, subject, isRead = false, isStar = false) {
    this.id = id
    this.from = from
    this.to = to
    this.date = date
    this.subject = subject
    this.isRead = isRead
    this.isStar = isStar
  }
}

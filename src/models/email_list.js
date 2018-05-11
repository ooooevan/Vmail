export default class EmailList {
  constructor (id, from, to, date, subject, isRead = false, isStar = false) {
    this.id = id
    this.from = (this.from || []).concat(from)
    this.to = (this.to || []).concat(to)
    this.date = date
    this.subject = (this.subject || []).concat(subject)
    this.isRead = isRead
    this.isStar = isStar
  }
}

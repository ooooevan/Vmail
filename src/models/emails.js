export default class Emails {
  constructor (id, from, to, date, subject, bodyText, emailText, bodyHtml, attachment = [], status = '', isStar = false) {
    this.id = id
    this.from = from
    this.to = to
    this.date = date
    this.subject = subject
    this.emailText = emailText
    this.bodyText = bodyText
    this.bodyHtml = bodyHtml
    this.attachment = attachment
    this.status = status
    this.isStar = isStar
  }
}

import { mailReg } from './config'
const nodemailer = require('nodemailer')

function createTransporter (user) {
  const type = user.email.match(mailReg)[1]
  return nodemailer.createTransport({
    service: type,
    auth: {
      user: user.email,
      pass: user.password
    }
  })
}

export function _sendEmail (user, emailData, fileList) {
  return new Promise((resolve, reject) => {
    const transporter = createTransporter(user)
    var mailOptions = {
      from: user.email,
      to: emailData.to.split(';'),
      subject: emailData.subject,
      // text: 'Hello world',
      html: emailData.html
    }
    if (fileList.length) {
      mailOptions.attachments = fileList.map(file => ({
        filename: file.name,
        path: file.raw.path
      }))
    }
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

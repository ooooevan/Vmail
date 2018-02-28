import { htmlTypeReg, plainTypeReg, multipartType, sentContentTypeReg, charsetReg, sentFileNameReg, cidPrefix, contentIdReg, encodeFileNameReg, twoCodeReg, utf8Reg, base64ImgPrefix, blankLineReg, suffixReg, fileNameReg, contentDispositionReg, mixedMultipart, blankSpaceStartReg, relatedMultipart, contentTransferEncodingReg, secondChartsetReg, contentTypeReg, boundaryReg, alternativeMultipart } from './config'
const iconv = require('iconv-lite')
const utf8 = require('utf8')
const quotedPrintable = require('quoted-printable')

export function matchBody (emailText, emailHeader) {
  let result = {
    bodyText: '',
    bodyHtml: '',
    attachment: []
  }
  // 有时最后会有多余空行，去掉，后面要用空行做分隔
  emailText = emailText.trim()
  // 这里注意imap.parseHeader方法做了处理，全部转为小写，且值为数组
  let contentType = (emailHeader['content-type'] && emailHeader['content-type'].join(''))
  if (!contentType) {
    contentType = getTypeAndBoundary(emailText)
    emailHeader['content-type'] = [contentType]
  }
  // ① 是text/html类型
  if (contentType.match(htmlTypeReg)) {
    // 有的值是 text/html;charset="gb2312"，字符集有引号，这里统一去掉，得到字符集;
    const charset = contentType.match(charsetReg) && contentType.match(charsetReg)[1].replace(/"/g, '')
    // const Html = emailText.split(blankLineReg)[1]  //不能这样，正文可能有空行
    let htmlArr = emailText.split(blankLineReg)
    htmlArr.shift()
    const Html = htmlArr.join('')
    const transferEncoding = emailHeader['content-transfer-encoding'].join('')
    if (transferEncoding === 'base64') {
      const buff = Buffer.from(Html, transferEncoding)
      result.bodyHtml = iconv.decode(buff, charset || 'utf-8')
    } else {
      // 编码为quoted-printable且charset为utf8。暂时遇到为utf8的,未看到其他字符集
      const quotedHtml = utf8.decode(quotedPrintable.decode(Html))
      result.bodyHtml = quotedHtml
    }
  } else if (contentType.match(multipartType)) {
    // ② 是multipart类型
    const boundary = contentType.match(boundaryReg)[1]
    const fatherBoundary = `--${boundary}--`
    const sonBoundary = `--${boundary}`
    // 据观察，父段只出现一次且后面是空行，所以不处理
    emailText = emailText.split(fatherBoundary)[0].trim()
    const textArr = emailText.split(sonBoundary)
    // 这里发现若是alternativeMultipart或 长度小于等于2的relatedMultipart类型
    // 又发现，值为multipart/related;type="multipart/alternative";boundary="----=_NextPart_5A6951CD_6F185580_3879981A" 会当做alternativeMultipart，但不应该进入这里
    // 基于上一个情况，alternativeMultipart和relatedMultipart只能出现一个，否则去else if
    if ((contentType.match(alternativeMultipart) && !contentType.match(relatedMultipart)) || (contentType.match(relatedMultipart) && textArr.length <= 2)) {
      // ② - 1 - 2, multipart/alternative类型
      // 第一个是邮件头，所以忽略第一个
      textArr.forEach((text, index) => {
        if (index === 0) {
          return
        }
        const contentType = text.match(contentTypeReg)[1].trim()
        const charset = (text.match(secondChartsetReg) || text.match(charsetReg))[1].trim().replace(/"/g, '')
        const transferEncoding = text.match(contentTransferEncodingReg)[1].trim()
        const subTextArr = text.split(blankLineReg)
        subTextArr.shift()
        const contentText = subTextArr.filter(item => (item.trim())).join('')
        if (contentType.match(htmlTypeReg)) {
          if (transferEncoding === 'base64') {
            const buff = Buffer.from(contentText, transferEncoding)
            result.bodyHtml = iconv.decode(buff, charset || 'utf-8')
          } else if (transferEncoding === 'quoted-printable') {
            // 用try包裹是因为发现有邮件写着quoted-printable编码，正文却没有编码。quotedPrintable模块decode没有编码的内容就报错，进入catch
            try {
              // 编码为quoted-printable且charset为utf8。暂时遇到为utf8的,未看到其他字符集
              const quotedHtml = utf8.decode(quotedPrintable.decode(contentText))
              result.bodyHtml = quotedHtml
            } catch (e) {
              result.bodyHtml = contentText
            }
          } else {
            result.bodyHtml = contentText
          }
        } else if (contentType.match(plainTypeReg)) {
          if (transferEncoding === 'base64') {
            const buff = Buffer.from(contentText, transferEncoding)
            result.bodyText += iconv.decode(buff, charset || 'utf-8')
          } else {
            // 编码为quoted-printable且charset为utf8。暂时遇到为utf8的,未看到其他字符集
            const quotedText = utf8.decode(quotedPrintable.decode(contentText))
            result.bodyText += quotedText
          }
        }
      })
    } else if (contentType.match(mixedMultipart) || (contentType.match(relatedMultipart) && textArr.length > 2)) {
      // ② - 3, multipart/mixed类型
      // arr里面可以包含N(>=0)个附件类型和一个其他类型的'小邮件',根据contentType以区分
      textArr.forEach((text, index) => {
        if (index === 0) {
          return
        }
        const subContentType = (text.match(contentTypeReg) || text.match(sentContentTypeReg))[1].trim()
        if (subContentType.match(multipartType)) {
          // 3 - 1,mixed中的'小邮件'，像一个完整邮件
          const secondBoundary = text.match(boundaryReg)[1].trim()
          const fatherBoundary = `--${secondBoundary}--`
          const sonBoundary = `--${secondBoundary}`
          text = text.split(fatherBoundary)[0].trim()
          const subTextArr = text.split(sonBoundary)
          subTextArr.forEach((subText, index) => {
            if (index === 0) {
              return
            }
            const contentType = subText.match(contentTypeReg)[1].trim()
            const transferEncoding = subText.match(contentTransferEncodingReg)[1].trim()
            const thirdTextArr = subText.split(blankLineReg)
            thirdTextArr.shift()
            const thridContentText = thirdTextArr.filter(item => (item.trim())).join('')
            if (contentType.match(plainTypeReg)) {
              let plainText = ''
              if (transferEncoding === 'base64') {
                const charset = subText.match(secondChartsetReg) && subText.match(secondChartsetReg)[1].replace(/"/g, '')
                const buff = Buffer.from(thridContentText, transferEncoding)
                plainText = iconv.decode(buff, charset || 'utf-8')
              } else {
                try {
                  plainText = Buffer.from(thridContentText, transferEncoding).toString()
                } catch (e) {
                  plainText = thridContentText
                }
              }
              result.bodyText = plainText
            } else if (contentType.match(htmlTypeReg)) {
              let htmlText = ''
              if (transferEncoding === 'base64') {
                const charset = subText.match(secondChartsetReg) && subText.match(secondChartsetReg)[1].replace(/"/g, '')
                const htmlBuffer = Buffer.from(thridContentText, 'base64')
                htmlText = iconv.decode(htmlBuffer, charset || 'utf-8')
              } else if (transferEncoding === 'quoted-printable') {
                const charset = subText.match(secondChartsetReg) && subText.match(secondChartsetReg)[1].replace(/"/g, '')
                let quotedHtml
                if (charset && !charset.match(/utf/i)) {
                  quotedHtml = iconv.decode(quotedPrintable.decode(thridContentText), charset)
                } else {
                  quotedHtml = utf8.decode(quotedPrintable.decode(thridContentText))
                }
                htmlText = quotedHtml
              } else {
                try {
                  htmlText = Buffer.from(thridContentText, transferEncoding).toString()
                } catch (e) {
                  htmlText = thridContentText
                }
              }
              result.bodyHtml = htmlText
            }
          })
        } else if (subContentType.match(htmlTypeReg)) {
          const charset = subContentType.match(charsetReg) && subContentType.match(charsetReg)[1].replace(/"/g, '')
          const htmlArr = text.split(blankLineReg)
          htmlArr.shift()
          const Html = htmlArr.join('')
          const transferEncoding = text.match(contentTransferEncodingReg)[1].trim()
          if (transferEncoding === 'base64') {
            const buff = Buffer.from(Html, transferEncoding)
            result.bodyHtml = iconv.decode(buff, charset || 'utf-8')
          } else {
            // 编码为quoted-printable且charset为utf8。暂时遇到为utf8的,未看到其他字符集
            const quotedHtml = utf8.decode(quotedPrintable.decode(Html))
            result.bodyHtml = quotedHtml
          }
        } else {
          // 3 - 2, mixed中的文件,包含附件和正文资源
          if (text.match(contentDispositionReg) && !text.match(contentIdReg)) {
            // 是附件
            const transferEncoding = text.match(contentTransferEncodingReg)[1].trim()
            if (transferEncoding !== 'base64') {
              alert(`该附件(${emailHeader.subject.join('')})不是base64传输编码,需要扩展：${transferEncoding}`)
            }
            let fileName = (text.match(fileNameReg) || text.match(sentFileNameReg))[1]
            if (fileName.indexOf('=?') > -1) {
              // 文件名未解码，需要手动解码
              const firstCode = fileName.match(twoCodeReg)[1]
              const secondCode = fileName.match(twoCodeReg)[2]
              if (firstCode.match(utf8Reg) && secondCode.match(/b/i)) {
                fileName = fileName.match(encodeFileNameReg)[1].trim()
                fileName = Buffer.from(fileName, 'base64').toString()
              } else if (secondCode.match(/q/i)) {
                try {
                  // 尝试用quotedPrintable解码
                  fileName = utf8.decode(quotedPrintable.decode(fileName))
                } catch (e) {
                  alert(`该附件(${emailHeader.subject.join('')})文件名解析失败,需要扩展：${fileName}`)
                }
              } else if (secondCode.match(/b/i)) {
                fileName = fileName.match(encodeFileNameReg)[1].trim()
                const base64 = Buffer.from(fileName, 'base64')
                fileName = iconv.decode(base64, firstCode || 'utf-8')
              } else {
                alert(`该附件(${emailHeader.subject.join('')})文件名解析失败,需要扩展：${fileName}`)
              }
            }
            const suffix = fileName.match(suffixReg)[1]
            // const isImg = suffix.match(imgReg)
            // const imgPrefix = base64ImgPrefix(suffix)
            let imgContent = text.trim().split(blankLineReg)[1]
            imgContent = imgContent.replace(/\r|\n/g, '')
            const attachment = {
              name: fileName,
              type: suffix,
              content: imgContent
            }
            result.attachment.push(attachment)
          } else {
            // 不是附件，而是正文的资源
            // 这里可能有问题，这样写前提是bodyHtml在前，附件资源在后，后不是这个顺序则图片显示异常
            const contentId = cidPrefix + text.match(contentIdReg)[1]
            const content = base64ImgPrefix() + text.trim().split(blankLineReg)[1]
            result.bodyHtml = result.bodyHtml.replace(contentId, content)
          }
        }
      })
    }
  } else if (contentType.match(plainTypeReg)) {
    let plainText = ''
    const transferEncoding = emailText.match(contentTransferEncodingReg)[1].trim()
    let textArr = emailText.split(blankLineReg)
    textArr.shift()
    const TEXT = textArr.join('')
    if (transferEncoding === 'base64') {
      const charset = emailText.match(secondChartsetReg) && emailText.match(secondChartsetReg)[1].replace(/"/g, '')
      const buff = Buffer.from(TEXT, transferEncoding)
      plainText = iconv.decode(buff, charset || 'utf-8')
    } else {
      try {
        plainText = Buffer.from(TEXT, transferEncoding).toString()
      } catch (e) {
        plainText = TEXT
      }
    }
    result.bodyText = plainText
  }
  return result
}

// imap.parseHeader无法获取contenttype时，手动获取
// boundary可能会换行（甚至三行？），所以要判断下一行看是否是boundary
export function getTypeAndBoundary (emailText) {
  const header = emailText.trim().split(blankLineReg)[0]
  const lines = header.split(/\n|\r/)
  const typeLine = lines.findIndex(line => (line.indexOf('Content-Type') > -1))
  const boundary = (lines[typeLine + 1].match(blankSpaceStartReg) && lines[typeLine + 1]).trim() || ''
  let boundary2 = ''
  if (boundary) {
    boundary2 = (lines[typeLine + 2] && lines[typeLine + 2].match(blankSpaceStartReg) && lines[typeLine + 2].trim()) || ''
  }
  return lines[typeLine] + boundary + boundary2
}

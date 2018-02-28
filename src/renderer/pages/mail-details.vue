<template>
  <div class="details">
    <div class="header">
      <el-button size="small" @click="handleReturn">返回</el-button>
    </div>
    <div class="content">
      <div class="subject">
        <p style="font-weight: bold;margin-bottom: 5px;">{{header.subject.join(',')}}</p>
        <p :title='header.from'><span>发件人：</span>{{header.from.join(',').replace(/"/g, '')}}</p>
        <p><span>时间：</span>{{header.date.length && this.$moment(header.date.join(',')).format('YYYY-MM-DD HH:mm:ss') || ''}}</p>
        <p :title='header.to'><span>收件人：</span>{{header.to.join(',').substr(0, 45).replace(/"/g, '')}}</p>
        <p v-if='hasAttachment'><span>附件：</span>{{body.attachment.map(x => (x.name)).join('、').substr(0, 45)}}</p>
      </div>
      <div class="attachment clearfix" ref='attachment' v-if='hasAttachment'>
        <div style="user-select:none" title='点击打开附件' @click='open(attach)' :key='attach.name' class="attach" v-for='attach in body.attachment'>{{attach.name}}</div>
      </div>
      <div class="body detail-body" ref='body' v-if='isIframe'>
        <iframe :src="htmlSrc" frameborder="0" height='100%' width='100%' ref='iframe'></iframe>
      </div>
      <div class="body detail-body" v-html="body.bodyHtml" v-else-if='isHtml'></div>
      <div class="body detail-body" v-else>{{body.bodyText}}</div>
    </div>
  </div>
</template>
<script>
  import { mapActions, mapGetters, mapMutations } from 'vuex'
  const { shell } = require('electron')
  const fs = require('fs')
  export default {
    created () {
      const id = this.$route.params.id
      const type = this.$route.query.type
      this.getEmailDetail({id, type})
      this.setEmailRead(id)
      addEventListener('resize', this.limitWidth)
    },
    beforeDestroy () {
      removeEventListener('resize', this.limitWidth)
    },
    computed: {
      ...mapGetters(['emailDetail'])
    },
    data () {
      return {
        header: {
          subject: [],
          from: [],
          date: [],
          to: []
        },
        body: {
          bodyHtml: '',
          bodyText: '',
          attachment: []
        },
        attr: {
          uid: 0
        },
        htmlSrc: '',
        isIframe: false,
        isHtml: true,
        hasAttachment: false
      }
    },
    watch: {
      emailDetail (detail) {
        const HTML = '.html'
        const htmlSrc = `src/renderer/temp/${detail.attr.uid}.html`
        this.body = detail.body
        this.header = detail.header
        this.attr = detail.attr
        let bodyHtml = detail.body.bodyHtml
        alert('html为：' + bodyHtml)
        // ① html字符串是一个文件路径
        alert('fs:' + JSON.stringify(fs))
        alert('fs.readFileSync:' + JSON.stringify(fs.readFileSync))
        if (bodyHtml.indexOf(HTML) && bodyHtml.indexOf(HTML) + HTML.length === bodyHtml.length) {
          this.isIframe = true
          // 判断是否已经缓存，有文件就直接读取
          fs.stat(htmlSrc, (err, stats) => {
            alert('读取文件，有无err: ' + JSON.stringify(err, null, 2))
            if (err) {
              // createReadStream时异步api，需要在close时再读取
              fs.createReadStream(bodyHtml).pipe(fs.createWriteStream(htmlSrc))
                .on('close', () => {
                  alert('已添加入缓存，地址为：' + htmlSrc)
                  this.htmlSrc = htmlSrc
                  // 加载完修改高度，在标签用@onload不触发
                  this.$refs.iframe.onload = () => {
                    this.iframeLoad()
                  }
                })
            } else {
              alert('已有缓存，地址为：' + htmlSrc)
              this.htmlSrc = htmlSrc
              this.$refs.iframe.onload = () => {
                this.iframeLoad()
              }
            }
          })
        } else if (bodyHtml) {
          // ② html字符串是普通html字符串
          this.body.bodyHtml = bodyHtml
          this.limitWidth()
        } else {
          // ③ 没有html，只能放纯text
          this.isHtml = false
          this.body.bodyText = detail.body.bodyText
        }
        // 有附件,显示附件
        if (detail.body.attachment && detail.body.attachment.length) {
          this.hasAttachment = true
          this.body.attachment = detail.body.attachment
          // this.$nextTick(() => {
          //   const body = document.getElementsByClassName('body')[0]
          //   const height = 0.1 * parseInt(getComputedStyle(body)['height'])
          //   this.$refs.attachment.style.marginTop = height + 50 + 'px'
          // })
        }
        // 点击邮件链接浏览器打开
        this.$nextTick(() => {
          this.changeLink()
        })
      }
    },
    methods: {
      open (file) {
        const location = file.location
        shell.openItem(location)
      },
      limitWidth () {
        // 有的邮件的html片段，宽度很大，需要限制
        // 这里用窗口总宽度减去侧边栏宽度再减去margin等得到body宽度
        // 当使用别的元素来确定宽度（如.content）,发现有问题，要多次触发onresize才一点一点改变宽度。
        const body = document.getElementsByClassName('detail-body')[0]
        const whole = document.body.clientWidth
        const targetWidth = whole - 65 - 40 + 'px'
        body.style.width = targetWidth
        body.style['overflow-x'] = 'auto'
      },
      changeLink () {
        // 针对body嵌入html代码，不是处理iframe的
        const body = document.getElementsByClassName('detail-body')[0]
        body.addEventListener('click', (e) => {
          if (e.target && ((e.target.tagName.match(/^a$/i) && e.target.href) || (e.target.parentElement.tagName.match(/^a$/i) && e.target.parentElement.href))) {
            shell.openExternal(e.target.href || e.target.parentElement.href)
            e.preventDefault()
            return false
          }
        })
      },
      iframeLoad () {
        const iframe = this.$refs.iframe
        let height = Math.max(iframe.contentDocument.documentElement.scrollHeight, iframe.contentDocument.documentElement.offsetHeight, iframe.contentDocument.documentElement.clientHeight) + 50
        this.$refs.body.style.height = height + 'px'
        // 发现文字较小，就长度放大为1.1倍
        this.$refs.body.style.transform = 'scale3d(1, 1.1, 1)'
        setTimeout(() => {
          alert('iframe body高度：' + getComputedStyle(this.$refs.body)['height'])
        })
        // iframe内链接使用浏览器打开
        iframe.contentDocument.addEventListener('click', (e) => {
          if ((e.target.tagName.match(/^a$/i) && e.target.href) || (e.target.parentElement.tagName.match(/^a$/i) && e.target.parentElement.href)) {
            shell.openExternal(e.target.href || e.target.parentElement.href)
            e.preventDefault()
            return false
          }
        })
      },
      handleReturn () {
        this.$router.back()
      },
      ...mapActions(['getEmailDetail']),
      ...mapMutations({
        setEmailRead: 'READ_EMAIL_IN_LIST'
      })
    }
  }
</script>
<style>
.details {
  padding: 10px;
  font-size: 15px;
  box-sizing: border-box;
  margin-top: 1px;
  overflow-y: auto;
  height: calc(100% - 51px);
}
.details > .header {
  height: 35px;
  padding-left: 10px;
  border-bottom: 1px solid #409EFF;
  line-height: 30px;
}
.details .content {
  margin-top: 10px;
  box-sizing: border-box;
  height: calc(100% - 81px);
}
.details .content .subject {
  padding: 10px;
  box-sizing: border-box;
  background: #f9f9f9;
}
.details .content .subject p {
  height: 20px;
  line-height: 20px;
  padding-top: 2px;
}
.details .content .subject p span {
  color: #777777;
  font-size: 14px;
}
.details .content .body, .details .content .detail-body {
  padding: 10px;
  box-sizing: border-box;
  line-height: 18px;
  height: calc(100% - 85px);
  /* transform: scale3d(1, 1.1, 1); */
  overflow: hidden;
  transform-origin: 0 0 0;
}
.details .attachment {
  border-top: 1px solid #b7b5b5;
  border-bottom: 1px solid #b7b5b5;
  margin-top: 10px;
  padding: 3px 0;
  box-sizing: border-box;
  line-height: 30px;
}
.details .attachment .attach {
  border-radius: 5px;
  margin-right: 10px;
  padding: 0 10px;
  float: left;
}
.details .attachment .attach:hover {
  background-color: #deebf7;
  cursor: pointer;
}
</style>

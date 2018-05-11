# 关于项目

这是我的毕业设计(2018)，邮件客户端
包含收发邮件、通讯录、多账户登录、本地数据保存等功能

## 使用的相关模块

* 用electron-vue构建项目
* 用node-imap模块接收邮件
* 用nodemailer发送邮件
* 用element-ui组件库
* 用lowdb做本地数据存储
* 用iconv-lite、quoted-printable、utf8等处理编码
* 用vue-quill-editor做富文本编辑器

## 调试运行

``` bash
npm run dev    # 调试运行，localhost:9080

npm run build  # 打包
```

## 页面截图

![收件箱](https://ooooevan.github.io/2018/02/28/electron-vue%E9%82%AE%E4%BB%B6%E5%AE%A2%E6%88%B7%E7%AB%AF/inbox.jpg)

![邮箱详情](https://ooooevan.github.io/2018/02/28/electron-vue%E9%82%AE%E4%BB%B6%E5%AE%A2%E6%88%B7%E7%AB%AF/email-detail.jpg)

![写邮件](https://ooooevan.github.io/2018/02/28/electron-vue%E9%82%AE%E4%BB%B6%E5%AE%A2%E6%88%B7%E7%AB%AF/sent.jpg)

![通讯录](https://ooooevan.github.io/2018/02/28/electron-vue%E9%82%AE%E4%BB%B6%E5%AE%A2%E6%88%B7%E7%AB%AF/address-list.jpg)

## 项目目录

最外层结构是由electron-vue创建，主要看src的结构

``` md
─ src
 ├── main
 │  ├── index.js                         #主进程,创建渲染进程
 ├── models                              #定义模型，用于封装对象
 ├── renrender                           #渲染进程，里面就是一个vue项目目录
 │  ├── common                           #一些重要的js函数与公共样式
 │      ├── javascript
 │          ├── cache.js                 #硬盘存取相关函数
 │          ├── config.js                #存放配置及正则表达式
 │          ├── getEmail.js              #获取email的函数
 │          ├── parseEmail.js            #解析email的函数
 │          ├── sendEmail.js             #发送email的函数
 │      ├── style
 │  ├── components                       #存放组件
 │  ├── pages                            #存放页面
 │  ├── router                           #路由
 │  ├── store                            #vuex的store相关文件
 │  ├── app.vue                          #vue页面最外层结构
 │  ├── main.js                          #vue项目入口
 ├── index.ejs                           #electron页面入口
```

具体可看[博客](https://ooooevan.github.io/2017/12/14/vue-koa2-mongodb%E7%82%B9%E9%A4%90%E7%B3%BB%E7%BB%9F%E6%80%BB%E7%BB%93/)
如果有错，望指正，若觉得还可以，可以点个star
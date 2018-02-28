'use strict'
import { app, BrowserWindow } from 'electron'
import Config from '../models/config'
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')
// const adapter = new FileSync('')
// const db = low(adapter)
// console.log(db)
// import path from 'path'
// import fs from 'fs'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}
// 用户数据存储位置
// const userPath = app.getPath('userData')
// const userFile = path.join(userPath, 'config.json')
// console.log(fs.writeFileSync(userFile, '{aa:"aaa"}'))
// console.log(fs.readFileSync(userFile).toString())

// console.log(`home   ${app.getPath('home')}`) // 获取用户根目录
// console.log(`userData   ${app.getPath('userData')}`) // 用于存储 app 用户数据目录
// console.log(`appData   ${app.getPath('appData')}`) // 用于存储 app 数据的目录，升级会被覆盖
// console.log(`desktop   ${app.getPath('desktop')}`) // 桌面目录
const config = new FileSync(path.join(app.getPath('userData'), 'config.json'))
const db = low(config)
db.defaults(new Config()).write()
let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
function createWindow () {
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    autoHideMenuBar: true,
    title: 'Vmail',
    disableAutoHideCursor: true,
    frame: false, // 没有边框
    // transparent: true,  // 边框，不随系统
    // titleBarStyle: 'hidden-inset',
    width: 1000
  })

  mainWindow.loadURL(winURL)
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

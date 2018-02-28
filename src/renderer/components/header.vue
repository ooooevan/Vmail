<template>
  <header style="-webkit-app-region: drag">
    <div class="refresh fl">
      <span :class='[{active: updating},"el-icon-refresh"]' style="-webkit-app-region: no-drag" @click='refresh' ref='refresh'></span>
    </div>
    <div class=" fl">
      <p>{{user.email}}</p>
    </div>
    <div class='email fl' v-if='1 === 2'>
      <p><a style="-webkit-app-region: no-drag">6</a>封未读邮件</p>
    </div>
    <div class="fr" >
      <span style="-webkit-app-region: no-drag" class='minimize' @click='minimize'><svg class="icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8406"><path d="M192.128 768l639.68 0C867.264 768 896 796.416 896 832c0 35.392-29.184 64-64.192 64L192.128 896C156.736 896 128 867.584 128 832 128 796.608 157.184 768 192.128 768z" p-id="8407"></path></svg></span>
      <span style="-webkit-app-region: no-drag" class='full' @click='full'>
        <svg v-if='!isFullScreen' class="icon" style="width: 1.3em; height: 1.3em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8653"><path d="M298.666666 597.333334 213.333334 597.333334 213.333334 810.666664 426.666666 810.666664 426.666666 725.333334 298.666666 725.333334 298.666666 597.333334 298.666666 597.333334ZM213.333334 426.666666 298.666666 426.666666 298.666666 298.666666 426.666666 298.666666 426.666666 213.333334 213.333334 213.333334 213.333334 426.666666 213.333334 426.666666ZM725.333334 725.333334 597.333334 725.333334 597.333334 810.666664 810.666664 810.666664 810.666664 597.333334 725.333334 597.333334 725.333334 725.333334 725.333334 725.333334ZM597.333334 213.333334 597.333334 298.666666 725.333334 298.666666 725.333334 426.666666 810.666664 426.666666 810.666664 213.333334 597.333334 213.333334 597.333334 213.333334Z" p-id="8654"></path></svg>
        <svg v-else class="icon" style="width: 1.3em; height: 1.3em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9595"><path d="M597.333333 597.333333h213.333334v85.333334h-128v128h-85.333334v-213.333334m-384 0h213.333334v213.333334H341.333333v-128H213.333333v-85.333334m128-384h85.333334v213.333334H213.333333V341.333333h128V213.333333m469.333334 128v85.333334h-213.333334V213.333333h85.333334v128h128z" fill="" p-id="9596"></path></svg>
      </span>
      <span style="-webkit-app-region: no-drag" class='close' @click='close'><svg class="icon" style="width: 1.1em; height: 1.1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10073"><path d="M597.795527 511.488347 813.564755 295.718095c23.833825-23.833825 23.833825-62.47489 0.001023-86.307691-23.832801-23.832801-62.47489-23.833825-86.307691 0L511.487835 425.180656 295.717583 209.410404c-23.833825-23.833825-62.475913-23.833825-86.307691 0-23.832801 23.832801-23.833825 62.47489 0 86.308715l215.769228 215.769228L209.410915 727.258599c-23.833825 23.833825-23.833825 62.47489 0 86.307691 23.832801 23.833825 62.473867 23.833825 86.307691 0l215.768205-215.768205 215.769228 215.769228c23.834848 23.833825 62.475913 23.832801 86.308715 0 23.833825-23.833825 23.833825-62.47489 0-86.307691L597.795527 511.488347z" p-id="10074"></path></svg></span>
    </div>
  </header>
</template>
<script>
  import { mapActions, mapGetters } from 'vuex'
  const { remote } = require('electron')
  export default {
    data () {
      return {
        isFullScreen: false
      }
    },
    mounted () {
      window.onresize = () => {
        this.isFullScreen = remote.getCurrentWindow().isMaximized()
      }
    },
    computed: {
      ...mapGetters(['updating', 'user'])
    },
    methods: {
      close () {
        remote.getCurrentWindow().close()
      },
      minimize () {
        remote.getCurrentWindow().minimize()
      },
      full () {
        const browserWindow = remote.getCurrentWindow()
        if (browserWindow.isMaximized()) {
          browserWindow.unmaximize()
          this.isFullScreen = false
        } else {
          browserWindow.maximize()
          this.isFullScreen = true
        }
      },
      refresh () {
        this.updateEmailList()
      },
      ...mapActions(['updateEmailList'])
    }
  }
</script>
<style>
header {
  height: 50px;
  width: 100%;
  /* background-color: #424b54; */
  line-height: 50px;
  color: #000;
  box-shadow: 0 1px 0 #d2d2d2;
}

header .logo {
  font-size: 23px;
  padding-left: 11px;
}
header .refresh span {
  margin: auto 10px;
}
header .refresh span:active {
  color: #409EFF;
}
header .refresh span.active{
  color: #409EFF;
  animation: spin 800ms infinite linear;
}
@keyframes spin {
  0%   { transform: rotate(360deg); }
  100% { transform: rotate(0deg); }
}
header .email {
  margin-left: 20px;
}
header .email a {
  color: #409EFF;
  cursor: pointer;
  user-select: none;
}
header .fr {
  user-select: none;
}
header .fr span {
  padding: 0 5px;
}
header .fr span:hover {
  background-color: #d8e7f7;
}
header .fr span:active {
  background-color: #e6eff9;
}
</style>

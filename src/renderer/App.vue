<template>
  <div id="app" style="height: 100%">
    <slide></slide>
    <div id="content">
      <v-header></v-header>
      <router-view></router-view>
      <login @close='close' @loginClose='loginClose' :visible='loginVisible' v-if='loginVisible'></login>
    </div>
  </div>
</template>

<script>
  import vHeader from '@/components/header'
  import slide from '@/components/slide'
  import login from '@/pages/login'
  import { mapGetters, mapActions } from 'vuex'
  export default {
    name: 'vmail',
    components: {
      vHeader,
      slide,
      login
    },
    data () {
      return {
        loginVisible: true
      }
    },
    created () {
      if (this.user.email) {
        this.loginVisible = false
      }
      setInterval(() => {
        this.updateEmailList()
      }, 60 * 1000)
    },
    watch: {
      isShowLogin (newShow) {
        if (newShow) {
          this.loginVisible = true
        }
      }
    },
    computed: {
      ...mapGetters(['user', 'isShowLogin'])
    },
    methods: {
      loginClose () {
        this.loginVisible = false
      },
      close () {
        if (this.user.email) {
          this.loginVisible = false
          this.hideLogin()
        }
      },
      ...mapActions(['hideLogin', 'updateEmailList'])
    }
  }
</script>

<style>
#app {
  display: flex;
}
#app #content {
  flex: 1;
}
</style>

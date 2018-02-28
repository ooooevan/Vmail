<template>
  <div class='letter'>
    <el-menu
      :default-active="defaultActive"
      class="el-menu-letter"
      :router="router">
       <el-menu-item index="0" route='write'>
        <i class="el-icon-edit"></i>
        <span slot="title">写邮件</span>
      </el-menu-item>
       <el-menu-item index="1" route='inbox'>
        <i class="el-icon-message"></i>
        <span slot="title">收件箱</span>
      </el-menu-item>
      <el-menu-item index="2" route='star'>
        <i class="el-icon-star-off"></i>
        <span slot="title">标星邮件</span>
      </el-menu-item>
      <el-menu-item index="3" route='drafts'>
        <i class="el-icon-document"></i>
        <span slot="title">草稿箱</span>
      </el-menu-item>
      <el-menu-item index="4" route='sent'>
        <i class="el-icon-upload2"></i>
        <span slot="title">已发送</span>
      </el-menu-item>
    </el-menu>
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        router: true,
        defaultActive: '1'
      }
    },
    created () {
      const path = this.$route.path
      if (path.match('/letter/star')) {
        this.defaultActive = '2'
      } else if (path.match('/letter/drafts')) {
        this.defaultActive = '3'
      } else if (path.match('/letter/sent')) {
        this.defaultActive = '4'
      } else {
        this.defaultActive = '1'
      }
    },
    watch: {
      $route (newRoute) {
        const path = newRoute.path
        if (path.match('/letter/star')) {
          this.defaultActive = '2'
        } else if (path.match('/letter/drafts')) {
          this.defaultActive = '3'
        } else if (path.match('/letter/sent')) {
          this.defaultActive = '4'
        } else {
          this.defaultActive = '1'
        }
      }
    }
  }
</script>
<style>
.letter {
  display: flex;
  height: calc(100% - 50px);
}
.letter .el-menu {
  flex: 0 0 132px;
  margin-top: 2px;
  padding-top: 20px;
}
.letter .el-menu-letter li{
  height: 35px;
  line-height: 35px;
}
.letter .content {
  /* flex: 1; */
  width: calc(100% - 132px);
  /* margin-top: 2px; */
}
</style>

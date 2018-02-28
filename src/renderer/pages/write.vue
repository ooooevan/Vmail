<template>
  <div class="write">
    <div class="left">
      <div class="header">
      <div class="total fl">
        <el-button size="small" @click='send'>发送</el-button>
        <el-button size="small" @click='handleSaveDraft'>存草稿</el-button>
        <el-button size="small" @click='cancel'>取消</el-button>
      </div>
    </div>
      <el-form label-width="80px" :model="emailData">
        <el-form-item label="收件人">
          <el-input size="small" v-model="emailData.to"></el-input>
        </el-form-item>
        <el-form-item label="主题">
          <el-input size="small" v-model="emailData.subject"></el-input>
        </el-form-item>
        <el-form-item label="添加附件">
          <el-upload
          class="upload-demo"
          ref="upload"
          action="https://jsonplaceholder.typicode.com/posts/"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :file-list="fileList"
          :on-change="handleChange"
          :auto-upload="false">
          <el-button slot="trigger" size="small" type="primary">选择文件</el-button>
        </el-upload>
        </el-form-item>
        <el-form-item label="正文" class='content'>
          <quill-editor v-model="emailData.html"
            ref="myQuillEditor"
            @blur="onEditorBlur($event)"
            @focus="onEditorFocus($event)"
            @ready="onEditorReady($event)">
          </quill-editor>
        </el-form-item>
      </el-form>
    <div class="header">
      <div class="total fl">
        <el-button size="small" @click='send'>发送</el-button>
        <el-button size="small" @click='handleSaveDraft'>存草稿</el-button>
        <el-button size="small" @click='cancel'>取消</el-button>
      </div>
    </div>
    </div>
    <div class="write-right">
      <div class='header'>
        通讯录
        <el-input
          size="mini"
          placeholder="查找通讯录..."
          suffix-icon="el-icon-search"
          v-model="searchFriend">
        </el-input>
      </div>
      <div class="write-address-body">
        <el-tree
          class="filter-tree"
          :data="listData"
          show-checkbox
          @check-change='change'
          :props="defaultProps"
          :filter-node-method="filterNode"
          ref="tree2">
        </el-tree>
      </div>
    </div>
  </div>
</template>
<script>
  import { mapActions, mapGetters } from 'vuex'
  export default {
    data () {
      return {
        fileList: [],
        searchFriend: '',
        emailData: {
          html: '',
          subject: '',
          to: ''
        },
        defaultProps: {
          children: 'children',
          label: 'name'
        }
      }
    },
    watch: {
      searchFriend (val) {
        this.$refs.tree2.filter(val)
      },
      sendingStatus (newStatus) {
        if (newStatus.sending === false) {
          if (!newStatus.err) {
            this.$message({
              message: '发送成功',
              type: 'success'
            })
            this.updateEmailList()
            this.$router.push('/letter')
          } else {
            this.$message.error('发送失败:' + newStatus.err)
          }
        }
      }
    },
    mounted () {
      document.getElementsByClassName('ql-editor')[0].style.minHeight = '200px'
    },
    methods: {
      send () {
        const { emailData, fileList } = this
        if (!emailData.subject || !emailData.to) {
          this.$message.error('请填写完整邮件信息不完整')
          return false
        }
        this.sendEmail({emailData, fileList})
      },
      handleSaveDraft () {
        const { emailData, fileList } = this
        this.saveDraft({emailData, fileList})
      },
      cancel () {
        window.history.back()
      },
      filterNode (value, data) {
        return data.label && data.label.indexOf(value) !== -1
      },
      handleChange (file, fileList) {
        // 添加文件，上传成功或失败会触发，删除文件不会触发
        this.fileList = fileList
      },
      handleRemove (file, fileList) {
        this.fileList = fileList
      },
      handlePreview (file) {
        // console.log(file)
      },
      change (node) {
        if (node.children) return
        const nodeArr = this.$refs.tree2.getCheckedNodes(true).filter(x => (!x.children))
        if (!nodeArr.length) {
          return
        }
        let toStr = this.emailData.to
        nodeArr.forEach(item => {
          const email = item.id
          if (toStr.match(email)) {
            toStr = toStr.match(email + ';') ? toStr.replace(email + ';', '') : toStr.replace(email, '')
          } else {
            toStr = toStr + email + ';'
          }
        })
        this.emailData.to = toStr
      },
      onEditorBlur (quill) {
        // console.log('editor blur!', quill)
        // console.log(this.emailData.html)
      },
      onEditorFocus (quill) {
        // console.log('editor focus!', quill)
      },
      onEditorReady (quill) {
        // console.log('editor ready!', quill)
      },
      ...mapActions(['sendEmail', 'saveDraft', 'updateEmailList'])
    },
    computed: {
      listData () {
        let group = this.groupList.map(item => ({
          id: item.id,
          name: item.name,
          children: this.addressList.filter(x => (x.group === item.name)).map(address => ({
            id: address.email,
            name: address.name
          }))
        }))
        group.push({
          id: 0,
          name: '未分组',
          children: this.addressList.filter(x => (!x.group)).map(address => ({
            id: address.email,
            name: address.name
          }))
        })
        return group
      },
      editor () {
        return this.$refs.myQuillEditor.quill
      },
      ...mapGetters(['sendingStatus', 'addressList', 'groupList'])
    }
  }
</script>
<style scoped>
.write {
  height: calc(100% - 51px);
  overflow-y: auto;
  display: flex;
  margin-top: 1px;
  box-sizing: border-box;
}
.left {
  padding-top: 10px;
  /* box-sizing: border-box; */
  margin-right: 50px;
  flex: 1
}
.write-right{
  font-size: 14px;
  flex: 0 0 200px;
  padding: 10px 5px;
  /* box-sizing: border-box; */
  /* background: red; */
  border-left: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
}
.left .header {
  height: 40px;
  /* border-bottom: 1px solid #409EFF; */
  line-height: 40px;
  padding-left: 80px;
  margin-bottom: 22px;
}
/* .write-right .header {
  margin-bottom: 10px;
} */
.write-right .header .el-input {
  padding-top: 10px;
  border-bottom: 1px solid #ccc;
}
.write .el-form .content .quill-editor .ql-container .ql-blank{
  min-height: 200px;
}
</style>

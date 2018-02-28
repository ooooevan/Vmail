<template>
  <div class='addressTable'>
    <div class="header">
      <div class="total fl">
        全部，共{{list.length}}个好友
        <el-button size="small" @click="addVisible = true">添加好友</el-button>
        <el-button size="small" @click="groupVisible = true">管理分组</el-button>
      </div>
      <div class="page fr">
        <el-input
          size="mini"
          placeholder="查找通讯录..."
          suffix-icon="el-icon-search"
          v-model="searchFriend">
        </el-input>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th width="25%">姓名</th>
          <th width="35%">邮箱</th>
          <th width="25%">分组</th>
          <th width="15%">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          :key='index'
          v-for='(item, index) in currentData'>
          <th>{{item.name}}</th>
          <th>{{item.email}}</th>
          <th>{{item.group}}</th>
          <th class='delete' @click='deleteAddress(item)'>删除</th>
        </tr>
      </tbody>
    </table>
    <p v-if="!list.length" class="no-address-list">
      通讯录是空的
    </p>
    <el-dialog title="添加好友" :visible.sync="addVisible">
      <el-form :model="addForm">
        <el-form-item label="姓名" :label-width="formLabelWidth">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" :label-width="formLabelWidth">
          <el-input v-model="addForm.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="分组" :label-width="formLabelWidth">
          <el-select v-model="addForm.group" placeholder="分组">
            <el-option :key='item.id' :label='item.name' :value='item.name' v-for='item in group'></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAddress">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="管理分组" :visible.sync="groupVisible">
      <el-tag
        :key="tag.id"
        v-for="tag in group"
        closable
        :disable-transitions="false"
        @close="removeTag(tag)">
        {{tag.name}}
      </el-tag>
      <el-input
        class="input-new-tag"
        v-if="inputVisible"
        v-model="inputValue"
        ref="saveTagInput"
        @keyup.enter.native="handleInputConfirm"
        @blur="handleInputConfirm"
      >
      </el-input>
      <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
      <div slot="footer" class="dialog-footer">
        <el-button @click="groupVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        currentData: this.list,
        searchFriend: '',
        addVisible: false,
        groupVisible: false,
        inputVisible: false,
        inputValue: '',
        addForm: {
          name: '',
          email: '',
          group: ''
        },
        formLabelWidth: '120px'
      }
    },
    props: {
      list: {
        type: Array,
        default: []
      },
      group: {
        type: Array,
        default: []
      }
    },
    watch: {
      searchFriend (str) {
        this.currentData = this.list.filter(item => (item.name.indexOf(str) > -1 || item.email.indexOf(str) > -1 || `${item.group}`.indexOf(str) > -1))
      },
      list (newList) {
        this.currentData = newList.filter(item => (item.name.indexOf(this.searchFriend) > -1 || item.email.indexOf(this.searchFriend) > -1 || `${item.group}`.indexOf(this.searchFriend) > -1))
      }
    },
    methods: {
      addAddress () {
        if (!this.addForm.name || !this.addForm.email) {
          this.$message.error('请填写完整')
          return false
        }
        // 保存
        this.$emit('addAddress', this.addForm)
        this.addForm = {name: '', email: '', group: ''}
        this.addVisible = false
      },
      deleteAddress (item) {
        this.$confirm('确认删除该联系人？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$emit('deleteAddress', item)
        }).catch(() => {})
      },
      removeTag (tag) {
        this.$emit('removeGroup', tag)
      },
      showInput () {
        this.inputVisible = true
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus()
        })
      },
      handleInputConfirm () {
        let inputValue = this.inputValue
        if (inputValue) {
          this.$confirm('是否创建该分组', '提示', {
            confirmButtonText: '创建',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.$emit('addTag', inputValue)
          }).catch(() => {})
        }
        this.inputVisible = false
        this.inputValue = ''
      }
    }
  }
</script>
<style scoped>
.addressTable {
  height: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  overflow-y: auto;
}
.addressTable .el-tag + .el-tag {
  margin-left: 10px;
}
.addressTable .button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.addressTable .input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
.header {
  height: 50px;
  border-bottom: 1px solid #409EFF;
  line-height: 50px;
}
table {
  width: 100%;
  color: #545454;
  font-size: 15px;
}
table .delete:hover {
  text-decoration: underline;
  cursor: pointer;
}
table thead {
  line-height: 40px;
  height: 40px;
  border-bottom: 1px solid #ebeef5
}
table tbody tr {
  line-height: 35px;
  border-bottom: 1px solid #ebeef5;
  height:35px;
}
table thead tr th, table tbody tr th{
  text-align: start;
}
.addressTable .no-address-list {
  margin: 5px;
  text-align: center;
  color: #797979;
}
</style>

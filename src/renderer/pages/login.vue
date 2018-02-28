<template>
  <el-dialog :visible.sync='visible' title='添加账号' :before-close='close' top='30vh'>
      <div title='若不知道密码，需要先在邮箱：设置->账户->开启IMAP/STMP服务获取授权码，授权码即为客户端登录密码' class="help">帮助</div>
      <br>
      <el-form :model="ruleForm" label-width="80px" status-icon :rules="rules" size='small' ref="ruleForm">
        <el-form-item prop="email" label="email" >
          <el-autocomplete
            class="email"
            v-model="ruleForm.email"
            :fetch-suggestions="querySearch"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="ruleForm.password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button class='submit' type="primary" @click="submitForm('ruleForm')">登录</el-button>
        </el-form-item>
      </el-form>
  </el-dialog>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { supportEamil } from '@/common/javascript/config'
export default {
  data () {
    var checkEmail = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('email不能为空'))
      } else if (value.indexOf('@') === -1 || value.indexOf('.') === -1) {
        return callback(new Error('email格式有误'))
      }
      callback()
    }
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        callback()
      }
    }
    return {
      supportEamil: supportEamil,
      ruleForm: {
        password: '',
        email: ''
      },
      rules: {
        password: [
          { validator: validatePass }
        ],
        email: [
          { validator: checkEmail }
        ]
      }
    }
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(['user'])
  },
  methods: {
    ...mapActions(['testAccount']),
    querySearch (str, cb) {
      let results = this.supportEamil
      results = results.map(item => ({value: `${str}@${item}.com`}))
      cb(str ? results : [])
    },
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const { password, email } = this.ruleForm
          this.testAccount({email, password})
          this.ruleForm.password = ''
          this.ruleForm.email = ''
          this.$emit('loginClose')
        } else {
          return false
        }
      })
    },
    close () {
      this.$emit('close')
    }
  }
}
</script>
<style>
.el-dialog {
  width: 50%;
}
.el-dialog .el-dialog__header .el-dialog__title {
  font-size: 15px;
}
.el-dialog .help {
  float: right; 
  transform: translateY(-15px);
  cursor: pointer;
}
.el-dialog .email {
  width: 100%;
}

</style>

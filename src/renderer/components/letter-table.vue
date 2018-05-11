<template>
  <div class='content'>
    <div class="header">
      <div class="total fl">
        共{{data.length}}封邮件
      </div>
      <el-button class="markReaded fl" @click='handleMarkReaded' v-if='type === "in"' size="small">全部标为已读</el-button>
      <div class="page fr">
        <span>{{currentPage}} / {{totalPage}}页&nbsp;</span>
        <el-button @click='prev' v-if='data.length > perPage && currentPage > 1' size="mini">上一页</el-button>
        <el-button @click='next' v-if='data.length > perPage && currentPage < totalPage' size="mini">下一页</el-button>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th width="22%">{{type === 'in' ? '发件人' : '收件人'}}</th>
          <th width="59%">主题</th>
          <th width="19%">日期</th>
        </tr>
      </thead>
      <tbody>
        <tr
          :key='item.id'
          @click="select(item)"
          v-for='item in currentData'
          :class='item.isRead ? "" : "notRead"'>
          <th style="letter-spacing: -1px">{{cutstr(type == 'inbox' ? item.from.join(';') : item.to.join(';'))}}</th>
          <th style="letter-spacing: -1px">{{item.subject}}</th>
          <th>{{item.date}}</th>
          <th @click.stop="star(item)"><i :class='item.isStar ? "el-icon-star-on": "el-icon-star-off"'></i></th>
        </tr>
      </tbody>
    </table>
    <p v-if="!data.length" class="no-email">
      目前还没有邮件
    </p>
    <div class="header footer">
      <div class="page fr">
        <span>{{currentPage}} / {{totalPage}}页&nbsp;</span>
        <el-button @click='prev' v-if='data.length > perPage && currentPage > 1' size="mini">上一页</el-button>
        <el-button @click='next' v-if='data.length > perPage && currentPage < totalPage' size="mini">下一页</el-button>
      </div>
    </div>
  </div>
</template>
<script>
  import { mapMutations, mapGetters, mapActions } from 'vuex'
  const PERPAGE = 25
  export default {
    data () {
      return {
        currentPage: 1,
        perPage: PERPAGE
      }
    },
    props: {
      data: {
        type: Array,
        default: []
      },
      type: {
        type: String,
        default: 'inbox'
      }
    },
    computed: {
      totalPage () {
        return Math.ceil(this.data.length / PERPAGE)
      },
      currentData () {
        const page = this.currentPage
        return this.data.slice((page - 1) * PERPAGE, page * PERPAGE).map(item => ({
          ...item,
          subject: item.subject.join('').length > 30 ? `${item.subject.join('')}...` : item.subject.join(''),
          date: this.$moment(item.date).format('YYYY-MM-DD HH:mm:ss'),
          isRead: item.from[0].match(this.user.email) ? true : item.isRead
        }))
      },
      ...mapGetters(['user'])
    },
    created () {
      // 用url参数存储页数，当返回到列表能返回到具体页数而不是第一页
      this.currentPage = +this.$route.query.page || 1
    },
    methods: {
      handleMarkReaded () {
        this.markReaded(this.type)
      },
      cutstr (str) {
        const index = str.indexOf('<') > -1 ? str.indexOf('<') : str.length
        return str.substr(0, index)
      },
      select (item) {
        this.$router.push({path: `/mailDetails/${item.id}`, query: {type: this.type}})
      },
      star (item) {
        this.starEmail(item.id)
      },
      prev () {
        this.currentPage--
        this.$emit('changeRouter', this.currentPage)
      },
      next () {
        this.currentPage++
        this.$emit('changeRouter', this.currentPage)
      },
      ...mapMutations({
        starEmail: 'STAR_EMAIL_IN_LIST'
      }),
      ...mapActions(['markReaded'])
    }
  }
</script>
<style scoped>
.content {
  height: 100%;
  width: 100%;
  padding: 0 30px;
  box-sizing: border-box;
  overflow-y: auto;
}
.content .header {
  height: 40px;
  border-bottom: 1px solid #409EFF;
  line-height: 40px;
}
.content .header .markReaded {
  margin-left: 20px;
  cursor: pointer;
  transform: translateY(4px);
}
.content .header .page .el-button {
  transform: translateY(-1px);
}
.content .header .page a {
  cursor: pointer;
  color: #000;
  user-select: none;
}
.content .header .page a:hover {
  text-decoration: underline;
}
.content .footer {
  border-bottom: none;
}
table {
  width: 100%;
  color: #545454;
  font-size: 15px;
}
table thead {
  line-height: 40px;
  height: 40px;
  border-bottom: 1px solid #ebeef5
}
table tbody tr {
  font-size: 14px;
  line-height: 30px;
  border-bottom: 1px solid #ebeef5;
  height:30px;
  cursor: pointer;
  transition: all .3s;
}
table tbody tr:hover {
  background: #eae9e9;
}
table tbody tr.notRead th {
  font-weight: 600;
}
table thead tr th, table tbody tr th{
  text-align: start;
}
table tbody tr th .el-icon-star-on {
  color: #409EFF;
}
.no-email {
  margin: 5px;
  text-align: center;
  color: #797979;
}
</style>

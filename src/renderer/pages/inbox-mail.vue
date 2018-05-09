<template>
  <div class='inbox'>
    <letter-table type='inbox' :data="inboxMail" @changeRouter='changeRouter'></letter-table>
  </div>
</template>
<script>
  import letterTable from '@/components/letter-table'
  import { mapGetters } from 'vuex'
  export default {
    components: {
      letterTable
    },
    computed: {
      ...mapGetters(['inboxMail'])
    },
    mounted () {
      // window.onresize = () => {
      //   console.log(window.innerWidth)
      // }
    },
    methods: {
      changeRouter (page) {
        this.$router.push({path: 'inbox', query: {page: page}})
      }
    }
  }
</script>
<style scoped>
.inbox {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
.inbox table {
  width: 100%;
  color: #545454;
}
.inbox table thead {
  line-height: 40px;
  height: 40px;
  border-bottom: 1px solid #ebeef5
}
.inbox table tbody tr {
  line-height: 30px;
  border-bottom: 1px solid #ebeef5;
  height:30px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.inbox table thead tr th, .inbox table tbody tr th{
  text-align: start;
}
</style>

<template>
  <div class='star'>
    <letter-table :data="starMail"></letter-table>
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
      ...mapGetters(['starMail'])
    },
    mounted () {
      // window.onresize = () => {
      //   console.log(window.innerWidth)
      // }
    }
  }
</script>
<style scoped>
.star {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
.star table {
  width: 100%;
  color: #545454;
}
.star table thead {
  line-height: 40px;
  height: 40px;
  border-bottom: 1px solid #ebeef5
}
.star table tbody tr {
  line-height: 30px;
  border-bottom: 1px solid #ebeef5;
  height:30px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.star table thead tr th, table tbody tr th{
  text-align: start;
}
</style>

<template>
  <div class="addressList">
    <address-list-table @removeGroup='removeGroup' @addTag='addGroup' @deleteAddress='delOneAddress' @addAddress='addOneAddress' :group='groupList' :list="addressList" class='addressListTable'></address-list-table>
  </div>
</template>
<script>
  import addressListTable from '@/components/address-list-table'
  import { mapActions, mapGetters } from 'vuex'
  export default {
    components: {
      addressListTable
    },
    methods: {
      ...mapActions(['addOneAddress', 'delOneAddress', 'addGroup', 'removeGroup'])
    },
    computed: {
      ...mapGetters(['addressList', 'groupList'])
    }
  }
</script>
<style>
.addressList {
  width: 100%;
  height: calc(100% - 51px);
  margin-top: 1px;
  box-sizing: border-box;
}
.addressListTable {
  /* box-sizing: border-box; */
  /* margin: 20px; */
}
</style>

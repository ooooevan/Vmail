import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import * as getters from './getters'
import * as actions from './actions'
import mutations from './mutations'
import state from './state'
Vue.use(Vuex)
const debug = process.env_NODE_ENV !== 'production'

export default new Vuex.Store({
  getters,
  actions,
  state,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : []
})

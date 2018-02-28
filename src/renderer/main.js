import Vue from 'vue'
import ElementUI from 'element-ui'
import moment from 'moment'
import 'element-ui/lib/theme-chalk/index.css'
import './common/style/reset.css'
import VueQuillEditor from 'vue-quill-editor'
// require VueQuillEditor styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import App from './App'
import router from './router'
import store from './store'

Object.defineProperty(Vue.prototype, '$moment', {value: moment})
Vue.use(VueQuillEditor)
Vue.use(ElementUI)
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
// Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

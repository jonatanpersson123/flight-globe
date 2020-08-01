import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
import 'element-ui/lib/theme-chalk/index.css'
import 'element-ui/lib/theme-chalk/reset.css'

Vue.use(ElementUI, {locale})

Vue.config.productionTip = false
Vue.prototype.$http = axios

axios.defaults.headers.common['x-rapidapi-host'] = process.env.VUE_APP_API_HOST
axios.defaults.headers.common['x-rapidapi-key'] = process.env.VUE_APP_API_KEY

new Vue({
  el: '#app',
  render: h => h(App)
})
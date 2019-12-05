// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import config from './config'
import methods from './methods'

Vue.config.productionTip = false
Vue.prototype.axios = axios;

for(var key in config){
  Vue.prototype[key] = config[key];
}

for(var key in methods){
  Vue.prototype[key] = methods[key];
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

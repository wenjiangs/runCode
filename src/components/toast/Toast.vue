<!-- 提示框 -->
<template>
  <div>
    <!-- 标题栏 -->
    <mt-header title="提示框">
      <router-link to="/" slot="left">
        <mt-button icon="back">返回</mt-button>
      </router-link>
    </mt-header>
    <!-- 内容 -->
    <button @click="openTop()">top</button>
    <button @click="openCenter()">center</button>
    <button @click="openBottom()">bottom</button>
    <button @click="openLoading()">loading</button>
  </div>
</template>
 
<script>
// 引入Toast
import './components/Toast/toast.css';
import Toast from './components/Toast/index';
Vue.use(Toast);
export default {
  name: 'Toast',
  data(){
    return {
      //
    }
  },
  methods:{
    openTop(){
      this.$toast.top('top');
    },
    openCenter(){
      this.$toast.center('center');
    },
    openBottom(){
      this.$toast('bottom');  // or this.$toast.bottom('bottom');
    },
    openLoading(){
      this.$loading('loading...');
      let self = this;
      setTimeout(function () {
        self.closeLoading()
      }, 2000)
    },
    closeLoading(){
      this.$loading.close();
    }
  }
}
</script>
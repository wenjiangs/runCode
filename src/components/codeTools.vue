<template>
  <div class="codeTools">
    <div class="pull-left">
      <span @click="format">格式化代码</span>
    </div>
    <div class="pull-right">
      <span>总行：{{codeInfo.lineTotal}}</span>
      <span>长度：{{codeInfo.codeLength}}</span>
      <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <span>行：{{codeInfo.currentLine}}</span>
      <span>列：{{codeInfo.currentCol}}</span>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      codeInfo: {
        type: Object,
        default: ()=>{},
      }
    },
    data() {
      return {

      };
    },
    methods:{
      format(){
        this.$emit('format');
      }
    }
  }
</script>

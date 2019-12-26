import Vue from 'vue';

// element-ui
import {
  Loading,
  MessageBox,
  Dialog,
  Button,
  Input,
  Checkbox,
  CheckboxGroup
} from 'element-ui';

Vue.use(Dialog);
Vue.use(Button);
Vue.use(Input);
Vue.use(Checkbox);
Vue.use(CheckboxGroup);
// element-ui end

import qs from 'qs';

import '../components/Toast/toast.css';
import Toast from '../components/toast';
Vue.use(Toast);

import JsonViewer from 'vue-json-viewer'
Vue.use(JsonViewer)

import verify from '../common/js/verify.js';
import consoleCustom from '../common/js/console.js';

const prettier = require("prettier/standalone");
const prettierBabylon = require("prettier/parser-babylon"); // json
const prettierHtml = require("prettier/parser-html");
const prettierCss = require("prettier/parser-postcss");
const prettierJs = require("prettier/parser-flow");

import codeTools from '@/components/codeTools.vue'
Vue.component('code-tools', codeTools);

export default {
  name: 'index',
  data() {
    return {
      loadingInstance: {},
      codeObj: {
        code_name: '',
        code_info: '',
        code_markup: '',
        code_css: '',
        code_js: '',
        external_js: '',
        external_css: ''
      },
      loginDialogVisible: false,
      regDialogVisible: false,
      optionDialogVisible: false,
      username: '',
      password: '',
      useremail: '',
      userInfo: {},
      thisEditIndex: 1,
      aceOptions: {
        showPrintMargin: false,
        wrap: 'free',
        fontSize: '14'
      },
      // {source: 'user', type: '', text: '', time: ''}
      consoleArray: [],
      consoleSize: 1,

      codeInfo: {
        lineTotal: 0,
        codeLength: 0,
        currentLine: 0,
        currentCol: 0,
        platform: '',
      },

      myEditor: null,

      consoleHelpVisible: false,
      shareVisible: false,
      sdOpts: [],
      code_guid: '',
      shareIframe: '',

    }
  },
  components: {
    editor: require('vue2-ace-editor'),
  },
  methods: {
    log(json) {
      json.dataType = this.isJSON(json.text) ? 'json' : ''
      this.consoleArray.push(json);
      this.$nextTick(() => {
        var ele = document.getElementById('consoleList');
        ele.scrollTop = ele.scrollHeight;
      })
    },
    newCode() {
      window.location.href = "/runCode/"
    },
    editorInit() {
      require('brace/ext/language_tools')
      require('brace/mode/html')
      require('brace/mode/javascript')
      require('brace/mode/less')
      require('brace/theme/chrome')
      require('brace/snippets/javascript')
    },
    codeRun(isCheck = true) {

      if (this.isEmpty(this.codeObj.code_markup) &&
        this.isEmpty(this.codeObj.code_css) &&
        this.isEmpty(this.codeObj.code_js) && isCheck == true) {
        this.$toast('请输入你要运行的代码！');
        return;
      }

      let rf = this.$refs.resultframe;
      let rfHead = rf.contentDocument.firstElementChild.firstElementChild;
      let rfBody = rf.contentDocument.firstElementChild.lastElementChild;

      rfHead.innerHTML = '<style>' + this.codeObj.code_css + '</style>';
      rfBody.innerHTML = this.codeObj.code_markup

      this.codeObj.external_js = this.trim(this.codeObj.external_js);
      // 不为空才执行
      if (!this.isEmpty(this.codeObj.external_js)) {
        var scriptObj = this.codeObj.external_js.split(/[\s\n]/);
        this.dynamicLoadJs(scriptObj, rfHead, () => {
          try {
            rf.contentWindow.console = consoleCustom;
            rf.contentWindow.eval(this.codeObj.code_js);
          } catch (e) {
            this.log({
              source: 'code',
              type: 'error',
              text: e.toString(),
              time: (new Date()).getTime()
            })
          }
        })
      } else {
        // 不需要加载js直接执行代码
        try {
          rf.contentWindow.console = consoleCustom;
          rf.contentWindow.eval(this.codeObj.code_js);
        } catch (e) {
          this.log({
            source: 'code',
            type: 'error',
            text: e.toString(),
            time: (new Date()).getTime(),
          })
        }
      }

      this.codeObj.external_css = this.trim(this.codeObj.external_css);
      if (!this.isEmpty(this.codeObj.external_css)) {
        var cssObj = this.codeObj.external_css.split(/[\s\n]/);
        this.dynamicLoadCss(cssObj, rfHead);
      }

    },
    trim(str) {
      return str.replace(/(^\s*)|(\s*$)/g, "");
    },
    dynamicLoadJs(urls, rfHead, cb) {
      var loadNum = 0;
      for (let i = 0; i < urls.length; i++) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = urls[i];
        // console.log('处理回调')
        script.onload = script.onreadystatechange = function() {
          if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
            loadNum++;
            if (loadNum == urls.length) {
              loadNum = 0;
              cb();
            }
            script.onload = script.onreadystatechange = null;
          }
        };
        rfHead.appendChild(script);
      }
    },
    dynamicLoadCss(urls, rfHead) {
      for (let i = 0; i < urls.length; i++) {
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = urls[i];
        rfHead.appendChild(link);
      }
    },
    saveCode() {
      if (this.userInfo) {
        // post to save
        this.postSave();
      } else {
        this.loginDialogVisible = true;
      }
    },
    postSave() {
      let data = qs.stringify({
        model: 'saveCode',
        action: {
          user_id: this.userInfo.ID,
          token: this.userInfo.token,
          codeObj: this.codeObj
        }
      });
      this.loadingInstance = Loading.service({
        text: '正在保存'
      })
      this.axios.post(this.APIURL, data).then((res) => {
        this.optionDialogVisible = false;
        this.loadingInstance.close();
        if (res.data.success) {
          this.$toast(res.data.message, 'success');
          // 新增成功跳转
          if (!(res.data.data == '')) {
            this.codeObj = res.data.data;
            this.$router.push({
              path: '/',
              query: {
                code: res.data.data.code_guid
              }
            });
          }
        } else {
          this.$toast(res.data.message, 'error');
          // 失效用户清除本地缓存
          if (res.data.code == 2) {
            this.removeLS('userInfo');
            this.userInfo = {};
          }
        }
      })
    },

    logout() {
      MessageBox.confirm('确定退出登录吗？', '提示', {
        center: true,
        callback: (action, instance) => {
          if (action == 'confirm') {
            this.removeLS('userInfo');
            this.userInfo = {};
          }
        }
      })
    },

    initPage() {
      if (this.$route.query.code && !this.isEmpty(this.$route.query.code)) {
        this.loadingInstance = Loading.service({
          text: '加载中'
        });
        let data = qs.stringify({
          model: 'getCode',
          action: {
            code_guid: this.$route.query.code
          }
        });
        this.axios.post(this.APIURL, data).then((res) => {
          this.$nextTick(() => {
            this.loadingInstance.close();
          });
          if (res.data.success) {
            this.codeObj = res.data.data
            this.$nextTick(() => {
              this.codeRun(false);
            })
            this.getEditorInfo();
          } else {
            MessageBox.alert(res.data.message, '提示');
          }
        });
      }
    },
    changeEdit(e) {
      this.thisEditIndex = e;
      this.getEditorInfo();
    },
    ifShow(e) {
      if (this.$route.query.simple) {
        return this.thisEditIndex == e
      } else {
        if (e == 4 || e == 5) {
          return true;
        }
        return this.thisEditIndex == e;
      }
    },
    changeConsoleSize() {
      this.consoleSize++;
      if (this.consoleSize == 4) {
        this.consoleSize = 1;
      }
      localStorage.setItem('consoleSize', this.consoleSize);
    },
    deleteCode() {
      MessageBox.confirm('确定删除代码吗？', '提示', {
        center: true,
        callback: (action, instance) => {
          if (action == 'confirm') {
            this.deleteCodeDo()
          }
        }
      })
    },
    deleteCodeDo() {
      this.loadingInstance = Loading.service({
        text: '删除中'
      })
      let data = qs.stringify({
        model: 'deleteCode',
        action: {
          codeObj: this.codeObj,
          user_id: this.userInfo.ID,
          token: this.userInfo.token,
        }
      });
      this.axios.post(this.APIURL, data).then((res) => {
        this.$nextTick(() => {
          this.loadingInstance.close();
        });
        if (res.data.success) {
          window.location.href = '/';
        } else {
          this.$toast(res.data.message, 'error');
        }
      })
    },

    clearLog() {
      this.consoleArray = [];
    },

    getEditorInfo() {
      this.$nextTick(() => {
        this.getEditor();
        if (!this.myEditor) return;

        // 获取光标所在的行和列
        this.codeInfo.currentLine = this.myEditor.selection.getCursor().row + 1;
        this.codeInfo.currentCol = this.myEditor.selection.getCursor().column;
        this.myEditor.getSession().selection.on('changeCursor', (e) => {
          this.codeInfo.currentLine = this.myEditor.selection.getCursor().row + 1;
          this.codeInfo.currentCol = this.myEditor.selection.getCursor().column;
        });

        // 代码总长度
        this.codeInfo.codeLength = this.myEditor.getValue().length;
        // 获取总行数
        this.codeInfo.lineTotal = this.myEditor.session.getLength();
        this.myEditor.on('change', () => {
          this.codeInfo.lineTotal = this.myEditor.session.getLength();
          this.codeInfo.codeLength = this.myEditor.getValue().length;
        })

        this.codeInfo.platform = this.myEditor.getKeyboardHandler().platform.toUpperCase();
      })
    },

    // 格式化html
    formatCode() {
      let plugins = [],
        parser = '';
      if (this.thisEditIndex == 1) {
        plugins = [prettierHtml];
        parser = 'html';
      } else if (this.thisEditIndex == 2) {
        plugins = [prettierCss]
        parser = 'css';
      } else if (this.thisEditIndex == 3) {
        plugins = [prettierJs]
        parser = 'flow';
      }
      let codeValue = this.myEditor.getValue();
      if(this.isEmpty(codeValue)) return;

      try {
        codeValue = prettier.format(codeValue, {
          parser: parser,
          plugins: plugins
        });
        this.myEditor.setValue(codeValue);
      } catch (e) {
        this.log({
          source: 'code',
          type: 'error',
          text: e.toString(),
          time: (new Date()).getTime()
        });
      }
    },

    getEditor() {
      if (this.thisEditIndex == 1) {
        this.myEditor = this.$refs.htmlEditor.editor
      } else if (this.thisEditIndex == 2) {
        this.myEditor = this.$refs.cssEditor.editor
      } else if (this.thisEditIndex == 3) {
        this.myEditor = this.$refs.jsEditor.editor
      }
    },

    showLogHelp() {
      this.consoleHelpVisible = true;
    }

  },
  mounted() {
    this.initPage();
    let userInfo = this.getLS('userInfo');
    if (userInfo) {
      this.userInfo = JSON.parse(userInfo);
    }

    consoleCustom.dataOut = (json) => {
      this.log(json);
    }

    let consoleSize = localStorage.getItem('consoleSize');
    if (consoleSize) {
      this.consoleSize = consoleSize * 1
    }

    if (this.$route.query.code && !this.isEmpty(this.$route.query.code)) {
      this.code_guid = this.$route.query.code;
    }

    this.shareIframe = '<iframe class="iframe" src="' +
      this.WEBURL + '#/?code=' + this.code_guid + '&simple=1"></iframe>';

    this.$nextTick(()=>{
      this.getEditor();
      this.getEditorInfo();
    })
  }
}

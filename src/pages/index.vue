<template>
  <div class="page" :class="$route.query.simple?'isShare':''">
    <div id="topbar">
      <h2 id="logo"><a href="/">RJS</a></h2>
      <ul class="editNavBar editNavBarDo">
        <li id="html"><a href="javascript:" :class="thisEditIndex==1?'active':''" @click="changeEdit(1)">HTML</a></li>
        <li id="css"><a href="javascript:" :class="thisEditIndex==2?'active':''" @click="changeEdit(2)">CSS</a></li>
        <li id="js"><a href="javascript:" :class="thisEditIndex==3?'active':''" @click="changeEdit(3)">JS</a></li>
        <li id="result"><a href="javascript:" :class="thisEditIndex==4?'active':''" @click="changeEdit(4)">Result</a></li>
        <li id="result"><a href="javascript:" :class="thisEditIndex==5?'active':''" @click="changeEdit(5)">Console</a></li>
        <li id="run"><a href="javascript:" @click="codeRun"><i class="el-icon-video-play"></i> 运行</a></li>
        <li id="save"><a href="javascript:" @click="saveCode"><i class="el-icon-mobile"></i> 保存</a></li>
        <li id="option"><a href="javascript:" @click="optionDialogVisible = true">
            <i class="el-icon-setting"></i> 设置</a></li>
        <li id="share"><a href="javascript:" @click="shareVisible=true"><i class="el-icon-files"></i> 嵌入</a></li>
        <li id="delete"><a href="javascript:" @click="deleteCode"><i class="el-icon-delete"></i> 删除</a></li>
      </ul>
      <ul class="editNavBar navBarUserBox" v-if="isEmpty(userInfo)">
        <li><a href="/wp-login.php?redirect_to=http://www.wenjiangs.com/runCode/">登录</a></li>
      </ul>
      <ul class="editNavBar navBarUserBox" v-else>
        <li class="navLiUser">
          <span class="navAvatar"><img :src="userInfo.user_avatar" /></span>
          <span class="navName" v-html="userInfo.display_name"></span>
        </li>
        <li><a href="javascript:" class="login" @click="logout">退出</a></li>
      </ul>
    </div>

    <div class="codeCon">
      <div class="codeContainer" id="HTMLContainer" v-show="ifShow(1)">
        <code-tools :codeInfo="codeInfo" @format="formatCode"></code-tools>
        <div class="codeConBox" @format="formatCode">
          <editor v-model="codeObj.code_markup" @init="editorInit" ref="htmlEditor" lang="html" theme="chrome" width="100%"
            height="100%" :options="aceOptions"></editor>
        </div>
      </div>
      <div class="codeContainer" id="CSSContainer" v-show="ifShow(2)">
        <code-tools :codeInfo="codeInfo" @format="formatCode"></code-tools>
        <div class="codeConBox">
          <editor v-model="codeObj.code_css" @init="editorInit" ref="cssEditor" lang="css" theme="chrome" width="100%"
            height="100%" :options="aceOptions"></editor>
        </div>
      </div>
      <div class="codeContainer" id="JSContainer" v-show="ifShow(3)">
        <code-tools :codeInfo="codeInfo" @format="formatCode"></code-tools>
        <div class="codeConBox">
          <editor v-model="codeObj.code_js" @init="editorInit" ref="jsEditor" lang="javascript" theme="chrome" width="100%"
            height="100%" :options="aceOptions"></editor>
        </div>
      </div>
      <div class="codeContainer" id="ResultContainer" :class="['', 'consleBoxSmall', 'consleBoxMedium', 'consleBoxBig'][consoleSize]">
        <div class="resultBox" v-show="ifShow(4)">
          <iframe class="iframe" id="resultframe" ref="resultframe"></iframe>
        </div>
        <div class="consleBox" v-show="ifShow(5)">
          <div class="consoleTit">
            <span>
              <i @click="changeConsoleSize" :class="consoleSize==1?'el-icon-top':'el-icon-bottom'"></i>
              <i @click="clearLog" class="el-icon-delete"></i>
              <i @click="showLogHelp" class="el-icon-warning-outline"></i>
            </span>
            Console
          </div>
          <div class="consoleCon">
            <div class="consoleList" id="consoleList">
              <div class="consoleItem" :class="item.type" v-for="(item, index) in consoleArray" :key="index">
                <div class="ciPreU" v-if="item.source=='user'">&gt;&gt;</div>
                <div class="ciShow" v-if="item.dataType=='json'">
                  <json-viewer :value="item.text" copyable boxed sort></json-viewer>
                </div>
                <div class="ciShow ciShowAlone" v-else>{{item.text}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog width="800px" title="项目设置" :visible.sync="optionDialogVisible" class="loginBox" :center="true">
      <div class="loginForm">
        <div class="inputItem">
          <el-input type="text" v-model="codeObj.code_name" placeholder="项目名称"></el-input>
        </div>
        <div class="inputItem">
          <el-input type="textarea" v-model="codeObj.code_info" placeholder="项目描述"></el-input>
        </div>
        <div class="inputItem">
          <el-input type="textarea" v-model="codeObj.external_js" placeholder="外部JS文件，一行一个文件"></el-input>
        </div>
        <div class="inputItem">
          <el-input type="textarea" v-model="codeObj.external_css" placeholder="外部CSS文件，一行一个文件"></el-input>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" type="primary" @click="saveCode">保 存</el-button>
      </span>
    </el-dialog>
    <el-dialog width="400px" title="Console说明" :visible.sync="consoleHelpVisible" :center="true">
      <div class="infoContent">
        <p>可输出数组和对象，仅仅实现了 info、warn、log、error四个方法，调用其他方法无任何输出，甚至会报错。</p>
      </div>
    </el-dialog>
    <el-dialog v-if="!$route.query.simple" width="800px" title="嵌入其他页面/分享" :visible.sync="shareVisible" :center="true">
      <div class="sdBox">
        <div class="sdItem">
          <h3>功能</h3>
          <template>
            <el-checkbox-group v-model="sdOpts">
              <el-checkbox label="HTML"></el-checkbox>
              <el-checkbox label="CSS"></el-checkbox>
              <el-checkbox label="JS"></el-checkbox>
              <el-checkbox label="Result"></el-checkbox>
            </el-checkbox-group>
          </template>
          <h3>嵌入代码</h3>
          <div>
            <el-input type="textarea"></el-input>
          </div>
        </div>
        <div class="sdItem">
          <iframe class="iframe" src="http://127.0.0.1:8080/?code=1a0e775f&simple=1" id="shareframe" ref="shareframe"></iframe>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import index from './index.js';
  export default index;
</script>

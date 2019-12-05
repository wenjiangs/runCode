const methods = {
  beforeAxios() {
    this.axios.interceptors.request.use(function(config) {})
  },
  afterAxios() {
    this.axios.interceptors.response.use((res) => {
      return res;
    }, (error) => {
      return error.response;
    })
  },
  isEmpty(str) {
    if (str == "" || str == null || str == undefined || str.length == 0 || JSON.stringify(str) == "{}") {
      return true;
    } else {
      return false;
    }
  },
  getLS(sName) {
    let LS = localStorage.getItem(sName)
    if (LS) {
      return JSON.parse(LS)
    } else {
      return false;
    }
  },
  setLS(sName, sValue) {
    if (typeof(sValue) == 'string') {
      localStorage.setItem(sName, sValue);
    } else {
      localStorage.setItem(sName, JSON.stringify(sValue));
    }
  },
  removeLS(sName) {
    localStorage.removeItem(sName);
  },

  // 判断字符串是否是JSON
  isJSON(str) {
    // 是数组直接返回false
    if(this.isArray(str)) return false;
    if (typeof str == 'object') return true;
    if (typeof str == 'string') {
      try {
        var obj = JSON.parse(str);
        if (typeof obj == 'object' && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
  },

  isArray(value) {
    if (typeof Array.isArray === "function") {
      return Array.isArray(value);
    } else {
      return Object.prototype.toString.call(value) === "[object Array]";
    }
  },
}

export default methods;

var consoleCustom = {
  assert() {},
  clear() {},
  count() {},
  debug() {},
  dir() {},
  dirxml() {},
  error() {
    var args = Array.prototype.slice.call(arguments);
    consoleHelper.showerror(args.join(" "));
  },
  exception() {},
  group(name) {
    consoleHelper.showgroup(name);
  },
  groupCollapsed() {},
  groupEnd() {},
  info() {
    var args = Array.prototype.slice.call(arguments);
    if (args.length == 1) {
      if (arguments[0] instanceof Array) {
        consoleHelper.showinfo("[" + args[0] + "]");
      } else if (arguments[0] instanceof Function) {
        consoleHelper.showinfo(args[0], "console_log_function");
      } else {
        consoleHelper.showinfo(args[0]);
      }
    } else {
      consoleHelper.showinfo(args.join(" "));
    }
  },
  log() {
    var args = Array.prototype.slice.call(arguments);
    if (args.length > 1) {
      consoleHelper.showlog(args);
    }else{
      consoleHelper.showlog(args[0]);
    }
  },
  memoryProfile() {},
  memoryProfileEnd() {},
  profile() {},
  profileEnd() {},
  table() {},
  time() {},
  timeEnd() {},
  timeStamp() {},
  trace() {},
  warn() {
    var args = Array.prototype.slice.call(arguments);
    if (args.length == 1) {
      if (arguments[0] instanceof Array) {
        consoleHelper.showwarn("[" + args[0] + "]");
      } else if (arguments[0] instanceof Function) {
        consoleHelper.showwarn(args[0], "console_log_function");
      } else {
        consoleHelper.showwarn(args[0]);
      }
    } else {
      consoleHelper.showwarn(args.join(" "));
    }
  },
  dataOut(params) {}
};

const consoleHelper = {
  showlog(val, style, cla) {
    if (cla) {
      cla = "log " + cla;
    } else {
      cla = "log";
    }
    this.show(val, style, cla);
  },
  showinfo(val, cla) {
    if (cla) {
      cla = "info " + cla;
    } else {
      cla = "info";
    }
    this.show(val, null, cla);
  },
  showwarn(val, cla) {
    if (cla) {
      cla = "warn " + cla;
    } else {
      cla = "warn";
    }
    this.show(val, null, cla);
  },
  showerror(val) {
    this.show(val, null, "error");
  },
  showgroup(val) {
    if (!val) {
      val = "";
    }
    this.show(val + ":", null, "group");
  },
  show(val, style, cla) {
    consoleCustom.dataOut({
      source: 'code',
      type: cla,
      style: style,
      text: val,
      time: (new Date()).getTime()
    })
  },
};

export default consoleCustom

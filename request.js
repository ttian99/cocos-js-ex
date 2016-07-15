var request = request || {
  get: function (url, qsObj, opts, cb) {
    if (typeof (opts) === 'function') {
      cb = opts;
      opts = {};
    }
    opts.timeout = opts.timeout || 5000;

    var xhr = request.getXhr();

    url += '?' + querystring.stringify(qsObj);
    var errInfo = "get " + url + " failed!";
    xhr.open("GET", url, true);

    request.innerReq(xhr, opts.timeout, errInfo, cb);

    xhr.send();
  },

  post: function (url, qsObj, opts, cb) {
    if (typeof (opts) === 'function') {
      cb = opts;
      opts = {};
    }
    opts.timeout = opts.timeout || 5000;

    var xhr = request.getXhr();

    var data = querystring.stringify(qsObj);
    var errInfo = "post " + url + "[" + data + "] failed!";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    request.innerReq(xhr, opts.timeout, errInfo, cb);

    xhr.send(data);
  },

  getXhr: function () {
    if (cc) {
      return cc.loader.getXMLHttpRequest();
    }

    return (window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject("MSXML2.XMLHTTP"));
  },

  innerReq: function (xhr, timeout, errInfo, cb) {
    var beginTime = new Date();
    var timeoutid = setTimeout(function () {
      xhr.abort(); // call error callback
      cb('ETIMEOUT', errInfo);
    }, timeout);

    if ((cc && cc.sys.isNative) || ((/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)))) {
      // IE-specific logic here
      xhr.setRequestHeader("Accept-Charset", "utf-8");
      xhr.onreadystatechange = onReady;
    } else {
      if (xhr.overrideMimeType) {
        xhr.overrideMimeType("text\/plain; charset=utf-8");
      }
      xhr.onload = onReady;
    }

    function onReady() {
      if (xhr.readyState === 4) {
        clearTimeout(timeoutid);
        if (xhr.status === 200) {
          var json = null;
          try {
            json = JSON.parse(xhr.responseText);
            json.spendTime = (new Date()).valueOf() - beginTime.valueOf();
          } catch (e) {
            return cb('EJSON_PARSE', xhr.responseText);
          }
          cb(null, json);
        } else {
          cb(errInfo);
        }
      }
    }
  }
};
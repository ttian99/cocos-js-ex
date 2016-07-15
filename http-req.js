var http = Jtx.http = {
  defTimeout: 10 * 1000 // 默认超时时长，10s
};

http.get = function(url, cb, t) {
  var xhr = cc.loader.getXMLHttpRequest(),
    errInfo = "get " + url + " failed!";
  xhr.open("GET", url, true);
  if (cc.sys.isNative || (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent))) {
    // IE-specific logic here
    xhr.setRequestHeader("Accept-Charset", "utf-8");
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        clearTimeout(timeout);
        xhr.status === 200 ? cb(null, xhr.responseText) : cb(errInfo);
      }
    };
  } else {
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType("text\/plain; charset=utf-8");
    }
    xhr.onload = function() {
      if (xhr.readyState === 4) {
        clearTimeout(timeout);
        xhr.status === 200 ? cb(null, xhr.responseText) : cb(errInfo);
      }
    };
  }
  var timeout = setTimeout(function() {
    xhr.abort(); // call error callback
    cb('timeout', errInfo);
  }, t || this.defTimeout);
  xhr.send();
};

http.post = function(url, data, cb, t) {
  var xhr = cc.loader.getXMLHttpRequest(),
    errInfo = "post " + url + " [" + data + "] failed!";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  if (cc.sys.isNative || (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent))) {
    // IE-specific logic here
    xhr.setRequestHeader("Accept-Charset", "utf-8");
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        clearTimeout(timeout);
        xhr.status === 200 ? cb(null, xhr.responseText) : cb(errInfo);
      }
    };
  } else {
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType("text\/plain; charset=utf-8");
    }
    xhr.onload = function() {
      if (xhr.readyState === 4) {
        clearTimeout(timeout);
        xhr.status === 200 ? cb(null, xhr.responseText) : cb(errInfo);
      }
    };
  }

  var timeout = setTimeout(function() {
    xhr.abort(); // call error callback
    cb('timeout', errInfo);
  }, t || this.defTimeout);
  xhr.send(data);
};

http.getRetJson = function(url, cb, t) {
  this.get(url, function(err, txt) {
    if (err) {
      cb && cb(err);
      return;
    }
    var json = Ltc.safeParse(txt);
    if (json) {
      cb && cb(null, json);
    } else {
      cb && cb('parse err', txt);
    }
  }, t);
};

http.postRetJson = function(url, data, cb, t) {
  this.post(url, data, function(err, txt) {
    if (err) {
      cb && cb(err);
      return;
    }
    var json = Ltc.safeParse(txt);
    if (json) {
      cb && cb(null, json);
    } else {
      cb && cb('parse err', txt);
    }
  }, t);
};

http.imgTexture = function(url, cb) {
  cc.loader.loadImg(url, function(err, img) {
    if (err) {
      return cb(err);
    } else {
      var tex = null;
      if (!cc.sys.isNative) {
        tex = new cc.Texture2D();
        tex.url = url;
        tex.handleLoadedTexture();
      } else {
        tex = img;
      }
      cb(null, tex);
    }
  });
};
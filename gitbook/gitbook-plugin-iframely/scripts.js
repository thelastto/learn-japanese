function renderIframely(event) {
  var iframes         = document.querySelectorAll('.iframely-wrapper');
  var loaded          = 0;
  var total           = iframes.length;
  var externalScripts = [];

  function ajaxReq(url, callback) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState === XMLHttpRequest.DONE) {
        if (req.status === 200) {
          callback.apply(req, [JSON.parse(req.responseText)]);
        }
      }
    };

    req.open('GET', url, true);
    req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    req.setRequestHeader('Access-Control-Allow-Origin', '*');
    req.setRequestHeader('Referrer', document.location.href);
    req.send();
    return req;
  }

  function checkForScripts(html) {
    var tempElement = document.createElement('div');
    tempElement.innerHTML = html;

    var scripts = tempElement.querySelectorAll('script');

    if (scripts.length) {
      for (var i = 0; i < scripts.length; i++) {
        if (externalScripts.indexOf(scripts[i].src) < 0) {
          externalScripts.push(scripts[i].src);
          scripts[i].parentElement.removeChild(scripts[i]);
        }
      }
    }

    return tempElement;
  }

  function getVideoData(url, wrapper) {
    if (url.length) {
      ajaxReq(url, function(res) {
        var safeHtml = '';

        if (res.html) {
          safeHtml = checkForScripts(res.html);
        } else {
          safeHtml = document.createElement('a');
          safeHtml.href = res.url;
          safeHtml.innerText = res.url;
        }

        wrapper.innerHTML = '';
        wrapper.appendChild(safeHtml);

        loaded++;

        if (loaded === total) {
          externalScripts.forEach(function(script) {
            var newScript = document.createElement('script');
            newScript.src = script;
            document.body.appendChild(newScript);
          });
        }
      });
    }
  }

  for (var i = 0; i < iframes.length; i++) {
    var wrapper = iframes[i];
    var url     = wrapper.dataset.url;

    getVideoData(url, wrapper);
  }
}

require(['gitbook'], function(gitbook) {
  gitbook.events.on('page.change', renderIframely);
});

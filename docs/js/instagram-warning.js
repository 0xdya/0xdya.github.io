(function () {
  var userAgent = navigator.userAgent || '';
  // var jst4testingInBrowser = new URLSearchParams(window.location.search).has('instagram-warning');

  if ((!/Instagram/i.test(userAgent) && !jst4testingInBrowser) || document.getElementById('instagram-warning')) {
    return;
  }

  var warning = document.createElement('aside');
  warning.id = 'instagram-warning';
  warning.className = 'instagram-warning';
  warning.setAttribute('role', 'dialog');
  warning.setAttribute('aria-labelledby', 'instagram-warning-title');
  warning.innerHTML =
    '<div class="instagram-warning__content">' +
      '<div>' +
        '<h2 id="instagram-warning-title">لا تتصفح الموقع على انستقرام...</h2>' +
        '<p>الموقع لا يعمل بشكل جيد فمتصفح انستقرام. <br> افتح الصفحة في متصفح جهازك للحصول على التجربة الكاملة.</p>' +
      '</div>' +
      '<a class="instagram-warning__open" target="_blank" rel="noopener noreferrer">اغلاق الرسالة والاكمال فالتصفح' +
      '</div>' +
    '</div>';

  document.body.appendChild(warning);

  warning.querySelector('.instagram-warning__open').addEventListener('click', function () {
    warning.remove();
  });
}());
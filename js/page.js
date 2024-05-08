(function ($) {
  'use strict';
  $(document).ready(function () {
    var tc = function () {
      var time = '#' + (new Date()).toTimeString().match(/\d{2}:\d{2}:\d{2}/)[0].replace(/:/g, '');
      $('.time').text(time);
      if ($('html').hasClass('night')) {
        $('html').css('background-color', time);
      } else {
        $('.time').css('color', time);
      }
    };
    $('.time').on('click', function () {
      if ($('html').hasClass('night')) {
        $('html').removeClass('night');
        $('html').css('background-color', '#fff');
      } else {
        $('html').addClass('night');
        tc();
        $('.time').css('color', '#fff');
      }
    });
    // init
    if ((new Date()).getHours() > 18 || (new Date()).getHours() < 6) {
      $('html').addClass('night');
      $('.time').css('color', '#fff');
    }
    tc();
    setInterval(tc, 1000);
  });
})(jQuery);

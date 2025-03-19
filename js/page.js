(function ($) {
  "use strict";

  $(document).ready(function () {
    var ruaCounter = 0;
    var titlePhrases = ["らんらん♪", "にゃんぱすー", "にゃおん", "にゃあ"];
    var currentPhraseIndex = 0;
    var $leftCounter = $(".left-counter");
    var $navLink = $leftCounter.find("a");
    var $ruaCounterElement = $("#rua-counter");
    var $ruaCounterText = $(".rua-counter-text");
    var $html = $("html");
    var $themeToggle = $("#theme-toggle");
    var $themeIcon = $("#theme-icon");
    var $ripple = $("#ripple");
    var isNightMode = $html.hasClass("night");
    var ruaCounterVisible = false;
    var $centerText = $(".center-text");
    var themeToggled = false;
    var titleRotationInterval;


    console.log(Object.defineProperties(new Error, {
      message: { get() { window.location.href = 'https://github.com/CikeyQi' } },
      toString: { value() { (new Error).stack.includes('toString@') && (window.location.href = 'https://github.com/CikeyQi') } }
    }));

    function updateTitleAndNavLink() {
      var currentPhrase = titlePhrases[currentPhraseIndex];
      document.title = currentPhrase;
      $navLink.fadeOut("fast", function () {
        $navLink.html('<i class="material-icons md-24">home</i><span class="nav-text">' + currentPhrase + '</span>');
        $navLink.fadeIn("slow");
      });
      currentPhraseIndex = (currentPhraseIndex + 1) % titlePhrases.length;
    }

    function startTitleRotation() {
      if (titleRotationInterval) {
        clearInterval(titleRotationInterval);
      }
      titleRotationInterval = setInterval(updateTitleAndNavLink, 3000);
    }

    startTitleRotation();

    $(".zzz").on("click", function () {
      ruaCounter++;

      if (!ruaCounterVisible) {
        $ruaCounterElement.css("visibility", "visible");
        ruaCounterVisible = true;
      }

      $ruaCounterText.text(" × " + ruaCounter);
      $ruaCounterElement.addClass("animate");
      setTimeout(function () {
        $ruaCounterElement.removeClass("animate");
      }, 300);
      $(this).css("transition", "transform 0.1s");
      $(this).css("transform", "translate(-50%, -50%) scale(0.9)");
      setTimeout(() => {
        $(this).css("transform", "translate(-50%, -50%) scale(1)");
      }, 100);
    });

    document.oncontextmenu = function () {
      return false;
    };

    $themeToggle.on("click", function (event) {

      $centerText.css("visibility", "visible");

      $html.toggleClass("night");
      isNightMode = $html.hasClass("night");
      var iconText = isNightMode ? "brightness_2" : "brightness_4";
      $themeIcon.text(iconText);

      var primaryLight = "#D85555";
      var primaryDark = "#424242";
      var textLight = "#757575";
      var textDark = "#eee";

      if (isNightMode) {
        $themeToggle.css("color", textDark);
        $ripple.css("background-color", primaryDark);
        $centerText.css("color", textDark);
      } else {
        $themeToggle.css("color", primaryLight);
        $ripple.css("background-color", primaryLight);
        $centerText.css("color", textLight);
      }

      if (!themeToggled) {
        $centerText.addClass("visible");
        themeToggled = true;
      }

      startTitleRotation();
    });

    var primaryLight = "#D85555";
    var primaryDark = "#424242";
    var textLight = "#000";
    var textDark = "#eee";

    if (!isNightMode) {
      $themeIcon.text("brightness_4");
      $themeToggle.css("color", primaryLight);
      $ripple.css("background-color", primaryLight);
      $centerText.css("color", textLight);
    } else {
      $themeIcon.text("brightness_2");
      $themeToggle.css("color", textDark);
      $ripple.css("background-color", primaryDark);
      $centerText.css("color", textDark);
    }
  });
})(jQuery);
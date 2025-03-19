(function ($) {
  "use strict";

  $(document).ready(function () {
    let ruaCounter = 0;
    const titlePhrases = ["らんらん♪", "にゃんぱすー", "にゃおん", "にゃあ"];
    let currentPhraseIndex = 0;
    const $navLink = $(".home-link");
    const $ruaCounterElement = $("#rua-counter");
    const $ruaCounterText = $(".rua-counter-text");
    const $html = $("html");
    const $themeToggle = $("#theme-toggle");
    const $themeIcon = $("#theme-icon");
    const $ripple = $("#ripple");
    let isNightMode = $html.hasClass("night");
    let ruaCounterVisible = false;
    const $centerText = $(".center-text");
    let themeToggled = false;
    let titleRotationInterval;

    console.log(Object.defineProperties(new Error, {
      message: { get() { window.location.href = 'https://github.com/CikeyQi' } },
      toString: { value() { (new Error).stack.includes('toString@') && (window.location.href = 'https://github.com/CikeyQi') } }
    }));

    function updateTitleAndNavLink() {
      const currentPhrase = titlePhrases[currentPhraseIndex];
      document.title = currentPhrase;
      $navLink.fadeOut("fast", () => {
        $navLink.html(`<i class="material-icons">home</i><span class="home-text">${currentPhrase}</span>`);
        $navLink.fadeIn("slow");
      });
      currentPhraseIndex = (currentPhraseIndex + 1) % titlePhrases.length;
    }

    function startTitleRotation() {
      clearInterval(titleRotationInterval);
      titleRotationInterval = setInterval(updateTitleAndNavLink, 3000);
    }

    startTitleRotation();

    $(".zzz").on("click", function () {
      ruaCounter++;

      if (!ruaCounterVisible) {
        $ruaCounterElement.css("visibility", "visible");
        ruaCounterVisible = true;
      }

      $ruaCounterText.text(`× ${ruaCounter}`);
      $ruaCounterElement.addClass("animate");
      setTimeout(() => {
        $ruaCounterElement.removeClass("animate");
      }, 300);
      $(this).css("transform", "scale(0.9)").delay(100).queue(function (next) {
        $(this).css("transform", "scale(1)");
        next();
      });
    });

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    $themeToggle.on("click", function () {
      $centerText.css("visibility", "visible");
      $html.toggleClass("night");
      isNightMode = $html.hasClass("night");
      const iconText = isNightMode ? "brightness_2" : "brightness_4";
      $themeIcon.text(iconText);

      const primaryLight = "#D85555";
      const primaryDark = "#424242";
      const textDark = "#eee";
      const textLight = "#757575";

      $themeToggle.css("color", isNightMode ? textDark : primaryLight);
      $ripple.css("background-color", isNightMode ? primaryDark : primaryLight);
      $centerText.css("color", isNightMode ? textDark : textLight);

      if (!themeToggled) {
        $centerText.addClass("visible");
        themeToggled = true;
      }

      startTitleRotation();
    });

    const initialPrimaryLight = "#D85555";
    const initialPrimaryDark = "#424242";
    const initialTextDark = "#eee";
    const initialTextLight = "#757575";

    if (!isNightMode) {
      $themeIcon.text("brightness_4");
      $themeToggle.css("color", initialPrimaryLight);
      $ripple.css("background-color", initialPrimaryLight);
      $centerText.css("color", initialTextLight);
    } else {
      $themeIcon.text("brightness_2");
      $themeToggle.css("color", initialTextDark);
      $ripple.css("background-color", initialPrimaryDark);
      $centerText.css("color", initialTextDark);
    }
  });
})(jQuery);
(() => {
  "use strict";

  const html = document.documentElement;
  const titlePhrases = ["らんらん♪", "にゃんぱすー", "にゃおん", "にゃあ"];
  const longPressDuration = 550;
  const inputGap = 1000;
  const themeStorageKey = "cikeyqi-theme";
  const reducedMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const hiddenData = unpack([
    "9pHFKQ8TdVq5kOHCKwphTVO3lfjTIAlkR6+xkfTUPxJgR6mJ4/LZNhtwMqDy5NFBeGkUX8CF/sNDb00tPNXb4oRrfTVDUrnh",
    "tLFsXHsTzMbnvpZDXQBf+NSzsolXFH9SxOf+ozkvWiFE+82KgEMMMwce9ISk3SkEZzEHydu1vHtlMBXd5eS1zm9DHyHhw/fC",
    "oDZsYkCimvzQLiwFdUShiOHSPwhwaUO0hOfDPRh+T7Gkj/vDJQJ5XamTieTVLwt8X7uU6NTPNwlhQNLx",
  ].join(""));
  const inputRoute = hiddenData[0];
  const hiddenPayload = hiddenData[1];
  const hiddenKey = hiddenData[2];
  const maxInputLength = Math.max(...inputRoute.map((item) => item.length));
  const homeLink = document.querySelector(".home-link");
  const homeText = document.querySelector(".home-text");
  const avatar = document.querySelector(".zzz");
  const counter = document.querySelector("#rua-counter");
  const counterText = document.querySelector(".rua-counter-text");
  const centerText = document.querySelector(".center-text");
  const themeToggle = document.querySelector("#theme-toggle");
  const themeIcon = document.querySelector("#theme-icon");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const socialLinks = [...document.querySelectorAll(".link-list a")];

  if (!homeLink || !homeText || !avatar || !counter || !counterText ||
      !centerText || !themeToggle || !themeIcon) {
    return;
  }

  let ruaCounter = 0;
  let currentPhraseIndex = 0;
  let titleRotationInterval;
  let hiddenModeActive = false;
  let idleTimer;
  let lastActivityAt = 0;
  let avatarPrimaryColor = { red: 216, green: 85, blue: 85 };
  let themeTransitionActive = false;
  let pressState;
  let suppressClickUntil = 0;
  let inputBuffer = "";
  let routeIndex = 0;
  let commitTimer;
  let hiddenText = "";
  let lastActivationPoint;
  let scrambleFrame;

  function unpack(source) {
    const bytes = Uint8Array.from(atob(source), (value, index) => (
      value.charCodeAt(0) ^ ((173 + index * 29) & 255)
    ));

    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function readStoredTheme() {
    try {
      const storedTheme = window.localStorage.getItem(themeStorageKey);
      if (storedTheme === "dark" || storedTheme === "light") {
        return storedTheme === "dark";
      }
    } catch {}

    return Boolean(window.matchMedia?.("(prefers-color-scheme: dark)")?.matches);
  }

  function storeTheme(isNightMode) {
    try {
      window.localStorage.setItem(themeStorageKey, isNightMode ? "dark" : "light");
    } catch {}
  }

  function updateTitleAndNavLink() {
    const currentPhrase = titlePhrases[currentPhraseIndex];

    document.title = currentPhrase;
    scrambleText(homeText, currentPhrase);
    currentPhraseIndex = (currentPhraseIndex + 1) % titlePhrases.length;

    homeLink.classList.remove("is-changing");
    void homeLink.offsetWidth;
    homeLink.classList.add("is-changing");
  }

  function startTitleRotation() {
    window.clearInterval(titleRotationInterval);
    if (document.hidden) {
      return;
    }

    titleRotationInterval = window.setInterval(updateTitleAndNavLink, 3000);
  }

  function scrambleText(element, finalText) {
    const glyphs = "にゃあんぱすらん♪▒░◆◇";
    if (scrambleFrame) {
      cancelAnimationFrame(scrambleFrame);
      scrambleFrame = undefined;
    }

    if (reducedMotionQuery?.matches) {
      element.textContent = finalText;
      return;
    }

    const characters = Array.from(finalText);
    const startedAt = performance.now();
    const duration = 420;

    function renderFrame(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const revealed = Math.floor(progress * characters.length);
      const output = characters.map((character, index) => {
        if (character === " ") {
          return character;
        }
        return index < revealed
          ? character
          : glyphs[Math.floor(Math.random() * glyphs.length)];
      }).join("");

      element.textContent = output;

      if (progress < 1) {
        scrambleFrame = requestAnimationFrame(renderFrame);
      } else {
        element.textContent = finalText;
        scrambleFrame = undefined;
      }
    }

    scrambleFrame = requestAnimationFrame(renderFrame);
  }

  function updateTheme(isNightMode) {
    html.classList.toggle("night", isNightMode);
    themeIcon.textContent = isNightMode ? "brightness_2" : "brightness_4";
    themeToggle.setAttribute("aria-pressed", String(isNightMode));
    themeToggle.setAttribute("aria-label", isNightMode ? "切换到浅色主题" : "切换到深色主题");

    if (themeColor) {
      themeColor.setAttribute("content", isNightMode ? "#303030" : "#f3f3f3");
    }
  }

  function restartAnimation(element, className) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  function switchTheme(event, isNightMode) {
    if (themeTransitionActive) {
      return;
    }

    themeTransitionActive = true;
    const transitionX = Number.isFinite(event?.clientX) ? event.clientX : window.innerWidth / 2;
    const transitionY = Number.isFinite(event?.clientY) ? event.clientY : window.innerHeight / 2;

    html.style.setProperty("--transition-x", `${transitionX}px`);
    html.style.setProperty("--transition-y", `${transitionY}px`);

    const cleanup = () => {
      html.style.removeProperty("--transition-x");
      html.style.removeProperty("--transition-y");
      themeTransitionActive = false;
    };

    storeTheme(isNightMode);
    runFallbackThemeTransition(transitionX, transitionY, isNightMode, cleanup);
  }

  function runFallbackThemeTransition(x, y, isNightMode, cleanup) {
    const transition = document.createElement("div");
    const currentColor = isNightMode ? "#f3f3f3" : "#303030";
    const nextColor = isNightMode ? "#303030" : "#f3f3f3";
    const isShrink = isNightMode;

    transition.className = `theme-transition ${isShrink ? "shrink" : "expand"}`;
    transition.style.setProperty("--transition-x", `${x}px`);
    transition.style.setProperty("--transition-y", `${y}px`);
    transition.style.backgroundColor = isShrink ? currentColor : nextColor;

    if (!isShrink) {
      document.body.style.setProperty("--transition-background", currentColor);
      document.body.classList.add("theme-transitioning");
    }

    updateTheme(isNightMode);
    document.body.append(transition);

    let finished = false;
    let fallbackTimer;
    const finish = () => {
      if (finished) {
        return;
      }

      finished = true;
      window.clearTimeout(fallbackTimer);
      document.body.classList.remove("theme-transitioning");
      document.body.style.removeProperty("--transition-background");
      transition.remove();
      cleanup();
    };

    transition.addEventListener("animationend", finish, { once: true });
    fallbackTimer = window.setTimeout(finish, 900);
    requestAnimationFrame(() => transition.classList.add("active"));
  }

  function loadAvatarPrimaryColor() {
    const backgroundImage = getComputedStyle(avatar).backgroundImage;
    const source = backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];

    if (!source) {
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { willReadFrequently: true });

        if (!context) {
          return;
        }

        canvas.width = 32;
        canvas.height = 32;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const buckets = new Map();

        for (let index = 0; index < pixels.length; index += 16) {
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const alpha = pixels[index + 3];
          const brightness = (red + green + blue) / 3;

          if (alpha < 180 || brightness < 12 || brightness > 248) {
            continue;
          }

          const bucket = [red, green, blue].map((value) => Math.round(value / 16) * 16);
          const key = bucket.join(",");
          const current = buckets.get(key) ?? { count: 0, red: 0, green: 0, blue: 0 };

          current.count += 1;
          current.red += red;
          current.green += green;
          current.blue += blue;
          buckets.set(key, current);
        }

        const dominant = [...buckets.values()].sort((first, second) => second.count - first.count)[0];

        if (dominant) {
          avatarPrimaryColor = {
            red: Math.round(dominant.red / dominant.count),
            green: Math.round(dominant.green / dominant.count),
            blue: Math.round(dominant.blue / dominant.count),
          };
        }
      } catch {
      }
    };
    image.src = source;
  }

  function getAvatarParticleColor() {
    const brightnessFactor = 0.78 + Math.random() * 0.42;
    const adjust = (value) => Math.max(0, Math.min(255, Math.round(value * brightnessFactor)));

    return `rgb(${adjust(avatarPrimaryColor.red)} ${adjust(avatarPrimaryColor.green)} ${adjust(avatarPrimaryColor.blue)})`;
  }

  function burstParticles(element, amount, origin) {
    const bounds = element.getBoundingClientRect();
    const centerX = origin?.x ?? bounds.left + bounds.width / 2;
    const centerY = origin?.y ?? bounds.top + bounds.height / 2;
    const symbols = ["✦", "✧", "✺", "🐾", "·", "⊹", "⋆"];
    if (document.hidden || reducedMotionQuery?.matches) {
      return;
    }

    const particleCount = Math.min(amount ?? 8 + Math.floor(Math.random() * 8), 36);

    for (let index = 0; index < particleCount; index += 1) {
      const particle = document.createElement("span");
      const angle = Math.random() * Math.PI * 2;
      const distance = 55 + Math.random() * 115;
      const size = 11 + Math.random() * 14;
      const rotation = -180 + Math.random() * 360;

      particle.className = "click-particle";
      particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      particle.setAttribute("aria-hidden", "true");
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      particle.style.setProperty("--particle-x", `${Math.cos(angle) * distance}px`);
      particle.style.setProperty("--particle-y", `${Math.sin(angle) * distance}px`);
      particle.style.setProperty("--particle-delay", `${Math.random() * 120}ms`);
      particle.style.setProperty("--particle-color", getAvatarParticleColor());
      particle.style.setProperty("--particle-size", `${size}px`);
      particle.style.setProperty("--particle-rotation", `${rotation}deg`);
      particle.style.setProperty("--particle-duration", `${0.55 + Math.random() * 0.45}s`);
      document.body.append(particle);
      particle.addEventListener("animationend", () => particle.remove(), { once: true });
    }
  }

  function updateAvatarMagnet(event) {
    if (event.pointerType === "touch") {
      return;
    }

    const bounds = avatar.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const offsetX = Math.max(-8, Math.min(8, (event.clientX - centerX) * 0.08));
    const offsetY = Math.max(-8, Math.min(8, (event.clientY - centerY) * 0.08));
    const rotation = Math.max(-4, Math.min(4, (event.clientX - centerX) * 0.04));

    avatar.style.setProperty("--avatar-x", `${offsetX}px`);
    avatar.style.setProperty("--avatar-y", `${offsetY}px`);
    avatar.style.setProperty("--avatar-rotation", `${rotation}deg`);
  }

  function resetAvatarMagnet() {
    avatar.style.setProperty("--avatar-x", "0px");
    avatar.style.setProperty("--avatar-y", "0px");
    avatar.style.setProperty("--avatar-rotation", "0deg");
  }

  function wakePage() {
    const now = performance.now();
    if (idleTimer !== undefined && now - lastActivityAt < 250) {
      return;
    }

    lastActivityAt = now;
    document.body.classList.remove("is-idle");
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      idleTimer = undefined;
      document.body.classList.add("is-idle");
    }, 20000);
  }

  function updatePointerGlow(event) {
    if (event.pointerType === "touch") {
      return;
    }

    document.body.style.setProperty("--pointer-x", `${event.clientX}px`);
    document.body.style.setProperty("--pointer-y", `${event.clientY}px`);
    document.body.classList.add("pointer-active");
    wakePage();
  }

  function updateSocialMagnet(event) {
    if (event.pointerType === "touch") {
      return;
    }

    const link = event.currentTarget;
    const bounds = link.getBoundingClientRect();
    const offsetX = Math.max(-5, Math.min(5, (event.clientX - (bounds.left + bounds.width / 2)) * 0.18));
    const offsetY = Math.max(-5, Math.min(5, (event.clientY - (bounds.top + bounds.height / 2)) * 0.18));

    link.style.setProperty("--social-x", `${offsetX}px`);
    link.style.setProperty("--social-y", `${offsetY}px`);
    wakePage();
  }

  function resetSocialMagnet(event) {
    const link = event.currentTarget;
    link.style.setProperty("--social-x", "0px");
    link.style.setProperty("--social-y", "0px");
  }

  function resetInput() {
    inputBuffer = "";
    routeIndex = 0;
    window.clearTimeout(commitTimer);
    commitTimer = undefined;
  }

  function hideInput() {
    window.clearTimeout(commitTimer);
    commitTimer = undefined;
    centerText.textContent = "";
    centerText.classList.remove("visible");
  }

  function pauseCommit() {
    window.clearTimeout(commitTimer);
    commitTimer = undefined;
  }

  function showInput() {
    if (!inputBuffer) {
      hideInput();
      return;
    }

    centerText.textContent = inputBuffer;
    centerText.classList.add("visible");
  }

  function commitInput() {
    pauseCommit();

    const expectedValue = inputRoute[routeIndex];
    const isValidInput = inputBuffer && inputBuffer === expectedValue;

    hideInput();

    if (!isValidInput) {
      resetInput();
      return false;
    }

    routeIndex += 1;
    inputBuffer = "";

    if (routeIndex === inputRoute.length) {
      activateHiddenMode();
    }

    return true;
  }

  function scheduleCommit() {
    pauseCommit();
    commitTimer = window.setTimeout(commitInput, inputGap);
  }

  function activateHiddenMode() {
    if (hiddenModeActive) {
      return;
    }

    hiddenModeActive = true;
    document.body.classList.add("secret-mode");
    updateTheme(!html.classList.contains("night"));
    burstParticles(avatar, 24, lastActivationPoint);
    centerText.textContent = hiddenText;
    centerText.classList.add("visible");
    resetInput();
  }

  function registerInput(symbol) {
    if (hiddenModeActive) {
      return;
    }

    inputBuffer += symbol;

    if (inputBuffer.length > maxInputLength) {
      const overflowSymbol = inputBuffer.slice(maxInputLength);
      inputBuffer = inputBuffer.slice(0, maxInputLength);
      commitInput();

      if (hiddenModeActive) {
        return;
      }

      inputBuffer = overflowSymbol;
      showInput();
      scheduleCommit();
      return;
    }

    showInput();
    scheduleCommit();
  }

  function decodePayload() {
    try {
      const encoded = hiddenPayload.join("");
      const encryptedBytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
      const decodedBytes = encryptedBytes.map((byte, index) => byte ^ hiddenKey[index % hiddenKey.length]);

      return new TextDecoder().decode(decodedBytes);
    } catch {
      return "";
    }
  }

  function initializeHiddenText() {
    hiddenText = decodePayload();
    hideInput();
  }

  function handleAvatarActivation(symbol, event) {
    const bounds = avatar.getBoundingClientRect();
    const hasActivationCoordinates = Number.isFinite(event?.clientX) &&
      Number.isFinite(event?.clientY) &&
      (Boolean(event?.pointerType) || Number(event?.detail) > 0 || event.clientX !== 0 || event.clientY !== 0);

    lastActivationPoint = {
      x: hasActivationCoordinates
        ? event.clientX
        : bounds.left + bounds.width / 2,
      y: hasActivationCoordinates
        ? event.clientY
        : bounds.top + bounds.height / 2,
    };

    ruaCounter += 1;
    counterText.textContent = `× ${ruaCounter}`;
    counter.classList.add("visible");
    restartAnimation(counter, "animate");
    restartAnimation(avatar, "clicked");
    burstParticles(avatar, undefined, lastActivationPoint);
    registerInput(symbol);
    wakePage();

    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(symbol === "-" ? 18 : 10);
    }
  }

  function handlePointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    pressState = {
      pointerId: event.pointerId,
      startedAt: performance.now(),
    };
    pauseCommit();
    avatar.setPointerCapture?.(event.pointerId);
    avatar.classList.add("pressing");
  }

  function handlePointerUp(event) {
    if (!pressState || pressState.pointerId !== event.pointerId) {
      return;
    }

    const duration = performance.now() - pressState.startedAt;
    pressState = null;
    suppressClickUntil = performance.now() + 500;
    avatar.classList.remove("pressing");
    handleAvatarActivation(duration >= longPressDuration ? "-" : ".", event);
  }

  function cancelPointerPress() {
    pressState = null;
    avatar.classList.remove("pressing");

    if (inputBuffer) {
      scheduleCommit();
    }
  }

  avatar.addEventListener("pointermove", updateAvatarMagnet);
  avatar.addEventListener("pointermove", wakePage);
  avatar.addEventListener("pointerleave", resetAvatarMagnet);
  avatar.addEventListener("pointerdown", handlePointerDown);
  avatar.addEventListener("pointerup", handlePointerUp);
  avatar.addEventListener("pointercancel", cancelPointerPress);
  avatar.addEventListener("lostpointercapture", cancelPointerPress);
  avatar.addEventListener("click", (event) => {
    if (performance.now() < suppressClickUntil) {
      suppressClickUntil = 0;
      return;
    }

    handleAvatarActivation(".", event);
  });

  counter.addEventListener("animationend", (event) => {
    if (event.animationName === "jump") {
      counter.classList.remove("animate");
    }
  });

  avatar.addEventListener("animationend", (event) => {
    if (event.animationName === "avatar-click") {
      avatar.classList.remove("clicked");
    }
  });

  themeToggle.addEventListener("click", (event) => {
    if (themeTransitionActive) {
      return;
    }

    const isNightMode = !html.classList.contains("night");

    switchTheme(event, isNightMode);
    wakePage();
  });

  socialLinks.forEach((link) => {
    link.addEventListener("pointermove", updateSocialMagnet);
    link.addEventListener("pointerleave", resetSocialMagnet);
  });

  window.addEventListener("pointermove", updatePointerGlow, { passive: true });
  window.addEventListener("pointerdown", wakePage, { passive: true });
  window.addEventListener("blur", cancelPointerPress);
  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.clearTimeout(idleTimer);
      idleTimer = undefined;
      window.clearInterval(titleRotationInterval);
      document.body.classList.remove("pointer-active");
      cancelPointerPress();
    } else {
      wakePage();
      startTitleRotation();
    }
  });

  initializeHiddenText();
  loadAvatarPrimaryColor();
  updateTheme(readStoredTheme());
  wakePage();
  startTitleRotation();
})();

(() => {
  "use strict";

  if (!window.matchMedia("(pointer: fine)").matches) {
    return;
  }

  const cursor = document.createElement("div");
  cursor.id = "cursor";
  cursor.className = "hidden";
  document.body.append(cursor);

  const cursorOffset = 8;
  let currentPosition = null;
  let previousPosition = null;
  let animationFrame;

  const lerp = (start, end, amount) => start + (end - start) * amount;

  function moveCursor(x, y) {
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  }

  function updateHoverState(target) {
    const interactiveElement = target instanceof Element
      ? target.closest("a, button, [role=\"button\"]")
      : null;
    const isAvatar = interactiveElement?.classList.contains("zzz") ?? false;

    cursor.classList.toggle("hover", Boolean(interactiveElement));
    cursor.classList.toggle("avatar-hover", isAvatar);
  }

  function render() {
    if (currentPosition) {
      if (!previousPosition) {
        previousPosition = { ...currentPosition };
      } else {
        previousPosition.x = lerp(previousPosition.x, currentPosition.x, 0.45);
        previousPosition.y = lerp(previousPosition.y, currentPosition.y, 0.45);
      }

      moveCursor(previousPosition.x, previousPosition.y);
    }

    animationFrame = window.requestAnimationFrame(render);
  }

  function startRendering() {
    if (!animationFrame && !document.hidden) {
      animationFrame = window.requestAnimationFrame(render);
    }
  }

  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") {
      return;
    }

    currentPosition = {
      x: event.clientX - cursorOffset,
      y: event.clientY - cursorOffset,
    };
    cursor.classList.remove("hidden");
    updateHoverState(event.target);
  }, { passive: true });

  window.addEventListener("pointerover", (event) => {
    updateHoverState(event.target);
  }, { passive: true });

  window.addEventListener("pointerout", (event) => {
    updateHoverState(event.relatedTarget);
  }, { passive: true });

  window.addEventListener("pointerdown", () => {
    cursor.classList.add("active");
  }, { passive: true });

  window.addEventListener("pointerup", () => {
    cursor.classList.remove("active");
  }, { passive: true });

  window.addEventListener("blur", () => {
    cursor.classList.add("hidden");
    cursor.classList.remove("active", "hover", "avatar-hover");
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
      cursor.classList.add("hidden");
    } else {
      startRendering();
    }
  });

  startRendering();
})();

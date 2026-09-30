(function () {
  "use strict";

  var progressFill = document.getElementById("progressFill");
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll("[data-speed]"));
  var ticking = false;

  function updateOnScroll() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressFill) progressFill.style.width = progress + "%";

    parallaxEls.forEach(function (el) {
      var speed = parseFloat(el.getAttribute("data-speed")) || 0;
      var offset = scrollTop * speed;
      el.style.transform = "translateY(" + offset + "px)";
    });

    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  }, { passive: true });

  updateOnScroll();

  var revealTargets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    revealTargets.forEach(function (el) { observer.observe(el); });

    var amphora = document.querySelector(".amphora-showcase");
    if (amphora) {
      var amphoraObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      }, { threshold: 0.4 });
      amphoraObserver.observe(amphora);
    }
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  var heroSky = document.getElementById("heroSky");
  if (heroSky) {
    var starCount = 70;
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < starCount; i++) {
      var star = document.createElement("span");
      star.className = "star";
      star.style.top = Math.random() * 70 + "%";
      star.style.left = Math.random() * 100 + "%";
      star.style.animationDelay = (Math.random() * 3.5).toFixed(2) + "s";
      star.style.opacity = (0.3 + Math.random() * 0.5).toFixed(2);
      fragment.appendChild(star);
    }
    heroSky.appendChild(fragment);
  }

  var chestButton = document.getElementById("chestButton");
  var particlesLayer = document.getElementById("particlesLayer");

  function burstParticles() {
    if (!particlesLayer) return;
    var count = 24;
    for (var i = 0; i < count; i++) {
      var particle = document.createElement("span");
      particle.className = "particle";
      var angle = Math.random() * Math.PI * 2;
      var distance = 60 + Math.random() * 90;
      var dx = Math.cos(angle) * distance;
      var dy = Math.sin(angle) * distance - 40;
      particle.style.setProperty("--dx", dx + "px");
      particle.style.setProperty("--dy", dy + "px");
      particle.style.animationDelay = (Math.random() * 0.15).toFixed(2) + "s";
      particlesLayer.appendChild(particle);
      (function (p) {
        setTimeout(function () { p.remove(); }, 1300);
      })(particle);
    }
  }

  if (chestButton) {
    chestButton.addEventListener("click", function () {
      var willOpen = chestButton.getAttribute("aria-expanded") !== "true";
      chestButton.setAttribute("aria-expanded", String(willOpen));
      if (willOpen) burstParticles();
    });
  }

  var ctaButton = document.getElementById("ctaButton");
  var ctaToast = document.getElementById("ctaToast");
  var toastTimer = null;

  if (ctaButton) {
    ctaButton.addEventListener("click", function (event) {
      var rect = ctaButton.getBoundingClientRect();
      var ripple = document.createElement("span");
      var size = Math.max(rect.width, rect.height);
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (event.clientX - rect.left - size / 2) + "px";
      ripple.style.top = (event.clientY - rect.top - size / 2) + "px";
      ctaButton.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 650);

      if (ctaToast) {
        ctaToast.classList.add("is-visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
          ctaToast.classList.remove("is-visible");
        }, 3200);
      }
    });
  }

  var cursorDot = document.getElementById("cursorDot");
  var cursorRing = document.getElementById("cursorRing");
  var supportsFinePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  if (supportsFinePointer && cursorDot && cursorRing) {
    document.body.classList.add("cursor-ready");
    var ringX = 0, ringY = 0, targetX = 0, targetY = 0;

    window.addEventListener("mousemove", function (e) {
      targetX = e.clientX;
      targetY = e.clientY;
      cursorDot.style.left = targetX + "px";
      cursorDot.style.top = targetY + "px";
    });

    function animateRing() {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      cursorRing.style.left = ringX + "px";
      cursorRing.style.top = ringY + "px";
      window.requestAnimationFrame(animateRing);
    }
    animateRing();

    var interactiveEls = document.querySelectorAll(".interactive, button, a");
    interactiveEls.forEach(function (el) {
      el.addEventListener("mouseenter", function () { cursorRing.classList.add("is-active"); });
      el.addEventListener("mouseleave", function () { cursorRing.classList.remove("is-active"); });
    });
  }
})();

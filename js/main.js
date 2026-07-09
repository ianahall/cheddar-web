/* ============================================================
   Cheddar — cheddarcam.com
   Progressive enhancement only. The site is fully readable
   with JS disabled; this adds audio demos + gentle motion.
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* --------------------------------------------------------
     Play Store link — single source of truth. When the
     listing is live, paste the URL here and every "Get the
     app" button updates. Until then they stay inert ("#").
     -------------------------------------------------------- */
  var PLAY_STORE_URL = ""; // e.g. "https://play.google.com/store/apps/details?id=com.snacksdesign.cheddar"
  if (PLAY_STORE_URL) {
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-play-store]"),
      function (a) {
        a.setAttribute("href", PLAY_STORE_URL);
        a.setAttribute("rel", "noopener");
      }
    );
  }

  /* --------------------------------------------------------
     Mobile nav: hamburger toggles the nav pill into a dropdown.
     Closes on link click, Escape, or an outside click.
     -------------------------------------------------------- */
  (function () {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.getElementById("primary-nav");
    if (!header || !toggle || !menu) return;

    function setOpen(open) {
      header.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!header.classList.contains("nav-open"));
    });
    Array.prototype.forEach.call(menu.querySelectorAll("a"), function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    document.addEventListener("click", function (e) {
      if (header.classList.contains("nav-open") && !header.contains(e.target)) {
        setOpen(false);
      }
    });
  })();

  /* --------------------------------------------------------
     Audio: one clip at a time. Shared across voice chips and
     ContentCards. Any element with [data-audio] participates.
     -------------------------------------------------------- */
  var current = null;        // currently playing <audio>
  var currentEl = null;      // its trigger element

  function stopCurrent() {
    if (current) {
      current.pause();
      current.currentTime = 0;
    }
    if (currentEl) {
      currentEl.classList.remove("is-playing");
      currentEl.setAttribute("aria-pressed", "false");
    }
    current = null;
    currentEl = null;
  }

  function wireAudio(el) {
    var src = el.getAttribute("data-audio");
    if (!src) return;

    var audio = new Audio();
    audio.preload = "none";
    audio.src = src;

    el.setAttribute("aria-pressed", "false");

    audio.addEventListener("ended", function () {
      el.classList.remove("is-playing");
      el.setAttribute("aria-pressed", "false");
      if (current === audio) { current = null; currentEl = null; }
    });

    audio.addEventListener("error", function () {
      // Missing/unsupported clip: fail quietly, don't leave it "playing".
      el.classList.remove("is-playing");
      el.setAttribute("aria-pressed", "false");
      el.classList.add("is-unavailable");
    });

    el.addEventListener("click", function () {
      var isThis = current === audio;
      stopCurrent();
      if (isThis) return;           // second click on same = stop

      var playPromise = audio.play();
      current = audio;
      currentEl = el;
      el.classList.add("is-playing");
      el.setAttribute("aria-pressed", "true");

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          el.classList.remove("is-playing");
          el.setAttribute("aria-pressed", "false");
          if (current === audio) { current = null; currentEl = null; }
        });
      }
    });
  }

  Array.prototype.forEach.call(
    document.querySelectorAll("[data-audio]"),
    wireAudio
  );

  // Stop audio when the tab is hidden (kids wander off).
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopCurrent();
  });

  /* --------------------------------------------------------
     Graceful screenshots: any element with data-shot may
     reference a real screenshot. If it loads, swap it in and
     hide the placeholder. If it 404s, the placeholder stays.
     -------------------------------------------------------- */
  Array.prototype.forEach.call(
    document.querySelectorAll("[data-shot]"),
    function (host) {
      var src = host.getAttribute("data-shot");
      if (!src) return;
      var probe = new Image();
      probe.onload = function () {
        var img = document.createElement("img");
        img.src = src;
        img.alt = host.getAttribute("data-shot-alt") || "";
        img.decoding = "async";
        img.loading = "lazy";
        host.insertBefore(img, host.firstChild);
        host.classList.add("has-shot");
      };
      probe.src = src;   // if it 404s, onload never fires; placeholder stays
    }
  );

  /* --------------------------------------------------------
     Full-width photo band: swap in the real lifestyle photo
     as a background once it loads; otherwise keep the gradient
     placeholder. (Setting .style is CSSOM, allowed under CSP.)
     -------------------------------------------------------- */
  Array.prototype.forEach.call(
    document.querySelectorAll("[data-photo]"),
    function (band) {
      var src = band.getAttribute("data-photo");
      if (!src) return;
      var probe = new Image();
      probe.onload = function () {
        band.style.backgroundImage = "url(" + JSON.stringify(src) + ")";
        band.classList.add("has-photo");
      };
      probe.src = src;
    }
  );

  /* --------------------------------------------------------
     Hero camera: pressing the shutter flashes the screen white
     and advances to the next photo frame (placeholders for now).
     -------------------------------------------------------- */
  (function () {
    var cam = document.querySelector("[data-hero-cam]");
    if (!cam) return;
    var frames = Array.prototype.slice.call(cam.querySelectorAll(".hcam-frame"));
    var shutter = cam.querySelector("[data-hero-shutter]");
    var flash = cam.querySelector("[data-hero-flash]");
    if (frames.length < 2 || !shutter) return;
    var idx = 0;

    shutter.addEventListener("click", function () {
      if (flash) {
        flash.classList.remove("is-flash");
        void flash.offsetWidth; // restart the flash animation
        flash.classList.add("is-flash");
      }
      var next = (idx + 1) % frames.length;
      // Swap the photo at the peak of the flash so the change is hidden.
      window.setTimeout(function () {
        frames[idx].classList.remove("is-current");
        frames[next].classList.add("is-current");
        idx = next;
      }, prefersReduced ? 0 : 120);
    });
  })();

  /* --------------------------------------------------------
     Interactive app demo: press the shutter to snap photos,
     then tap one to hear Cheddar describe it in a character
     voice. Content lives in SHOTS — swap the emoji subjects
     for real photo paths anytime.
     -------------------------------------------------------- */
  (function () {
    var stage = document.querySelector("[data-appdemo]");
    if (!stage) return;
    var cam = stage.querySelector("[data-appcam]");
    var shutter = stage.querySelector("[data-appcam-shutter]");
    var flash = stage.querySelector("[data-appcam-flash]");
    var again = stage.querySelector("[data-appcam-again]");
    var play = stage.querySelector("[data-appcam-play]");
    var titleEl = stage.querySelector("[data-ad-title]");
    var descEl = stage.querySelector("[data-ad-desc]");
    var stepEmoji = stage.querySelector("[data-ad-emoji]");
    var checks = {
      snap: stage.querySelector('[data-ad-check="snap"]'),
      listen: stage.querySelector('[data-ad-check="listen"]')
    };
    if (!cam || !shutter) return;

    // The Wizard's voice (Cheddar Says). Swap for a per-photo clip later.
    var WIZARD_VOICE = "assets/voices/voice_preview_charon.m4a";
    var audio = null;

    function setStep(emoji, title, desc) {
      if (stepEmoji) stepEmoji.textContent = emoji;
      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = desc;
    }
    function stopAudio() {
      if (audio) { audio.pause(); audio = null; }
      if (play) play.classList.remove("is-playing");
    }
    function playVoice() {
      stopAudio();
      try {
        audio = new Audio(WIZARD_VOICE);
        if (play) play.classList.add("is-playing");
        audio.addEventListener("ended", function () { if (play) play.classList.remove("is-playing"); audio = null; });
        audio.addEventListener("error", function () { if (play) play.classList.remove("is-playing"); audio = null; });
        var p = audio.play();
        if (p && p.catch) p.catch(function () { if (play) play.classList.remove("is-playing"); });
      } catch (e) { if (play) play.classList.remove("is-playing"); }
    }

    function snap() {
      if (cam.classList.contains("show-say")) return;
      if (flash) { flash.classList.remove("is-flash"); void flash.offsetWidth; flash.classList.add("is-flash"); }
      if (checks.snap) checks.snap.classList.add("is-done");
      window.setTimeout(function () {
        cam.classList.add("show-say");
        if (checks.listen) checks.listen.classList.add("is-done");
        setStep("🧀", "That's Cheddar Says", "Cheddar looks at the photo and describes it out loud — here, a little poem in the Wizard's voice. Tap ▶ to replay, or Try Again to snap another.");
        playVoice();
      }, prefersReduced ? 0 : 300);
    }

    shutter.addEventListener("click", snap);
    if (play) play.addEventListener("click", playVoice);
    if (again) again.addEventListener("click", function () {
      stopAudio();
      cam.classList.remove("show-say");
      setStep("📸", "Tap the big yellow shutter", "Just say “cheese!” and Cheddar grabs the shot — no aiming, no reading, no fuss.");
    });
    document.addEventListener("visibilitychange", function () { if (document.hidden) stopAudio(); });
  })();

  /* --------------------------------------------------------
     "Made for real kids" behavior → solution explorer:
     clicking a kid-moment tab reveals its paired feature.
     -------------------------------------------------------- */
  (function () {
    var kbx = document.querySelector("[data-kbx]");
    if (!kbx) return;
    var items = Array.prototype.slice.call(kbx.querySelectorAll("[data-kbx-item]"));
    var panels = Array.prototype.slice.call(kbx.querySelectorAll("[data-kbx-panel]"));
    if (!items.length) return;

    function activate(i) {
      items.forEach(function (it, idx) {
        var on = idx === i;
        it.classList.toggle("is-active", on);
        it.setAttribute("aria-selected", on ? "true" : "false");
        it.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p, idx) {
        var on = idx === i;
        p.classList.toggle("is-active", on);
        if (on) { p.hidden = false; } else { p.hidden = true; }
      });
    }
    items.forEach(function (it, i) {
      it.addEventListener("click", function () { activate(i); });
      it.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (i + 1) % items.length;
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = (i - 1 + items.length) % items.length;
        if (n !== null) { e.preventDefault(); activate(n); items[n].focus(); }
      });
    });
  })();

  /* --------------------------------------------------------
     Features carousel: one phone frame, a horizontally
     scroll-snapped track of slides. Native touch/trackpad
     swipe drives it; arrows + dots + keyboard enhance it.
     The caption (title/desc/accent) + active dot follow the
     slide that's centered in the viewport.
     -------------------------------------------------------- */
  Array.prototype.forEach.call(
    document.querySelectorAll("[data-carousel]"),
    function (track) {
      var slides = Array.prototype.slice.call(
        track.querySelectorAll(".carousel-slide")
      );
      if (!slides.length) return;

      var section = track.closest(".carousel-section") || document;
      var caption = section.querySelector("[data-carousel-caption]");
      var dotsWrap = section.querySelector("[data-carousel-dots]");
      var prevBtn = section.querySelector("[data-carousel-prev]");
      var nextBtn = section.querySelector("[data-carousel-next]");
      var titleEl = caption && caption.querySelector(".cc-slide-title");
      var descEl = caption && caption.querySelector(".cc-slide-desc");

      var active = 0;
      var dots = [];

      // Build dots
      if (dotsWrap) {
        slides.forEach(function (slide, i) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.className = "carousel-dot" + (i === 0 ? " is-active" : "");
          dot.setAttribute("role", "tab");
          dot.setAttribute(
            "aria-label",
            slide.getAttribute("data-title") || "Feature " + (i + 1)
          );
          dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
          dot.addEventListener("click", function () {
            goTo(i);
          });
          dotsWrap.appendChild(dot);
          dots.push(dot);
        });
      }

      function accentClassFor(slide) {
        var a = slide.getAttribute("data-accent");
        return a ? "accent-" + a : "accent-yellow";
      }

      function render(i) {
        active = i;
        var slide = slides[i];
        if (caption) {
          caption.className = "carousel-caption " + accentClassFor(slide);
        }
        if (titleEl) titleEl.innerHTML = slide.getAttribute("data-title") || "";
        if (descEl) descEl.innerHTML = slide.getAttribute("data-desc") || "";
        dots.forEach(function (dot, di) {
          var on = di === i;
          dot.classList.toggle("is-active", on);
          dot.setAttribute("aria-selected", on ? "true" : "false");
        });
        if (prevBtn) prevBtn.disabled = i === 0;
        if (nextBtn) nextBtn.disabled = i === slides.length - 1;
      }

      function goTo(i) {
        i = Math.max(0, Math.min(slides.length - 1, i));
        slides[i].scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "nearest",
          inline: "center"
        });
        // Fallback for browsers that ignore inline scrollIntoView inside
        // an overflow container: set scrollLeft directly.
        track.scrollTo({
          left: slides[i].offsetLeft - track.offsetLeft,
          behavior: prefersReduced ? "auto" : "smooth"
        });
        render(i);
      }

      if (prevBtn) prevBtn.addEventListener("click", function () { goTo(active - 1); });
      if (nextBtn) nextBtn.addEventListener("click", function () { goTo(active + 1); });

      track.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); goTo(active + 1); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); goTo(active - 1); }
      });

      // Sync caption to whatever slide is centered while swiping.
      if ("IntersectionObserver" in window) {
        var cio = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
                var idx = slides.indexOf(entry.target);
                if (idx !== -1 && idx !== active) render(idx);
              }
            });
          },
          { root: track, threshold: [0.55, 0.75] }
        );
        slides.forEach(function (s) { cio.observe(s); });
      } else {
        // No IO: fall back to a debounced scroll handler.
        var t;
        track.addEventListener("scroll", function () {
          clearTimeout(t);
          t = setTimeout(function () {
            var idx = Math.round(track.scrollLeft / track.clientWidth);
            render(Math.max(0, Math.min(slides.length - 1, idx)));
          }, 90);
        });
      }

      render(0);
    }
  );

  /* --------------------------------------------------------
     Mouse-tilt on showcase phones. The phone lifts slightly and
     tilts toward the cursor, pivoting from its base. Purely an
     enhancement — to roll it back, delete this whole block (the
     CSS :hover lift stays as a graceful fallback).
     -------------------------------------------------------- */
  (function () {
    if (prefersReduced) return;
    var MAX_TILT = 3; // degrees at the far left/right edge
    Array.prototype.forEach.call(
      document.querySelectorAll(".fpanel-media .phone, .download-visual .phone"),
      function (el) {
        el.addEventListener("mousemove", function (e) {
          var r = el.getBoundingClientRect();
          var x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); // 0=left, 1=right
          var tilt = (x - 0.5) * 2 * MAX_TILT;
          el.style.transform = "translateY(-3px) rotate(" + tilt.toFixed(2) + "deg)";
        });
        el.addEventListener("mouseleave", function () {
          el.style.transform = "";
        });
      }
    );
  })();

  /* --------------------------------------------------------
     Hero parallax: the phone and the character speech bubbles
     drift subtly toward the cursor, in the same mouse-driven
     language as the feature-phone tilt above. Layered depths
     give the bubbles a gentle sense of float. Purely an
     enhancement — to roll it back, delete this whole block;
     the CSS transitions are harmless on their own.
     -------------------------------------------------------- */
  (function () {
    if (prefersReduced) return;
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var phone = hero.querySelector(".hero-phone");
    var bubbles = Array.prototype.slice.call(hero.querySelectorAll(".hero-say"));
    if (!phone && !bubbles.length) return;

    var raf = null, nx = 0, ny = 0;
    function apply() {
      raf = null;
      if (phone) {
        phone.style.transform =
          "translate(" + (nx * 6).toFixed(1) + "px, " + (ny * 5).toFixed(1) +
          "px) rotate(" + (nx * 2.2).toFixed(2) + "deg)";
      }
      bubbles.forEach(function (b, i) {
        var depth = 9 + (i % 2) * 7; // alternating 9 / 16px for a layered feel
        b.style.transform =
          "translate(" + (nx * depth).toFixed(1) + "px, " +
          (ny * depth * 0.6).toFixed(1) + "px)";
      });
    }
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
      if (!raf) raf = window.requestAnimationFrame(apply);
    });
    hero.addEventListener("mouseleave", function () {
      nx = ny = 0;
      if (phone) phone.style.transform = "";
      bubbles.forEach(function (b) { b.style.transform = ""; });
    });
  })();

  /* --------------------------------------------------------
     Scroll-in reveal (skipped entirely under reduced motion).
     -------------------------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(reveals, function (el) {
      el.classList.add("is-in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    Array.prototype.forEach.call(reveals, function (el) {
      io.observe(el);
    });
  }
})();

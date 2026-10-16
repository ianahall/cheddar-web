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
     Animated mascots: each [data-mascot-video] swaps its still
     for a transparent loop. Safari/iOS only render alpha from
     HEVC (.mov); everyone else gets VP9 (.webm). Nothing loads
     until the page has finished and the mascot is near the
     viewport and actually displayed (the footer one is hidden
     on phones). A [data-mascot-eager] stage (the hero) attaches
     at once and shows the video from the start, no crossfade:
     the still is only a fallback for when playback is refused.
     Reduced-motion users keep the stills.
     -------------------------------------------------------- */
  (function () {
    var stages = document.querySelectorAll("[data-mascot-video]");
    if (!stages.length || prefersReduced || !("IntersectionObserver" in window)) return;
    var ua = navigator.userAgent;
    var isWebKit = /AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg|Android/.test(ua);

    function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } // refused: still stays

    // Playback refused or the file failed: drop the video and put the still back.
    function fallback(stage, v) {
      if (stage._mascotVideo !== v) return;
      stage._mascotVideo = null;
      stage.classList.remove("has-video", "is-playing");
      if (v.parentNode) v.parentNode.removeChild(v);
    }

    function attach(stage) {
      var eager = stage.hasAttribute("data-mascot-eager");
      var v = document.createElement("video");
      v.className = "mascot-video";
      v.muted = true;
      v.loop = true;
      v.autoplay = true;
      v.playsInline = true;
      v.preload = eager ? "auto" : "metadata";
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      v.setAttribute("aria-hidden", "true");
      v.addEventListener("playing", function () { stage.classList.add("is-playing"); });
      v.addEventListener("error", function () { fallback(stage, v); });
      v.src = stage.getAttribute(isWebKit ? "data-mov" : "data-webm");
      stage.appendChild(v);
      stage._mascotVideo = v;
      if (eager) stage.classList.add("has-video"); // hide the still now; no fade
      var p = v.play();
      if (p && p.catch) p.catch(function (err) {
        // Only a genuine refusal (autoplay policy, unsupported file) brings the still
        // back. An AbortError just means the browser paused us mid-start, e.g. a
        // background tab: the video is fine and resumes with the tab.
        if (eager && err && (err.name === "NotAllowedError" || err.name === "NotSupportedError")) fallback(stage, v);
      });
      return v;
    }

    function init() {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var stage = e.target;
          if (e.isIntersecting) {
            if (!stage._mascotVideo) {
              if (!stage.offsetWidth) return; // display:none (e.g. footer on phones)
              attach(stage);
            } else play(stage._mascotVideo);
          } else if (stage._mascotVideo) {
            stage._mascotVideo.pause(); // don't burn battery looping off-screen
          }
        });
      }, { rootMargin: "300px 0px" });
      Array.prototype.forEach.call(stages, function (s) { io.observe(s); });
    }

    // Browsers pause silent videos in background tabs; pick them back up on return.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) return;
      Array.prototype.forEach.call(stages, function (s) { if (s._mascotVideo) play(s._mascotVideo); });
    });

    // The hero doesn't wait for window load — that delay is what made the swap visible.
    Array.prototype.forEach.call(stages, function (s) {
      if (s.hasAttribute("data-mascot-eager") && s.offsetWidth) attach(s);
    });
    if (document.readyState === "complete") init();
    else window.addEventListener("load", init);
  })();

  /* --------------------------------------------------------
     Play Store link — single source of truth. When the
     listing is live, paste the URL here and every "Get the
     app" button updates. Until then they stay inert ("#").
     -------------------------------------------------------- */
  var PLAY_STORE_URL = ""; // live listing: "https://play.google.com/store/apps/details?id=com.cheddarcam.android"
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
     Storytime cards: each card's data-kb (seconds, roughly the
     clip length) becomes the --kb-dur CSS variable that paces
     the Ken Burns zoom while its story plays. Set via CSSOM
     because our CSP blocks inline style attributes.
     -------------------------------------------------------- */
  Array.prototype.forEach.call(
    document.querySelectorAll(".story-card[data-kb]"),
    function (card) {
      card.style.setProperty("--kb-dur", card.getAttribute("data-kb") + "s");
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
     Mouse-tilt on showcase phones. The phone lifts slightly and
     tilts toward the cursor, pivoting from its base. Purely an
     enhancement — to roll it back, delete this whole block (the
     CSS :hover lift stays as a graceful fallback).
     -------------------------------------------------------- */
  (function () {
    if (prefersReduced) return;
    var MAX_TILT = 2; // degrees at the far left/right edge
    Array.prototype.forEach.call(
      document.querySelectorAll(".fpanel-media .phone, .download-visual .phone, .hero-phone"),
      function (el) {
        el.addEventListener("mousemove", function (e) {
          var r = el.getBoundingClientRect();
          var x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); // 0=left, 1=right
          var tilt = (x - 0.5) * 2 * MAX_TILT;
          el.style.transform = "translateY(-2px) rotate(" + tilt.toFixed(2) + "deg)";
        });
        el.addEventListener("mouseleave", function () {
          el.style.transform = "";
        });
      }
    );
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

(function () {
  /* mobile nav */
  var nav = document.getElementById("mainNav"),
    tog = document.getElementById("menuToggle"),
    scrim = document.getElementById("scrim");
  function openNav() {
    nav.classList.add("open");
    scrim.hidden = false;
    tog.setAttribute("aria-expanded", "true");
  }
  function closeNav() {
    nav.classList.remove("open");
    scrim.hidden = true;
    tog.setAttribute("aria-expanded", "false");
  }
  tog.addEventListener("click", function () {
    nav.classList.contains("open") ? closeNav() : openNav();
  });
  document.getElementById("navClose").addEventListener("click", closeNav);
  scrim.addEventListener("click", closeNav);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeNav();
      closeDD();
    }
  });

  /* dropdown */
  var dd = document.querySelector(".has-dd"),
    ddBtn = dd.querySelector("button");
  function closeDD() {
    dd.classList.remove("open");
    ddBtn.setAttribute("aria-expanded", "false");
  }
  ddBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var o = dd.classList.toggle("open");
    ddBtn.setAttribute("aria-expanded", o);
  });
  document.addEventListener("click", function (e) {
    if (!dd.contains(e.target)) closeDD();
  });

  /* map pins <-> cards */
  var cards = document.querySelectorAll(".loc"),
    pins = document.querySelectorAll(".mpin");
  function hl(id, on) {
    cards.forEach(function (c) {
      c.classList.toggle("hl", on && c.dataset.loc === id);
    });
    pins.forEach(function (p) {
      p.classList.toggle("hl", on && p.dataset.loc === id);
    });
  }
  pins.forEach(function (p) {
    var id = p.dataset.loc;
    function go() {
      var c = document.querySelector('.loc[data-loc="' + id + '"]');
      if (c) {
        c.scrollIntoView({ behavior: "smooth", block: "center" });
        hl(id, true);
      }
    }
    p.addEventListener("click", go);
    p.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    });
    p.addEventListener("mouseenter", function () {
      hl(id, true);
    });
    p.addEventListener("mouseleave", function () {
      hl(id, false);
    });
  });
  cards.forEach(function (c) {
    c.addEventListener("mouseenter", function () {
      hl(c.dataset.loc, true);
    });
    c.addEventListener("mouseleave", function () {
      hl(c.dataset.loc, false);
    });
  });

  /* live open / closed in Chicago time */
  function chicagoNow() {
    var f = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(new Date());
    var o = {};
    f.forEach(function (p) {
      o[p.type] = p.value;
    });
    var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      day: map[o.weekday],
      mins: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10),
    };
  }
  function fmt(m) {
    var h = Math.floor(m / 60),
      mm = m % 60,
      ap = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return h + (mm ? ":" + String(mm).padStart(2, "0") : "") + ap;
  }
  function status(el, label, wk, sat, now) {
    if (!el) return;
    var h = now.day >= 1 && now.day <= 5 ? wk : now.day === 6 ? sat : null;
    var open = h && now.mins >= h[0] && now.mins < h[1];
    el.classList.toggle("open", !!open);
    el.lastElementChild.textContent =
      label + (open ? ": open now, until " + fmt(h[1]) : ": closed now");
  }
  function updateHours() {
    var now = chicagoNow();
    status(
      document.getElementById("stCS"),
      "Customer service",
      [480, 1200],
      [480, 1020],
      now,
    );
    status(
      document.getElementById("stSales"),
      "Sales",
      [480, 1230],
      [480, 1050],
      now,
    );
    document.querySelectorAll(".hours tr").forEach(function (tr) {
      var d = tr.dataset.days.split("-").map(Number),
        lo = d[0],
        hi = d[1] || d[0];
      tr.classList.toggle("today", now.day >= lo && now.day <= hi);
    });
    document.querySelectorAll(".status-badge").forEach(function(badge) {
      if(!badge.dataset.open) return;
      var op = badge.dataset.open.split(":").map(Number);
      var cl = badge.dataset.close.split(":").map(Number);
      var wk = [op[0]*60 + (op[1]||0), cl[0]*60 + (cl[1]||0)];
      var satOp = badge.dataset.satOpen.split(":").map(Number);
      var satCl = badge.dataset.satClose.split(":").map(Number);
      var sat = [satOp[0]*60 + (satOp[1]||0), satCl[0]*60 + (satCl[1]||0)];
      var h = now.day >= 1 && now.day <= 5 ? wk : now.day === 6 ? sat : null;
      var open = h && now.mins >= h[0] && now.mins < h[1];
      badge.textContent = open ? "Open now" : "Closed";
      badge.className = "status-badge badge-" + (open ? "open" : "closed");
    });
  }
  updateHours();
  setInterval(updateHours, 60000);

  /* contact form – demo submit */
  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("cf-name");
      var email = document.getElementById("cf-email");
      var msg = document.getElementById("cf-msg");
      var valid = true;
      [name, email, msg].forEach(function (f) {
        if (!f) return;
        if (!f.value.trim()) {
          f.style.borderColor = "#c0392b";
          f.style.boxShadow = "0 0 0 3px rgba(192,57,43,0.15)";
          valid = false;
        } else {
          f.style.borderColor = "";
          f.style.boxShadow = "";
        }
      });
      if (!valid) return;
      var btn = document.getElementById("cf-submit");
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      setTimeout(function () {
        contactForm.style.display = "none";
        var succ = document.getElementById("formSuccess");
        if (succ) succ.style.display = "block";
      }, 800);
    });
  }

  /* blog filter pills – active state */
  document.querySelectorAll(".filter-pill").forEach(function (pill) {
    pill.addEventListener("click", function () {
      document.querySelectorAll(".filter-pill").forEach(function (p) {
        p.classList.remove("active");
      });
      pill.classList.add("active");
    });
  });

  /* external links open in a new tab (keeps the preview open, works inside frames) */
  document.querySelectorAll('a[href^="https://"]').forEach(function (a) {
    if (!a.target) {
      a.target = "_blank";
      a.rel = "noopener";
    }
  });
})();

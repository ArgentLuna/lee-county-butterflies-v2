(function () {
  "use strict";

  function yorkMonth() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      month: "numeric",
    }).formatToParts(new Date());
    var m = parts.find(function (p) {
      return p.type === "month";
    });
    return parseInt(m.value, 10);
  }

  function chipFor(el, month) {
    if (el.getAttribute("data-garden") === "1") return "Garden colonizer";
    if (month === 8) return el.getAttribute("data-august-chip");
    var peak = (el.getAttribute("data-peak") || "")
      .split(",")
      .filter(Boolean)
      .map(Number);
    var flight = (el.getAttribute("data-flight") || "")
      .split(",")
      .filter(Boolean)
      .map(Number);
    if (peak.indexOf(month) !== -1) return "Common now";
    if (flight.indexOf(month) !== -1) return "Possible";
    return "Unlikely this month";
  }

  function chipClass(label) {
    if (label === "Common now") return "chip chip-common";
    if (label === "Possible") return "chip chip-possible";
    if (label === "Unlikely this month") return "chip chip-unlikely";
    if (label === "Garden colonizer") return "chip chip-colonizer";
    return "chip";
  }

  function applyChip(el, month) {
    var node = el.querySelector("[data-chip]");
    if (!node) return;
    var label = chipFor(el, month);
    node.textContent = label;
    node.className = chipClass(label);
    el.setAttribute("data-chip-now", label);
  }

  function selectedIn(root, group) {
    return Array.prototype.map
      .call(root.querySelectorAll('[data-group="' + group + '"][aria-pressed="true"]'), function (b) {
        return b.getAttribute("data-value");
      });
  }

  function hasAny(have, want) {
    for (var i = 0; i < want.length; i++) {
      if (have.indexOf(want[i]) !== -1) return true;
    }
    return false;
  }

  function parseList(attr) {
    if (!attr) return [];
    return attr.split("|").filter(Boolean);
  }

  function applyFilters(root) {
    var flying = root.querySelector('[data-group="flying"][aria-pressed="true"]');
    var colors = selectedIn(root, "color");
    var places = selectedIn(root, "place");
    var kinds = selectedIn(root, "kind");
    var cards = root.querySelectorAll("[data-species]");
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var ok = true;
      if (flying) {
        var chip = card.getAttribute("data-chip-now");
        if (chip !== "Common now" && chip !== "Garden colonizer") ok = false;
      }
      if (ok && colors.length) {
        if (!hasAny(parseList(card.getAttribute("data-color")), colors)) ok = false;
      }
      if (ok && places.length) {
        if (!hasAny(parseList(card.getAttribute("data-place")), places)) ok = false;
      }
      if (ok && kinds.length) {
        if (!hasAny(parseList(card.getAttribute("data-kind")), kinds)) ok = false;
      }
      if (ok) card.removeAttribute("hidden");
      else card.setAttribute("hidden", "");
    }
  }

  /* First-ship 20: map iNat scientific / common / aliases → species page slug */
  var GUIDE_BY_SCI = {
    "anartia jatrophae": "white-peacock",
    "agraulis vanillae": "gulf-fritillary",
    "dione vanillae": "gulf-fritillary",
    "heliconius charithonia": "zebra-longwing",
    "dryas iulia": "julia",
    "danaus plexippus": "monarch",
    "danaus gilippus": "queen",
    "limenitis archippus": "viceroy",
    "papilio cresphontes": "giant-swallowtail",
    "heraclides cresphontes": "giant-swallowtail",
    "battus polydamas": "polydamas-swallowtail",
    "papilio polyxenes": "black-swallowtail",
    "phoebis sennae": "cloudless-sulphur",
    "eurema daira": "barred-yellow",
    "ascia monuste": "great-southern-white",
    "eumaeus atala": "atala",
    "hylephila phyleus": "fiery-skipper",
    "urbanus proteus": "long-tailed-skipper",
    "junonia neildi": "mangrove-buckeye",
    "phocides pigmalion": "mangrove-skipper",
    "phocides batabano": "mangrove-skipper",
    "hemiargus ceraunus": "ceraunus-blue",
    "leptotes cassius": "cassius-blue",
  };

  var GUIDE_BY_COMMON = {
    "white peacock": "white-peacock",
    "gulf fritillary": "gulf-fritillary",
    "zebra longwing": "zebra-longwing",
    "florida zebra longwing": "zebra-longwing",
    "julia": "julia",
    "julia heliconian": "julia",
    "monarch": "monarch",
    "queen": "queen",
    "viceroy": "viceroy",
    "giant swallowtail": "giant-swallowtail",
    "eastern giant swallowtail": "giant-swallowtail",
    "polydamas swallowtail": "polydamas-swallowtail",
    "black swallowtail": "black-swallowtail",
    "cloudless sulphur": "cloudless-sulphur",
    "barred yellow": "barred-yellow",
    "great southern white": "great-southern-white",
    "atala": "atala",
    "fiery skipper": "fiery-skipper",
    "long-tailed skipper": "long-tailed-skipper",
    "mangrove buckeye": "mangrove-buckeye",
    "mangrove skipper": "mangrove-skipper",
    "ceraunus blue": "ceraunus-blue",
    "cassius blue": "cassius-blue",
  };

  function norm(s) {
    return (s || "").toLowerCase().trim().replace(/\s+/g, " ");
  }

  function speciesBase(scientific) {
    var n = norm(scientific);
    if (!n) return "";
    // drop subspecies epithet for matching (e.g. Heliconius charithonia tuckeri)
    var parts = n.split(" ");
    if (parts.length >= 3) return parts[0] + " " + parts[1];
    return n;
  }

  function matchGuide(row) {
    var sci = norm(row.scientific);
    var base = speciesBase(row.scientific);
    var common = norm(row.common);
    if (GUIDE_BY_SCI[sci]) return GUIDE_BY_SCI[sci];
    if (GUIDE_BY_SCI[base]) return GUIDE_BY_SCI[base];
    if (GUIDE_BY_COMMON[common]) return GUIDE_BY_COMMON[common];
    return null;
  }

  function guideCard(root, slug) {
    return root.querySelector('[data-species="' + slug + '"]');
  }

  function renderSeenLately(root, countsPayload) {
    var section = root.querySelector("[data-seen-lately]");
    var list = root.querySelector("[data-seen-lately-list]");
    if (!section || !list) return;
    var rows = (countsPayload && countsPayload.species_counts) || [];
    if (!rows.length) return;

    var matched = [];
    var seen = {};
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var slug = matchGuide(row);
      if (!slug || seen[slug]) continue;
      var card = guideCard(root, slug);
      if (!card) continue;
      seen[slug] = true;
      matched.push({
        slug: slug,
        count: row.count != null ? Number(row.count) : 0,
        card: card,
      });
    }
    matched.sort(function (a, b) {
      return b.count - a.count;
    });
    matched = matched.slice(0, 8);
    if (!matched.length) return;

    list.textContent = "";
    for (var j = 0; j < matched.length; j++) {
      var item = matched[j];
      var nameEl = item.card.querySelector(".card-name");
      var imgEl = item.card.querySelector(".card-photo img");
      var name = nameEl ? nameEl.textContent : item.slug;
      var src = imgEl ? imgEl.getAttribute("src") : "";
      var li = document.createElement("li");
      li.className = "seen-lately-item";
      var a = document.createElement("a");
      a.href = "species/" + item.slug + ".html";
      a.className = "seen-lately-link";
      var thumb = document.createElement("span");
      thumb.className = "seen-lately-thumb";
      if (src) {
        var img = document.createElement("img");
        img.src = src;
        img.alt = "";
        img.width = 56;
        img.height = 56;
        thumb.appendChild(img);
      }
      var nm = document.createElement("span");
      nm.className = "seen-lately-name";
      nm.textContent = name;
      a.appendChild(thumb);
      a.appendChild(nm);
      if (item.count) {
        var cnt = document.createElement("span");
        cnt.className = "seen-lately-count";
        cnt.textContent = String(item.count);
        a.appendChild(cnt);
      }
      li.appendChild(a);
      list.appendChild(li);
    }
    section.removeAttribute("hidden");
    var credit = root.querySelector("[data-seen-lately-credit]");
    if (credit) credit.removeAttribute("hidden");
  }

  function loadSeenLately(root) {
    if (!root.querySelector("[data-seen-lately]")) return;
    // relative path; fail soft
    fetch("data/inat-lee-species-counts.json")
      .then(function (res) {
        if (!res.ok) throw new Error("counts " + res.status);
        return res.json();
      })
      .then(function (data) {
        renderSeenLately(root, data);
      })
      .catch(function () {
        /* fail soft — leave section hidden */
      });
  }

  function initHome() {
    var root = document.querySelector("[data-home]");
    if (!root) return;
    var month = yorkMonth();
    var cards = root.querySelectorAll("[data-species]");
    for (var i = 0; i < cards.length; i++) applyChip(cards[i], month);
    var buttons = root.querySelectorAll(".fchip");
    for (var j = 0; j < buttons.length; j++) {
      buttons[j].addEventListener("click", function () {
        var on = this.getAttribute("aria-pressed") === "true";
        this.setAttribute("aria-pressed", on ? "false" : "true");
        applyFilters(root);
      });
    }
    applyFilters(root);
    loadSeenLately(root);
  }

  function initSpecies() {
    var page = document.querySelector("[data-species-page]");
    if (!page) return;
    applyChip(page, yorkMonth());
  }

  initHome();
  initSpecies();
})();

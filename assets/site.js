/* SoloDesk shared helpers — tiny, dependency-free. */
(function () {
  "use strict";
  // Number + currency formatting
  window.SD = window.SD || {};
  // Locale: Indonesian pages format as id-ID (Rp150.000,00); everything else follows the browser.
  SD.locale = function () {
    var lang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
    return lang === "id" ? "id-ID" : undefined;
  };
  SD.fmt = function (n, currency) {
    if (!isFinite(n)) return "—";
    try {
      var cur = currency || "USD";
      var digits = (cur === "IDR" || cur === "JPY") ? 0 : 2;
      return new Intl.NumberFormat(SD.locale(), {
        style: "currency", currency: cur, minimumFractionDigits: digits, maximumFractionDigits: digits
      }).format(n);
    } catch (e) {
      return "$" + Number(n).toFixed(2);
    }
  };
  SD.num = function (n, d) {
    if (!isFinite(n)) return "—";
    return new Intl.NumberFormat(SD.locale(), { maximumFractionDigits: d == null ? 2 : d }).format(n);
  };
  // Parse a typed number. Accepts "1,250.50", "1 250,50" and "0,5" (a lone comma is a decimal separator).
  SD.parse = function (raw) {
    var s = String(raw == null ? "" : raw).trim().replace(/\s/g, "");
    if (s.indexOf(",") > -1 && s.indexOf(".") === -1 && s.split(",").length === 2) s = s.replace(",", ".");
    else s = s.replace(/,/g, "");
    var v = parseFloat(s);
    return isFinite(v) ? v : 0;
  };
  SD.val = function (id) {
    var el = document.getElementById(id);
    return el ? SD.parse(el.value) : 0;
  };
  SD.setText = function (id, t) { var el = document.getElementById(id); if (el) el.textContent = t; };
  // Flash a temporary label on a button, then always restore the original.
  SD._flash = function (btn, msg) {
    if (!btn) return;
    if (btn.dataset.label == null) btn.dataset.label = btn.textContent;
    clearTimeout(btn._t);
    btn.textContent = msg;
    btn._t = setTimeout(function () { btn.textContent = btn.dataset.label; }, 1600);
  };
  SD.copy = function (text, btn) {
    var ok = function () { SD._flash(btn, "Copied"); SD.say("Copied to clipboard"); };
    var fail = function () { SD._flash(btn, "Press Ctrl+C"); SD.say("Copy failed. Select the text and press Ctrl+C."); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, function () { if (SD._fallbackCopy(text)) ok(); else fail(); });
    } else if (SD._fallbackCopy(text)) { ok(); } else { fail(); }
  };
  SD._fallbackCopy = function (text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("aria-hidden", "true");
    ta.setAttribute("tabindex", "-1");
    ta.style.cssText = "position:fixed;left:-9999px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy") === true; } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  };
  // One polite status region for the whole site.
  SD.say = function (msg) {
    var s = document.getElementById("sd-status");
    if (!s) return;
    s.textContent = msg;
    clearTimeout(SD._sayT);
    SD._sayT = setTimeout(function () { s.textContent = ""; }, 2000);
  };
  // Debounced announcement, for calculators that recompute on every keystroke.
  SD.sayLater = function (msg, wait) {
    clearTimeout(SD._sayDebounce);
    SD._sayDebounce = setTimeout(function () { SD.say(msg); }, wait == null ? 500 : wait);
  };
  // Flash the result panel so the sighted case gets the same cue.
  SD.flashResult = function (elOrId) {
    var el = typeof elOrId === "string" ? document.getElementById(elOrId) : elOrId;
    if (!el) el = document.querySelector(".result");
    if (!el) return;
    el.classList.remove("changed");
    requestAnimationFrame(function () {
      el.classList.add("changed");
      requestAnimationFrame(function () { el.classList.remove("changed"); });
    });
  };
  // Current year in footer, plus the shared status region
  document.addEventListener("DOMContentLoaded", function () {
    var y = document.querySelectorAll("[data-year]");
    for (var i = 0; i < y.length; i++) y[i].textContent = new Date().getFullYear();
    if (!document.getElementById("sd-status")) {
      var s = document.createElement("p");
      s.className = "visually-hidden";
      s.id = "sd-status";
      s.setAttribute("role", "status");
      s.setAttribute("aria-live", "polite");
      s.setAttribute("aria-atomic", "true");
      document.body.appendChild(s);
    }
  });
})();

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
  SD.copy = function (text, btn) {
    var done = function () { if (btn) { var o = btn.textContent; btn.textContent = "Copied!"; setTimeout(function(){btn.textContent=o;}, 1400); } };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function(){ SD._fallbackCopy(text); done(); });
    } else { SD._fallbackCopy(text); done(); }
  };
  SD._fallbackCopy = function (text) {
    var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta);
    ta.select(); try { document.execCommand("copy"); } catch (e) {} document.body.removeChild(ta);
  };
  // Current year in footer
  document.addEventListener("DOMContentLoaded", function () {
    var y = document.querySelectorAll("[data-year]");
    for (var i = 0; i < y.length; i++) y[i].textContent = new Date().getFullYear();
  });
})();

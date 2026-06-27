// App Store Localization Helper — browser-only, no API, no translation.
// Helps structure App Store metadata for multiple locales with character limit checks.

const LOCALES = [
  { code: "en-US", label: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", label: "English (UK)", flag: "🇬🇧" },
  { code: "en-AU", label: "English (Australia)", flag: "🇦🇺" },
  { code: "de-DE", label: "German", flag: "🇩🇪" },
  { code: "fr-FR", label: "French", flag: "🇫🇷" },
  { code: "es-ES", label: "Spanish (Spain)", flag: "🇪🇸" },
  { code: "es-MX", label: "Spanish (Mexico)", flag: "🇲🇽" },
  { code: "pt-BR", label: "Portuguese (Brazil)", flag: "🇧🇷" },
  { code: "pt-PT", label: "Portuguese (Portugal)", flag: "🇵🇹" },
  { code: "it-IT", label: "Italian", flag: "🇮🇹" },
  { code: "nl-NL", label: "Dutch", flag: "🇳🇱" },
  { code: "sv-SE", label: "Swedish", flag: "🇸🇪" },
  { code: "da-DK", label: "Danish", flag: "🇩🇰" },
  { code: "nb-NO", label: "Norwegian", flag: "🇳🇴" },
  { code: "fi-FI", label: "Finnish", flag: "🇫🇮" },
  { code: "pl-PL", label: "Polish", flag: "🇵🇱" },
  { code: "ru-RU", label: "Russian", flag: "🇷🇺" },
  { code: "tr-TR", label: "Turkish", flag: "🇹🇷" },
  { code: "zh-Hans", label: "Chinese (Simplified)", flag: "🇨🇳" },
  { code: "zh-Hant", label: "Chinese (Traditional)", flag: "🇹🇼" },
  { code: "ja-JP", label: "Japanese", flag: "🇯🇵" },
  { code: "ko-KR", label: "Korean", flag: "🇰🇷" },
  { code: "ar-SA", label: "Arabic", flag: "🇸🇦" },
  { code: "he-IL", label: "Hebrew", flag: "🇮🇱" },
  { code: "el-GR", label: "Greek", flag: "🇬🇷" },
  { code: "cs-CZ", label: "Czech", flag: "🇨🇿" },
  { code: "ro-RO", label: "Romanian", flag: "🇷🇴" },
  { code: "hu-HU", label: "Hungarian", flag: "🇭🇺" },
  { code: "sk-SK", label: "Slovak", flag: "🇸🇰" },
  { code: "uk-UA", label: "Ukrainian", flag: "🇺🇦" },
  { code: "th-TH", label: "Thai", flag: "🇹🇭" },
  { code: "id-ID", label: "Indonesian", flag: "🇮🇩" },
  { code: "ms-MY", label: "Malay", flag: "🇲🇾" },
  { code: "vi-VN", label: "Vietnamese", flag: "🇻🇳" },
  { code: "hi-IN", label: "Hindi", flag: "🇮🇳" },
  { code: "ca-ES", label: "Catalan", flag: "🏴" },
  { code: "hr-HR", label: "Croatian", flag: "🇭🇷" },
];

const FIELDS = [
  { key: "name", label: "App Name", limit: 30, placeholder: "My Awesome App", note: "30 characters max. Appears as the main title." },
  { key: "subtitle", label: "Subtitle", limit: 30, placeholder: "The best tool for...", note: "30 characters max. Appears below the name." },
  { key: "keywords", label: "Keywords", limit: 100, placeholder: "keyword1,keyword2,keyword3", note: "100 characters, comma-separated, no spaces after commas. Don't repeat words from the name or subtitle." },
  { key: "promotional_text", label: "Promotional Text", limit: 170, placeholder: "Update this anytime without a new version...", note: "170 characters max. Can be updated without a new submission." },
  { key: "description", label: "Description", limit: 4000, isLong: true, placeholder: "Full app description...", note: "4000 characters max. First 3 lines show before 'more'." },
  { key: "release_notes", label: "What's New", limit: 4000, isLong: true, placeholder: "Bug fixes and performance improvements...", note: "4000 characters max. Shown on the update page." },
];

const STORAGE_KEY = "localization_v1";

let selectedLocales = ["en-US", "de-DE", "fr-FR", "es-ES", "zh-Hans", "ja-JP"];
let sourceLocale = "en-US";
let metadata = {};

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (raw.metadata) metadata = raw.metadata;
    if (raw.selectedLocales) selectedLocales = raw.selectedLocales;
    if (raw.sourceLocale) sourceLocale = raw.sourceLocale;
  } catch {}
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ metadata, selectedLocales, sourceLocale }));
}

function getVal(locale, field) {
  return (metadata[locale] || {})[field] || "";
}

function setVal(locale, field, value) {
  if (!metadata[locale]) metadata[locale] = {};
  metadata[locale][field] = value;
  save();
  updateCounters(locale, field);
}

function updateCounters(locale, fieldKey) {
  const field = FIELDS.find(f => f.key === fieldKey);
  if (!field) return;
  const val = getVal(locale, fieldKey);
  const len = val.length;
  const countEl = document.getElementById(`count_${locale}_${fieldKey}`);
  const barEl = document.getElementById(`bar_${locale}_${fieldKey}`);
  if (!countEl) return;
  const pct = Math.min(100, Math.round(len / field.limit * 100));
  countEl.textContent = `${len} / ${field.limit}`;
  countEl.style.color = len > field.limit ? "var(--err)" : len > field.limit * 0.9 ? "var(--warn)" : "var(--muted)";
  if (barEl) {
    barEl.style.width = pct + "%";
    barEl.style.background = len > field.limit ? "var(--err)" : len > field.limit * 0.9 ? "var(--warn)" : "var(--accent)";
  }
}

function buildLocaleSelector() {
  const container = document.getElementById("localePicker");
  container.innerHTML = "";
  LOCALES.forEach(loc => {
    const label = document.createElement("label");
    label.className = "locale-check";
    const checked = selectedLocales.includes(loc.code);
    label.innerHTML = `<input type="checkbox" value="${loc.code}" ${checked ? "checked" : ""} onchange="toggleLocale('${loc.code}', this.checked)">
      <span>${loc.flag} ${loc.label}</span>`;
    container.appendChild(label);
  });

  const sourceSelect = document.getElementById("sourceLocale");
  sourceSelect.innerHTML = "";
  LOCALES.forEach(loc => {
    const opt = document.createElement("option");
    opt.value = loc.code;
    opt.textContent = `${loc.flag} ${loc.label}`;
    if (loc.code === sourceLocale) opt.selected = true;
    sourceSelect.appendChild(opt);
  });
}

function toggleLocale(code, checked) {
  if (checked) {
    if (!selectedLocales.includes(code)) selectedLocales.push(code);
  } else {
    selectedLocales = selectedLocales.filter(c => c !== code);
  }
  save();
  buildMetadataEditor();
}

function buildMetadataEditor() {
  const container = document.getElementById("metadataEditor");
  container.innerHTML = "";

  if (selectedLocales.length === 0) {
    container.innerHTML = `<div class="empty-msg">Select at least one locale above.</div>`;
    return;
  }

  selectedLocales.forEach(locCode => {
    const loc = LOCALES.find(l => l.code === locCode);
    if (!loc) return;

    const locCard = document.createElement("div");
    locCard.className = "locale-card";
    locCard.id = `locale_${locCode}`;

    const fieldsHtml = FIELDS.map(f => {
      const val = getVal(locCode, f.key);
      const len = val.length;
      const pct = Math.min(100, Math.round(len / f.limit * 100));
      const countColor = len > f.limit ? "var(--err)" : len > f.limit * 0.9 ? "var(--warn)" : "var(--muted)";
      const barColor = len > f.limit ? "var(--err)" : len > f.limit * 0.9 ? "var(--warn)" : "var(--accent)";
      const inputEl = f.isLong
        ? `<textarea rows="4" id="input_${locCode}_${f.key}" placeholder="${f.placeholder || ""}"
            oninput="setVal('${locCode}','${f.key}',this.value)">${val}</textarea>`
        : `<input type="text" id="input_${locCode}_${f.key}" value="${val.replace(/"/g, '&quot;')}"
            placeholder="${f.placeholder || ""}" oninput="setVal('${locCode}','${f.key}',this.value)" />`;
      const pasteHint = locCode !== sourceLocale
        ? `<button class="copy-source-btn" onclick="copyFromSource('${locCode}','${f.key}')" title="Copy from source locale">← Copy from ${sourceLocale}</button>` : "";
      return `
        <div class="field-block">
          <div class="field-head">
            <span class="field-label">${f.label}</span>
            ${pasteHint}
            <span class="char-count" id="count_${locCode}_${f.key}" style="color:${countColor}">${len} / ${f.limit}</span>
          </div>
          <div class="char-bar"><div class="char-fill" id="bar_${locCode}_${f.key}" style="width:${pct}%;background:${barColor}"></div></div>
          ${inputEl}
          <div class="field-note">${f.note}</div>
        </div>
      `;
    }).join("");

    locCard.innerHTML = `
      <div class="locale-header">
        <span class="locale-flag">${loc.flag}</span>
        <span class="locale-name">${loc.label}</span>
        <span class="locale-code">${loc.code}</span>
        <button class="remove-locale" onclick="removeLocale('${locCode}')">✕</button>
      </div>
      <div class="locale-fields">${fieldsHtml}</div>
    `;
    container.appendChild(locCard);
  });
}

function removeLocale(code) {
  selectedLocales = selectedLocales.filter(c => c !== code);
  save();
  // Update checkbox
  const cb = document.querySelector(`#localePicker input[value="${code}"]`);
  if (cb) cb.checked = false;
  buildMetadataEditor();
}

function copyFromSource(targetLocale, fieldKey) {
  const srcVal = getVal(sourceLocale, fieldKey);
  if (!srcVal) return;
  setVal(targetLocale, fieldKey, srcVal);
  const inputEl = document.getElementById(`input_${targetLocale}_${fieldKey}`);
  if (inputEl) {
    if (inputEl.tagName === "TEXTAREA") inputEl.value = srcVal;
    else inputEl.value = srcVal;
  }
  updateCounters(targetLocale, fieldKey);
}

function onSourceChange() {
  sourceLocale = document.getElementById("sourceLocale").value;
  save();
  buildMetadataEditor();
}

function exportJSON() {
  const output = {};
  selectedLocales.forEach(loc => {
    output[loc] = {};
    FIELDS.forEach(f => {
      const v = getVal(loc, f.key);
      if (v) output[loc][f.key] = v;
    });
  });
  const blob = new Blob([JSON.stringify(output, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "app-store-metadata.json";
  a.click();
}

function exportDeliver() {
  let output = "";
  selectedLocales.forEach(loc => {
    const hasContent = FIELDS.some(f => getVal(loc, f.key));
    if (!hasContent) return;
    const locData = LOCALES.find(l => l.code === loc);
    output += `# ${locData?.flag || ""} ${loc}\n`;
    FIELDS.forEach(f => {
      const v = getVal(loc, f.key);
      if (!v) return;
      output += `${f.key}["${loc}"] = """\n${v}\n"""\n`;
    });
    output += "\n";
  });
  const blob = new Blob([output], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "Deliverfile-metadata.txt";
  a.click();
}

function exportMarkdown() {
  let md = "# App Store Metadata\n\n";
  selectedLocales.forEach(loc => {
    const locData = LOCALES.find(l => l.code === loc);
    md += `## ${locData?.flag || ""} ${locData?.label || loc} (${loc})\n\n`;
    FIELDS.forEach(f => {
      const v = getVal(loc, f.key);
      md += `**${f.label}** (${f.limit} char limit): ${v ? v.length : 0} chars\n\n`;
      if (v) md += `> ${v.replace(/\n/g, "\n> ")}\n\n`;
      else md += `> *(empty)*\n\n`;
    });
    md += "---\n\n";
  });
  const blob = new Blob([md], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "app-store-metadata.md";
  a.click();
}

function clearAll() {
  if (!confirm("Clear all metadata? This cannot be undone.")) return;
  metadata = {};
  save();
  buildMetadataEditor();
}

function runAudit() {
  const issues = [];
  selectedLocales.forEach(loc => {
    const locData = LOCALES.find(l => l.code === loc);
    const name = locData?.label || loc;
    FIELDS.forEach(f => {
      const v = getVal(loc, f.key);
      if (!v && f.key === "name") issues.push({ locale: name, field: f.label, severity: "error", msg: "App Name is empty" });
      if (!v && f.key === "description") issues.push({ locale: name, field: f.label, severity: "warn", msg: "Description is empty" });
      if (v && v.length > f.limit) issues.push({ locale: name, field: f.label, severity: "error", msg: `Over limit: ${v.length}/${f.limit} characters` });
      if (v && f.key === "keywords" && /,\s/.test(v)) issues.push({ locale: name, field: f.label, severity: "warn", msg: "Keywords should use comma without space (e.g. key1,key2)" });
      if (v && f.key === "name" && /\b(#1|best|top|free)\b/i.test(v)) issues.push({ locale: name, field: f.label, severity: "warn", msg: "Name contains superlatives (#1, best, top, free) — Apple may reject" });
    });
  });

  const auditEl = document.getElementById("auditResults");
  if (issues.length === 0) {
    auditEl.innerHTML = `<div class="audit-ok">✓ No issues found across all ${selectedLocales.length} locales.</div>`;
  } else {
    auditEl.innerHTML = issues.map(i =>
      `<div class="audit-issue ${i.severity}">
        <span class="issue-flag">${i.severity === "error" ? "🔴" : "🟡"}</span>
        <span class="issue-locale">${i.locale}</span> — <b>${i.field}:</b> ${i.msg}
      </div>`
    ).join("");
  }
  document.getElementById("auditSection").style.display = "block";
  auditEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("DOMContentLoaded", () => {
  load();
  buildLocaleSelector();
  buildMetadataEditor();
  document.getElementById("sourceLocale").addEventListener("change", onSourceChange);
});

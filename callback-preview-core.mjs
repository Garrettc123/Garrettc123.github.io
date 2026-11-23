// Privacy-first local CSV analyzer. No network, storage, or customer-row rendering.
const MAX_CHARACTERS = 2_000_000;
const MAX_ROWS = 5000;
const normalizeHeader = value => String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

export function parseCsv(source) {
  const text = String(source).replace(/^\uFEFF/, "");
  if (!text || text.length > MAX_CHARACTERS) throw new Error("CSV is empty or exceeds the 2 MB preview limit.");
  const rows = [];
  let row = [], field = "", insideQuotes = false, atFieldStart = true;
  function finishField() { row.push(field); field = ""; atFieldStart = true; }
  function finishRow() {
    finishField();
    if (row.some(value => value.trim() !== "")) rows.push(row);
    row = [];
    if (rows.length > MAX_ROWS + 1) throw new Error("Preview supports at most 5,000 data rows.");
  }
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (insideQuotes) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') insideQuotes = false;
      else field += char;
    } else if (char === '"' && atFieldStart) {
      insideQuotes = true;
      atFieldStart = false;
    } else if (char === '"') {
      throw new Error("Malformed CSV quoting.");
    } else if (char === ",") {
      finishField();
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      finishRow();
    } else {
      field += char;
      atFieldStart = false;
    }
  }
  if (insideQuotes) throw new Error("Unclosed quoted CSV field.");
  if (field !== "" || row.length) finishRow();
  const headers = rows.shift();
  if (!headers?.length || !headers.some(value => value.trim())) throw new Error("CSV needs a header row.");
  if (headers.length > 100) throw new Error("Preview supports at most 100 columns.");
  const keys = headers.map(normalizeHeader);
  if (keys.some(key => !key) || new Set(keys).size !== keys.length) {
    throw new Error("Column headings must be distinct and nonempty.");
  }
  if (!rows.length) throw new Error("CSV has no data rows.");
  if (rows.some(row => row.length !== headers.length)) throw new Error("CSV row width does not match column headings.");
  return {headers, rows};
}

function column(headers, aliases) {
  const normalized = headers.map(normalizeHeader);
  const idx = normalized.findIndex(name => aliases.includes(name));
  return idx < 0 ? null : idx;
}

export function analyzeCsv(parsed, options = {}) {
  const {headers, rows} = parsed;
  const now = Number.isFinite(options.now) ? options.now : Date.now();
  const hours = Number(options.ageHours ?? 48);
  if (!Number.isFinite(hours) || hours < 1 || hours > 720) throw new Error("Choose an age threshold between 1 and 720 hours.");
  const owner = column(headers, ["owner","leadowner","assignedto","assignee","assigneduser","assignedperson"]);
  const step = column(headers, ["nextaction","nextstep","followupaction","nextfollowup"]);
  const created = column(headers, ["createdat","createddate","leadcreated","leaddate","created"]);
  const status = column(headers, ["status","leadstatus","stage","pipelinestage"]);
  const contact = column(headers, ["lastcontacted","contactedat","firstcontactat","firstresponseat","lastcallat"]);
  const blank = (row, idx) => row[idx]?.trim() === "";
  const countBlank = idx => idx == null ? null : rows.filter(row => blank(row, idx)).length;
  let agedOpen = null, unparseableDates = null;
  if (created !== null && status !== null) {
    agedOpen = 0;
    unparseableDates = 0;
    const open = new Set(["new","open","pending","active","uncontacted","awaitingresponse","notcontacted"]);
    for (const row of rows) {
      const normalizedStatus = normalizeHeader(row[status]);
      if (!open.has(normalizedStatus)) continue;
      const timestamp = Date.parse(row[created]);
      if (!Number.isFinite(timestamp) || timestamp > now) { unparseableDates++; continue; }
      if (now - timestamp > hours * 3_600_000) agedOpen++;
    }
  }
  return {
    totalRows: rows.length,
    columnsDetected: {
      owner: owner == null ? null : headers[owner],
      nextAction: step == null ? null : headers[step],
      created: created == null ? null : headers[created],
      status: status == null ? null : headers[status],
      contactTimestamp: contact == null ? null : headers[contact]
    },
    unassigned: countBlank(owner),
    missingNextAction: countBlank(step),
    missingContactTimestamp: countBlank(contact),
    agedOpen,
    unparseableDates,
    ageThresholdHours: hours,
    responseTimeMeasured: false,
    missedCallsProven: false
  };
}

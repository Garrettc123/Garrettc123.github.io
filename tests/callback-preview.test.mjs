import test from "node:test";
import assert from "node:assert/strict";
import {parseCsv, analyzeCsv} from "../callback-preview-core.mjs";

test("quoted commas, escaped quotes and CRLF stay within their records", () => {
  const parsed = parseCsv('Owner,Status,Next step,Created At\r\n"Taylor, Sr.",Open,"Call ""soon""",2026-11-18T00:00:00Z\r\n,New,,2026-11-20T00:00:00Z\r\n');
  assert.equal(parsed.rows.length, 2);
  assert.equal(parsed.rows[0][0], "Taylor, Sr.");
  assert.equal(parsed.rows[0][2], 'Call "soon"');
  const report = analyzeCsv(parsed,{now:Date.parse("2026-11-23T00:00:00Z"),ageHours:48});
  assert.equal(report.unassigned,1);
  assert.equal(report.missingNextAction,1);
  assert.equal(report.agedOpen,2);
  assert.equal(report.responseTimeMeasured,false);
  assert.equal(report.missedCallsProven,false);
});

test("missing fields are unknown, not zero", () => {
  const report = analyzeCsv(parseCsv("Name,Phone\nA,123\n"));
  assert.equal(report.unassigned,null);
  assert.equal(report.agedOpen,null);
  assert.equal(report.missingContactTimestamp,null);
});

test("rejects malformed widths, unmatched quotes and duplicate headers", () => {
  assert.throws(()=>parseCsv('A,B\n"a,b\n'),/Unclosed/);
  assert.throws(()=>parseCsv("A,B\na\n"),/width/);
  assert.throws(()=>parseCsv("Owner,owner\nA,B\n"),/distinct/);
});

test("unknown status and unparseable timestamps are not reported as missed followups",()=>{
  const report=analyzeCsv(parseCsv("Owner,Status,Created At\nPat,Closed,invalid\nPat,Open,invalid\n"),{now:Date.parse("2026-11-23T00:00:00Z")});
  assert.equal(report.agedOpen,0);
  assert.equal(report.unparseableDates,1);
  assert.equal(report.missedCallsProven,false);
});

test("rejects unsupported thresholds",()=>{
  assert.throws(()=>analyzeCsv(parseCsv("A\nB"),{ageHours:0}),/threshold/);
});

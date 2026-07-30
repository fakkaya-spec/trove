// Saf domain kurallarının testleri (node üzerinde `npx tsx tests/domain.test.ts`).
// React/DB bağımlılığı yok — Faz 0 kabul kriterlerindeki kritik kurallar burada güvence altında.
import assert from "node:assert/strict";
import {
  bulkApproveSection,
  canTransition,
  checkCompletion,
  isCriticalFailure,
  needsIssueSheet,
  sectionProgress,
  summarize,
  toResultMap,
} from "../src/domain/inspection";
import type { TemplateItemDef, TemplateSectionDef } from "../src/domain/types";

function item(id: string, opts?: Partial<TemplateItemDef>): TemplateItemDef {
  return {
    id,
    sectionId: "s1",
    sort: 0,
    title: { en: id },
    isCritical: false,
    requiresPhotoOnIssue: false,
    required: true,
    inputKind: "status",
    ...opts,
  };
}

const section: TemplateSectionDef = {
  id: "s1",
  sort: 0,
  icon: "x",
  title: { en: "S1" },
  items: [
    item("a"),
    item("b"),
    item("crit", { isCritical: true }),
    item("meter1", { inputKind: "meter", meterKind: "fuel_pct" }),
  ],
};

// 1) Toplu onay kritik maddeyi ATLAR, meter maddelerini saymaz
{
  const updates = bulkApproveSection(section, toResultMap([]));
  assert.deepEqual(
    updates.map((u) => u.templateItemId).sort(),
    ["a", "b"],
    "bulk approve must skip critical + meter items"
  );
  assert.ok(updates.every((u) => u.status === "working"));
}

// 2) Toplu onay zaten işaretli maddeye dokunmaz
{
  const updates = bulkApproveSection(
    section,
    toResultMap([{ templateItemId: "a", status: "not_working" }])
  );
  assert.deepEqual(updates.map((u) => u.templateItemId), ["b"]);
}

// 3) Bölüm ilerlemesi: kritik unchecked ayrı sayılır
{
  const prog = sectionProgress(section, toResultMap([{ templateItemId: "a", status: "working" }]));
  assert.equal(prog.total, 3);
  assert.equal(prog.unchecked, 2);
  assert.equal(prog.criticalUnchecked, 1);
  assert.equal(prog.complete, false);
}

// 4) Tamamlama: unchecked kritik = ENGEL, unchecked normal = UYARI
{
  const res = checkCompletion([section], toResultMap([{ templateItemId: "a", status: "working" }]));
  assert.equal(res.canComplete, false);
  assert.deepEqual(res.blockingItems.map((i) => i.id), ["crit"]);
  assert.deepEqual(res.warningItems.map((i) => i.id), ["b"]);
}
{
  const res = checkCompletion(
    [section],
    toResultMap([
      { templateItemId: "crit", status: "working" },
      { templateItemId: "a", status: "not_applicable" },
    ])
  );
  assert.equal(res.canComplete, true);
  assert.deepEqual(res.warningItems.map((i) => i.id), ["b"]);
}

// 5) Sorun sheet'i yalnız needs_attention / not_working için
{
  assert.equal(needsIssueSheet("needs_attention"), true);
  assert.equal(needsIssueSheet("not_working"), true);
  assert.equal(needsIssueSheet("working"), false);
  assert.equal(needsIssueSheet("not_applicable"), false);
}

// 6) Kritik arıza uyarısı: yalnız kritik madde + not_working
{
  assert.equal(isCriticalFailure(section.items[2], "not_working"), true);
  assert.equal(isCriticalFailure(section.items[2], "needs_attention"), false);
  assert.equal(isCriticalFailure(section.items[0], "not_working"), false);
}

// 7) Durum makinesi
{
  assert.equal(canTransition("draft", "in_progress"), true);
  assert.equal(canTransition("in_progress", "completed"), true);
  assert.equal(canTransition("completed", "in_progress"), true); // imza öncesi geri açma
  assert.equal(canTransition("draft", "completed"), false);
  assert.equal(canTransition("locked", "in_progress"), false);
  assert.equal(canTransition("completed", "locked"), false); // imza aşaması atlanamaz
}

// 8) Özet sayımı meter maddelerini dışlar
{
  const sum = summarize(
    [section],
    toResultMap([
      { templateItemId: "a", status: "working" },
      { templateItemId: "b", status: "not_working" },
    ])
  );
  assert.equal(sum.totalItems, 3);
  assert.equal(sum.working, 1);
  assert.equal(sum.notWorking, 1);
  assert.equal(sum.unchecked, 1);
}

console.log("domain.test.ts: ALL PASS");

// Synthetic fixtures only. No production JSON, workbook, or network access.
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const ts = require("typescript");
const test = require("node:test");

function compile(file) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInThisContext("(function(require,module,exports){" + code + "\n})")(name => name.startsWith("@/") ? compile("src/" + name.slice(2) + ".ts") : require(name), module, module.exports);
  return module.exports;
}
const lib = compile("src/lib/planning.ts");
const data = compile("src/lib/data.ts");
const product = { 商品ID: "TEST/?&", 商品名: "合成タルト", ブランド名: "合成ブランド", 対象月: null,
  対象年: "2020", 主素材: "桃", 副素材: "紅茶", ALC試作案: "既存の台を使う", ロス対策: "合成冷凍案",
  ピース価格: "700円（税込・合成）", サイズ: "合成サイズ", 実在確認レベル: "C", URL: "https://example.invalid/product" };

test("候補IDの上限・重複・不正保存値を拒否", () => {
  assert.deepEqual(lib.parseCandidateIds(null), []);
  assert.deepEqual(lib.parseCandidateIds('["A","B"]'), ["A", "B"]);
  for (const raw of ['{}', '[1]', '["A","A"]', '["A","B","C","D","E"]', 'broken']) assert.throws(() => lib.parseCandidateIds(raw));
});
test("企画メモを完全復元し、壊れた保存値を拒否", () => {
  const draft = lib.blankDraft(); draft.title = "合成試作案";
  assert.deepEqual(lib.parseDraft(JSON.stringify(draft)), draft);
  assert.throws(() => lib.parseDraft('{"title":1}'));
});
test("企画の参照スナップショットは比較候補から独立", () => {
  const saved = lib.parseSavedDraft(JSON.stringify({version:1, draft:lib.blankDraft(), references:[product]}));
  const changed = {...product, ピース価格:"変更後"};
  assert.equal(saved.references[0].ピース価格,"700円（税込・合成）");
  assert.notEqual(saved.references[0].ピース価格,changed.ピース価格);
  assert.deepEqual(lib.parseSavedDraft(JSON.stringify(lib.blankDraft())).references,[]);
});
test("メモ書き出しが原文価格・出典・仮説を分けて保持", () => {
  const draft = lib.blankDraft(); draft.price = "目標900円";
  const output = lib.draftMarkdown(draft, [product]);
  for (const value of ["目標900円", "700円（税込・合成）", "TEST/?&", "https://example.invalid/product", "2020", "月未設定", "販売確認: 未確認", "企画仮説"]) assert(output.includes(value));
});
test("URLはhttp/httpsだけ許可", () => {
  assert.equal(lib.safeHttpUrl("javascript:alert(1)"), undefined);
  assert.equal(lib.safeHttpUrl("file:///C:/private"), undefined);
  assert.equal(lib.safeHttpUrl("https://example.invalid/"), "https://example.invalid/");
});
test("分析文・副素材・全角・複数語を検索", () => {
  for (const query of ["紅茶　既存", "ＴＥＳＴ", "合成冷凍案", "　"]) assert.equal(data.matchesQuery(product, query), true);
  assert.equal(data.matchesQuery(product, "紅茶 チョコ"), false);
});
test("実在・販売確認は独立", () => {
  assert.equal(data.existenceLabel(product), "C"); assert.equal(data.salesLabel(product), "未確認");
});
test("未確認のプレースホルダーを開発記録ありに数えない", () => {
  for (const value of ["", "未確認", "要確認", "不明", "-"]) assert.equal(data.hasRecord(value),false);
  assert.equal(data.hasRecord("流用不可"),true);
});
test("読込データの不正形・重複ID・不正月を拒否", () => {
  for (const payload of [{}, [null], [{...product, 対象月:13}], [product, product]]) assert.throws(() => data.parseProducts(payload));
  assert.equal(data.parseProducts([product]).length, 1);
});
test("HTTP失敗後の再取得と同時取得共有", async () => {
  let calls = 0;
  global.fetch = async () => { calls++; return { ok:false, status:503 }; };
  await assert.rejects(data.getProducts(), /HTTP 503/);
  global.fetch = async () => { calls++; return {ok:true, json:async()=>[product]}; };
  await Promise.all([data.getProducts(), data.getProducts()]);
  assert.equal(calls, 2);
});

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
const news = compile("src/lib/news.ts");
const search = compile("src/lib/search.ts");
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

test("新着は初期収録を除き、発売日でなく収録日・バッチ順", () => {
  const values = [
    {...product, 商品ID:"baseline", dbFirstSeen:"2026-01-01", dbFirstSeenKind:"baseline"},
    {...product, 商品ID:"old", dbFirstSeen:"2020-01-01", dbFirstSeenKind:"added", 販売開始日:"2026-12-01"},
    {...product, 商品ID:"new", dbFirstSeen:"2026-01-01", dbFirstSeenKind:"added", dbFirstSeenBatch:"2"},
    {...product, 商品ID:"same-day", dbFirstSeen:"2026-01-01", dbFirstSeenKind:"added", dbFirstSeenBatch:"1"},
    {...product, 商品ID:"unknown", dbFirstSeen:"", dbFirstSeenKind:"added"},
  ];
  assert.deepEqual(news.newsProducts(values).map(p=>p.商品ID), ["new", "same-day", "old"]);
  assert.equal(values[0].商品ID,"baseline");
});

test("OGP・未確認・不正画像は表示しない", () => {
  const p = {...product, imageUrl:"https://example.invalid/photo.jpg", imageSourceUrl:"https://example.invalid/article", imageCheckedAt:"2026-01-01"};
  for(const status of [undefined,"shared","generic","unverified","missing"]) assert.equal(news.imageForProduct({...p,imageDisplayStatus:status}),undefined);
  assert.equal(news.imageForProduct({...p,imageDisplayStatus:"matched"}),p.imageUrl);
  assert.equal(news.imageForProduct({...p,imageDisplayStatus:"matched",imageUrl:"javascript:alert(1)"}),undefined);
  assert.equal(news.imageForProduct({...p,imageDisplayStatus:"matched",imageSourceUrl:""}),undefined);
});

test("最新情報は確認日順で、初回収録日を変更しない", () => {
  const values=[
    {...product, 商品ID:"old",dbFirstSeen:"2020-01-01",informationCheckedAt:"2026-09-01",latestInfoUrl:"https://example.invalid/old"},
    {...product, 商品ID:"new",dbFirstSeen:"2020-01-02",informationCheckedAt:"2026-09-12",latestInfoUrl:"https://example.invalid/new"},
    {...product, 商品ID:"unchecked",dbFirstSeen:"2026-09-12"},
  ];
  assert.deepEqual(news.latestProducts(values).map(p=>p.商品ID),["new","old"]);
  assert.equal(values[0].dbFirstSeen,"2020-01-01");
});

test("生成画像は説明と安全なローカルパスが必要", () => {
  const p={...product,imageDisplayStatus:"generated",imageUrl:"/images/generated/TEST-1.png",imageGenerationBasis:"合成素材・形状は推定"};
  assert.equal(news.imageForProduct(p),p.imageUrl);
  assert.equal(news.imageForProduct({...p,imageGenerationBasis:""}),undefined);
  for(const url of ["/images/generated/../../private.png","https://example.invalid/generated.png","javascript:alert(1)"]) assert.equal(news.imageForProduct({...p,imageUrl:url}),undefined);
});

test("期限付きSNS画像の保存先は回収画像フォルダのみ", () => {
  const p={...product,imageDisplayStatus:"matched",imageUrl:"/images/recovered/TEST-1.jpg",imageSourceUrl:"https://example.invalid/post",imageCheckedAt:"2026-09-12"};
  assert.equal(news.imageForProduct(p),p.imageUrl);
  assert.equal(news.imageForProduct({...p,imageUrl:"/private.jpg"}),undefined);
  assert.equal(news.imageForProduct({...p,imageSourceUrl:""}),undefined);
});

test("最新の商品説明も検索対象", () => {
  assert.equal(data.matchesQuery({...product,latestDescription:"合成限定シトラス",latestUpdateSummary:"秋発売"},"シトラス 秋発売"),true);
});


// Search journeys use synthetic records only.
const sample = (id, overrides = {}) => ({ ...product, 商品ID:id, 商品名:"合成商品", ブランド名:"合成工房", 主素材:"", 副素材:"", 商品カテゴリ:"タルト", 商品会議優先度:"B", 対象月:9, ...overrides });
const runSearch = (records, patch = {}) => search.searchProducts(search.buildSearchIndex(records), {...search.defaultSearch(), ...patch}).map(hit=>hit.product.商品ID);

test("検索の初期状態は全月・年未記録も含む", () => {
  const records=[sample("spring",{対象月:3}), sample("fall"), sample("unknown",{対象月:null,対象年:""})];
  assert.deepEqual(new Set(runSearch(records)),new Set(["spring","fall","unknown"]));
  assert.deepEqual(search.parseSearch(new URLSearchParams()).months,[]);
});
test("素材の表記違い・かな・全角を統一する", () => {
  const p=sample("fruit",{商品名:"苺とマロンのタルト",主素材:"ストロベリー"});
  for(const q of ["いちご 栗","ｲﾁｺﾞ ﾏﾛﾝ","イチゴ タルト"]) assert(search.matchesQuery(p,q));
});
test("ブランドの中黒・空白とALC略称を扱う", () => {
  assert(search.matchesQuery(sample("brand",{ブランド名:"キル フェ ボン"}),"キルフェボン"));
  for(const q of ["アラカンパーニュ","ALC"]) assert(search.matchesQuery(sample("own",{ブランド名:"ア・ラ・カンパーニュ"}),q));
});
test("胡桃・桜桃を桃に誤変換しない", () => {
  const walnut=sample("nut",{商品名:"胡桃のタルト",主素材:"胡桃"});
  assert.equal(search.matchesQuery(walnut,"桃"),false);
  assert.equal(search.hasIngredient(walnut,"ナッツ"),true);
  assert.equal(search.matchesQuery(sample("cherry",{商品名:"桜桃のケーキ"}),"桃"),false);
  assert.equal(search.matchesQuery(sample("peach",{商品名:"白桃のケーキ"}),"桃"),true);
});
test("和梨と洋梨、ぶどうとグレープフルーツを混同しない", () => {
  assert.equal(search.matchesQuery(sample("pear",{主素材:"洋梨"}),"和梨"),false);
  assert.equal(search.hasIngredient(sample("citrus",{主素材:"グレープフルーツ"}),"ぶどう"),false);
});
test("素材タグに品種・別名を含める", () => {
  for(const [tag,material] of [["ぶどう","シャインマスカット"],["ナッツ","胡桃"],["さくらんぼ","チェリー"],["洋梨","ラ・フランス"],["紅茶","アールグレイ"]]) assert(search.hasIngredient(sample("ingredient",{主素材:material}),tag));
});
test("すべての語・いずれかの語と除外語を組み合わせる", () => {
  const records=[sample("a",{商品名:"苺のタルト"}), sample("b",{商品名:"栗のタルト"}),sample("c",{商品名:"苺チョコタルト"})];
  assert.deepEqual(runSearch(records,{q:"いちご 栗"}),[]);
  assert.deepEqual(runSearch(records,{q:"いちご 栗 -チョコ",mode:"any"}),["a","b"]);
  assert.deepEqual(runSearch(records,{q:"-いちご"}),["b"]);
});
test("引用符のフレーズとハイフンを含むIDを検索できる", () => {
  const p=sample("SWT-0099",{商品名:"紅茶 タルト"});
  assert(search.matchesQuery(p,'"紅茶 タルト"'));
  assert(search.matchesQuery(p,"SWT-0099"));
  assert.equal(search.matchesQuery(sample("different",{商品名:"紅茶 ケーキ タルト"}),'"紅茶 タルト"'),false);
});
test("商品名完全一致をメモのみ一致の高優先度商品より上に出す", () => {
  const records=[sample("memo",{真似すべき点:"いちごタルトを参考",商品会議優先度:"S"}),sample("exact",{商品名:"苺タルト",商品会議優先度:"C"})];
  assert.deepEqual(runSearch(records,{q:"いちごタルト"}),["exact","memo"]);
  assert.deepEqual(runSearch(records,{q:"いちごタルト",sort:"priority"}),["memo","exact"]);
});
test("複数月はOR、ほかの条件とはANDで絞る", () => {
  const records=[sample("a",{対象月:3,ブランド名:"工房A"}),sample("b",{対象月:9,ブランド名:"工房A"}),sample("c",{対象月:9,ブランド名:"工房B"})];
  assert.deepEqual(runSearch(records,{months:["3","9"],brand:"工房A"}),["a","b"]);
});
test("月を解除しても検索語とブランドは保たれる", () => {
  const records=[sample("spring",{対象月:3,商品名:"苺タルト"}),sample("other",{商品名:"栗タルト"})];
  const state={...search.defaultSearch(),q:"いちご",months:["9"],brand:"合成工房"};
  assert.equal(runSearch(records,state).length,0);
  assert.deepEqual(runSearch(records,{...state,months:[]}),["spring"]);
  assert.equal(state.q,"いちご");
});
test("元DBの年と最新確認日は別の条件として扱う", () => {
  const records=[sample("old",{対象年:"2024",informationCheckedAt:"2026-09-12",latestInfoUrl:"https://example.invalid/latest"}),sample("new",{対象年:"2026"})];
  assert.deepEqual(runSearch(records,{year:"2026"}),["new"]);
  assert.deepEqual(runSearch(records,{latest:"latest"}),["old"]);
  assert.deepEqual(runSearch(records,{year:"2026",latest:"latest"}),[]);
});
test("情報確認順は画像調査日や初回登録日を使わない", () => {
  const records=[sample("image",{imageCheckedAt:"2099-01-01",dbFirstSeen:"2099-01-01"}),sample("checked",{informationCheckedAt:"2026-09-12",latestInfoUrl:"https://example.invalid/latest"})];
  assert.deepEqual(runSearch(records,{sort:"checked"}),["checked","image"]);
});
test("画像条件は表示可能な写真と生成画像と未確認を区別", () => {
  const records=[sample("photo",{imageDisplayStatus:"matched",imageUrl:"https://example.invalid/photo.jpg",imageSourceUrl:"https://example.invalid/source",imageCheckedAt:"2026-09-12"}),sample("gen",{imageDisplayStatus:"generated",imageUrl:"/images/generated/test.png",imageGenerationBasis:"合成説明"}),sample("ogp",{imageCandidateUrl:"https://example.invalid/ogp.jpg",imageDisplayStatus:"shared"}),sample("broken",{imageDisplayStatus:"matched",imageUrl:"javascript:bad"})];
  assert.deepEqual(runSearch(records,{image:"photo"}),["photo"]);
  assert.deepEqual(runSearch(records,{image:"generated"}),["gen"]);
  assert.deepEqual(runSearch(records,{image:"none"}),["broken","ogp"]);
});
test("最新掲載価格の出典も価格出典ありに含める", () => {
  const p=sample("latest-price",{latestPrice:"950円",latestInfoUrl:"https://example.invalid/current",informationCheckedAt:"2026-09-12"});
  assert.deepEqual(runSearch([p],{development:"price"}),["latest-price"]);
  assert.deepEqual(runSearch([{...p,latestInfoUrl:""}],{development:"price"}),[]);
});
test("全検索条件・表示・ページをURLで復元する", () => {
  const state={...search.defaultSearch(),q:"苺 -チョコ",months:["3","9","unknown"],brand:"工房 & A",ingredient:"紅茶",year:"2026",image:"photo",sort:"checked",mode:"any",view:"list",page:3,size:"48"};
  assert.deepEqual(search.parseSearch(new URL(search.searchUrl(state),"https://example.invalid").searchParams),state);
});
test("不正なURL条件とページ数を安全な値に戻す", () => {
  const state=search.parseSearch(new URLSearchParams("months=0,9,9,13,unknown&page=-1&size=0&sort=evil&view=x&image=bad"));
  assert.deepEqual(state.months,["9","unknown"]);assert.equal(state.page,1);assert.equal(state.size,"24");assert.equal(state.sort,"auto");assert.equal(state.image,"");
});
test("全件表示で240件を超えても落とさず、ページ範囲を補正", () => {
  const results=Array.from({length:543},(_,i)=>i);
  const last=search.resultPage(results,{page:999,size:"24"});
  assert.equal(last.page,23);assert.equal(last.start,529);assert.equal(last.end,543);
  assert.equal(search.resultPage(results,{page:999,size:"all"}).items.length,543);
  assert.equal(search.resultPage([],{page:3,size:"24"}).start,0);
});
test("詳細の前後移動は絞り込みと並び順を引き継ぐ", () => {
  const records=[sample("a",{主素材:"栗",対象月:9}),sample("b",{主素材:"苺",対象月:9}),sample("c",{主素材:"苺",対象月:3})];
  const url=search.searchUrl({...search.defaultSearch(),q:"いちご",sort:"month",size:"24"});
  assert.deepEqual(search.listProducts(records,url).map(p=>p.商品ID),["c","b"]);
});
test("新着と画像一覧の条件も詳細の連続閲覧に反映する", () => {
  const records=[sample("a",{主素材:"苺",informationCheckedAt:"2026-09-12",latestInfoUrl:"https://example.invalid/latest",imageDisplayStatus:"generated"}),sample("b",{主素材:"栗",informationCheckedAt:"2026-09-12",latestInfoUrl:"https://example.invalid/latest"})];
  assert.deepEqual(search.listProducts(records,"/news/?q=いちご&view=latest").map(p=>p.商品ID),["a"]);
  assert.deepEqual(search.listProducts(records,"/images/?status=generated").map(p=>p.商品ID),["a"]);
});
test("比較への往復で検索条件を維持し、外部の戻り先を拒否する", () => {
  const back=search.searchUrl({...search.defaultSearch(),q:"いちご",months:["9"],page:2,view:"list"});
  const planning=search.planningUrl(back);
  assert.equal(new URL(planning,"https://example.invalid").searchParams.get("back"),back);
  for(const invalid of ["//evil.invalid/","https://evil.invalid/","/\\evil.invalid/","/planning/?back=bad","javascript:alert(1)"]) assert.equal(search.safeListBack(invalid),undefined);
});
test("比較と書き出しに過去価格と最新価格・確認日・出典が残る", () => {
  const p=sample("price",{ピース価格:"650円（2020年）",latestPrice:"950円（税込）",informationCheckedAt:"2026-09-12",latestAvailability:"9月15日発売予定",latestInfoUrl:"https://example.invalid/current"});
  const output=lib.draftMarkdown(lib.blankDraft(),[p]);
  for(const value of ["650円（2020年）","950円（税込）","2026-09-12","9月15日発売予定","https://example.invalid/current"]) assert(output.includes(value));
  assert(lib.COMPARISON_GROUPS.some(group=>group.fields.some(([field])=>field==="latestPrice")));
});

test("最新情報グループを追加しても製造・運用メモを保持する", () => {
  assert(lib.DEVELOPMENT_GROUP.fields.some(([key])=>key==="ALC試作案"));
  assert(lib.DEVELOPMENT_GROUP.fields.some(([key])=>key==="ロス対策"));
  assert.equal(lib.DEVELOPMENT_GROUP.fields.some(([key])=>key==="ピース価格"),false);
});
test("詳細の連続閲覧でページ境界を越えても戻り先を補正する", () => {
  const back=search.searchUrl({...search.defaultSearch(),q:"いちご",page:1,size:"24",view:"list"});
  const next=search.parseSearch(new URL(search.backAtResult(back,24),"https://example.invalid").searchParams);
  assert.equal(next.page,2);assert.equal(next.q,"いちご");assert.equal(next.view,"list");
  assert.equal(search.backAtResult("/news/?q=栗",24),"/news/?q=栗".replace("栗","%E6%A0%97"));
});

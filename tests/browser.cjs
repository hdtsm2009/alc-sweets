// Browser journey tests route synthetic data; every external request is blocked.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:3100";
const month = new Date().getMonth() + 1;
const base = { "No.":1, 商品ID:"REF /?&#+", ブランド名:"ア・ラ・カンパーニュ", 会社名:"合成会社", 商品名:"秋の桃と紅茶のタルト（合成）",
  商品カテゴリ:"タルト", 対象月:month, 対象年:"2020", 主素材:"桃", 副素材:"紅茶", 商品会議優先度:"S", ALC実装難易度:"中",
  実在確認レベル:"C", 販売確認状態:"未確認", 価格確認ステータス:"未確認", 画像確認ステータス:"未確認",
  ピース価格:"700円（税込・合成）", ホール価格:"", セット価格:"", サイズ:"合成サイズ", URL:"https://example.invalid/product",
  一次情報URL:"https://example.invalid/official", 価格出典URL:"https://example.invalid/price", 既存タルト台流用可否:"要試作",
  ALC試作案:"既存の台と紅茶クリームで試作", ロス対策:"合成の冷凍検証", 応用案:"果実の断面を見せる", 会議確認事項:"果実の歩留まりを確認" };
const products = [base, ...Array.from({length:205}, (_, i) => ({...base, 商品ID:`REF-${i}`, ブランド名:"合成競合", 商品名:`比較用${i} ${i===0?'パフェ':'タルト'}`, 商品カテゴリ:i===0?'パフェ':'タルト', 商品会議優先度:"B", ALC試作案:i===0?base.ALC試作案:""})), {...base,商品ID:"UNKNOWN", 商品名:"月未設定のA+（合成）",対象月:null,商品会議優先度:"A+"}];
let passed=0, failed=0;
async function test(name, fn) { try { await fn(); passed++; console.log(`PASS ${name}`); } catch(error) {failed++; console.error(`FAIL ${name}: ${error.stack}`);} }

(async () => {
  await fs.mkdir("test-results", {recursive:true});
  const browser = await chromium.launch({headless:true, ...(process.env.BROWSER_CHANNEL ? {channel:process.env.BROWSER_CHANNEL} : {})});
  const context = await browser.newContext({viewport:{width:1360,height:1000}, acceptDownloads:true});
  let failureMode = "";
  await context.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.abort();
    if (url.pathname === "/data/products.json") {
      if (failureMode === "http") return route.fulfill({status:503,body:"unavailable"});
      if (failureMode === "json") return route.fulfill({contentType:"application/json",body:"{broken"});
      if (failureMode === "timeout") return;
      return route.fulfill({json:products});
    }
    if (url.pathname === "/data/meta.json") return route.fulfill({json:{total:products.length,version:"SYNTHETIC",generated:"2020-01-01"}});
    return route.continue();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  const runtimeErrors=[]; page.on("pageerror", error => runtimeErrors.push(error.message));
  await test("全207件表示・自社/競合の再計算・タルト区分", async () => {
    await page.goto(origin + "/?months=");
    await page.getByRole("heading",{name:"季節の素材から、次の試作を考える"}).waitFor();
    await page.waitForFunction(()=>document.querySelectorAll("article").length===207);
    await page.getByLabel("自社・競合").selectOption("自社");
    await page.waitForFunction(()=>document.querySelectorAll("article").length===2);
    await page.getByLabel("自社・競合").selectOption("競合");
    await page.waitForFunction(()=>document.querySelectorAll("article").length===205);
    await page.getByLabel("参考範囲").selectOption("other");
    await page.waitForFunction(()=>document.querySelectorAll("article").length===1);
  });
  await test("検索→予約文字IDの詳細→元の条件に戻る", async () => {
    await page.goto(origin+"/?months=&q="+encodeURIComponent("秋 紅茶"));
    await page.locator("article").first().getByRole("link").click();
    await page.getByRole("heading", {name:base.商品名, exact:true}).waitFor();
    await page.getByRole("link", {name:"← 検索結果に戻る"}).click();
    assert.equal(await page.getByLabel("商品名・素材・試作案を検索").inputValue(), "秋 紅茶");
  });
  await test("具体的な試作案のある商品を探せる", async () => {
    await page.goto(origin+"/?months=&development=prototype");
    await page.waitForFunction(()=>document.querySelectorAll("article").length===3);
    assert.equal(await page.getByLabel("開発情報の記録").inputValue(),"prototype");
  });
  await test("候補4件の保存・上限・再読み込み・比較", async () => {
    await page.goto(origin+"/?months=");
    for (let i=0;i<4;i++) await page.locator("article").nth(i).getByRole("button",{name:"＋ 比較候補に追加"}).click();
    await page.locator("article").nth(4).getByRole("button",{name:"＋ 比較候補に追加"}).click();
    await page.getByText("比較できる候補は4件までです。1件外してから追加してください。").waitFor();
    await page.reload();
    await page.getByRole("button",{name:"✓ 比較候補から外す"}).first().waitFor();
    assert.equal(await page.getByRole("button",{name:"✓ 比較候補から外す"}).count(),4);
    await page.goto(origin+"/planning/");
    await page.getByRole("heading",{name:"比較候補 4件"}).waitFor();
    assert.equal(await page.locator("thead th").count(),5);
    await page.screenshot({path:"test-results/comparison-desktop.png",fullPage:false});
  });
  await test("試作メモ保存・復元・出典付き書き出し", async () => {
    await page.getByLabel("企画名",{exact:true}).fill("合成：秋の紅茶タルト");
    await page.getByLabel("タルト台・生地",{exact:true}).fill("既存の合成タルト台を使用");
    await page.getByLabel("目標販売価格・税区分",{exact:true}).fill("目標900円・税込");
    await page.getByRole("button",{name:"この端末に保存",exact:true}).click();
    await page.getByText("試作メモと参照商品の記録をこの端末に保存しました。",{exact:true}).waitFor();
    await page.reload();
    assert.equal(await page.getByLabel("企画名",{exact:true}).inputValue(),"合成：秋の紅茶タルト");
    const event=page.waitForEvent("download");
    await page.getByRole("button",{name:"メモと出典を書き出す"}).click();
    const download=await event; const target=path.resolve("test-results/合成_タルト試作メモ.md"); await download.saveAs(target);
    const content=await fs.readFile(target,"utf8");
    for(const value of ["目標900円・税込","700円（税込・合成）","https://example.invalid/official","REF /?&#+","企画仮説"]) assert(content.includes(value));
  });
  await test("自動保存後の内部移動と参照商品の固定", async () => {
    await page.getByLabel("クリーム・層の構成",{exact:true}).fill("合成紅茶クリーム");
    await page.getByRole("link",{name:"参考商品を探す",exact:true}).click();
    await page.getByRole("heading",{level:1}).waitFor();
    await page.goto(origin+"/planning/");
    assert.equal(await page.getByLabel("クリーム・層の構成",{exact:true}).inputValue(),"合成紅茶クリーム");
    await page.getByRole("button",{name:"候補から外す",exact:true}).first().click();
    await page.getByText("比較中の候補とは異なります。保存・書き出しには、この案に紐づく記録を使います。").waitFor();
    const snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem("alc-tart-draft-v1")));
    assert.equal(snapshot.references.length,4);
    assert.equal(snapshot.references[0].商品ID,base.商品ID);
    await page.reload();
    await page.getByRole("heading",{name:"比較候補 3件"}).waitFor();
    await page.getByText("この案に紐づく参照商品 4件").waitFor();
  });
  await test("月未設定の優先候補とカレンダー", async () => {
    await page.goto(origin+"/picks/"); await page.getByText("月未設定のA+（合成）",{exact:true}).waitFor();
    await page.goto(origin+"/calendar/"); await page.getByRole("button",{name:/月未設定/}).click();
    await page.getByText("月未設定のA+（合成）",{exact:true}).waitFor();
  });
  await test("HTTPとJSONエラーから再試行で復帰", async () => {
    for(const mode of ["http","json"]) {
      failureMode=mode; await page.goto(origin+"/?months="); await page.getByText("商品データを読み込めませんでした。再試行してください。",{exact:true}).waitFor();
      failureMode=""; await page.getByRole("button",{name:"再試行",exact:true}).click();
      await page.waitForFunction(()=>document.querySelectorAll("article").length===207);
    }
  });
  await test("通信が終わらない場合もタイムアウトし再試行できる", async () => {
    failureMode="timeout"; await page.goto(origin+"/?months=");
    await page.getByText("商品データを読み込めませんでした。再試行してください。",{exact:true}).waitFor({timeout:20000});
    failureMode=""; await page.getByRole("button",{name:"再試行",exact:true}).click();
    await page.waitForFunction(()=>document.querySelectorAll("article").length===207);
  });
  await test("壊れた候補保存を勝手に上書きせず明示操作で復旧", async () => {
    await page.evaluate(()=>localStorage.setItem("alc-tart-candidates-v1","broken"));
    await page.goto(origin+"/planning/");
    await page.getByRole("alert").waitFor();
    assert.equal(await page.evaluate(()=>localStorage.getItem("alc-tart-candidates-v1")),"broken");
    page.once("dialog", dialog=>dialog.accept());
    await page.getByRole("button",{name:"候補保存を初期化",exact:true}).click();
    await page.getByRole("heading",{name:"比較候補を選んでください",exact:true}).waitFor();
    await page.getByText("この案に紐づく参照商品 4件").waitFor();
  });
  await test("スマートフォンでページ全体の横はみ出しなし", async () => {
    await page.setViewportSize({width:390,height:844});
    for(const route of ["/?months=&q="+encodeURIComponent("秋 紅茶"),"/planning/","/product/?id="+encodeURIComponent(base.商品ID)]) {
      await page.goto(origin+route); await page.getByRole("heading",{level:1}).waitFor();
      assert(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth + 1),route);
    }
    await page.screenshot({path:"test-results/detail-mobile.png",fullPage:true});
  });
  await test("実行時例外なし",()=>assert.deepEqual(runtimeErrors,[]));
  console.log(`Tests: ${passed+failed}, passed: ${passed}, failed: ${failed}`);
  console.log("Closing test context");
  await context.close();
  console.log("Closing test browser");
  await browser.close();
  console.log("Browser closed");
  process.exitCode=failed?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;});

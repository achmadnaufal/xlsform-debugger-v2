const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const FORM_URL = "http://localhost:5174";
const XLSFORM_PATH =
  "/Users/achmadnaufal/projects/forms/china_stm/Draft_Regag_Garlic_UPDATED.xlsx";
const CSV_DIR = "/Users/achmadnaufal/projects/forms/china_stm/pulldata/";
const TODAY = new Date().toISOString().split("T")[0];

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function selectFirstOption(page, questionEl) {
  return page.evaluate((el) => {
    const radios = el.querySelectorAll(
      '.option-wrapper input[type="radio"], .option-wrapper input[type="checkbox"]'
    );
    for (const r of radios) {
      if (r.value && r.value !== "" && !r.disabled) {
        r.click();
        r.dispatchEvent(new Event("change", { bubbles: true }));
        return r.value;
      }
    }
    const sel = el.querySelector("select");
    if (sel && sel.options.length > 1) {
      sel.selectedIndex = 1;
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      return sel.options[1]?.value || null;
    }
    return null;
  }, questionEl);
}

async function selectOptionByValue(page, questionEl, value) {
  return page.evaluate(
    (el, val) => {
      const radios = el.querySelectorAll(
        '.option-wrapper input[type="radio"], .option-wrapper input[type="checkbox"]'
      );
      for (const r of radios) {
        if (r.value === val) {
          r.click();
          r.dispatchEvent(new Event("change", { bubbles: true }));
          return r.value;
        }
      }
      const sel = el.querySelector("select");
      if (sel) {
        for (let i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value === val) {
            sel.selectedIndex = i;
            sel.dispatchEvent(new Event("change", { bubbles: true }));
            return val;
          }
        }
      }
      return null;
    },
    questionEl,
    value
  );
}

async function fillInput(page, questionEl, value) {
  return page.evaluate(
    (el, val) => {
      const input = el.querySelector(
        'input[type="text"], input[type="number"], input[type="date"], input[type="tel"], textarea'
      );
      if (input && !input.disabled && !input.readOnly) {
        const nativeSet = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set;
        if (nativeSet) nativeSet.call(input, val);
        else input.value = val;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
      return false;
    },
    questionEl,
    String(value)
  );
}

async function findQuestion(page, namePattern) {
  const questions = await page.$$(".question");
  for (const q of questions) {
    const match = await page.evaluate(
      (el, pattern, isRegex) => {
        const style = window.getComputedStyle(el);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          el.classList.contains("disabled") ||
          el.offsetParent === null
        )
          return false;
        const name =
          el.getAttribute("data-name") ||
          el.querySelector("[name]")?.getAttribute("name") ||
          "";
        if (isRegex) return new RegExp(pattern).test(name);
        return name.includes(pattern);
      },
      q,
      typeof namePattern === "string" ? namePattern : namePattern.source,
      namePattern instanceof RegExp
    );
    if (match) return q;
  }
  return null;
}

async function fillNamed(page, namePattern, action, label) {
  const q = await findQuestion(page, namePattern);
  if (!q) {
    console.log(`   [SKIP] ${label || namePattern} not visible`);
    return false;
  }
  const result = await action(q);
  if (result) {
    console.log(`   [FILL] ${label || namePattern} = ${result}`);
    await sleep(1000);
  } else {
    console.log(`   [FAIL] ${label || namePattern}`);
  }
  return !!result;
}

async function run() {
  console.log("=== XLSForm Debugger Auto-Test: China STM Garlic ===\n");

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(60000);

  // Patch document.evaluate to handle OpenRosa XPath functions gracefully.
  // enketo-transformer's web build uses browser XPath which doesn't support
  // selected(), current(), etc. This patch catches the error and returns
  // an empty result so the transform doesn't crash.
  await page.evaluateOnNewDocument(() => {
    const origEval = Document.prototype.evaluate;
    Document.prototype.evaluate = function (...args) {
      try {
        return origEval.apply(this, args);
      } catch (e) {
        if (
          e instanceof DOMException ||
          (e instanceof SyntaxError &&
            e.message.includes("Failed to execute 'evaluate'"))
        ) {
          console.warn("[XPath patch] Caught invalid XPath, returning empty:", args[0]?.substring?.(0, 80));
          // Return an empty XPathResult
          return {
            resultType: 4, // UNORDERED_NODE_ITERATOR_TYPE
            iterateNext: () => null,
            snapshotLength: 0,
            snapshotItem: () => null,
            numberValue: NaN,
            stringValue: "",
            booleanValue: false,
            singleNodeValue: null,
            invalidIteratorState: false,
          };
        }
        throw e;
      }
    };
  });

  page.on("console", (msg) => {
    const text = msg.text();
    if (
      msg.type() === "error" ||
      text.includes("[FormRenderer]") ||
      text.includes("[useEnketoForm]") ||
      text.includes("[XPath patch]")
    ) {
      console.log(`   [PAGE] ${text.substring(0, 200)}`);
    }
  });

  // 1. Navigate
  console.log("1. Navigating to", FORM_URL);
  await page.goto(FORM_URL, { waitUntil: "networkidle2" });
  await sleep(1000);

  // 2. Upload CSV files
  console.log("2. Uploading CSV files...");
  const csvFiles = fs
    .readdirSync(CSV_DIR)
    .filter((f) => f.endsWith(".csv"))
    .map((f) => path.join(CSV_DIR, f));
  console.log(`   ${csvFiles.length} CSV files found`);

  const csvInput = await page.$('input[type="file"][accept=".csv"]');
  if (csvInput) {
    await csvInput.uploadFile(...csvFiles);
    await page.evaluate(() => {
      document
        .querySelector('input[type="file"][accept=".csv"]')
        ?.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await sleep(500);
    console.log("   CSV files uploaded");
  }

  // 3. Upload XLSForm
  console.log("3. Uploading XLSForm:", path.basename(XLSFORM_PATH));
  const xlsxInput = await page.$('input[type="file"][accept=".xlsx"]');
  if (xlsxInput) {
    await xlsxInput.uploadFile(XLSFORM_PATH);
    await sleep(500);
  }

  // 4. Wait for form
  console.log("4. Waiting for form to render...");
  try {
    await page.waitForFunction(
      () => {
        const container = document.querySelector(".enketo-form-container");
        if (!container) return false;
        return !!(container.querySelector("form") || container.querySelector(".or"));
      },
      { timeout: 180000, polling: 2000 }
    );
    console.log("   Form rendered!");
  } catch (e) {
    await page.screenshot({
      path: "/tmp/form_debug_timeout.png",
      fullPage: true,
    });
    const info = await page.evaluate(() => ({
      container: !!document.querySelector(".enketo-form-container"),
      containerHTML: document.querySelector(".enketo-form-container")?.innerHTML?.substring(0, 500),
      forms: document.querySelectorAll("form").length,
      bodySnippet: document.body.textContent?.substring(0, 300),
    }));
    console.log("   Debug:", JSON.stringify(info, null, 2));
    throw new Error("Form did not render: " + e.message);
  }

  await sleep(3000);
  await page.screenshot({ path: "/tmp/form_loaded.png", fullPage: true });
  console.log("5. Screenshot: /tmp/form_loaded.png\n");

  // === FILL FORM ===
  console.log("6. Filling form...\n");
  let filledCount = 0;

  const fill = async (name, action, label) => {
    if (await fillNamed(page, name, action, label || name)) filledCount++;
    await sleep(1500);
  };

  // Key questions in sequence
  await fill("subproject_id", async (q) => {
    return (
      (await selectOptionByValue(page, q, "cn_garlic_stm")) ||
      (await selectFirstOption(page, q))
    );
  });

  await fill("interviewer", (q) => selectFirstOption(page, q));
  await fill("producer_present_yn", (q) =>
    selectOptionByValue(page, q, "yes")
  );
  await fill("producer_filter", async (q) =>
    (await selectOptionByValue(page, q, "id")) || (await selectFirstOption(page, q))
  );
  await fill("producer_identity_card_nb_select", (q) =>
    fillInput(page, q, "509734541")
  );
  await fill("producer_code_select", async (q) => {
    return page.evaluate((el) => {
      const radios = el.querySelectorAll('.option-wrapper input[type="radio"]');
      for (const r of radios) {
        if (r.value && r.value !== "" && r.value !== "other" && !r.disabled) {
          r.click();
          r.dispatchEvent(new Event("change", { bubbles: true }));
          return r.value;
        }
      }
      const sel = el.querySelector("select");
      if (sel) {
        for (let i = 0; i < sel.options.length; i++) {
          const v = sel.options[i].value;
          if (v && v !== "" && v !== "other") {
            sel.selectedIndex = i;
            sel.dispatchEvent(new Event("change", { bubbles: true }));
            return v;
          }
        }
      }
      return null;
    }, q);
  });

  // Screenshot after initial selections
  await page.screenshot({ path: "/tmp/form_debug_selections.png", fullPage: true });

  // Generic fill passes
  console.log("\n   --- Generic fill passes ---\n");

  const skipNames = [
    "photo", "picture", "geopoint", "geoshape", "image",
    "start-geopoint", "legal_document_pdf",
  ];
  const alreadyFilled = [
    "subproject_id", "interviewer", "producer_present_yn",
    "producer_filter", "producer_code_select", "producer_identity_card_nb_select",
  ];

  for (let pass = 0; pass < 10; pass++) {
    const questions = await page.$$(".question");
    let filledThisPass = 0;

    for (const q of questions) {
      const info = await page.evaluate((el) => {
        const style = window.getComputedStyle(el);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          el.classList.contains("disabled") ||
          el.classList.contains("or-appearance-hidden") ||
          el.offsetParent === null
        )
          return null;

        const name =
          el.getAttribute("data-name") ||
          el.querySelector("[name]")?.getAttribute("name") ||
          "";
        const type = el.dataset.type || "";
        const inputs = el.querySelectorAll("input, select, textarea");
        let hasValue = false;
        let inputCount = 0;
        for (const inp of inputs) {
          inputCount++;
          if (inp.type === "radio" || inp.type === "checkbox") {
            if (inp.checked) hasValue = true;
          } else if (inp.value && inp.value.trim() !== "") {
            hasValue = true;
          }
        }
        return { name, type, hasValue, inputCount };
      }, q);

      if (!info || info.hasValue || !info.name || info.inputCount === 0) continue;
      if (skipNames.some((s) => info.name.toLowerCase().includes(s))) continue;
      if (alreadyFilled.some((s) => info.name.includes(s))) continue;
      if (
        ["geopoint", "geoshape", "image", "file", "start-geopoint", "start", "end", "today", "hidden", "note"].some(
          (t) => info.type === t
        )
      ) continue;

      let result = null;
      const hasRadios = await page.evaluate(
        (el) => el.querySelectorAll('input[type="radio"]').length > 0,
        q
      );
      const hasCheckboxes = await page.evaluate(
        (el) => el.querySelectorAll('input[type="checkbox"]').length > 0,
        q
      );
      const hasSelect = await page.evaluate(
        (el) => el.querySelectorAll("select").length > 0,
        q
      );

      if (hasRadios) {
        if (info.name.includes("_yn")) result = await selectOptionByValue(page, q, "yes");
        if (!result) result = await selectFirstOption(page, q);
      } else if (hasCheckboxes) {
        result = await selectFirstOption(page, q);
      } else if (hasSelect) {
        result = await selectFirstOption(page, q);
      } else {
        const inputType = await page.evaluate((el) => {
          const inp = el.querySelector("input, textarea");
          return inp ? inp.type || "text" : null;
        }, q);
        if (inputType === "date") result = (await fillInput(page, q, TODAY)) ? TODAY : null;
        else if (inputType === "number") result = (await fillInput(page, q, "1")) ? "1" : null;
        else if (inputType === "range") result = (await fillInput(page, q, "50")) ? "50" : null;
        else result = (await fillInput(page, q, "Test")) ? "Test" : null;
      }

      if (result) {
        filledThisPass++;
        filledCount++;
        const shortName = info.name.length > 60 ? "..." + info.name.slice(-57) : info.name;
        if (filledThisPass <= 20 || filledThisPass % 10 === 0) {
          console.log(`   [FILL] ${shortName} = ${result}`);
        }
      }
    }

    console.log(`   Pass ${pass + 1}: filled ${filledThisPass} questions`);
    if (filledThisPass === 0) break;
    await sleep(2000);
  }

  const visibleCount = await page.$$eval(".question", (els) =>
    els.filter((el) => {
      const s = window.getComputedStyle(el);
      return s.display !== "none" && s.visibility !== "hidden" && el.offsetParent !== null;
    }).length
  );

  // 7. Recap
  console.log("\n7. Searching for recap notes...\n");
  const recapData = await page.$$eval(".question", (els) => {
    const results = [];
    for (const el of els) {
      const s = window.getComputedStyle(el);
      if (s.display === "none") continue;
      const name =
        el.getAttribute("data-name") ||
        el.querySelector("[name]")?.getAttribute("name") ||
        "";
      const text = (el.textContent || "").trim();
      const ln = name.toLowerCase();
      const lt = text.toLowerCase();
      if (
        ln.includes("recap") ||
        ln.includes("summary") ||
        (ln.includes("total") &&
          (lt.includes("tree") || lt.includes("parcel") || lt.includes("area") || lt.includes("intervention"))) ||
        lt.includes("recapitulation")
      ) {
        results.push({ name, text: text.substring(0, 300) });
      }
    }
    return results;
  });

  console.log(`   Found ${recapData.length} recap/total notes:`);
  for (const r of recapData) {
    console.log(`   - [${r.name}]: ${r.text.substring(0, 150)}`);
  }

  // 8. Screenshot
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(1000);
  await page.screenshot({ path: "/tmp/form_recap.png", fullPage: true });
  console.log("\n8. Screenshot: /tmp/form_recap.png");

  // 9. Save state
  const formState = await page.$$eval(".question", (els) => {
    const data = [];
    for (const el of els) {
      const s = window.getComputedStyle(el);
      if (s.display === "none") continue;
      const name =
        el.getAttribute("data-name") ||
        el.querySelector("[name]")?.getAttribute("name") ||
        "";
      if (!name) continue;
      let value = null;
      for (const inp of el.querySelectorAll("input, select, textarea")) {
        if (inp.type === "radio" || inp.type === "checkbox") {
          if (inp.checked) value = inp.value;
        } else if (inp.value) value = inp.value;
      }
      if (!value) {
        const lbl = el.querySelector(".question-label");
        if (lbl) {
          const t = lbl.textContent?.trim();
          if (t && t.length < 500) value = t;
        }
      }
      data.push({ name, value });
    }
    return data;
  });
  fs.writeFileSync("/tmp/form_state.json", JSON.stringify(formState, null, 2));
  console.log(`9. Saved ${formState.length} fields to /tmp/form_state.json`);

  // 10. Summary
  console.log("\n=== SUMMARY ===");
  console.log(`Visible questions: ${visibleCount}`);
  console.log(`Filled questions: ${filledCount}`);
  console.log(`Recap notes found: ${recapData.length}`);
  const nonZeroRecaps = recapData.filter((r) => {
    const nums = r.text.match(/\d+/g);
    return nums && nums.some((n) => parseInt(n) > 0);
  });
  console.log(`Recap notes with non-zero values: ${nonZeroRecaps.length}`);
  for (const r of nonZeroRecaps) {
    console.log(`   ${r.name}: ${r.text.substring(0, 200)}`);
  }
  console.log("\n=== DONE ===");

  await sleep(5000);
  await browser.close();
}

run().catch((err) => {
  console.error("FATAL ERROR:", err.message || err);
  process.exit(1);
});

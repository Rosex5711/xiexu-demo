"use strict";

// Display-only case summaries. No model, data-provider or verification engine.
const CASES = {
  maotai: {
    company: "贵州茅台", code: "600519.SH", period: "2025Q1",
    description: "同一份公开财报，展示三种不同的核验结论。",
    source: "https://www.moutaichina.com/mtgf/articleFileDir/2025-05/08/3329e26c2c524b318c83e6296e354021.pdf",
    steps: ["分析 · 首轮", "核验 · 首轮", "分析 · 补充原文后", "核验 · 再次复查", "报告 · 整理结果"],
    claims: [
      {
        title: "营业收入同比增长至少 10%。", status: "支持", tone: "support", value: "实际约 10.54%",
        heading: "两期金额与增长率能够对应",
        description: "公开报告披露本期与上年同期营业收入。按照同一指标和期间比较，约 10.54% 的增幅达到主张中的 10% 阈值。",
        rows: [["本期营业收入", "50,600,957,885.78"], ["上年同期营业收入", "45,775,517,043.29"]],
        formula: "（本期收入 ÷ 上年同期收入 − 1）× 100% ≈ 10.54%",
        sources: [{page: 1, label: "公司季报 · 第 1 页"}],
        review: ["确认比较的是营业收入和两个对应的一季度。", "原表金额单位为人民币元；展示单位变化不改变增长率。", "此条只判断数值阈值，不推断增长原因或未来表现。"]
      },
      {
        title: "归母净利润同比增长至少 1000%。", status: "反驳", tone: "refute", value: "实际约 11.56%",
        heading: "错误的数值前提应被指出",
        description: "两期归母净利润对应的增幅约为 11.56%，未达到输入主张的 1000%。保留错误前提会使后续解释失去依据。",
        rows: [["本期归母净利润", "26,847,474,238.76"], ["上年同期归母净利润", "24,065,262,374.15"]],
        formula: "（本期归母净利润 ÷ 上年同期归母净利润 − 1）× 100% ≈ 11.56%",
        sources: [{page: 1, label: "公司季报 · 第 1 页"}],
        review: ["先核对主张中的指标和增长阈值。", "两期金额显示有增长，但不支持“至少 1000%”。", "输出反驳及实际增幅，避免继续沿用错误前提。"]
      },
      {
        title: "本季利润增长足以证明主营改善且可持续。", status: "证据不足", tone: "insufficient", value: "保留原因与持续性缺口",
        heading: "有增长，不等于原因和持续性已经得到证明",
        description: "单季利润增长与现金流金额，可以提供进一步研究的线索。现有案例材料仍不足以独立证明主营改善的原因及未来持续性。",
        quote: "经营活动产生的现金流量净额：本期 8,809,195,646.38 元。",
        gaps: ["对利润变化来源的充分解释与可比依据。", "能够支持持续性判断的后续期间或经营材料。", "现金流与归母利润的归属口径差异需单独考虑。"],
        sources: [{page: 1, label: "现金流及主要指标 · 第 1 页"}],
        review: ["核验阶段检查解释性主张是否有对应的支持材料。", "既有案例补充查看了已保存的现金流原文，再进行复查。", "补充原文后仍有缺口，最终保留“证据不足”；该例不证明多角色提高了准确率。"]
      }
    ]
  },
  midea: {
    company: "美的集团", code: "000333.SZ", period: "2025Q1",
    description: "对照两处公司原文，检查研究表述是否把不同事项的原因接错。",
    source: "https://disc.static.szse.cn/download/disc/disk03/finalpage/2025-04-30/65d7aa3b-dde3-403c-987b-b49bfcf82ff1.PDF",
    steps: ["分析 · 梳理表述", "核验 · 检查依据", "分析 · 补充公司原文", "核验 · 复查两处说明", "报告 · 整理结果"],
    claims: [{
      title: "公司将利润总额增长主要归因为结构性存款增加。", status: "反驳", tone: "refute", value: "两个事项的解释被接错",
      heading: "公司原文描述的是两个不同事项",
      description: "原报告把利润总额增长与收入规模、经营效率联系起来；结构性存款减少则对应交易性金融资产减少。待核验表述既接错解释，也把“减少”写成了“增加”。",
      quotes: [
        {page: 4, label: "利润总额增长的公司说明", text: "主要系收入规模增长及经营效率提升所致。"},
        {page: 3, label: "交易性金融资产减少的公司说明", text: "主要系结构性存款减少所致。"}
      ],
      sources: [{page: 4, label: "利润总额说明 · 第 4 页"}, {page: 3, label: "交易性金融资产说明 · 第 3 页"}],
      review: ["分别查看两个事项所对应的公司说明。", "补充既有原文后，识别主张与公司表述的冲突。", "这里核对公司是否这样表述；并非独立证明公司经营变化的真实经济原因，语义判断仍需研究人员复核。"]
    }]
  }
};

const $ = id => document.getElementById(id);
let currentKey = "maotai";
let selectedClaim = 0;
let ready = false;
let playing = false;
let chosenTab = "evidence";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function setTab(name, moveFocus = false) {
  chosenTab = name;
  for (const key of ["evidence", "review"]) {
    const active = key === name;
    $(key + "-tab").setAttribute("aria-selected", String(active));
    $(key + "-tab").tabIndex = active ? 0 : -1;
    $(key + "-panel").hidden = !active;
  }
  if (moveFocus) $(name + "-tab").focus();
}

function renderCase() {
  const data = CASES[currentKey];
  ready = false;
  selectedClaim = 0;
  $("case-description").textContent = data.description;
  $("input-claims").replaceChildren(...data.claims.map(c => el("li", "", c.title)));
  $("result-company").replaceChildren(document.createTextNode(data.company + " "), el("span", "", data.period));
  $("steps").replaceChildren(...data.steps.map((text, i) => {
    const item = el("li");
    item.append(el("span", "step-dot", String(i + 1)), el("span", "", text));
    return item;
  }));
  $("progress").value = 0;
  $("results").hidden = true;
  $("empty-state").hidden = false;
  $("status").textContent = "选择案例后，点击“播放案例”。";
  $("run-demo").textContent = "播放案例";
  $("reset-demo").disabled = true;
  setTab("evidence");
}

function renderEvidence() {
  const data = CASES[currentKey];
  const c = data.claims[selectedClaim];
  const panel = $("evidence-panel");
  panel.replaceChildren(el("h4", "", c.heading), el("p", "", c.description));
  if (c.rows) {
    const table = el("table");
    const thead = el("thead");
    const header = el("tr");
    for (const label of ["公开财报指标", "原始金额 / 人民币元"]) {
      const th = el("th", "", label);
      th.scope = "col";
      header.append(th);
    }
    thead.append(header);
    const tbody = el("tbody");
    for (const row of c.rows) {
      const tr = el("tr");
      tr.append(...row.map(text => el("td", "", text)));
      tbody.append(tr);
    }
    table.append(thead, tbody);
    panel.append(table, el("div", "formula", c.formula));
  }
  if (c.quote) panel.append(el("blockquote", "", c.quote));
  for (const quote of c.quotes || []) {
    panel.append(el("p", "muted", "报告第 " + quote.page + " 页 · " + quote.label), el("blockquote", "", quote.text));
  }
  if (c.gaps) {
    const list = el("ul");
    list.append(...c.gaps.map(text => el("li", "", text)));
    const gap = el("div", "gap-note");
    gap.append(el("strong", "", "仍待补充"), list);
    panel.append(gap);
  }
  const links = el("div", "source-links");
  for (const source of c.sources) {
    const a = el("a", "", source.label + " ↗");
    a.href = data.source + "#page=" + source.page;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    links.append(a);
  }
  panel.append(links, el("p", "muted", "资料为公开季报的选取摘要；页码为 PDF 物理页码。"));
  const list = el("ul");
  list.append(...c.review.map(text => el("li", "", text)));
  $("review-panel").replaceChildren(el("h4", "", "为什么得到这个结果"), list,
    el("p", "muted", "页面仅回放预设结果与步骤概述，没有执行新的分析、核验或模型调用。"));
}

function renderResults() {
  const data = CASES[currentKey];
  $("claim-results").replaceChildren(...data.claims.map((c, i) => {
    const button = el("button", "claim-result");
    button.type = "button";
    button.setAttribute("aria-pressed", String(i === selectedClaim));
    const left = el("span");
    left.append(el("span", "claim-number", "主张 " + String(i + 1).padStart(2, "0")), el("span", "claim-title", c.title));
    const right = el("span", "claim-end");
    right.append(el("span", "tag " + c.tone, c.status), el("span", "claim-value", c.value));
    button.append(left, right);
    button.addEventListener("click", () => {
      selectedClaim = i;
      renderResults();
    });
    return button;
  }));
  renderEvidence();
  setTab(chosenTab);
}

async function runPlayback() {
  if (playing) return;
  playing = true;
  ready = false;
  $("case-select").disabled = true;
  $("run-demo").disabled = true;
  $("reset-demo").disabled = true;
  $("run-demo").textContent = "回放中…";
  $("results").hidden = true;
  $("empty-state").hidden = false;
  const steps = [...$("steps").children];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  for (let i = 0; i < steps.length; i++) {
    steps.forEach((step, j) => {
      step.classList.toggle("done", j < i);
      step.classList.toggle("active", j === i);
      if (j === i) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });
    $("status").textContent = "正在回放既有案例：" + CASES[currentKey].steps[i] + "（非实时调用）";
    $("progress").value = i;
    await new Promise(resolve => setTimeout(resolve, reduceMotion ? 0 : 360));
  }
  steps.forEach(step => {
    step.className = "done";
    step.removeAttribute("aria-current");
  });
  $("progress").value = 5;
  $("empty-state").hidden = true;
  $("results").hidden = false;
  $("status").textContent = "回放完成 · 点击任一主张，查看对应证据与复核说明。";
  ready = true;
  playing = false;
  $("case-select").disabled = false;
  $("run-demo").disabled = false;
  $("run-demo").textContent = "重新播放案例";
  $("reset-demo").disabled = false;
  renderResults();
}

function downloadSummary() {
  if (!ready || playing) return;
  const data = CASES[currentKey];
  const lines = ["协序 · 产品演示摘要", data.company + " / " + data.code + " / " + data.period, "",
    "固定案例回放；不代表本次执行了真实模型核验或数据获取。", ""];
  data.claims.forEach((c, i) => {
    lines.push("主张 " + (i + 1) + "：" + c.title, "展示结果：" + c.status + "；" + c.value, c.description);
    for (const row of c.rows || []) lines.push(row[0] + "：" + row[1] + " 元");
    if (c.formula) lines.push(c.formula);
    if (c.quote) lines.push(c.quote);
    for (const quote of c.quotes || []) lines.push("第 " + quote.page + " 页：" + quote.text);
    for (const gap of c.gaps || []) lines.push("缺口：" + gap);
    lines.push("公开来源：" + data.source, "对应 PDF 页码：" + c.sources.map(s => s.page).join("、"), "");
  });
  lines.push("仅用于项目展示，不构成投资建议。", "© 2026 知衡队 · 权利保留");
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {type: "text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = el("a");
  a.href = url;
  a.download = "xiexu-" + currentKey + "-demo-summary.txt";
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

$("case-select").addEventListener("change", event => {
  if (playing) return;
  currentKey = event.target.value;
  renderCase();
});
$("run-demo").addEventListener("click", runPlayback);
$("reset-demo").addEventListener("click", () => { if (!playing) renderCase(); });
$("download-summary").addEventListener("click", downloadSummary);
for (const name of ["evidence", "review"]) {
  $(name + "-tab").addEventListener("click", () => setTab(name));
  $(name + "-tab").addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      setTab(name === "evidence" ? "review" : "evidence", true);
    }
  });
}
renderCase();

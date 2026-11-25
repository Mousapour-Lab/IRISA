"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine, ArrowLeft, BookOpen, Check, CheckCircle2, ChevronDown, ChevronLeft,
  ChevronRight, CircleHelp, ClipboardCheck, Code2, Copy, Database, ExternalLink,
  FileText, FolderTree, HardDriveDownload, ListFilter, Menu, Play, RotateCcw,
  ShieldAlert, ShieldCheck, Video, X,
} from "lucide-react";

const DEPARTMENTS = [
  { id: 1, name: "Procurement" },
  { id: 2, name: "Warehouse" },
  { id: 3, name: "IT" },
];
const EMPLOYEES = [
  { id: 101, name: "Ali Rezaei", dept: 1 }, { id: 102, name: "Sara Ahmadi", dept: 1 },
  { id: 103, name: "Reza Karimi", dept: 2 }, { id: 104, name: "Neda Hosseini", dept: 2 },
  { id: 105, name: "Omid Taheri", dept: 3 }, { id: 106, name: "Maryam Saberi", dept: 3 },
];
const ORG = [
  { id: 1, name: "CEO", parent: null },
  { id: 2, name: "Procurement Deputy", parent: 1 },
  { id: 3, name: "Finance Deputy", parent: 1 },
  { id: 7, name: "Operations Deputy", parent: 1 },
  { id: 4, name: "Procurement Manager", parent: 2 },
  { id: 6, name: "Accounting Manager", parent: 3 },
  { id: 5, name: "Warehouse Manager", parent: 7 },
];
const TREE_QUERY = `SELECT CASE WHEN CONNECT_BY_ISLEAF = 1 THEN 0 WHEN LEVEL = 1 THEN 1 ELSE -1 END,
       LEVEL,
       org_name,
       NULL,
       SUBSTR(SYS_CONNECT_BY_PATH(org_name, ' -> '), 5)
FROM   org_hierarchy
START WITH parent_id IS NULL
CONNECT BY PRIOR org_id = parent_id
ORDER SIBLINGS BY org_name;`;
const LOV_QUERY = `SELECT emp_name, emp_id
FROM   employees
WHERE  dept_id = :EMP_BLK.DEPT_LIST
ORDER  BY emp_name`;
const TASK1_TRIGGER = `:EMP_BLK.EMP_NAME := NULL;
:EMP_BLK.EMP_ID   := NULL;
GO_ITEM('EMP_BLK.EMP_NAME');
LIST_VALUES;   -- optional: opens the LOV automatically`;
const TREE_TRIGGER = `DECLARE
  htree ITEM;
BEGIN
  htree := FIND_ITEM('NAV.TREE_ORG');
  IF :SYSTEM.TRIGGER_NODE_SELECTED = 'TRUE' THEN
    :NAV.PATH_TXT := FTREE.GET_TREE_NODE_PROPERTY(
      htree, :SYSTEM.TRIGGER_NODE, FTREE.NODE_VALUE);
  END IF;
END;`;
const TASKS = [
  "بررسی پیش‌نیازهای نسخه‌ی انتخاب‌شده در مستندات رسمی Oracle",
  "دانلود نصاب‌ها از منبع رسمی و ثبت نسخه و فایل‌ها",
  "نصب دیتابیس و ساخت کاربر تمرینی با رمز شخصی و امن",
  "اجرای اسکریپت‌های schema و seed در Oracle",
  "ساخت فرم اول و آزمایش LOV برای هر سه دپارتمان",
  "ساخت فرم دوم و آزمایش مسیر سه سطحی درخت",
  "تأیید موارد باز در Forms Builder و ثبت محیط واقعی",
  "ضبط و بازبینی ویدیو؛ افزودن لینک فقط پس از بارگذاری واقعی",
];

type Tab = "guide" | "lov" | "tree" | "code" | "delivery";

function cx(...values: Array<string | false | undefined>) { return values.filter(Boolean).join(" "); }
function CodeBox({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1400); }
    catch { setCopied(false); }
  }
  return <div className="codebox" dir="ltr"><div className="codebar"><span>{label || "Code"}</span><button onClick={copy} className="copy-btn" aria-label="کپی کد">{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? "کپی شد" : "کپی"}</button></div><pre><code>{code}</code></pre></div>;
}
function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="section-title"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{text}</p></div>;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("guide");
  const [dept, setDept] = useState(1);
  const [chosen, setChosen] = useState<(typeof EMPLOYEES)[number] | null>(null);
  const [lovOpen, setLovOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedNode, setSelectedNode] = useState(1);
  const [expanded, setExpanded] = useState<number[]>([1, 2, 3, 7]);
  const [query, setQuery] = useState("");
  const [checks, setChecks] = useState<boolean[]>(TASKS.map(() => false));
  const [loaded, setLoaded] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [env, setEnv] = useState({ db: "", forms: "", java: "", os: "", note: "" });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem("irisa-workspace-v1");
        if (raw) {
          const saved = JSON.parse(raw) as { checks?: boolean[]; env?: typeof env };
          if (saved.checks?.length === TASKS.length) setChecks(saved.checks);
          if (saved.env) setEnv(saved.env);
        }
      } catch { /* Ignore stale or malformed local-only data. */ }
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem("irisa-workspace-v1", JSON.stringify({ checks, env }));
  }, [checks, env, loaded]);

  const filteredEmployees = useMemo(() => EMPLOYEES.filter((employee) => employee.dept === dept &&
    employee.name.toLowerCase().includes(filter.trim().toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)), [dept, filter]);
  const pathById = useMemo(() => {
    const map = new Map<number, string>();
    for (const node of ORG) {
      const path: string[] = [node.name];
      let parent = node.parent;
      while (parent !== null) {
        const ancestor = ORG.find((item) => item.id === parent);
        if (!ancestor) break;
        path.unshift(ancestor.name);
        parent = ancestor.parent;
      }
      map.set(node.id, path.join(" -> "));
    }
    return map;
  }, []);
  const done = checks.filter(Boolean).length;
  const setTaskDone = (index: number, value: boolean) => setChecks((old) => old.map((item, i) => i === index ? value : item));
  const reset = () => { setChecks(TASKS.map(() => false)); setEnv({ db: "", forms: "", java: "", os: "", note: "" }); };

  const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
    { id: "guide", label: "راهنمای نصب", icon: BookOpen },
    { id: "lov", label: "شبیه‌ساز LOV", icon: ListFilter },
    { id: "tree", label: "شبیه‌ساز درخت", icon: FolderTree },
    { id: "code", label: "کدهای پروژه", icon: Code2 },
    { id: "delivery", label: "چک‌لیست تحویل", icon: ClipboardCheck },
  ];
  const active = tabs.find((item) => item.id === tab)!;

  function renderTree(parent: number | null, depth = 0): React.ReactNode {
    return ORG.filter((node) => node.parent === parent).sort((a, b) => a.name.localeCompare(b.name)).map((node) => {
      const hasChildren = ORG.some((child) => child.parent === node.id);
      const isOpen = expanded.includes(node.id);
      return <div key={node.id}>
        <div className={cx("tree-line", selectedNode === node.id && "tree-selected")} style={{ paddingInlineStart: 12 + depth * 24 }}>
          {hasChildren ? <button className="tree-toggle" onClick={() => setExpanded((old) => isOpen ? old.filter((id) => id !== node.id) : [...old, node.id])} aria-label={isOpen ? "بستن" : "بازکردن"}>{isOpen ? <ChevronDown size={15}/> : <ChevronLeft size={15}/>}</button> : <span className="tree-spacer"/>}
          <button className="tree-label" onClick={() => setSelectedNode(node.id)}><span className={cx("node-dot", depth === 0 && "root-dot", depth === 2 && "leaf-dot")}/>{node.name}</button>
          <span className="depth-tag">L{depth + 1}</span>
        </div>
        {hasChildren && isOpen && renderTree(node.id, depth + 1)}
      </div>;
    });
  }

  return <main className="app-shell">
    <aside className={cx("sidebar", mobileMenu && "sidebar-open")}>
      <div className="brand"><div className="brand-mark"><Database size={21}/></div><div><b>Oracle Forms</b><span>همراه تمرین ایریسا</span></div><button className="mobile-close" onClick={() => setMobileMenu(false)} aria-label="بستن منو"><X size={18}/></button></div>
      <div className="workspace-label">میز کار شخصی <span className="local-tag"><i/> محلی</span></div>
      <nav className="side-nav" aria-label="بخش‌های برنامه">
        {tabs.map(({ id, label, icon: Icon }, index) => <button key={id} onClick={() => { setTab(id); setMobileMenu(false); }} className={cx("nav-item", tab === id && "nav-active")}><Icon size={18}/><span>{label}</span><small>{String(index + 1).padStart(2, "0")}</small></button>)}
      </nav>
      <div className="sidebar-bottom"><div className="safe-note"><ShieldCheck size={17}/><div><b>بدون اتصال دیتابیس</b><span>شبیه‌سازها با داده‌ی نمونه در مرورگر اجرا می‌شوند.</span></div></div><div className="sidebar-foot">اطلاعات چک‌لیست فقط در همین مرورگر ذخیره می‌شود.</div></div>
    </aside>
    {mobileMenu && <button className="scrim" aria-label="بستن منو" onClick={() => setMobileMenu(false)}/>}
    <section className="main-column">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu-btn" aria-label="بازکردن منو" onClick={() => setMobileMenu(true)}><Menu size={20}/></button><div className="crumb">فضای تمرین <ChevronLeft size={14}/><strong>{active.label}</strong></div></div><div className="topbar-right"><span className="not-tested"><span/>راهنما و شبیه‌ساز؛ اجرا نشده در Oracle</span><div className="avatar">IR</div></div></header>
      <div className="content-wrap">
        <div className="welcome-row"><div><div className="eyebrow">ORACLE FORMS · TAKE-HOME PRACTICE</div><h1>آماده‌سازی محیط و تمرین فرم‌ها</h1><p>یک فضای تمرینی فارسی برای دنبال‌کردن مراحل، دیدن رفتار دو فرم نمونه و مرور کدهای همین مخزن.</p></div><div className="deadline-chip"><span className="deadline-icon"><ShieldAlert size={17}/></span><span><b>بدون فرض درباره‌ی موعد</b><small>تاریخ تحویل را از پیام کارفرما بررسی کن</small></span></div></div>
        <div className="progress-card"><div className="progress-copy"><div className="progress-icon"><CheckCircle2 size={19}/></div><div><b>پیشرفت چک‌لیست شخصی</b><span>{done} مورد از {TASKS.length} مورد علامت خورده</span></div></div><div className="progress-track"><div style={{ width: `${Math.round(done / TASKS.length * 100)}%` }}/></div><strong>{Math.round(done / TASKS.length * 100)}%</strong></div>
        {tab === "guide" && <>
          <SectionTitle eyebrow="شروع امن" title="نصب را با نسخه‌ی درست شروع کن" text="ترکیب نسخه‌های دیتابیس، Forms، WebLogic و Java به نسخه‌ی دقیق محصول و سیستم‌عامل وابسته است. قبل از نصب، ماتریس سازگاری همان نسخه را از مستندات رسمی Oracle بررسی کن."/>
          <div className="notice notice-amber"><ShieldAlert size={19}/><div><b>VPN جایگزین اطلاعات واقعی یا مجوز نیست.</b><p>از اطلاعات هویتی/نشانی ساختگی برای ثبت‌نام استفاده نکن. NordVPN هم دسترسی دانلود، سازگاری یا مجوز استفاده را تضمین نمی‌کند. اگر دسترسی مجاز نداری، از کارفرما یا پشتیبانی رسمی مسیر مجاز بگیر.</p></div></div>
          <div className="guide-grid">
            <article className="guide-card"><div className="guide-num">۰۱</div><div className="guide-card-icon purple"><HardDriveDownload size={20}/></div><h3>نسخه و پیش‌نیازها را مشخص کن</h3><p>نسخه‌ی دقیق Windows، Oracle Database و Oracle Forms را تعیین کن. سپس پیش‌نیازهای Java، معماری، فضای دیسک و مسیر نصب را در مستندات همان نسخه چک کن.</p><a href="https://www.oracle.com/middleware/technologies/forms/downloads.html" target="_blank" rel="noreferrer">صفحه رسمی Forms <ExternalLink size={14}/></a></article>
            <article className="guide-card"><div className="guide-num">۰۲</div><div className="guide-card-icon blue"><Database size={20}/></div><h3>دیتابیس و کاربر تمرینی</h3><p>نصاب مجاز را از Oracle بگیر و طبق راهنمای خودش نصب کن. با DBA یا دستورالعمل نسخه، کاربر جداگانه‌ای برای تمرین بساز؛ رمز را در چت، کد یا Git قرار نده.</p><a href="https://www.oracle.com/database/technologies/xe-downloads.html" target="_blank" rel="noreferrer">صفحه Oracle Database XE <ExternalLink size={14}/></a></article>
            <article className="guide-card"><div className="guide-num">۰۳</div><div className="guide-card-icon teal"><Code2 size={20}/></div><h3>ساخت جداول همین تسک</h3><p>با کاربر تمرینی به دیتابیس وصل شو و اسکریپت‌ها را به ترتیب اجرا کن. خروجی کوئری درخت را قبل از تنظیم Tree در Forms، جداگانه بررسی کن.</p><div className="file-pills"><code>01_schema.sql</code><code>02_seed.sql</code><code>03_tree_query.sql</code></div></article>
            <article className="guide-card"><div className="guide-num">۰۴</div><div className="guide-card-icon orange"><FolderTree size={20}/></div><h3>Forms Builder و اجرا</h3><p>نصب و runtime را مطابق راهنمای همان release انجام بده. وجود فایل نصاب به‌تنهایی برای تعیین روش نصب یا اجرای فرم کافی نیست؛ چیزی را که در سیستم واقعاً جواب داده ثبت کن.</p><a href="https://www.oracle.com/middleware/technologies/forms/downloads.html" target="_blank" rel="noreferrer">راهنمای دانلود رسمی <ExternalLink size={14}/></a></article>
          </div>
          <section className="install-steps"><div className="install-steps-heading"><div><span className="eyebrow">SEQUENCE</span><h3>ترتیب پیشنهادی اجرا</h3><p>هر مرحله را با مستندات release انتخابی تطبیق بده؛ اگر پیش‌نیازها تأیید نیستند، نصب را جلو نبر.</p></div><span className="sequence-badge">۶ مرحله</span></div><ol><li><i>۱</i><div><b>ثبت نسخه‌ها و نیازمندی‌ها</b><span>نسخه و build دقیق سیستم‌عامل، دیتابیس، Forms و Java را یادداشت و در ماتریس سازگاری رسمی بررسی کن.</span></div></li><li><i>۲</i><div><b>تهیه‌ی رسانه‌ی نصب مجاز</b><span>فقط از کانال رسمی/مجاز بگیر؛ فایل‌ها و checksum منتشرشده را ثبت کن. VPN تضمین دسترسی یا مجوز نیست.</span></div></li><li><i>۳</i><div><b>نصب دیتابیس</b><span>طبق راهنمای همان نسخه نصب کن، اتصال و سرویس را بررسی کن، سپس با روش امن یک schema تمرینی بساز.</span></div></li><li><i>۴</i><div><b>اجرای SQL همین مخزن</b><span><code>01_schema.sql</code>، سپس <code>02_seed.sql</code>؛ کوئری <code>03_tree_query.sql</code> را جداگانه اجرا و تعداد/مسیرها را بررسی کن.</span></div></li><li><i>۵</i><div><b>نصب و تنظیم Forms</b><span>پیش‌نیاز Java، ترتیب middleware، domain و runtime را فقط طبق مستندات نسخه‌ی دقیق انجام بده؛ log خطا را نگه دار.</span></div></li><li><i>۶</i><div><b>ساخت، آزمایش و مستندسازی</b><span>دو فرم را طبق BUILD_STEPS بساز، compile و run کن، موارد VERIFY را ببند و فقط نتیجه‌های مشاهده‌شده را ثبت کن.</span></div></li></ol></section>
          <div className="two-cards"><article className="panel"><div className="panel-heading"><div className="small-icon"><CircleHelp size={18}/></div><div><h3>درباره‌ی NordVPN</h3><p>محدودیت جغرافیایی یا شرایط استفاده را دور نزن.</p></div></div><p className="body-muted">اگر VPN برای اتصال امن شبکه‌ی خودت لازم است، از آن مطابق قوانین و شرایط Oracle استفاده کن. کشور، نشانی و اطلاعات حساب باید واقعی و متعلق به خودت باشد. این برنامه وضعیت VPN یا دسترسی Oracle را نمی‌سنجد.</p></article><article className="panel"><div className="panel-heading"><div className="small-icon green"><CheckCircle2 size={18}/></div><div><h3>بعد از نصب</h3><p>پیش برو بر اساس مشاهده، نه فرض.</p></div></div><ul className="short-list"><li>نسخه‌ها و خطاهای واقعی را یادداشت کن.</li><li>فرم‌ها را داخل Builder کامپایل و اجرا کن.</li><li>فقط مواردی را تیک بزن که خودت انجام داده‌ای.</li></ul></article></div>
        </>}

        {tab === "lov" && <>
          <SectionTitle eyebrow="FORM 1 · LIST ITEM + LOV" title="انتخاب دپارتمان، محدودکردن LOV" text="این پیش‌نمایش در مرورگر رفتار مورد انتظار را شبیه‌سازی می‌کند؛ جایگزین Oracle Forms یا آزمایش Record Group واقعی نیست."/>
          <div className="sim-layout"><div className="sim-main"><div className="sim-window"><div className="window-bar"><div className="window-dots"><i/><i/><i/></div><span>فرم نمونه · EMP_BLK</span><span className="window-state"><i/> شبیه‌ساز</span></div><div className="window-body"><div className="window-title"><span className="mini-symbol"><ListFilter size={17}/></span><div><b>جست‌وجوی کارمند</b><small>انتخاب نام از LOV وابسته به دپارتمان</small></div></div><label className="field-label" htmlFor="dept">دپارتمان <span>DEPT_LIST</span></label><select id="dept" className="form-select" value={dept} onChange={(event) => { setDept(Number(event.target.value)); setChosen(null); setFilter(""); }}><option value={1}>Procurement · 1</option><option value={2}>Warehouse · 2</option><option value={3}>IT · 3</option></select><div className="form-caption"><span className="status-dot"/> تغییر دپارتمان، نام و شناسه‌ی انتخاب قبلی را پاک می‌کند.</div><div className="field-label-row"><label className="field-label" htmlFor="empname">نام کارمند <span>EMP_NAME</span></label><span className="lov-tag">LOV_EMP</span></div><div className="input-action"><input id="empname" className="form-input" readOnly value={chosen?.name || ""} placeholder="از فهرست انتخاب کن…"/><button className="primary-btn" onClick={() => { setFilter(""); setLovOpen(true); }}><ListFilter size={16}/> بازکردن LOV</button></div><label className="field-label" htmlFor="empid">شناسه <span>EMP_ID</span></label><input id="empid" className="form-input muted-input" readOnly value={chosen?.id || ""} placeholder="پس از انتخاب پر می‌شود"/><div className="form-footer"><span><ShieldCheck size={14}/> داده‌ی ساختگی برای دمو</span><button className="text-btn" onClick={() => setChosen(null)}><RotateCcw size={14}/> پاک‌کردن</button></div></div></div><div className="sim-explain"><div className="explain-head"><div className="small-icon purple"><Play size={17}/></div><div><h3>چه چیزی شبیه‌سازی می‌شود؟</h3><span>جریان رویداد در فرم ۱</span></div></div><ol className="event-list"><li><i>۱</i><span>انتخاب دپارتمان، مقدار <code>DEPT_LIST</code> را عوض می‌کند.</span></li><li><i>۲</i><span>انتخاب قبلی از دو فیلد پاک می‌شود.</span></li><li><i>۳</i><span>داده‌های LOV بر اساس دپارتمان فیلتر می‌شوند.</span></li><li><i>۴</i><span>انتخاب ردیف، نام و شناسه را پر می‌کند.</span></li></ol><div className="query-caption">Record Group query</div><CodeBox code={LOV_QUERY} label="RG_EMP · Query"/></div></div></div>
          <div className="note-strip"><CircleHelp size={17}/><span>در Forms Builder، bind داخل Record Group و refresh شدن LOV را با نسخه‌ی خودت بررسی کن؛ وضعیت این ویژگی‌ها در <code>docs/VERIFY.md</code> هنوز تأییدنشده است.</span></div>
        </>}

        {tab === "tree" && <>
          <SectionTitle eyebrow="FORM 2 · HIERARCHICAL TREE" title="گره را انتخاب کن؛ مسیرش را ببین" text="درخت نمونه سه سطح دارد. کوئری و داده‌ی این شبیه‌ساز با فایل‌های SQL همین مخزن هم‌راستا هستند."/>
          <div className="tree-layout"><div className="tree-panel"><div className="tree-panel-head"><div><b>ساختار سازمانی نمونه</b><small>۷ گره · ۳ سطح</small></div><span className="live-label"><i/> قابل تعامل</span></div><div className="tree-body" dir="ltr">{renderTree(null)}</div><div className="tree-legend"><span><i className="root-dot"/> ریشه</span><span><i className="leaf-dot"/> برگ</span><span>کلیک روی نام = انتخاب گره</span></div></div><div className="path-panel"><div className="path-icon"><FolderTree size={21}/></div><span className="eyebrow">NODE PATH</span><h3>مسیر گره انتخاب‌شده</h3><div className="path-value" dir="ltr">{pathById.get(selectedNode)}</div><div className="path-meta"><span>گره: <b dir="ltr">{ORG.find((n) => n.id === selectedNode)?.name}</b></span><span>سطح: <b>{(pathById.get(selectedNode)?.split(" -> ").length || 1)}</b></span></div><div className="path-divider"/><p>در نسخه‌ی SQL، ستون پنجم <code>NODE_VALUE</code> مسیر کامل را نگه می‌دارد. تریگر Forms باید مقدار آن را در <code>PATH_TXT</code> نمایش دهد.</p></div></div>
          <div className="query-card"><div className="query-card-title"><div><span className="small-icon teal"><Code2 size={17}/></span><div><b>کوئری درخت پنج‌ستونی</b><small>از sql/03_tree_query.sql</small></div></div><button className={cx("seg-btn", query === "parent" && "seg-active")} onClick={() => setQuery(query === "parent" ? "" : "parent")}>نمایش منطق مسیر</button></div><CodeBox code={TREE_QUERY} label="Oracle SQL · Hierarchical Tree"/>{query === "parent" && <div className="logic-note"><b>منطق مسیر:</b> <code>SYS_CONNECT_BY_PATH</code> مسیر را می‌سازد و <code>SUBSTR(..., 5)</code> جداکننده‌ی آغازین « -&gt; » را حذف می‌کند. این شبیه‌ساز محاسبه‌ی همان مسیر را در JavaScript انجام می‌دهد، نه Oracle.</div>}</div>
        </>}

        {tab === "code" && <>
          <SectionTitle eyebrow="SOURCE FILES" title="کدهای قابل مرور و کپی" text="نسخه‌ی مرجع برای اجرا، فایل‌های داخل پوشه‌های sql/ و forms/ این مخزن هستند. کدها در این صفحه اجرا نمی‌شوند."/>
          <div className="notice notice-blue"><FileText size={18}/><div><b>وضعیت صادقانه</b><p>هیچ‌یک از SQLها روی Oracle و هیچ تریگری داخل Forms Builder اجرا یا کامپایل نشده است. موارد نیازمند تأیید در <code>docs/VERIFY.md</code> فهرست شده‌اند.</p></div></div>
          <div className="code-grid"><article className="code-card"><div className="code-card-head"><span className="file-type">SQL</span><div><b>Record Group · LOV پویا</b><small>forms/task1_list_and_dynamic_lov/triggers.sql</small></div></div><CodeBox code={LOV_QUERY} label="RG_EMP"/><p>نام و شناسه از یک LOV برمی‌گردند؛ <code>EMP_ID</code> از mapping پر می‌شود، نه LOV جداگانه.</p></article><article className="code-card"><div className="code-card-head"><span className="file-type plsql">PL/SQL</span><div><b>WHEN-LIST-CHANGED</b><small>Task 1 · DEPT_LIST</small></div></div><CodeBox code={TASK1_TRIGGER} label="Trigger code"/><p>در فایل مرجع، بازشدن خودکار LOV با <code>LIST_VALUES</code> به‌عنوان انتخاب اختیاری آمده است.</p></article><article className="code-card wide"><div className="code-card-head"><span className="file-type plsql">PL/SQL</span><div><b>خواندن NODE_VALUE درخت</b><small>forms/task2_tree_path/triggers.sql</small></div></div><CodeBox code={TREE_TRIGGER} label="WHEN-TREE-NODE-SELECTED"/><p>امضای built-inها و رفتار runtime هنوز باید در Forms Builder واقعی بررسی شود.</p></article></div>
          <div className="source-links"><a href="/sql/01_schema.sql">01_schema.sql <ArrowLeft size={14}/></a><a href="/sql/02_seed.sql">02_seed.sql <ArrowLeft size={14}/></a><a href="/sql/03_tree_query.sql">03_tree_query.sql <ArrowLeft size={14}/></a><a href="/forms/task1_list_and_dynamic_lov/BUILD_STEPS.md">BUILD_STEPS · Task 1 <ArrowLeft size={14}/></a><a href="/forms/task2_tree_path/BUILD_STEPS.md">BUILD_STEPS · Task 2 <ArrowLeft size={14}/></a></div>
        </>}

        {tab === "delivery" && <>
          <SectionTitle eyebrow="PERSONAL WORKSPACE" title="آماده‌سازی و تحویل" text="موارد زیر را پس از انجام واقعی علامت بزن. وضعیت فقط در localStorage همین مرورگر نگه‌داری می‌شود و به پایگاه‌داده‌ای ارسال نمی‌شود."/>
          <div className="delivery-grid"><section className="checklist-panel"><div className="list-head"><div><span className="small-icon green"><ClipboardCheck size={18}/></span><div><h3>چک‌لیست پروژه</h3><small>مستقل از این برنامه در Oracle آزمایش شود</small></div></div><span className="count-pill">{done}/{TASKS.length}</span></div><div className="check-items">{TASKS.map((task, index) => <label key={task} className={cx("check-row", checks[index] && "check-done")}><input type="checkbox" checked={checks[index]} onChange={(event) => setTaskDone(index, event.target.checked)}/><span className="custom-check">{checks[index] && <Check size={13}/>}</span><span>{task}</span></label>)}</div><button className="reset-btn" onClick={() => setChecks(TASKS.map(() => false))}><RotateCcw size={14}/> پاک‌کردن تیک‌ها</button></section><section className="env-panel"><div className="list-head"><div><span className="small-icon purple"><FileText size={18}/></span><div><h3>یادداشت محیط واقعی</h3><small>فقط بعد از نصب، با مقدار واقعی پر کن</small></div></div></div><div className="env-fields"><label>نسخه Database<input value={env.db} onChange={(e) => setEnv({ ...env, db: e.target.value })} placeholder="TODO(owner)"/></label><label>نسخه Forms Builder<input value={env.forms} onChange={(e) => setEnv({ ...env, forms: e.target.value })} placeholder="TODO(owner)"/></label><label>نسخه Java و سیستم‌عامل<input value={env.java} onChange={(e) => setEnv({ ...env, java: e.target.value })} placeholder="مقدار مشاهده‌شده"/></label><label>یادداشت خطا / راه‌حل واقعی<textarea value={env.note} onChange={(e) => setEnv({ ...env, note: e.target.value })} placeholder="پیام خطا و راه‌حلی که واقعاً آزمودی…" rows={3}/></label></div><button className="download-btn" onClick={() => { const md = `# Environment Notes\n\n- Database: ${env.db || "TODO(owner)"}\n- Forms Builder: ${env.forms || "TODO(owner)"}\n- Java / OS: ${env.java || "TODO(owner)"}\n\n## Issue actually observed\n${env.note || "TODO(owner)"}\n`; const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown" })); a.download = "ENVIRONMENT-notes.md"; a.click(); URL.revokeObjectURL(a.href); }}><ArrowDownToLine size={15}/> دریافت یادداشت Markdown</button></section></div>
          <div className="recording-card"><div className="record-icon"><Video size={20}/></div><div><h3>ویدیوی نمایش</h3><p>فرم‌های واقعی را پس از build/runtime ضبط کن. لینک و مدت‌زمان را فقط وقتی فایل واقعاً آماده و بارگذاری شده، اضافه کن.</p></div><span className="todo-pill">TODO(owner)</span></div>
        </>}
        <footer className="page-footer"><span>همراه تمرین Oracle Forms</span><span>این برنامه نصب Oracle را انجام نمی‌دهد و وضعیت‌ها را راستی‌آزمایی نمی‌کند.</span></footer>
      </div>
    </section>

    {lovOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setLovOpen(false); }}><div className="lov-modal" role="dialog" aria-modal="true" aria-labelledby="lov-title"><div className="modal-head"><div><span className="lov-tag">LOV_EMP</span><h2 id="lov-title">انتخاب کارمند</h2><p>دپارتمان: {DEPARTMENTS.find((item) => item.id === dept)?.name}</p></div><button onClick={() => setLovOpen(false)} className="modal-close" aria-label="بستن"><X size={19}/></button></div><div className="search-box"><ListFilter size={16}/><input autoFocus value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="جست‌وجوی نام…"/></div><div className="lov-table-head"><span>نام کارمند</span><span>شناسه</span></div><div className="lov-results">{filteredEmployees.length ? filteredEmployees.map((employee) => <button key={employee.id} className="lov-row" onClick={() => { setChosen(employee); setLovOpen(false); }}><span><i className="person-avatar">{employee.name.split(" ").map((part) => part[0]).join("")}</i>{employee.name}</span><code>{employee.id}</code><ChevronLeft size={15}/></button>) : <div className="empty-result">برای این فیلتر موردی پیدا نشد.</div>}</div><div className="modal-foot">{filteredEmployees.length} ردیف نمونه <span>انتخاب فقط در همین شبیه‌ساز ثبت می‌شود</span></div></div></div>}
  </main>;
}

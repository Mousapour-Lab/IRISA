# گزارش کامل کارهای انجام‌شده

این سند گزارشی است از تغییرات مخزن، وب‌اپ فارسی، آزمون‌های انجام‌شده، وضعیت GitHub و Vercel، و مواردی که هنوز انجام یا تأیید نشده‌اند. وضعیت‌ها بر اساس آن چیزی است که هنگام تهیه‌ی این گزارش از مخزن و سرویس‌ها بررسی شد.

> **محدودیت مهم:** وب‌اپ به معنی نصب Oracle نیست. من در این محیط هیچ SQL را روی Oracle اجرا نکردم و فرم واقعی در Forms Builder نساختم، compile نکردم یا در runtime نیازمودم. در پیامی که کاربر نقل کرد، به اجرای موفق اسکریپت‌ها روی Oracle XE 21c در Docker اشاره شده بود؛ اما log، دستورهای اجرا و خروجی‌ها در این گفتگو در دسترس نبودند و من آن اجرا را مستقل تأیید نکردم. به همین دلیل نتیجه‌ای از طرف خودم به‌عنوان تست Oracle ثبت نمی‌کنم.

## ۱. خلاصه‌ی وضعیت فعلی

- مخزن: [Mousapour-Lab/IRISA](https://github.com/Mousapour-Lab/IRISA)
- شاخه‌ی کاری: `arena/2942f98e-irisa`
- commit افزودن وب‌اپ به شاخه‌ی کاری: `20ff26f` — `Add Persian Oracle Forms companion web app`
- PR #1 و PR #2 هر دو merge شده‌اند. PR #2 با merge commit `33ff946c79f32885d79660364e0a7bb1855a8dd9` وارد `main` شده است.
- وب‌اپ Vercel در نشانی [irisa-oracle-forms-companion.vercel.app](https://irisa-oracle-forms-companion.vercel.app) در دسترس است. آخرین بررسی Vercel آن را `READY` و `Production` نشان داد و محتوای صفحه دریافت شد.
- deployment فعلی Production از `main` و commit ادغام PR #2 ساخته شده است؛ **این Preview شاخه نیست**.
- پس از تهیه‌ی گزارش، به درخواست کاربر بخش «Persian companion web app» در README از بالای فایل به انتهای آن منتقل شد؛ وضعیت‌های تست و visibility ریپو/سایت در این تغییر دست‌نخورده ماندند.

## ۲. کارهای انجام‌شده روی SQL و فرم‌ها

### ساختار پایگاه داده و داده‌ی نمونه

- اسکریپت‌های `sql/01_schema.sql`، `sql/02_seed.sql`، `sql/03_tree_query.sql` و `sql/99_drop.sql` در مخزن قرار گرفتند.
- مدل شامل سه جدول `departments`، `employees` و `org_hierarchy` است.
- داده‌ی نمونه شامل ۳ دپارتمان، ۶ کارمند و ۷ گره‌ی سلسله‌مراتبی در سه سطح است.
- برای منطقی‌شدن درخت، `Operations Deputy` زیر CEO اضافه شد و `Warehouse Manager` زیر آن قرار گرفت.
- ترتیب درج گره‌های والد و فرزند بررسی شد؛ ردیف‌های مدیران پس از ردیف معاونان درج شده‌اند تا در صورت اجرای واقعی، والد پیش از فرزند درج شود.
- کوئری درخت پنج ستون دارد: state، depth، label، icon و value/path. مقدار مسیر با `SYS_CONNECT_BY_PATH` ساخته می‌شود و `SUBSTR(..., 5)` جداکننده‌ی آغازین را حذف می‌کند.

### Task 1 — List Item و Dynamic LOV

- دستورالعمل ساخت `EMP_BLK`، `DEPT_LIST`، `RG_EMP` و `LOV_EMP` در `forms/task1_list_and_dynamic_lov/BUILD_STEPS.md` قرار دارد.
- مقادیر نمونه‌ی فهرست عبارت‌اند از `Procurement = 1`، `Warehouse = 2` و `IT = 3`.
- کوئری Record Group از مقدار `:EMP_BLK.DEPT_LIST` برای فیلتر کارمندان استفاده می‌کند.
- تریگر نمونه فیلدهای نام و شناسه‌ی کارمند را پاک می‌کند، cursor را به `EMP_NAME` می‌برد و `LIST_VALUES` را به‌عنوان بازکردن اختیاری LOV نشان می‌دهد.
- توضیح اصلاح شد تا روشن باشد `EMP_NAME` به LOV وصل است و `EMP_ID` از column mapping پر می‌شود؛ `EMP_ID` LOV جداگانه ندارد.

### Task 2 — Hierarchical Tree و مسیر

- راهنمای ساخت بلوک `NAV`، درخت `TREE_ORG` و فیلد `PATH_TXT` در `forms/task2_tree_path/BUILD_STEPS.md` است.
- نمونه‌ی اصلی trigger از `FTREE.POPULATE_TREE` و `FTREE.GET_TREE_NODE_PROPERTY(..., FTREE.NODE_VALUE)` استفاده می‌کند.
- fallback درختی از نوع `FTREE.NODE`، `FTREE.ID_NULL` و پیمایش parent را در قالب کد توضیحی دارد؛ اما نام built-inها و رفتار این روش در Forms Builder واقعی تأیید نشده است.

### اصلاحات حاصل از بازبینی قبلی

در فایل‌ها و مستندات، این موارد اصلاح شدند:

1. نوع گره‌ی fallback از `NODE` به `FTREE.NODE` تغییر کرد و شرط نامعتبر `IS NOT NULL` حذف شد.
2. مقدار `Mapping of Other Values = 0` حذف شد؛ property باید خالی بماند.
3. نام fallback مربوط به Record Group به `POPULATE_GROUP_WITH_QUERY` اصلاح شد و ادعای بی‌مدرک درباره‌ی bindها حذف شد.
4. `TO_NUMBER` غیرضروری از فیلتر دپارتمان حذف شد.
5. نام propertyهای درخت با احتیاط نوشته شد، چون ممکن است نام واقعی در نسخه‌ی Forms متفاوت باشد.
6. درباره‌ی `Automatic Refresh` به‌عنوان موردی برای بررسی LOV یادداشت اضافه شد، نه نتیجه‌ی آزمایش‌شده.
7. متن مربوط به `:SYSTEM.TRIGGER_NODE` و `FTREE.SELECTED_NODE` خنثی شد و به‌عنوان موضوع نیازمند بررسی باقی ماند.
8. چند عبارت بیش‌ازحد قطعی یا تبلیغاتی از اسناد حذف/بازنویسی شدند. `VERIFY.md` و `TEST_CHECKLIST.md` حذف نشدند و همچنان فهرست پرسش‌ها و آزمایش‌های آینده‌اند.
9. در README مشخص شد فقط `EMP_NAME` LOV دارد.
10. ساختار نمونه‌ی درخت با افزودن `Operations Deputy` اصلاح شد.

همچنین اشکال احتمالی ترتیب درج FK در seed پیدا و با جابه‌جایی ردیف‌ها اصلاح شد. این بررسی با شبیه‌سازی ترتیب و محدودیت‌ها انجام شد، نه با اجرای Oracle.

## ۳. وب‌اپ فارسی

### چه چیزی اضافه شد

یک همراه‌کار Next.js با رابط RTL فارسی ساخته شد که پنج بخش دارد:

1. **راهنمای نصب:** ترتیب کلی مراحل را نشان می‌دهد و می‌گوید سازگاری نسخه‌ها باید از مستندات همان release بررسی شود.
2. **شبیه‌ساز LOV:** تغییر دپارتمان، فیلترکردن داده‌ی نمونه و پرشدن نام/شناسه را در مرورگر نمایش می‌دهد.
3. **شبیه‌ساز درخت:** درخت نمونه‌ی هفت‌گرهی و سه‌سطحی و مسیر گره‌ی انتخاب‌شده را نشان می‌دهد.
4. **کدهای پروژه:** کدهای نمونه را برای مشاهده و کپی نشان می‌دهد و به فایل‌های اصلی مخزن لینک می‌دهد.
5. **چک‌لیست و یادداشت محیط:** وضعیت‌ها و یادداشت‌ها در `localStorage` همان مرورگر نگه داشته می‌شوند و امکان دریافت یک فایل Markdown از یادداشت محیط وجود دارد.

### تصمیم‌های ایمنی و صداقت

- شبیه‌سازها به Oracle یا PostgreSQL وصل نیستند و داده‌هایشان فقط برای نمایش رفتار نمونه است.
- هیچ login، پسورد دیتابیس، connection string یا API برای پایگاه داده در وب‌اپ اضافه نشده است.
- اتصال یا استفاده‌ای از Supabase انجام نشد.
- اطلاعات تماس/نشانی ساختگی، گذرواژه‌های نمونه، ادعای تضمین دسترسی با VPN و ادعاهای تأییدنشده درباره‌ی نصب سریع یا سازگاری نسخه‌ها از پیش‌نویس اولیه وارد محصول نشدند.
- چک‌لیست از ابتدا تیک‌نخورده است؛ سایت نصب یا تست Oracle را به‌جای صاحب پروژه انجام نمی‌دهد.

### فایل‌های افزوده/تغییریافته برای وب‌اپ

- `package.json` و `package-lock.json`
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `next.config.ts`، `next-env.d.ts`، `tsconfig.json` و `eslint.config.mjs`
- `public/sql/` شامل سه فایل SQL
- `public/forms/task1_list_and_dynamic_lov/` و `public/forms/task2_tree_path/` شامل راهنماها و triggerها

هفت فایل داخل `public/` در برابر فایل‌های اصلی `sql/` و `forms/` با `cmp` مقایسه شدند و در زمان بررسی byte-for-byte یکسان بودند. این نسخه‌های عمومی برای لینک‌های داخل وب‌اپ هستند.

## ۴. آزمون‌ها و بررسی‌هایی که واقعاً انجام شدند

### ابزارهای وب‌اپ

در آخرین اجرای محلی:

- `npm run typecheck` — موفق
- `npm run lint` — موفق
- `npm audit --audit-level=moderate` — صفر آسیب‌پذیری گزارش شد
- `npm run build` — build تولیدی Next.js موفق شد.
- درخواست محلی به صفحه‌ی اصلی و یکی از فایل‌های SQL پاسخ HTTP 200 داد.
- صفحه‌ی Production Vercel با ابزار خواندن صفحه دریافت شد و محتوای فارسی آن قابل مشاهده بود.
- `git diff --check` و مقایسه‌ی نسخه‌های فایل‌های public بررسی شدند.

این نتایج فقط مربوط به کد وب‌اپ و پاسخ HTTP هستند؛ هیچ‌کدام Oracle را آزمایش نمی‌کنند.

### بررسی‌های آفلاین SQL/درخت

در کار قبلی، ترتیب parent/child در seed با یک شبیه‌سازی Python بررسی شد و خطای FK در ترتیب درج باقی نماند. پیمایش ساختار نمونه نیز به‌صورت محلی با منطق query مقایسه شد: ۷ گره، حداکثر عمق ۳ و مسیرهای مورد انتظار. این‌ها شبیه‌سازی آفلاین هستند، نه اجرای SQL در Oracle.

## ۵. GitHub، commitها و PRها

- PR #1: [Add Oracle Forms take-home task](https://github.com/Mousapour-Lab/IRISA/pull/1) — merge شده بود.
- PR #2: [Apply Oracle Forms review fixes and add Persian companion app](https://github.com/Mousapour-Lab/IRISA/pull/2) — شامل اصلاحات بازبینی و وب‌اپ شد و merge شده است.
- commit وب‌اپ در شاخه‌ی کاری: `20ff26f5c8b343b5dfb37cd9a3979bb0b7536a9d`.
- merge commit PR #2 در `main`: `33ff946c79f32885d79660364e0a7bb1855a8dd9`.
- برای جلوگیری از PR تکراری، عنوان و توضیح PR موجود به‌روزرسانی شد. فرمان `gh pr edit` به‌دلیل خطای GraphQL مربوط به Projects قدیمی موفق نشد؛ سپس متن همان PR از طریق `gh api` به‌روزرسانی شد.
- هنگام بررسی نهایی شاخه‌ی محلی `arena/2942f98e-irisa` روی commit وب‌اپ بود، با `origin` همگام بود و working tree پاک بود.

## ۶. راه‌اندازی و وضعیت Vercel

1. ابتدا پروژه‌ی هم‌نامی در Vercel پیدا نشد و پروژه‌های دیگر دست‌کاری نشدند.
2. تلاش اولیه برای ساخت پروژه به‌دلیل نبود Login Connection گیت‌هاب در Vercel رد شد. پس از اینکه صاحب حساب گفت اتصال برقرار شده، ساخت پروژه موفق شد.
3. پروژه‌ی `irisa-oracle-forms-companion` به مخزن `Mousapour-Lab/IRISA` متصل شد.
4. یک درخواست deployment از شاخه‌ی feature به‌جای Preview با target برابر Production برگشت. چون اجازه فقط برای Preview بود، همان deployment لغو شد و alias نگرفت.
5. در بررسی بعدی، Vercel یک deployment جداگانه از `main` با وضعیت `READY` و target برابر `production` نشان داد. این deployment روی merge commit PR #2 است و alias اصلی `https://irisa-oracle-forms-companion.vercel.app` دارد. محتوای صفحه از این نشانی دریافت شد.
6. بنابراین وب‌اپ در حال حاضر روی Production است؛ deployment لغوشده‌ی feature، deployment زنده‌ی فعلی نیست.

### CLI، افزونه و MCP

- Vercel CLI نسخه‌ی `67.0.0` به‌صورت global نصب شد.
- `vercel whoami` نشان داد CLI وارد حساب نشده است. `vercel login` به‌دلیل reset شدن اتصال به `api.vercel.com` در این sandbox شکست خورد.
- نصب plugin رسمی به‌علت پیدا نشدن agent پشتیبانی‌شده در PATH انجام نشد.
- نصب fallback skills به انتخاب تعاملی agent نیاز داشت؛ در این محیط agent سازگار پیدا نشد و چیزی نصب نشد.
- تنظیم MCP رسمی جداگانه انجام نشد چون کلاینت Arena در فهرست کلاینت‌های مستندشده نبود. در عین حال، اتصال Vercel در Arena برای خواندن تیم‌ها و وضعیت پروژه کار می‌کرد.

## ۷. مواردی که هنوز انجام نشده‌اند

- نصب Oracle Database یا Oracle Forms Builder در دستگاه کاربر
- من اجرای `01_schema.sql` و `02_seed.sql` را در Oracle انجام ندادم. کاربر در پیام نقل‌شده اجرای موفق آن‌ها روی Oracle XE 21c در Docker را گزارش کرده، اما خروجی/لاگ برای تأیید مستقل در این گفتگو موجود نبود.
- تأیید مستقل خروجی `03_tree_query.sql` در Oracle در اختیار من نیست.
- ساخت یا commit فایل‌های واقعی `.fmb`؛ هیچ فایل `.fmb` یا `.fmx` ساخته یا جعل نشده است
- compile و اجرای triggerها در Forms Builder/Runtime
- تأیید bind در Record Group، Automatic Refresh، نام دقیق built-inهای FTREE و دیگر موارد فهرست‌شده در `docs/VERIFY.md`
- تکمیل نسخه‌ها و خطاهای واقعی در `docs/ENVIRONMENT.md`
- تیک‌زدن موارد README یا `docs/TEST_CHECKLIST.md` پیش از آزمایش صاحب پروژه
- ضبط ویدیو یا افزودن لینک آن
- ورود CLI به Vercel از همین sandbox

## ۸. نکته‌ی امنیتی

در گفتگو چند بار رشته‌ای شبیه Bearer/API credential فرستاده شد. آن رشته در ابزارها، فایل‌های مخزن، commitها یا مستندات این گزارش استفاده یا ذخیره نشد و اینجا نیز عمداً تکرار نشده است. چون در چت افشا شده، اگر هنوز revoke نشده، باید در Vercel باطل شود؛ کلید جایگزین را در چت نفرست.

## ۹. قدم‌های پیشنهادی برای صاحب پروژه

1. credential افشاشده را revoke کن، اگر هنوز انجام نشده است.
2. نصب واقعی Oracle و Forms را بر اساس نسخه‌ی سازگار و مجاز انجام بده.
3. اسکریپت‌ها را در Oracle اجرا و فرم‌ها را با Forms Builder بساز.
4. موارد `VERIFY.md` و `TEST_CHECKLIST.md` را با نتیجه‌ی واقعی ببند و `ENVIRONMENT.md` را با نسخه‌ها و خطاهای مشاهده‌شده پر کن.
5. از اجرای واقعی هر دو فرم و triggerها ویدیوی کوتاه تهیه کن؛ هیچ وضعیت یا لینکی را قبل از انجام واقعی ثبت نکن.

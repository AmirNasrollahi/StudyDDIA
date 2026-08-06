// ============================================================
// Chapter 1 — Trade-Offs in Data Systems Architecture
// منبع: Designing Data-Intensive Applications (ویرایش دوم)
// هر فصل با CHAPTERS.push({...}) ثبت می‌شود.
// ============================================================
CHAPTERS.push({
  id: 1,
  title: 'Trade-Offs in Data Systems Architecture',
  badge: 'فصل اول',
  quote: 'There are no solutions; there are only trade-offs.',
  quoteAuthor: 'Thomas Sowell',
  topics: [
    '⚡ OLTP vs OLAP',
    '🏛️ Data Warehousing',
    '🌊 Data Lake & Lakehouse',
    '📜 Systems of Record & Derived Data',
    '☁️ Cloud vs Self-Hosting',
    '🔮 Cloud Native Architecture',
    '🧩 Distributed vs Single-Node',
    '🔬 Microservices & Serverless',
    '⚖️ Law, Ethics & GDPR',
    '📊 ETL / Reverse ETL'
  ],
  questions: [
    {
      id: 1,
      q: 'تفاوت اصلی بین سیستم‌های عملیاتی (OLTP) و تحلیلی (OLAP) چیست؟',
      a: `<strong>OLTP</strong> (Online Transaction Processing) برای تراکنش‌های روزمره: تعداد زیاد کوئری‌های کوچک، خواندن/نوشتن رکوردهای مجزا بر اساس کلید (Point Query). مثال: ثبت سفارش در فروشگاه.<br><br>
        <strong>OLAP</strong> (Online Analytical Processing) برای تحلیل: تعداد کم کوئری‌های سنگین، aggregation روی حجم عظیم داده. مثال: گزارش فروش ماهانه.<br><br>
        <strong>تفاوت‌های کلیدی:</strong>
        <ul>
          <li>الگوی خواندن: OLTP → Point Query · OLAP → Aggregate روی میلیون‌ها رکورد</li>
          <li>الگوی نوشتن: OLTP → درج/به‌روزرسانی تکی · OLAP → Bulk import (ETL)</li>
          <li>کاربر: OLTP → کاربر نهایی · OLAP → تحلیلگر داخلی</li>
          <li>حجم داده: OLTP → گیگابایت تا ترابایت · OLAP → ترابایت تا پتابایت</li>
        </ul>`
    },
    {
      id: 2,
      q: 'دیتا ورهاوس (Data Warehouse) چیست و چرا به وجود آمد؟',
      a: `<strong>Data Warehouse</strong> یک پایگاه داده مجزاست که کپی read-only از داده‌های تمام سیستم‌های OLTP سازمان را نگه می‌دارد.<br><br>
        <strong>دلایل ایجاد:</strong>
        <ul>
          <li><strong>Data Silos:</strong> داده در سیستم‌های مختلف پراکنده است و ترکیب آنها در یک کوئری سخت است</li>
          <li><strong>Schema mismatch:</strong> ساختار OLTP برای تحلیل بهینه نیست</li>
          <li><strong>Performance impact:</strong> کوئری‌های تحلیلی سنگین، performance سیستم عملیاتی را کاهش می‌دهند</li>
          <li><strong>Security:</strong> سیستم‌های OLTP ممکن است در شبکه‌ای جداگانه باشند</li>
        </ul>
        داده‌ها از OLTPها از طریق <strong>ETL</strong> (Extract-Transform-Load) استخراج، پالایش و بارگذاری می‌شوند.`
    },
    {
      id: 3,
      q: 'تفاوت Data Warehouse و Data Lake چیست؟',
      a: `<strong>Data Warehouse:</strong> ساختار یافته، از SQL پشتیبانی می‌کند، schema از پیش تعریف شده (<code>schema-on-write</code>). مناسب برای BI و گزارش‌گیری.<br><br>
        <strong>Data Lake:</strong> مخزن متمرکز فایل‌ها با هر فرمتی (JSON, Avro, Parquet, تصویر, ویدئو). هیچ schema اجباری ندارد (<code>schema-on-read</code>). ارزان‌تر، انعطاف‌پذیرتر — مناسب برای Data Scientists.<br><br>
        <strong>اصل Sushi:</strong> «داده خام بهتر است» — هر مصرف‌کننده می‌تواند داده را به شکل دلخواه خود transform کند.`
    },
    {
      id: 4,
      q: 'منظور از Systems of Record و Derived Data Systems چیست؟',
      a: `<strong>System of Record (Source of Truth):</strong> داده‌ای که اولین بار ثبت می‌شود و نسخه معتبر (canonical) محسوب می‌شود. هر واقعیت دقیقاً یک بار نمایش داده می‌شود (معمولاً normalized).<br><br>
        <strong>Derived Data System:</strong> نتیجه پردازش/transform داده از منبع اصلی. در صورت از دست رفتن قابل بازتولید است. مثال: کش، ایندکس، materialized view، مدل ML.<br><br>
        <strong>نکته:</strong> یک دیتابیس ذاتاً system of record یا derived نیست — نحوه استفاده شما تعیین می‌کند. سیستم‌های تحلیلی معمولاً derived هستند چون داده را از جای دیگر مصرف می‌کنند.`
    },
    {
      id: 5,
      q: 'مزایا و معایب Cloud Services نسبت به Self-Hosting چیست؟',
      a: `<strong>مزایای Cloud:</strong>
        <ul>
          <li>راه‌اندازی سریع‌تر — نیازی به یادگیری مدیریت آن سیستم ندارید</li>
          <li>مقیاس‌پذیری الاستیک — پرداخت به ازای مصرف واقعی</li>
          <li>کاهش هزینه در بار متغیر (نیازی به provision برای پیک نیست)</li>
          <li>تخصص اپراتوری ارائه‌دهنده (SLA بالاتر)</li>
        </ul>
        <strong>معایب Cloud:</strong>
        <ul>
          <li>عدم کنترل — اگر فیچری کم دارد فقط می‌توانید درخواست دهید</li>
          <li>Vendor lock-in — مهاجرت سخت و پرهزینه</li>
          <li>عیب‌یابی محدود — به لاگ و metrics سرور دسترسی ندارید</li>
          <li>خطر ژئوپلیتیک — تحریم‌ها یا قطع دسترسی</li>
        </ul>
        <strong>نکته:</strong> اگر بار کاری قابل پیش‌بینی است و تیم مجرب دارید، self-hosting معمولاً ارزان‌تر است.`
    },
    {
      id: 6,
      q: 'معماری Cloud Native چیست و تفاوت آن با IaaS چیست؟',
      a: `<strong>Cloud Native:</strong> طراحی شده از ابتدا برای استفاده از سرویس‌های ابری سطح پایین‌تر. به جای اجرای نرم‌افزار روی VM (IaaS)، روی سرویس‌های ابری مثل Object Storage (S3) ساخته می‌شود.<br><br>
        <strong>IaaS:</strong> مثل یک کامپیوتر سنتی روی ابر — شما VM می‌گیرید و خودتان نرم‌افزار را مدیریت می‌کنید.<br><br>
        <strong>Separation of Storage and Compute:</strong> در معماری cloud native، storage و compute از هم جدا می‌شوند (disaggregated). مثال: Snowflake روی S3 ساخته شده — دیتا در S3 ذخیره می‌شود و compute جداگانه روی آن اجرا می‌کند.<br><br>
        <strong>مقایسه:</strong>
        <ul>
          <li>Self-hosted: MySQL, PostgreSQL, MongoDB, ClickHouse</li>
          <li>Cloud Native: AWS Aurora, Snowflake, Google BigQuery, Azure SQL Hyperscale</li>
        </ul>`
    },
    {
      id: 7,
      q: 'چه زمانی باید از سیستم‌های توزیع‌شده (Distributed) استفاده کنیم؟',
      a: `<strong>دلایل استفاده:</strong>
        <ul>
          <li><strong>Inherent distribution:</strong> ذات سیستم توزیع‌شده است (چند کاربر با دستگاه‌های مختلف)</li>
          <li><strong>Fault tolerance:</strong> در صورت خرابی یک ماشین، ماشین دیگر جایگزین شود</li>
          <li><strong>Scalability:</strong> داده از ظرفیت یک ماشین بیشتر است</li>
          <li><strong>Latency:</strong> کاربران در سراسر جهان — سرورهای نزدیک به هر منطقه</li>
          <li><strong>Elasticity:</strong> مقیاس‌پذیری خودکار بر اساس تقاضا (مخصوصاً در ابر)</li>
          <li><strong>Compliance:</strong> قوانین residency داده در کشورهای خاص</li>
        </ul>
        <strong>توصیه کتاب:</strong> تا جایی که می‌شود از single-node استفاده کنید — ساده‌تر و ارزان‌تر است. گاهی یک برنامه تک‌ریسه روی یک ماشین از کلاستری با ۱۰۰ هسته CPU بهتر عمل می‌کند!`
    },
    {
      id: 8,
      q: 'مشکلات اصلی سیستم‌های توزیع‌شده چیست؟',
      a: `<strong>مشکلات کلیدی:</strong>
        <ul>
          <li><strong>Network failures:</strong> هر درخواست شبکه ممکن است timeout شود — نمی‌دانیم درخواست دریافت شده یا نه. Retry ممکن است ناامن باشد</li>
          <li><strong>Latency:</strong> حتی در دیتاسنتر، فراخوانی سرویس دیگر بسیار کندتر از فراخوانی تابع در same process است</li>
          <li><strong>Data locality:</strong> بهتر است computation را به جایی ببریم که data هست، نه برعکس</li>
          <li><strong>Observability:</strong> عیب‌یابی در سیستم توزیع‌شده سخت است — ابزارهایی مثل OpenTelemetry, Zipkin, Jaeger</li>
          <li><strong>Consistency:</strong> وقتی هر سرویس دیتابیس خودش را دارد، maintain کردن consistency بین سرویس‌ها چالش‌برانگیز است</li>
          <li><strong>Distributed transactions:</strong> در معماری microservices به ندرت استفاده می‌شوند چون با independence سرویس‌ها در تضادند</li>
        </ul>`
    },
    {
      id: 9,
      q: 'معماری Microservices چه مزایا و معایبی دارد؟',
      a: `<strong>مزایا:</strong>
        <ul>
          <li>هر سرویس مستقل به‌روزرسانی می‌شود — کاهش coordination</li>
          <li>منابع سخت‌افزاری متناسب با نیاز هر سرویس تخصیص می‌یابد</li>
          <li>جزئیات پیاده‌سازی پشت API پنهان می‌شود</li>
          <li>هر سرویس دیتابیس خودش را دارد (database per service)</li>
        </ul>
        <strong>معایب:</strong>
        <ul>
          <li>تست کردن سرویس‌ها سخت است — باید همه سرویس‌های وابسته را هم اجرا کنید</li>
          <li>نیاز به زیرساخت پیچیده: deployment, logging, monitoring, alerting</li>
          <li>API evolution دشوار — افزودن/حذف فیلدها ممکن است clientها را بشکند</li>
        </ul>
        <strong>نکته مهم:</strong> مایکروسرویس‌ها راه‌حلی <strong>سازمانی</strong> برای یک <strong>مشکل انسانی</strong> هستند — اجازه دادن به تیم‌های مختلف برای پیشرفت مستقل. در تیم کوچک، monolithic ساده‌تر است.`
    },
    {
      id: 10,
      q: 'منظور از Serverless (FaaS) چیست و چه محدودیت‌هایی دارد؟',
      a: `<strong>Serverless / Function-as-a-Service (FaaS):</strong> ارائه‌دهنده ابر به طور خودکار منابع را بر اساس درخواست‌های ورودی تخصیص و آزاد می‌کند. شما فقط برای مدت اجرای کد پرداخت می‌کنید — مثل metered billing برای compute.<br><br>
        <strong>محدودیت‌ها:</strong>
        <ul>
          <li>محدودیت زمان اجرا (timeout)</li>
          <li>Cold start — اولین فراخوانی کند است</li>
          <li>محیط اجرا محدود و restricted</li>
        </ul>
        حتی خود سرویس‌های بزرگ مثل BigQuery و Kafka از واژه serverless برای signalling استفاده می‌کنند.`
    },
    {
      id: 11,
      q: 'ETL و Reverse ETL چیست؟',
      a: `<strong>ETL (Extract-Transform-Load):</strong> داده از OLTPها استخراج می‌شود (<strong>Extract</strong>)، به فرمت analysis-friendly تبدیل می‌شود (<strong>Transform</strong>)، و در Data Warehouse بارگذاری می‌شود (<strong>Load</strong>). گاهی ترتیب Transform و Load عوض می‌شود که به آن <strong>ELT</strong> می‌گویند.<br><br>
        <strong>Reverse ETL:</strong> برعکس — خروجی سیستم‌های تحلیلی (مثلاً prediction یک مدل ML) به سیستم‌های عملیاتی برمی‌گردد تا در product استفاده شود. مثال: «کسانی که X خریده‌اند، Y هم خریده‌اند».`
    },
    {
      id: 12,
      q: 'تفاوت Cloud Computing و Supercomputing (HPC) چیست؟',
      a: `<strong>تفاوت‌های اصلی:</strong>
        <ul>
          <li><strong>کاربرد:</strong> HPC برای محاسبات علمی — Cloud برای سرویس‌های آنلاین و تجاری</li>
          <li><strong>Fault tolerance:</strong> HPC در صورت خرابی node، کل cluster را متوقف و از آخرین checkpoint restart می‌کند. Cloud نمی‌تواند متوقف شود</li>
          <li><strong>شبکه:</strong> HPC از RDMA/shared memory با trust بالا — Cloud از IP/Ethernet با isolation امنیتی قوی</li>
          <li><strong>توپولوژی:</strong> HPC از mesh/torus — Cloud از Clos topology</li>
          <li><strong>جغرافیا:</strong> Cloud multi-region — HPC متمرکز</li>
        </ul>`
    },
    {
      id: 13,
      q: 'GDPR چه تأثیری بر طراحی سیستم‌های داده دارد؟',
      a: `<strong>تأثیرات کلیدی:</strong>
        <ul>
          <li><strong>Right to be forgotten:</strong> کاربر می‌تواند درخواست حذف داده‌هایش را بدهد — اما سیستم‌های append-only log چطور داده را حذف می‌کنند؟ چالش مهندسی!</li>
          <li><strong>Data minimization:</strong> داده شخصی فقط برای هدف مشخص جمع‌آوری شود — برخلاف فلسفه big data که همه چیز را ذخیره می‌کند</li>
          <li><strong>Derived data:</strong> حذف داده‌ای که وارد derived dataset (مثل training data مدل ML) شده کار ساده‌ای نیست</li>
          <li><strong>PCI / SOC 2:</strong> استانداردهای امنیتی برای پردازش‌گرهای پرداخت و فروشندگان نرم‌افزار</li>
        </ul>
        قانون عمداً تکنولوژی خاصی را تجویز نمی‌کند — اصول سطح بالا تعیین می‌کند که تفسیرپذیر هستند.`
    },
    {
      id: 14,
      q: 'نقش Data Engineer و Analytics Engineer چیست؟',
      a: `<strong>Data Engineer:</strong> یکپارچه‌سازی سیستم‌های عملیاتی و تحلیلی — مسئول زیرساخت داده سازمان در سطح کلان.<br><br>
        <strong>Analytics Engineer:</strong> مدل‌سازی و transform داده برای مفیدتر کردن آن برای Business Analysts و Data Scientists. با ابزارهایی مثل dbt کار می‌کند.<br><br>
        <strong>نکته:</strong> کتاب هم سیستم‌های عملیاتی و هم تحلیلی را پوشش می‌دهد چون هر دو در چرخه حیات داده نقش مهمی دارند.`
    },
    {
      id: 15,
      q: 'جدول ۱-۱ را توضیح دهید (مقایسه ویژگی‌های OLTP و OLAP).',
      a: `<table>
          <tr><th>ویژگی</th><th style="color:#4ade80;">OLTP</th><th style="color:#a78bfa;">OLAP</th></tr>
          <tr><td>الگوی خواندن</td><td>Point Query (تکی)</td><td>Aggregate روی حجم زیاد</td></tr>
          <tr><td>الگوی نوشتن</td><td>درج/ویرایش/حذف تکی</td><td>Bulk import / Event stream</td></tr>
          <tr><td>کاربر انسانی</td><td>کاربر نهایی وب/موبایل</td><td>تحلیلگر داخلی</td></tr>
          <tr><td>مصرف ماشینی</td><td>بررسی مجوز</td><td>تشخیص تقلب/الگو</td></tr>
          <tr><td>نوع کوئری‌ها</td><td>ثابت و از پیش تعریف شده</td><td>ادهاک و اکتشافی</td></tr>
          <tr><td>حجم کوئری</td><td>تعداد زیاد، هر کدام کوچک</td><td>تعداد کم، هر کدام سنگین</td></tr>
          <tr><td>نمایانگر</td><td>آخرین state داده</td><td>تاریخچه رخدادها</td></tr>
          <tr><td>حجم داده</td><td>گیگابایت تا ترابایت</td><td>ترابایت تا پتابایت</td></tr>
        </table>`
    }
  ],
  interview: [
    { category: 'sd', difficulty: 'medium', q: 'یک سیستم گزارش‌گیری تحلیلی برای فروشگاه آنلاین طراحی کنید.', a: `<strong>معماری پیشنهادی:</strong> دو لایه<br>
      ۱. <strong>لایه OLTP:</strong> PostgreSQL — ثبت سفارشات، کاربران، محصولات<br>
      ۲. <strong>لایه OLAP:</strong> Data Warehouse مثل ClickHouse — گزارش‌های فروش<br><br>
      <strong>جریان داده:</strong> هر شب (یا real-time با CDC) داده از OLTP از طریق ETL به DW منتقل می‌شود. بیزینس آنالیست‌ها با Tableau/Looker متصل می‌شوند.<br><br>
      <strong>چرا جدا؟</strong> (۱) کوئری تحلیلی سنگین روی OLTP performance را خراب می‌کند (۲) ساختار OLTP برای تحلیل بهینه نیست (۳) مسائل امنیتی
      <div class="tip">💡 همیشه به trade-off بین real-time vs batch اشاره کنید</div>` },
    { category: 'sd', difficulty: 'hard', q: 'Cloud Native vs Self-Hosted Database — معیار انتخاب چیست؟', a: `<strong>Cloud Native:</strong> بار کاری متغیر، تیم devops کوچک، نیاز به elastic scaling<br>
      <strong>Self-Hosted:</strong> بار کاری ثابت، تیم مجرب sysadmin، نیاز به کنترل کامل، نگران vendor lock-in<br><br>
      <strong>نکته:</strong> David Heinemeier Hansson در مقاله "Why We're Leaving the Cloud" نشان داده که برای بار کاری ثابت، self-hosting می‌تواند ۵۰٪ ارزان‌تر باشد.
      <div class="tip">💡 First understand your workload — then decide</div>` },
    { category: 'cp', difficulty: 'medium', q: 'Systems of Record و Derived Data Systems را با مثال توضیح دهید.', a: `<strong>System of Record:</strong> دیتابیس اصلی کاربران — اولین جایی که داده نوشته می‌شود. مثال: جدول <code>users</code> در PostgreSQL.<br><br>
      <strong>Derived Data System:</strong> Elasticsearch index همان کاربران — اگر Elasticsearch crash کند، می‌توان از PostgreSQL دوباره index ساخت.<br><br>
      <strong>سیستم تحلیلی</strong> همیشه derived است — داده را از سیستم‌های عملیاتی می‌گیرد.
      <div class="tip">💡 یک دیتابیس می‌تواند هم system of record باشد هم derived — نحوه استفاده تعیین می‌کند</div>` },
    { category: 'cp', difficulty: 'hard', q: 'فرق Data Warehouse و Data Lake چیست و هر کدام چه کسانی استفاده می‌کنند؟', a: `<strong>Data Warehouse:</strong> داده ساختیافته، schema-on-write، SQL-native. کاربران: Business Analysts. مثال: Snowflake<br>
      <strong>Data Lake:</strong> هر نوع داده، schema-on-read، cheaper storage. کاربران: Data Scientists. مثال: S3 + Spark<br>
      <strong>اخیراً:</strong> Lakehouse معماری ترکیبی (مثل Databricks)
      <div class="tip">💡 آینده: ترکیب هر دو — data lakehouse — رایج‌تر می‌شود</div>` },
    { category: 'sc', difficulty: 'easy', q: 'تیم شما از Monolith به Microservices مهاجرت می‌کند. چه توصیه‌ای برای مدیریت دیتابیس‌ها دارید؟', a: `۱. <strong>Database per Service</strong> — اشتراک دیتابیس coupling می‌آورد<br>
      ۲. <strong>Data Warehouse مرکزی</strong> برای reporting<br>
      ۳. <strong>Saga/Outbox pattern</strong> برای consistency<br>
      ۴. <strong>API first</strong> — هر سرویس API مشخص داشته باشد
      <div class="tip">💡 Don't start with microservices. Start with a monolith, extract when you feel the pain.</div>` },
    { category: 'cp', difficulty: 'medium', q: 'Separation of Storage and Compute در معماری Cloud Native یعنی چه؟', a: `در معماری سنتی، storage و compute روی یک ماشین هستند. در Cloud Native از هم جدا می‌شوند.<br><br>
      <strong>مثال:</strong> Snowflake — دیتا در S3، cluster مجزای compute روی آن اجرا می‌کند.<br><br>
      <strong>مزایا:</strong> elastic scaling, cost efficiency, faster recovery, multi-workload
      <div class="tip">💡 AWS: Aurora · Azure: SQL DB Hyperscale · GCP: BigQuery</div>` },
    { category: 'cp', difficulty: 'medium', q: 'HTAP چیست و آیا جایگزین Data Warehouse می‌شود؟', a: `<strong>HTAP (Hybrid Transactional/Analytical Processing):</strong> یک سیستم که هم OLTP و هم OLAP را پشتیبانی می‌کند — بدون ETL. مثال: SingleStore<br><br>
      <strong>جایگزین DW نمی‌شود چون:</strong> (۱) نمی‌تواند داده از چندین OLTP را ترکیب کند (۲) use-case محدود (مثل fraud detection)` },
    { category: 'sc', difficulty: 'hard', q: 'یک مدل ML توصیه‌گر نیاز به Feature دارد. Feature Store استفاده کند یا مستقیماً از Data Warehouse؟', a: `<strong>مشکل DW برای ML:</strong> تبدیل rows به feature vectors با SQL سخت است، Data Scientist Python ترجیح می‌دهد، نیاز به NLP/پردازش تصویر<br><br>
      <strong>راه‌حل:</strong> Feature Store (مثل Feast, Tecton) — داده خام از Data Lake، feature engineering، ذخیره در Feature Store هم برای training و هم serving<br><br>
      <strong>اصل Sushi:</strong> داده خام بهتر است — هر تیم خودش transform کند` },
    { category: 'cp', difficulty: 'medium', q: 'تفاوت DevOps/SRE با DBA سنتی چیست؟', a: `<strong>DBA سنتی:</strong> مدیریت تک‌تک ماشین‌ها — capacity planning دیسک، provision ماشین، نصب patch<br><br>
      <strong>DevOps/SRE:</strong> اتوماسیون، VMهای ephemeral، به‌روزرسانی مکرر، یادگیری از incidents<br><br>
      <strong>در عصر ابر:</strong> capacity planning → financial planning, performance → cost optimization
      <div class="tip">💡 The cloud doesn't eliminate operations — it changes the focus.</div>` },
    { category: 'sc', difficulty: 'hard', q: 'داده از ۱۰۰GB به ۵۰TB رسیده. PostgreSQL کند شده. چه راه‌حلی پیشنهاد می‌دهید؟', a: `۱. اول <strong>single-node upgrade</strong> (طبق توصیه کتاب)<br>
      ۲. <strong>Cache</strong> (Redis) برای read-heavy<br>
      ۳. <strong>Read replicas</strong><br>
      ۴. جدا کردن analytics به <strong>Data Warehouse</strong><br>
      ۵. <strong>Sharding</strong> برای write-heavy<br>
      ۶. در نهایت <strong>distributed systems</strong>
      <div class="tip">💡 A single thread can outperform a cluster with 100 CPU cores — distributed is not always the answer!</div>` }
  ]
});

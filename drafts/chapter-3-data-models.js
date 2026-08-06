// ============================================================
// DRAFT — Chapter 3: Data Models and Query Languages
// ⚠️ این فایل هنوز در index.html لود نمی‌شود (پیش‌نویس است).
// منبع: Designing Data-Intensive Applications (ویرایش دوم)
// برای فعال‌سازی: فایل را به js/chapters/chapter-3.js منتقل کنید
// ============================================================
CHAPTERS.push({
  id: 3,
  title: 'Data Models and Query Languages',
  badge: 'فصل سوم',
  quote: "A language that doesn't affect the way you think about programming is not worth knowing.",
  quoteAuthor: 'Alan Perlis',
  topics: [
    '🧱 Relational Model & SQL',
    '📄 Document Model (JSON)',
    '⚡ NoSQL — چرا به وجود آمد',
    '🔗 Many-to-One & Many-to-Many',
    '🧩 ORM & Impedance Mismatch',
    '🗂️ Schema-on-Write vs Schema-on-Read',
    '📜 Declarative Query Languages',
    '🔄 MapReduce Querying',
    '🕸️ Property Graphs & Cypher',
    '🧠 Triple-Stores & SPARQL',
    '📐 Datalog',
    '🔍 Vector Embeddings & Semantic Search'
  ],
  questions: [
    {
      id: 1,
      q: 'تفاوت اساسی بین مدل رابطهای (Relational) و مدل سندی (Document) چیست؟',
      a: `<strong>مدل رابطهای</strong> (ادگار کاد، ۱۹۷۰): داده در <strong>جدولها (relations)</strong> با سطر و ستون؛ ارجاع بین جدول‌ها با <strong>کلید خارجی (Foreign Key)</strong> و ترکیب با <strong>JOIN</strong>.<br><br>
      <strong>مدل سندی</strong> (مثل MongoDB): داده به شکل <strong>JSON documents</strong> — یک ساختار درختی (tree) که داده‌های مرتبط داخل همان سند ذخیره می‌شوند؛ ترکیب چند سند به <code>$lookup</code> یا کوئری جداگانه نیاز دارد.<br><br>
      <table>
        <tr><th>ویژگی</th><th style="color:#fb923c;">Relational</th><th style="color:#a78bfa;">Document</th></tr>
        <tr><td>واحد داده</td><td>سطر در جدول</td><td>سند (JSON/BSON)</td></tr>
        <tr><td>ساختار</td><td>مسطح — داده بین جدول‌ها پخش می‌شود</td><td>درختی — داده مرتبط داخل یک سند</td></tr>
        <tr><td>ترکیب داده‌ها</td><td>JOIN (قدرتمند و بهینه‌شده)</td><td>کمتر پشتیبانی می‌شود (گران)</td></tr>
        <tr><td>اسکیما</td><td>Schema-on-Write (از پیش تعریف)</td><td>Schema-on-Read (منعطف)</td></tr>
        <tr><td>One-to-Many</td><td>جدول جدا + FK</td><td>آرایه داخل سند (طبیعی)</td></tr>
        <tr><td>Data Locality</td><td>ضعیف — نیاز به JOIN</td><td>قوی — کل سند یکجا</td></tr>
        <tr><td>مناسب برای</td><td>روابط پیچیده، تراکنش‌های مالی</td><td>داده‌های ناهمگن و درختی، پیش‌نمایش سریع</td></tr>
      </table>
      <strong>نکته کلیدی:</strong> هیچ‌کدام ذاتاً بهتر نیست — انتخاب به <strong>ساختار داده</strong> و الگوی دسترسی شما بستگی دارد.`
    },
    {
      id: 2,
      q: 'انگیزه‌های ظهور NoSQL چه بود؟',
      a: `کتاب سه نیروی اصلی پشت موج NoSQL (اواخر دهه ۲۰۰۰) را معرفی می‌کند:
      <ul>
        <li><strong>مقیاس‌پذیری بزرگ:</strong> نیاز به حجم داده و نرخ نوشتن بسیار بیشتر از آنچه دیتابیس‌های رابط‌ای به سادگی فراهم می‌کنند — و تمایل به sharding ساده‌تر</li>
        <li><strong>متن‌باز بودن:</strong> ترجیح گسترده برای نرم‌افزار رایگان و متن‌باز به‌جای محصولات تجاری</li>
        <li><strong>عملیات تخصصی:</strong> قابلیت‌های کوئری خاص که مدل رابطه‌ای پشتیبانی نمی‌کرد (مثل traversal روی گراف)</li>
      </ul>
      به این‌ها یک انگیزه دیگر هم اضافه می‌شود: <strong>مدل داده پویا و گویاتر</strong> (dynamic & expressive) — یعنی همان چیزی که بعداً در بحث schema-on-read می‌بینیم.<br><br>
      <strong>نکته مصاحبه:</strong> NoSQL به‌معنای «نه SQL» نیست — یک برچسب جمع‌وجور برای خانواده‌ای از دیتابیس‌ها با مدل‌های متفاوت (سندی، گرافی، ستونی، key-value) است.`
    },
    {
      id: 3,
      q: 'Object-Relational Mismatch (ناسازگاری شیء-رابطه‌ای) چیست؟',
      a: `بیشتر زبان‌های برنامه‌نویسی (Java, Python, JS) با <strong>objects</strong> کار می‌کنند، اما داده در SQL به شکل <strong>rows</strong> ذخیره می‌شود. این دو مدل نمی‌خوانند — به این شکاف <strong>impedance mismatch</strong> می‌گویند.<br><br>
      <strong>مثال کتاب — رزومه (resume):</strong> پروفایل کاربر شامل چند «موقعیت شغلی» و چند «تحصیل» است:
      <ul>
        <li>در <strong>مدل سندی</strong> این یک سند JSON درختی طبیعی است: <code>positions</code> و <code>education</code> به‌صورت آرایه داخل همان سند</li>
        <li>در <strong>مدل رابطه‌ای</strong> باید داده بین جدول‌های <code>users</code>، <code>positions</code> و <code>education</code> پخش شود و هنگام خواندن با JOIN دوباره سرهم شود</li>
      </ul>
      <strong>راه‌حل:</strong> فریم‌ورک‌های ORM مثل Hibernate و ActiveRecord ترجمه بین دو مدل را ساده می‌کنند، اما نمی‌توانند تفاوت بنیادی را کاملاً پنهان کنند — به‌خصوص وقتی روابط پیچیده‌اند. Orm یعنی الگوی «یک ردیف = یک شیء» که با همه شکل‌های داده جور درنمی‌آید.`
    },
    {
      id: 4,
      q: 'Many-to-One و Many-to-Many چیست و چرا در مدل سندی چالش‌برانگیز است؟',
      a: `<strong>Many-to-One:</strong> چند رکورد به یک موجودیت واحد اشاره می‌کنند. مثال: «شهر محل زندگی» — هزاران کاربر در شهر تهران ساکن‌اند.<br><br>
      دو روش ذخیره‌سازی:
      <ul>
        <li><strong>ذخیره متن شهر:</strong> اگر نام شهر تغییر کند یا غلط تایپ شود (مثلاً «تهران» vs «تهران»)، باید همه‌جا اصلاح شود؛ یکتایی و جستجو دردسر دارد</li>
        <li><strong>ذخیره ID شهر:</strong> یک جدول/مرجع شهر + کلید خارجی — این همان <strong>نرمال‌سازی</strong> است؛ نام شهر فقط یک بار ذخیره می‌شود و به‌روزرسانی آن یک کوئری ساده است</li>
      </ul>
      <strong>Many-to-Many:</strong> مثل «یک کاربر چند مهارت، یک مهارت چند کاربر» — در مدل رابطه‌ای با <strong>جدول واسط</strong> (join table) حل می‌شود.<br><br>
      <strong>مشکل مدل سندی:</strong> ذخیره ID در JSON (many-to-one) ساده است، اما پشتیبانی از <strong>JOIN</strong> ضعیف است — و به محض رسیدن به many-to-many، ترکیب چند سند به <code>$lookup</code> یا چند کوئری نیاز دارد که گران‌تر از JOIN رابطه‌ای است. این دقیقاً جایی است که مدل رابطه‌ای می‌درخشد.`
    },
    {
      id: 5,
      q: 'Schema-on-Write و Schema-on-Read چه تفاوتی دارند؟',
      a: `<strong>Schema-on-Write:</strong> ساختار داده از قبل تعریف می‌شود (مثل <code>CREATE TABLE</code>) و همه نوشتن‌ها باید از آن پیروی کنند. مشخصه دیتابیس‌های رابطه‌ای.<br><br>
      <strong>Schema-on-Read:</strong> ساختار داده هنگام خواندن تفسیر می‌شود — فرض نمی‌کنیم همه سندها ساختار یکسان دارند. مشخصه مدل سندی.<br><br>
      <strong>مثال کتاب — افزودن «فیلد درآمد سالانه» به یک فرم:</strong>
      <ul>
        <li>در <strong>RDBMS</strong>: باید <code>ALTER TABLE</code> اجرا شود — روی جدول‌های بزرگ و در پیک ترافیک سخت و کند است</li>
        <li>در <strong>Document DB</strong>: فقط سندهای جدید را با فیلد جدید می‌نویسیم؛ سندهای قدیمی بدون فیلد می‌مانند و برنامه هنگام خواندن تصمیم می‌گیرد (مثلاً null) </li>
      </ul>
      <strong>تشبیه کتاب:</strong> schema-on-write مثل <strong>type checking در زمان compile</strong> است (تضمین‌های استاتیک) و schema-on-read مثل <strong>runtime type checking</strong> (انعطاف بیشتر، اما مسئولیت با برنامه).<br><br>
      <strong>نکته عملی:</strong> schema-on-read رایگان نیست — اگر یک فیلد جدید به ۱۰۰ هزار سند قدیمی اضافه شود، همان تعداد سند با داده ناقص خواهید داشت.`
    },
    {
      id: 6,
      q: 'آیا دیتابیس‌های سندی «تاریخ را تکرار می‌کنند»؟',
      a: `بله — یکی از جذاب‌ترین بخش‌های فصل! ساختار درختی JSON یادآور مدل‌های قدیمی است:
      <ul>
        <li><strong>IMS (دهه ۱۹۶۰، IBM):</strong> مدل سلسله‌مراتبی (hierarchical) — داده مثل یک درخت؛ یک‌به‌چند طبیعی بود، اما <strong>many-to-many بسیار دردناک</strong> بود و JOIN نداشت</li>
        <li><strong>CODASYL (دهه ۱۹۷۰):</strong> مدل شبکه‌ای (network model) — رکوردها با pointer به هم متصل می‌شدند؛ قدرتمند اما کارکردن با آن نیاز به شناخت عمیق مسیرهای دسترسی داشت (مثل حرکت در یک maze)</li>
      </ul>
      این مدل‌ها به‌دلیل سختی کار با روابط پیچیده کنار رفتند و مدل رابطه‌ای برنده شد — چون JOIN و کوئری declarative را آسان کرد.<br><br>
      <strong>حال:</strong> مدل سندی دوباره ساختار درختی را (به شکل JSON) برمی‌گرداند و یک‌به-چند را طبیعی می‌کند — درست مثل IMS. فرق اصلی: امروز مدل‌ها به سمت همگرایی حرکت می‌کنند و ابزارهای بهتری برای روابط داریم (ببینید سوال ۸).<br><br>
      <strong>درس کتاب:</strong> مدل داده «درست» وجود ندارد — هر مدل trade-off خودش را دارد و این بحث‌ها دوباره و چندباره در تاریخ تکرار شده‌اند.`
    },
    {
      id: 7,
      q: 'Data Locality در مدل سندی به چه معناست؟',
      a: `<strong>Data Locality:</strong> وقتی برنامه به کل سند نیاز دارد (مثلاً کل رزومه یک کاربر)، در مدل سندی فقط <strong>یک خواندن</strong> لازم است — چون همه داده‌های مرتبط داخل همان سند ذخیره شده‌اند.<br><br>
      در مدل رابطه‌ای، همان داده بین چند جدول پخش است و باید با چند JOIN (چند round-trip) کنار هم گذاشته شود — کندتر و پرهزینه‌تر.<br><br>
      <strong>قیمت locality:</strong>
      <ul>
        <li>اگر فقط به <strong>بخشی</strong> از سند نیاز باشد، باز هم کل سند خوانده و دوباره نوشته می‌شود — هدررفت I/O</li>
        <li>به‌روزرسانی حتی یک فیلد کوچک، بازنویسی کل سند را می‌طلبد</li>
        <li>با بزرگ‌شدن سند، هزینه بیشتر می‌شود — سندها نباید بی‌نهایت بزرگ شوند</li>
      </ul>
      <strong>کاربرد:</strong> دیتابیس‌هایی مثل DynamoDB و MongoDB بهینه‌سازی‌های locality را بهبود داده‌اند؛ انتخاب بین «یک سند بزرگ یکپارچه» و «چند سند کوچک» یک تصمیم طراحی مهم است.`
    },
    {
      id: 8,
      q: 'آیا مدل رابطه‌ای و سندی به هم نزدیک شده‌اند؟ (Convergence)',
      a: `بله — همگرایی دوطرفه اتفاق افتاده:
      <ul>
        <li><strong>دیتابیس‌های رابطه‌ای JSON اضافه کرده‌اند:</strong> PostgreSQL (<code>jsonb</code>)، MySQL (<code>JSON</code>)، SQL Server — می‌توان ستون JSON داشت و با توابع JSON کوئری زد</li>
        <li><strong>دیتابیس‌های سندی JOIN و تراکنش اضافه کرده‌اند:</strong> MongoDB <code>$lookup</code> و از نسخه ۴، تراکنش‌های multi-document دارد</li>
      </ul>
      <strong>نتیجه:</strong> تفاوت عملی بین دو مدل کمتر شده — دیگر انتخاب «همه یا هیچ» نیست؛ می‌توان جدول‌های رابطه‌ای و ستون‌های JSON را کنار هم به‌کار برد.<br><br>
      <strong>پیام کتاب:</strong> به‌جای دنبال‌کردن ترند، بر اساس <strong>ساختار داده‌ها و الگوی استفاده</strong> تصمیم بگیرید. برای داده درختی یک‌به-چند، مدل سندی طبیعی‌تر است؛ برای روابط many-to-many پیچیده، مدل رابطه‌ای.`
    },
    {
      id: 9,
      q: 'زبان کوئری Declarative و Imperative چه تفاوتی دارند و چرا Declarative بهتر است؟',
      a: `<strong>Imperative:</strong> مشخص می‌کنید <strong>چطور</strong> به نتیجه برسید — حلقه، شرط، قدم به قدم. مثال: کد Java/Python برای پیدا کردن مرغابی‌ها در یک منطقه (loop + if).<br><br>
      <strong>Declarative:</strong> فقط مشخص می‌کنید <strong>چه چیزی</strong> می‌خواهید؛ موتور اجرا تصمیم می‌گیرد چطور:<br>
      <code>SELECT * FROM animals WHERE species = 'duck'</code><br><br>
      <strong>چرا declarative بهتر است؟</strong>
      <ul>
        <li><strong>بهینه‌سازی خودکار:</strong> query optimizer از index، ترتیب مناسب join و موازی‌سازی استفاده می‌کند — برنامه‌نویس لازم نیست جزئیات را بداند</li>
        <li><strong>تغییر پیاده‌سازی بدون تغییر کوئری:</strong> اگر موتور ذخیره‌سازی عوض شود، کوئری همان می‌ماند</li>
        <li><strong>مخفیکردن جزئیات:</strong> مثل CSS — می‌گویی «عنصر قرمز باشد» نه «این ۱۰ مرحله DOM را انجام بده»</li>
        <li><strong>مناسب API و محصولات:</strong> declarative بودن SQL آن را به استانداردی قابل استفاده در ابزارهای گوناگون تبدیل کرد</li>
      </ul>
      <strong>مثال کتاب از وب:</strong> در مرورگر، CSS/XSL (declarative) به‌جای دستکاری دستی DOM با جاوااسکریپت — کد کمتر، خطای کمتر، قابلیت بهینه‌سازی بیشتر.`
    },
    {
      id: 10,
      q: 'MapReduce چیست و چه محدودیت‌هایی به‌عنوان زبان کوئری دارد؟',
      a: `<strong>MapReduce:</strong> الگوی پردازش توزیع‌شده از Google (۲۰۰۴) که در MongoDB و Hadoop رواج یافت؛ بین imperative و declarative قرار می‌گیرد (به‌ شکل: شما دو تابع می‌نویسید):
      <ul>
        <li><strong>map:</strong> روی هر رکورد اجرا می‌شود — با <code>emit(key, value)</code> صفر یا چند جفت کلید-مقدار تولید می‌کند</li>
        <li><strong>reduce:</strong> روی همه مقادیر یک کلید اجرا می‌شود — آن‌ها را به یک خروجی تجمیع می‌کند</li>
      </ul>
      <strong>مثال کتاب (شمارش مشاهده کوسه‌ها در MongoDB):</strong><br>
      <code>db.observations.mapReduce(</code><br>
      <code>&nbsp;&nbsp;function map() { emit(this.month, this.num); },</code><br>
      <code>&nbsp;&nbsp;function reduce(key, values) { return Array.sum(values); },</code><br>
      <code>&nbsp;&nbsp;{ query: { family: "Sharks" }, out: "monthlySharkReport" })</code><br><br>
      <strong>محدودیت‌ها:</strong>
      <ul>
        <li>باید دو تابع جاوااسکریپ (ظریف و سخت‌تر از یک کوئری declarative) بنویسید</li>
        <li><strong>بهینه‌ساز ندارد:</strong> نمی‌تواند از index یا تکنیک‌های بهینه‌سازی موتور استفاده کند — همه‌چیز دستی</li>
        <li>توابع باید <strong>خالص (pure)</strong> باشند — بدون side effect و I/O؛ و reduce باید associative باشد تا موازی‌سازی ممکن شود</li>
        <li>مشکلات جانبی: فرمت ورودی/خروجی خاص، سختی دیباگ</li>
      </ul>
      <strong>نتیجه:</strong> MapReduce به‌عنوان <strong>مکانیزم اجرا</strong> ماندگار شد (پشت Hive, Spark و…) اما به‌عنوان <strong>زبان کوئری</strong> کنار رفت — چون declarative بودن دوباره پیروز شد.`
    },
    {
      id: 11,
      q: 'Property Graph چیست و چه ساختاری دارد؟',
      a: `<strong>Property Graph:</strong> مدل داده گرافی با دو عنصر پایه:
      <ul>
        <li><strong>Vertex (گره):</strong> شناسه یکتا + مجموعه properties (کلید-مقدار) — مثل <code>person</code> با <code>name</code> و <code>age</code></li>
        <li><strong>Edge (یال):</strong> شناسه یکتا + جهت (از کدام گره به کدام گره) + برچسب نوع (<code>married_to</code>, <code>born_in</code>) + properties</li>
      </ul>
      <strong>مثال کتاب:</strong>
      <ul>
        <li>گره‌های <code>Alice</code> و <code>Bob</code> با <code>age</code> و <code>country</code></li>
        <li>یال <code>Alice -[married_to]-> Bob</code></li>
        <li>گره‌های مکان مثل <code>Idaho</code> و <code>London</code> با رابطه <code>within</code></li>
      </ul>
      <strong>قدرت مدل گراف:</strong>
      <ul>
        <li><strong>انعطاف کامل:</strong> اسکیما از پیش تعریف نشده — هر گره/یال می‌تواند properties متفاوت داشته باشد؛ افزودن نوع رابطه جدید بدون migration</li>
        <li><strong>Traversal طبیعی:</strong> «افرادی که در X متولد شده‌اند» یعنی دنبال‌کردن یال‌ها hop به hop — کاری که مدل رابطه‌ای با JOIN های چندگانه و ناخوشایند انجام می‌دهد</li>
      </ul>
      <strong>مثال پیاده‌سازی:</strong> Neo4j؛ در دیتابیس‌های رابطه‌ای هم با recursive queries می‌توان گراف را تقریب زد (سوال ۱۵).`
    },
    {
      id: 12,
      q: 'زبان کوئری Cypher چیست و با یک مثال توضیح دهید.',
      a: `<strong>Cypher:</strong> زبان کوئری declarative برای property graphs — ساخته‌شده برای Neo4j. الگوی گراف را به‌صورت <code>(گره) -[یال]-> (گره)</code> می‌نویسید.<br><br>
      <strong>مثال کتاب — «افرادی که در آمریکا متولد شده‌اند»:</strong><br>
      <code>MATCH (person) -[:BORN_IN]-> () -[:WITHIN*0..]-> (us:Location {name:"United States"})</code><br>
      <code>RETURN person.name</code><br><br>
      <strong>خواندن کوئری:</strong>
      <ul>
        <li><code>(person)</code> → هر گره‌ای</li>
        <li><code>-[:BORN_IN]-></code> → یال با برچسب BORN_IN (جهت‌دار)</li>
        <li><code>()</code> → یک گره میانی (محل تولد)</li>
        <li><code>-[:WITHIN*0..]-></code> → صفر یا چند hop از یال‌های WITHIN — یعنی «در هر عمقی» (شهر داخل ایالت داخل کشور)</li>
        <li><code>(us:Location {name:"United States"})</code> → گره‌ای با برچسب Location و مقدار مشخص</li>
      </ul>
      <strong>در مقایسه با SQL:</strong> همین سوال در مدل رابطه‌ای به چند JOIN نامشخص (چون عمق WITHIN معلوم نیست) و recursive CTE نیاز دارد — Cypher آن را طبیعی و خوانا بیان می‌کند؛ این جوهر مزیت مدل گراف است.`
    },
    {
      id: 13,
      q: 'Triple-Store و SPARQL چیست؟ (مدل داده RDF)',
      a: `<strong>RDF (Resource Description Framework):</strong> مدل داده‌ای از دل «وب معنایی» — همه اطلاعات به‌صورت <strong>سه‌گانه (triple): سوژه - گزاره - مفعول</strong>. مثال: <code>(Jim, likes, bananas)</code> — یعنی یک یال جهت‌دار در گراف: <code>Jim --likes--> bananas</code>.<br><br>
      <strong>مثال کتاب (Turtle):</strong><br>
      <code>@prefix : &lt;urn:example:&gt;.</code><br>
      <code>_:john a :Person.</code><br>
      <code>_:john :name "John".</code><br>
      <code>_:john :born_in _:california.</code><br><br>
      <strong>SPARQL:</strong> زبان کوئری RDF — با <code>:</code> (مقدار ثابت) یا <code>?</code> (متغیر). کوئری «افراد متولدشده در آمریکا»:<br>
      <code>PREFIX : &lt;urn:example:&gt;</code><br>
      <code>SELECT ?personName WHERE {</code><br>
      <code>&nbsp;&nbsp;?person :name ?personName.</code><br>
      <code>&nbsp;&nbsp;?person :bornIn / :within* / :name "United States".</code><br>
      <code>}</code><br><br>
      <strong>نکات:</strong>
      <ul>
        <li>SPARQL و Cypher از نظر مفهومی نزدیک‌اند — هر دو با الگوهای triple/edge کار می‌کنند</li>
        <li><strong>وب معنایی</strong> رویای انتشار داده‌های قابل‌خواندن برای ماشین در وب را داشت ولی فراگیر نشد؛ با این حال RDF در حوزه‌های خاص (دانشنامه‌ها، داده‌های بین‌سازمانی) استفاده می‌شود</li>
      </ul>`
    },
    {
      id: 14,
      q: 'زبان Datalog چیست و چه فرق/تفاوتی با SQL دارد؟',
      a: `<strong>Datalog:</strong> زبان کوئری از دهه ۱۹۸۰ (خانواده Prolog) که در گراف‌ها خیلی موثر است — پایه‌اش <strong>قوانین (rules)</strong> است، نه کوئری‌های یکبار.<br><br>
      <strong>مثال کتاب — حقایق (facts):</strong><br>
      <code>name(namerica, 'North America').</code><br>
      <code>within(us, namerica).</code><br>
      <code>within(california, us).</code><br>
      <code>within(berkeley, california).</code><br><br>
      <strong>قوانین (rules):</strong><br>
      <code>within_recursive(X, Y) :- within(X, Y).</code> ← انتقال مستقیم<br>
      <code>within_recursive(X, Y) :- within(X, Z), within_recursive(Z, Y).</code> ← انتقال بازگشتی<br><br>
      پرس‌وجو:<br>
      <code>?- within_recursive(berkeley, namerica).</code> → <code>true</code><br><br>
      <strong>مزیت Datalog:</strong>
      <ul>
        <li>نوشتن <strong>بازگشت و ترکیب</strong> (recursion & composition) بسیار طبیعی‌تر از recursive CTE است</li>
        <li>قوانین را می‌توان ترکیب و reuse کرد — همان «بیان اینکه چه می‌خواهی» declarative</li>
        <li>برخی سیستم‌ها (مثل Datomic) از Datalog و مشتقاتش استفاده می‌کنند</li>
      </ul>
      <strong>تسلسل کتاب:</strong> Datalog پایه‌ای برای درک SPARQL و Cypher است — یادگیری آن کمک می‌کند همه زبان‌های گراف را بهتر بفهمید.`
    },
    {
      id: 15,
      q: 'Vector Embeddings و Semantic Search چیست؟ (مبحث جدید ویرایش دوم)',
      a: `<strong>مشکل:</strong> کوئری‌های سنتی (SQL، full-text) بر اساس <strong>تطبیق دقیق کلمه</strong> کار می‌کنند — «ماشین آبی» با «خودروی آب‌رنگ» مطابقت ندارد.<br><br>
      <strong>Embedding:</strong> مدل‌های یادگیری ماشین هر متن/تصویر را به <strong>بردار اعداد</strong> تبدیل می‌کنند (مثلاً ۱۰۰۰+ بعد) طوری که معنای مشابه → بردارهای نزدیک.<br><br>
      <strong>Semantic Search:</strong> کوئری هم embed می‌شود و نزدیک‌ترین بردارها با معیارهایی مثل <strong>cosine similarity</strong> پیدا می‌شوند (k-NN / ANN) — حتی وقتی کلمه‌ها یکسان نیستند.<br><br>
      <strong>رابطه با data model:</strong> embedding یک «نوع داده» جدید است — ستون بردار در PostgreSQL (<code>pgvector</code>)، یا دیتابیس‌های برداری اختصاصی (Pinecone, Weaviate, Milvus, Qdrant).<br><br>
      <strong>کاربردها:</strong>
      <ul>
        <li>RAG در سیستم‌های LLM — بازیابی داکیومنت‌های مرتبط برای پاسخ‌دادن دقیق‌تر</li>
        <li>جستجوی تصویر بر اساس توصیف متنی</li>
        <li>تشخیص موارد مشابه (recommendation، fraud detection)</li>
      </ul>
      <strong>نکته مصاحبه:</strong> embedding محدودیت هم دارد — «نزدیکی» همیشه معنادار نیست، هزینه محاسباتی دارد و معمولاً به <strong>hybrid search</strong> (ترکیب full-text سنتی + برداری) نیاز است.`
    }
  ],
  interview: [
    { category: 'sd', difficulty: 'medium', q: 'مدل داده یک شبکه اجتماعی (پست، لایک، فالو) را طراحی کنید — رابط‌ای یا گراف؟', a: `<strong>ابتدا query patterns را مشخص کنید:</strong> فید (پست‌های دوستان)، پروفایل، فالو/آنفالو، لایک.<br><br>
      <strong>گزینه A — Relational (پیشنهادی):</strong> جدول <code>users</code>، <code>posts</code>، <code>likes</code> (جدول واسط user↔post)، <code>follows</code> (جدول واسط user↔user). با JOIN و index روی کلیدهای خارجی — مناسب CONSISTENCY و reporting.<br>
      <strong>گزینه B — Graph:</strong> گره user/post + یال <code>follows</code>/<code>likes</code>. عالی برای «دوستانِ دوستان» و path queries، اما ساخت فید (تجمیع پست‌های همه فالوها) در گراف سنگین‌تر است.<br><br>
      <strong>نکته عملی:</strong> اکثر سیستم‌های واقعی (مثل Twitter/LinkedIn) مدل رابطه‌ای/ستونی دارند و گراف را فقط برای ویژگی‌های خاص (توصیه، شناسایی حلقه) کنار آن استفاده می‌کنند.
      <div class="tip">💡 Model is a function of your query patterns — not the other way around</div>` },
    { category: 'sd', difficulty: 'hard', q: 'سیستم جستجوی معنایی (semantic search) برای داکیومنت‌های یک سازمان طراحی کنید.', a: `<strong>اجزای اصلی:</strong>
      ۱. <strong>Ingestion:</strong> داکیومنت → پارس → <strong>chunking</strong> (تکه‌های ~۵۰۰-۱۰۰۰ توکن) → <strong>embedding model</strong> → ذخیره بردارها<br>
      ۲. <strong>Vector DB:</strong> pgvector / Pinecone / Weaviate — با index بردار (HNSW) برای جستجوی سریع تقریبی (ANN)<br>
      ۳. <strong>Query:</strong> کوئری کاربر → embed → جستجوی k-NN → بازگرداندن top-k داکیومنت<br>
      ۴. <strong>Rerank:</strong> مرحله دوم برای مرتب‌سازی دقیق‌تر (مثلاً cross-encoder)<br><br>
      <strong>ملاحظات:</strong>
      <ul>
        <li><strong>Hybrid search:</strong> بردار به تنهایی کافی نیست — ترکیب با BM25/full-text برای کلمات دقیق (نام، کد محصول)</li>
        <li><strong>Version کردن مدل:</strong> وقتی embedding model عوض می‌شود، باید همه داده‌ها re-embed شوند — یا دو نسخه موازی نگه داشت</li>
        <li><strong>هزینه:</strong> embedding یک‌میلیون سند هزینه API دارد — بهتر بود batch processing شبانه</li>
        <li><strong>Metadata filter:</strong> فیلتر بر اساس تاریخ/نویسنده قبل از جستجوی برداری</li>
      </ul>
      <div class="tip">💡 Mention RAG — this pipeline is exactly the retrieval half of RAG for LLMs</div>` },
    { category: 'cp', difficulty: 'easy', q: 'Schema-on-Read و Schema-on-Write را با یک مثال ملموس توضیح دهید.', a: `<strong>Schema-on-Write:</strong> ساختار پیش از نوشتن تعریف می‌شود. مثال: <code>CREATE TABLE users (id, name, email)</code> — برای افزودن <code>phone</code> باید <code>ALTER TABLE</code> کنید و همه رکوردها باید conform باشند (یا nullable).<br>
      <strong>Schema-on-Read:</strong> هیچ schema اجباری هنگام نوشتن نیست. مثال: در MongoDB سند اول <code>{name, email}</code> و سند دوم <code>{name, email, phone}</code>؛ خواننده (برنامه) هنگام خواندن تصمیم می‌گیرد با فیلدهای ناقص چه کند.<br><br>
      <strong>تشبیه:</strong> compile-time type checking (schema-on-write) در مقابل runtime type checking (schema-on-read).<br>
      <strong>Trade-off:</strong> اولی تضمین و ایمنی بیشتری می‌دهد، دومی انعطاف — اما «رایگان» نیست؛ داده‌های ناسازگار باید مدیریت شوند.` },
    { category: 'cp', difficulty: 'medium', q: 'چه زمانی Document Database انتخاب می‌کنید و چه زمانی Relational؟', a: `به این سوال‌ها جواب دهید:
      <ul>
        <li>آیا داده ساختار درختی a-to-many دارد و همیشه کل درخت خوانده می‌شود؟ → <strong>Document</strong> (locality)</li>
        <li>آیا روابط many-to-many پیچیده بین موجودیت‌هاست؟ → <strong>Relational</strong> (JOIN)</li>
        <li>آیا schema مدام تغییر می‌کند؟ → Document راحت‌تر، اما <code>jsonb</code> در PostgreSQL هم می‌تواند</li>
        <li>آیا به تراکنش ACID قوی نیاز دارید؟ → Relational</li>
        <li>آیا گزارش‌گیری/BI روی داده انجام می‌شود؟ → Relational/Columnar بهتر است</li>
      </ul>
      <strong>مثال:</strong> کاتالوگ محصول با attributes متغیر → Document یا JSONB؛ سیستم حسابداری/مالی → Relational؛ لاگ و event → JSON در دیتابیس‌های زمان‌سری/سندی.
      <div class="tip">💡 In 2026 the practical gap is small — pick by workload, not by hype</div>` },
    { category: 'cp', difficulty: 'hard', q: 'چرا MapReduce به‌عنوان زبان کوئری شکست خورد و SQL دوباره غالب شد؟', a: `<strong>دلایل:</strong>
      <ul>
        <li><strong>Declarative بودن برنده شد:</strong> SQL فقط «چه چیزی» می‌گوید؛ optimizer (index, join order, parallelism) را خودش انتخاب می‌کند. MapReduce شما را مجبور می‌کند «چطور» را با دو در یک تابع بنویسید</li>
        <li><strong>نگهداری:</strong> کد map/reduce سخت‌تر دیباگ و تست است — در SQL چند خط declarative</li>
        <li><strong>بهینه‌سازی:</strong> query optimizer نمی‌تواند کد object JS را بهینه کند — index و پوشش coverage ندارد</li>
        <li><strong>قیدهای model:</strong> pure functions و محدودیت reduce</li>
      </ul>
      <strong>سرنوشت:</strong> MapReduce به <strong>مکانیزم اجرا</strong> زیر declarative engines تبدیل شد — Hive, Spark SQL, Impala. همان «پنهان‌کردن جزئیات» که فصل تأکید می‌کند؛ یعنی تاریخ دوباره تکرار شد: زبان سطح پایین → زبان سطح بالا declarative.` },
    { category: 'cp', difficulty: 'medium', q: 'Property Graph و Triple-Store (RDF) چه تفاوتی دارند؟', a: `<strong>شباهت:</strong> هر دو گراف‌اند — گره‌ها و یال‌ها؛ SPARQL و Cypher از نظر مفهومی نزدیک‌اند.<br>
      <strong>تفاوت‌ها:</strong>
      <ul>
        <li><strong>Property Graph:</strong> گره/یال می‌توانند properties (key-value) داشته باشند؛ یال برچسب و جهت دارد؛ بدون vocabulary استاندارد — آزاد</li>
        <li><strong>Triple-Store (RDF):</strong> همه‌چیز سه‌تایی <code>subject-predicate-object</code>؛ URI برای شناسایی جهانی؛ امکان <strong>vocabulary مشترک</strong> (schema.org) برای یکپارچه‌سازی داده بین سازمان‌ها</li>
      </ul>
      <strong>کاربرد:</strong> RDF وقتی داده باید بین چند سازمان/سیستم مبادله شود (data integration)؛ Property Graph وقتی مدل داخلی و انعطاف‌پذیر می‌خواهید (مثل social graph).
      <div class="tip">💡 The semantic web vision didn't fully materialize — but RDF remains useful for interop</div>` },
    { category: 'sc', difficulty: 'easy', q: 'تیم شما می‌خواهد از PostgreSQL به MongoDB مهاجرت کند چون «اسکیمای انعطاف‌پذیر» می‌خواهد. چه سوالاتی می‌پرسید؟', a: `<strong>سوالات کلیدی قبل از مهاجرت:</strong>
      <ul>
        <li><strong>چرا؟</strong> «انعطاف اسکیما» با <code>jsonb</code> در PostgreSQL هم حل می‌شود — دلیل واقعی را بپرسید (scaling؟ تیم؟ خستگی؟)</li>
        <li><strong>تراکنش:</strong> آیا برنامه به ACID چند جدول وابسته است؟ (MongoDB 4+ دارد ولی تفاوت‌های isolation و زیرساخت را بشناسید)</li>
        <li><strong>JOIN ها:</strong> کوئری‌های join‌دار چطور به مدل سندی ترجمه می‌شوند؟ شاید به denormalization و sync منطق نیاز باشد</li>
        <li><strong>ابزارها:</strong> BI/reporting، backup، monitoring، migration ابزار جدید — هزینه پنهان</li>
        <li><strong>Emergency plan:</strong> migrate بدون downtime (CDC/double-write) و plan بازگشت</li>
      </ul>
      <strong>نکته:</strong> بیشتر «نیاز به MongoDB»ها در عمل با طراحی بهتر schema در PostgreSQL حل می‌شود. اول مسأله را بفهمید، بعد دیتابیس را عوض کنید.` },
    { category: 'sc', difficulty: 'medium', q: 'کاتالوگ محصولات با هزاران attribute متغیر (فیلترهای فروشگاه آنلاین) را چطور مدل می‌کنید؟', a: `<strong>گزینه‌های طراحی:</strong>
      <ul>
        <li><strong>EAV (Entity-Attribute-Value) — قدیمی/ضعیف:</strong> جدول <code>(product_id, attr, value)</code> — کوئری‌های filter وحشتناک، join های زیاد، بدون type safety — از آن دور شوید</li>
        <li><strong>JSONB در PostgreSQL — پیشنهادی:</strong> ستون <code>attributes jsonb</code> + index <strong>GIN</strong> — فیلتر با <code>@&gt;</code> و <code>?|</code>؛ فیلدهای ثابت (قیمت، برند) در ستون‌های معمولی + attributes متغیر در JSONB</li>
        <li><strong>Document DB:</strong> سند کامل محصول — طبیعی اما مدیریت قیمت/موجودی (داده تراکنشی) به‌جای آن‌ها</li>
      </ul>
      <strong>معماری پیشنهادی:</strong> جدول <code>products</code> (فیلدهای ثابت) + جدول <code>categories</code> (تعریف attribute ها) + <code>product_attributes</code> یا JSONB — برای فیلترهای ترکیبی پیچیده از Elasticsearch.
      <div class="tip">💡 Fixed fields stay relational — only the truly variable part goes to JSON</div>` },
    { category: 'sc', difficulty: 'hard', q: 'ویژگی «افرادی که ممکن است بشناسید» (People You May Know) را طراحی کنید.', a: `<strong>مشکل:</strong> پیشنهاد کاربرانی که «ممکن است بشناسید» — معمولاً بر اساس friends-of-friends (همسایگی ۲-hop در گراف) + امتیازدهی.<br>
      <strong>رویکرد ۱ — آنلاین با گراف (Neo4j):</strong><br>
      <code>MATCH (u)-[:FOLLOWS]->(f)-[:FOLLOWS]->(candidate)</code> — شمارش مسیرهای مشترک، وزندهی با تعداد دوستان مشترک. محدودیت: برای گراف عظیم (میلیارد یال)، traversal آنلاین برای هر کاربر گران است و sharding گراف سخت است.<br>
      <strong>رویکرد ۲ — Batch/Offline (مناسب مقیاس بزرگ):</strong>
      <ul>
        <li>شبانه (یا hourly) و با پردازش توزیع‌شده (Spark GraphX / Pregel / Flink Gelly) همسایگی 2-hop هر کاربر محاسبه می‌شود</li>
        <li>امتیاز = f(تعداد دوستان مشترک، تعاملات، همشهری بودن) → sort و top-N</li>
        <li>نتیجه در کش/جدول (Redis یا key-value) — در حالت لحظه فقط read از کش</li>
      </ul>
      <strong>نکات:</strong> cold start (کاربر جدید → محبوب‌ترین‌ها)، privacy (افراد خیلی محبوب معرفی نشوند)، تازه‌ نگه‌داشتن با CDC.
      <div class="tip">💡 Social features at scale are batch-first — online graph traversal is the last resort</div>` },
    { category: 'sc', difficulty: 'medium', q: 'درخت سازمانی (مدیر → زیرمجموعه) را در SQL با recursive CTE کوئری بزنید.', a: `<strong>سناریو:</strong> جدول <code>employees(id, name, manager_id)</code> — همه زیرمجموعه‌های یک مدیر (مثلاً id=42) را بیابید.<br><br>
      <code>WITH RECURSIVE org AS (</code><br>
      <code>SELECT id, name, manager_id, 1 AS depth FROM employees WHERE id = 42</code><br>
      <code>UNION ALL</code><br>
      <code>SELECT e.id, e.name, e.manager_id, org.depth + 1</code><br>
      <code>FROM employees e JOIN org ON e.manager_id = org.id</code><br>
      <code>) SELECT * FROM org;</code><br><br>
      <strong>چطور کار می‌کند:</strong> seed (ریشه) → هر بار زیرمجموعه‌ها به نتیجه اضافه می‌شوند تا جایی که دیگر سطری نماند (پایانی بازگشت).<br>
      <strong>کاربرد:</strong> درخت سازمانی، کامنت‌های درختی، دسته‌بندی چندی، گراف‌ها در SQL — همین مکانیزم پشت کوئری‌های گراف در دیتابیس‌های رابطه‌ای است (مقایسه با <code>WITHIN*</code> در Cypher).<br>
      <strong>محدودیت:</strong> عمق نامحدود و گراف‌های حلقه‌دار سخت‌تراند؛ در گراف‌های واقعی بزرگ، مدل گراف اختصاصی بهتر است.` }
  ]
});
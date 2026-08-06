// ============================================================
// Chapter 2 — Defining Nonfunctional Requirements
// منبع: Designing Data-Intensive Applications (ویرایش دوم، ۲۰۲۶)
// ============================================================
CHAPTERS.push({
  id: 2,
  title: 'Defining Nonfunctional Requirements',
  badge: 'فصل دوم',
  quote: 'The Internet was done so well that most people think of it as a natural resource like the Pacific Ocean, rather than something that was man-made. When was the last time a technology with a scale like that was so error-free?',
  quoteAuthor: 'Alan Kay — interview with Dr. Dobb’s Journal (2012)',
  topics: [
    '📱 Case Study: Home Timelines (X/Twitter)',
    '📤 Fan-out & Materialized Views',
    '⏱️ Response Time vs Throughput',
    '📊 Percentiles: p50 / p95 / p99',
    '🐢 Tail Latency & Amplification',
    '🚨 Retry Storm & Metastable Failure',
    '🛡️ Fault vs Failure & SPOF',
    '💽 Hardware vs Software Faults',
    '🧑‍💻 Humans & Blameless Postmortems',
    '📈 Scalability & Load Parameters',
    '🖥️ Shared-Nothing Architecture',
    '🔧 Operability · Simplicity · Evolvability'
  ],
  questions: [
    {
      id: 1,
      q: 'Functional Requirements و Nonfunctional Requirements چه تفاوتی دارند؟',
      a: `<strong>Functional Requirements:</strong> عملکردی که برنامه باید ارائه دهد — چه صفحه‌هایی، چه دکمه‌هایی، هر عملیات باید چه کاری انجام دهد. یعنی «چه چیزی» نرم‌افزار باید انجام دهد.<br><br>
      <strong>Nonfunctional Requirements:</strong> الزامات غیرعملکردی مثل: سریع بودن، قابلیت اطمینان (reliability)، امنیت، انطباق با قانون (GDPR) و نگهداشت‌پذیری (maintainability).<br><br>
      <strong>نکات مهم:</strong>
      <ul>
        <li>اغلب به‌صورت ضمنی در نظر گرفته می‌شوند چون «بدیهی» به نظر می‌رسند — اما به اندازه قابلیت‌ها مهم‌اند: یک اپ فوق‌العاده کند یا ناپایدار عملاً وجود ندارد</li>
        <li>بسیاری از NFRها (مثل امنیت) خارج از حیطه این کتاب‌اند، اما چهار مورد اصلی در فصل ۲ بررسی می‌شوند: <strong>performance</strong>، <strong>reliability</strong>، <strong>scalability</strong> و <strong>maintainability</strong></li>
        <li>اصطلاحات این فصل در سراسر کتاب (پیاده‌سازی سیستم‌های داده) استفاده می‌شود</li>
      </ul>`
    },
    {
      id: 2,
      q: 'کیس‌استادی فصل ۲ چیست؟ کوئری home timeline و مشکل Polling را توضیح دهید.',
      a: `کتاب با یک شبکه اجتماعی به سبک X (توییتر سابق) شروع می‌کند: کاربران پست می‌گذارند و یکدیگر را فالو می‌کنند.<br><br>
      <strong>فرضیات:</strong>
      <ul>
        <li>۵۰۰ میلیون پست در روز = میانگین <strong>۵,۸۰۰ پست در ثانیه</strong> (پیک تا ۱۵۰,۰۰۰ پست/ثانیه)</li>
        <li>هر کاربر به‌طور میانگین ۲۰۰ نفر را فالو می‌کند و ۲۰۰ فالوور دارد (سلیبریتی‌ها مثل اوباما ۱۰۰+ میلیون فالوور)</li>
      </ul>
      <strong>مدار رابطه‌ای:</strong> سه جدول <code>users</code>، <code>posts</code>، <code>follows</code> — و کوئری home timeline:<br>
      <code>SELECT posts.*, users.* FROM posts</code><br>
      <code>&nbsp;&nbsp;JOIN follows ON posts.sender_id = follows.followee_id</code><br>
      <code>&nbsp;&nbsp;JOIN users ON posts.sender_id = users.id</code><br>
      <code>&nbsp;&nbsp;WHERE follows.follower_id = current_user</code><br>
      <code>&nbsp;&nbsp;ORDER BY posts.timestamp DESC LIMIT 1000</code><br><br>
      <strong>مشکل Polling:</strong> فرض کنید پست باید <strong>ظرف ۵ ثانیه</strong> به فالوورها برسد؛ کلاینت هر ۵ ثانیه کوئری را تکرار کند. با ۱۰ میلیون کاربر آنلاین → <strong>۲ میلیون کوئری در ثانیه</strong>! و هر کوئری برای کاربری با ۲۰۰ فالو، لیست پست‌های ۲۰۰ نفر را باید merge کند: ۲M × 200 = <strong>۴۰۰ میلیون lookup در ثانیه</strong>. بعضی کاربران ده‌ها هزار نفر را فالو می‌کنند — برای آن‌ها این کوئری بسیار گران است.`
    },
    {
      id: 3,
      q: 'Materialization و Fan-out چیست و چطور مشکل home timeline را حل می‌کند؟',
      a: `<strong>دو بهبود:</strong>
      <ul>
        <li><strong>Push به‌جای Poll:</strong> سرور پست جدید را فعالانه به فالوورهای آنلاین می‌فرستد</li>
        <li><strong>Precompute:</strong> نتیجه کوئری از قبل محاسبه و در <strong>کش</strong> ذخیره می‌شود</li>
      </ul>
      <strong>ایده:</strong> برای هر کاربر یک ساختار داده = home timeline آماده. هر بار که کاربری پست می‌گذارد، همه فالوورهایش پیدا و پست به تایم‌لاین هر کدام <strong>درج</strong> می‌شود — مثل تحویل نامه به صندوق پستی.<br><br>
      <strong>Fan-out:</strong> وقتی یک درخواست اولیه به چند درخواست پایین‌دستی تبدیل می‌شود، به ضریب افزایش تعداد درخواست‌ها <strong>fan-out</strong> می‌گوییم.<br><br>
      <strong>محاسبه:</strong> با ۵,۸۰۰ پست/ثانیه و میانگین ۲۰۰ فالوور (fan-out = ۲۰۰): <strong>کمی بیش از ۱ میلیون نوشتن تایم‌لاین در ثانیه</strong> — در مقایسه با ۴۰۰ میلیون lookup، صرفه‌جویی عظیم!<br><br>
      <strong>به این فرایند precompute و به‌روزرسانی نتیجه کوئری، materialization می‌گوییم</strong> — تایم‌لاین کش یک <strong>materialized view</strong> است: سرعت خواندن بالا می‌رود اما هزینه نوشتن بیشتر می‌شود (derived data که باید به‌روز شود). در پیک، می‌توان تحویل را در صف گذاشت — تایم‌لاین‌ها همیشه سریع می‌مانند چون از کش سرو می‌شوند.`
    },
    {
      id: 4,
      q: 'مشکل سلیبریتی‌ها (Celebrities) در Fan-out چیست و کتاب چه راه‌حلی پیشنهاد می‌دهد؟',
      a: `<strong>دو حالت حدی در fan-out:</strong>
      <ul>
        <li><strong>کاربری که خیلی زیاد فالو می‌کند:</strong> نرخ بالای نوشتن به تایم‌لاین materialized او — ولی احتمالاً همه پست‌ها را نمی‌خواند؛ پس «انداختن» بعضی نوشتن‌ها و نمایش نمونه‌ای از پست‌ها مجاز است (lossy timeline)</li>
        <li><strong>سلیبریتی با میلیون‌ها فالوور:</strong> وقتی پست می‌گذارد باید در تایم‌لاین میلیون‌ها نفر درج شود — این‌جا انداختن نوشتن‌ها مجاز نیست!</li>
      </ul>
      <strong>راه‌حل کتاب:</strong> پست‌های سلیبریتی را <strong>جدا از بقیه</strong> مدیریت کنید: به‌جای درج پست در میلیون‌ها تایم‌لاین، آن را جدا ذخیره و هنگام <strong>خواندن</strong> تایم‌لاین، با محتوای materialized شده merge کنید.<br><br>
      <strong>نکته جالب:</strong> در سال ۲۰۱۰ حدود ۳٪ از سرورهای توییتر فقط به جاستین بیبر اختصاص داشت! مدیریت سلیبریتی‌ها زیرساخت سنگینی می‌خواهد — این یک مثال واقعی از trade-off بین هزینه خواندن و نوشتن است.`
    },
    {
      id: 5,
      q: 'Response Time و Throughput چه تفاوتی دارند و رابطه‌شان چیست؟',
      a: `<strong>Response Time:</strong> زمان سپری‌شده از لحظه درخواست کاربر تا دریافت پاسخ — واحد: میلی‌ثانیه/ثانیه.<br>
      <strong>Throughput:</strong> تعداد درخواست‌ها یا حجم داده پردازش‌شده در واحد زمان — «چند تا در ثانیه».<br><br>
      در کیس‌استادی: «پست در ثانیه» و «نوشتن تایم‌لاین در ثانیه» = throughput؛ «زمان لود تایم‌لاین» و «زمان رسیدن پست به فالوورها» = response time.<br><br>
      <strong>رابطه:</strong> وقتی بار کم است، response time پایین است؛ با افزایش بار، زمان پاسخ افزایش می‌یابد چون <strong>queueing</strong> رخ می‌دهد: درخواست تازه باید صبر کند تا CPU کار درخواست قبلی را تمام کند. با نزدیک‌شدن throughput به حداکثر ظرفیت سخت‌افزار، تأخیر صف <strong>به‌شدت افزایش</strong> می‌یابد (منحنی غیرخطی).<br><br>
      <strong>کاربرد دو معیار:</strong> response time چیزی است که کاربر حس می‌کند؛ throughput تعیین‌کننده منابع (تعداد سرور) و در نتیجه <strong>هزینه</strong> است. اگر throughput از ظرفیت فعلی فراتر رود، باید ظرفیت اضافه شود — و به سیستمی که با افزودن منابع بتوان throughput حداکثرش را به‌طور معنادار افزایش داد، <strong>scalable</strong> می‌گوییم.`
    },
    {
      id: 6,
      q: 'Latency، Response Time، Service Time و Queueing Delay چه تفاوت‌هایی دارند؟',
      a: `این اصطلاحات در کتاب دقیق تعریف شده‌اند (شکل ۲-۴):
      <ul>
        <li><strong>Response time:</strong> چیزی که کلاینت می‌بیند — شامل همه تأخیرهای کل سیستم</li>
        <li><strong>Service time:</strong> مدت‌زمانی که سرویس به‌طور فعال درخواست را پردازش می‌کند</li>
        <li><strong>Latency:</strong> زمان‌هایی که درخواست <strong>در حال پردازش نیست</strong> (latent است) — مثل <strong>شبکه latency</strong> (زمان رفت‌وبرگشت در شبکه)</li>
        <li><strong>Queueing delay:</strong> انتظار در صف‌ها — مثلاً صبر برای آزادشدن CPU یا بافر خروجی شبکه</li>
      </ul>
      <strong>چرا response time متغیر است؟</strong> context switch، از دست رفتن پکت و retransmission TCP، توقف garbage collection، page fault و خواندن از دیسک، حتی لرزش مکانیکی در رک سرور!<br><br>
      <strong>Head-of-line blocking:</strong> سرور به تعداد محدودی درخواست به‌صورت موازی رسیدگی می‌کند (محدود به تعداد هسته‌های CPU) — چند درخواست کند می‌توانند درخواست‌های بعدی را معطل کنند. به همین دلیل <strong>response time باید سمت کلاینت اندازه‌گیری شود</strong>، نه سمت سرور — چون سمت سرور queueing delay را نمی‌بیند.`
    },
    {
      id: 7,
      q: 'چرا میانگین (Mean) برای گزارش Response Time گمراه‌کننده است و Percentile ها چیست؟',
      a: `response time یک عدد نیست — یک <strong>توزیع</strong> است: اکثر درخواست‌ها سریع‌اند اما گاهی outlier ها خیلی کندند.<br><br>
      <strong>مشکل میانگین:</strong> میانگین (arithmetic mean) برای تخمین محدودیت throughput مفید است، اما برای «زمان پاسخ معمول» خوب نیست — نمی‌گوید چند کاربر واقعاً آن تأخیر را تجربه کرده‌اند.<br><br>
      <strong>Percentile ها:</strong>
      <ul>
        <li><strong>Median = p50:</strong> نقطه میانی توزیع — نیمی از درخواست‌ها سریع‌تر، نیمی کندتر؛ معیار خوب برای «زمان انتظار معمول کاربر»</li>
        <li><strong>p95, p99, p999:</strong> برای فهم outlier ها — اگر p95 = ۱.۵ ثانیه باشد، یعنی ۹۵ از ۱۰۰ درخواست کمتر از ۱.۵ ثانیه طول کشیده‌اند</li>
      </ul>
      <strong>چرا percentile های بالا مهم‌اند؟</strong> تجربه کاربران کندترین درخواست‌ها را شکل می‌دهد. مثال کتاب: آمازون SLO داخلی را بر اساس <strong>۹۹.۹th percentile</strong> تعریف می‌کند چون کندترین مشتری‌ها اغلب کسانی‌اند که بیشترین داده را دارند (بیشترین خرید = باارزش‌ترین مشتری‌ها). بهینه‌سازی p99.99 (۱ در ۱۰,۰۰۰) برای آمازون «خیلی گران و بی‌فایده» تشخیص داده شد.`
    },
    {
      id: 8,
      q: 'Tail Latency و Tail Latency Amplification چیست؟',
      a: `<strong>Tail latency:</strong> percentile های بالای response time (مثل p99) — چون «دم» توزیع را نشان می‌دهند. مستقیماً تجربه کاربر را تحت تأثیر قرار می‌دهند: مثلاً طبق داده‌های Yahoo، تفاوت ۱.۲۵ ثانیه‌ای بین پاسخ سریع و کند، ۲۰ تا ۳۰ درصد کلیک بیشتر روی نتایج سریع می‌آورد.<br><br>
      <strong>Tail Latency Amplification (مقاله «The Tail at Scale» — Dean & Barroso):</strong> وقتی سرویس یک درخواست کاربر را با چند فراخوانی موازی به سرویس‌های backend پاسخ می‌دهد، کل درخواست باید منتظر <strong>کندترین فراخوانی</strong> بماند.<br><br>
      <strong>ریاضی:</strong> اگر ۵٪ فراخوانی‌های backend کند باشند و هر درخواست کاربر به ۱۰ فراخوانی نیاز داشته باشد، احتمال اینکه حداقل یکی کند باشد ≈ ۱ - (۰.۹۵)<sup>10</sup> ≈ ۴۰٪! یعنی درصد کمی از فراخوانی‌های کند، درصد زیادی از درخواست‌های کند کاربر را می‌سازند.<br><br>
      <strong>کاربرد:</strong> به همین دلیل SLOها معمولاً ترکیبی از percentiles هستند (مثال: میانه زیر ۲۰۰ms و p99 زیر ۱ ثانیه).`
    },
    {
      id: 9,
      q: 'SLO و SLA چیست و چه تفاوتی دارند؟',
      a: `<strong>SLO (Service Level Objective):</strong> هدف کمی برای عملکرد و در دسترس بودن سرویس. مثال کتاب:
      <ul>
        <li>median response time کمتر از ۲۰۰ms</li>
        <li>p99 کمتر از ۱ ثانیه</li>
        <li>حداقل ۹۹.۹٪ درخواست‌های معتبر، پاسخ غیرخطا دریافت کنند</li>
      </ul>
      <strong>SLA (Service Level Agreement):</strong> قراردادی که مشخص می‌کند اگر SLO برآورده نشود چه اتفاقی می‌افتد — مثلاً مشتری مستحق <strong>بازپرداخت (refund)</strong> می‌شود.<br><br>
      <strong>تفاوت کلیدی:</strong> SLO یک هدف فنی داخلی/عمومی است؛ SLA یک تعهد قراردادی با پیامد تجاری. همیشه SLA ها بر پایه SLO ها ساخته می‌شوند.<br><br>
      <strong>نکته کتاب:</strong> تعریف معیارهای availability خوب برای SLO/SLA در عمل ساده نیست — «nines» (چند ۹) به تنهایی کافی نیست؛ باید معیارهای معنادار تعریف کرد (مثل «درخواست معتبر» دقیقاً یعنی چه؟).`
    },
    {
      id: 10,
      q: 'Retry Storm و Metastable Failure چیست و چه راه‌هایی برای جلوگیری وجود دارد؟',
      a: `<strong>Retry storm:</strong> وقتی سیستم نزدیک اشباع است، صف طولانی می‌شود، response time بالا می‌رود، کلاینت‌ها timeout می‌خورند و درخواست را <strong>دوباره</strong> ارسال می‌کنند — نرخ درخواست بیشتر می‌شود و مشکل بدتر!<br><br>
      <strong>Metastable failure:</strong> حتی بعد از کاهش بار، سیستم ممکن است در حالت اشباع بماند تا وقتی reboot یا reset شود — این پدیده علت بسیاری از outage های جدی در سیستم‌های production است.<br><br>
      <strong>راه‌حل‌های کتاب:</strong>
      <ul>
        <li><strong>Exponential backoff:</strong> افزایش و <strong>رندوم‌سازی</strong> فاصله بین retry ها در سمت کلاینت</li>
        <li><strong>Circuit breaker:</strong> موقتاً به سرویسی که خطا/timeout داده درخواست نفرستیم</li>
        <li><strong>Token bucket:</strong> محدودکردن نرخ درخواست‌ها</li>
        <li><strong>Load shedding:</strong> سرور هنگام نزدیک‌شدن به اشباع، به‌طور فعالانه درخواست‌ها را رد کند</li>
        <li><strong>Backpressure:</strong> سرور از کلاینت بخواهد سرعتش را کم کند</li>
      </ul>
      <strong>نکته:</strong> انتخاب الگوریتم queueing و load balancing هم تفاوت ایجاد می‌کند — و حلقه‌های بازخورد (feedback loops) مثل retry storm را باید در طراحی در نظر گرفت.`
    },
    {
      id: 11,
      q: 'Fault و Failure چه فرقی دارند؟ Fault Tolerance و SPOF را توضیح دهید.',
      a: `<strong>Fault (خطا/خرابی جزء):</strong> یک بخش از سیستم درست کار نمی‌کند — مثلاً یک دیسک از کار افتاد، یک ماشین crash کرد، یا سرویس خارجی وابسته outage دارد.<br>
      <strong>Failure (خرابی کل سیستم):</strong> کل سیستم دیگر سرویس موردنیاز را به کاربر نمی‌دهد — یعنی <strong>SLO را نقض می‌کند</strong>.<br><br>
      <strong>مثال تمایز:</strong> یک دیسک از کار افتاده = fault. اگر سیستم فقط همان یک دیسک را دارد، کل سیستم هم failure کرده. اما اگر چند دیسک داشته باشیم و کپی داده روی دیسک دیگر باشد، کل سیستم fault را تحمل می‌کند.<br><br>
      <strong>Fault Tolerance:</strong> سیستم با وجود رخ دادن fault های خاص، به ارائه سرویس ادامه می‌دهد.<br>
      <strong>SPOF (Single Point of Failure):</strong> بخشی که سیستم نتواند fault آن را تحمل کند — fault در آن به failure کل سیستم منجر می‌شود. مثال کیس‌استادی: ماشینی که در فرایند fan-out تایم‌لاین‌ها را به‌روز می‌کند crash کند — باید ماشین دیگری بدون جاافتادن یا تکراری‌شدن پست‌ها ادامه دهد (<strong>exactly-once semantics</strong>).<br><br>
      <strong>محدودیت تحمل:</strong> همیشه تا تعداد مشخصی fault تحمل داریم (مثلاً حداکثر ۲ دیسک هم‌زمان). تحمل هر تعداد fault بی‌معنی است — اگر همه گره‌ها crash کنند، هیچ‌کاری نمی‌شود کرد.`
    },
    {
      id: 12,
      q: 'Hardware Fault ها چه آماری دارند و redundancy چطور کمک می‌کند؟',
      a: `<strong>آمارهای کتاب:</strong>
      <ul>
        <li><strong>HDD:</strong> سالانه ۲ تا ۵٪ شکست — در کلاستر ۱۰,۰۰۰ دیسکی، به‌طور میانگین <strong>هر روز یک دیسک</strong> از کار می‌افتد!</li>
        <li><strong>SSD:</strong> سالانه ۰.۵ تا ۱٪؛ خطاهای غیرقابل اصلاح تقریباً سالی یک‌بار به ازای هر درایو</li>
        <li><strong>CPU:</strong> تقریباً ۱ از ۱,۰۰۰ ماشین هسته‌ای دارد که گاهی نتیجه اشتباه محاسبه می‌کند (نقص ساخت)</li>
        <li><strong>RAM:</strong> حتی با حافظه ECC، بیش از ۱٪ ماشین‌ها در سال خطای غیرقابل اصلاح دارند</li>
        <li><strong>دیتاسنتر:</strong> ممکن است کاملاً از دسترس خارج شود (برق، آتش، سیل، زلزله) — حتی طوفان خورشیدی می‌تواند به شبکه برق و کابل‌های زیردریایی آسیب بزند</li>
      </ul>
      <strong>Redundancy:</strong> RAID (توزیع داده روی چند دیسک)، منبع تغذیه دوگانه، CPUهای hot-swappable، باتری و دیزل ژنراتور. اما: fault ها مستقل نیستند — شکست یک رک کامل یا دیتاسنتر هنوز اتفاق می‌افتد.<br><br>
      <strong>رویکرد ابری:</strong> به‌جای افزایش uptime تک‌ماشین، <strong>faulty node ها در سطح نرم‌افزار</strong> تحمل می‌شوند؛ <strong>availability zones</strong> مشخص می‌کنند کدام منابع هم‌مکان‌اند (احتمال شکست هم‌زمان بیشتر).<br><br>
      <strong>Rolling upgrade:</strong> سیستم fault-tolerant چندگره‌ای را می‌توان گره‌به‌گره بدون قطعی سرویس پچ کرد — در سیستم تک‌سروری برای پچ باید downtime برنامه‌ریزی کنید.`
    },
    {
      id: 13,
      q: 'Software Fault ها با Hardware Fault ها چه تفاوتی دارند؟ چرا «خطای انسانی» عامل اصلی outage است؟',
      a: `<strong>تفاوت اصلی — همبستگی:</strong> خطاهای سخت‌افزاری تقریباً مستقل‌اند (شکست یک دیسک ربطی به دیسک دیگر ندارد)، اما خطاهای نرم‌افزاری <strong>به‌شدت همبسته</strong>اند — چون همه گره‌ها نرم‌افزار یکسان و باگ یکسان اجرا می‌کنند.<br><br>
      <strong>مثال‌های کتاب:</strong>
      <ul>
        <li><strong>Leap second (۳۰ ژوئن ۲۰۱۲):</strong> یک باگ در Linux kernel باعث شد برنامه‌های جاوا هم‌زمان hang کنند و چندین سرویس اینترنتی از کار بیفتند</li>
        <li><strong>باگ firmware:</strong> همه SSD های یک مدل بعد از دقیقاً ۳۲,۷۶۸ ساعت کار (کمتر از ۴ سال) ناگهان از کار افتادند و داده‌ها غیرقابل بازیابی شد</li>
        <li><strong>Runaway process:</strong> مصرف بیش از حد یک منبع مشترک (CPU، حافظه، دیسک، پهنای باند)</li>
        <li><strong>Cascading failures:</strong> مشکل یک جزء، جزء دیگر را overload می‌کند و آن هم بعدی را می‌اندازد</li>
      </ul>
      <strong>Human error:</strong> مطالعه‌ای روی سرویس‌های اینترنتی بزرگ نشان داد <strong>تغییرات config توسط اپراتورها علت اصلی outage</strong> است — سخت‌افزار فقط در ۱۰ تا ۲۵٪ موارد نقش دارد. «خطای انسانی» علت نیست، <strong>نشانه</strong> مشکل سیستم اجتماعی-فنی است.<br><br>
      <strong>راه‌حل:</strong> تست کامل (از جمله property testing)، rollback سریع تغییرات، rollout تدریجی، observability خوب، و فرهنگ <strong>blameless postmortem</strong> — بعد از incident، افراد بدون ترس از تنبیه جزئیات را کامل به اشتراک بگذارند تا دیگران یاد بگیرند. «باب باید دقت بیشتری می‌کرد» جواب نیست؛ مشکل اولویت‌های سازمان است.`
    },
    {
      id: 14,
      q: 'Scalability چیست؟ Load Parameters و Linear Scalability را توضیح دهید.',
      a: `<strong>Scalability:</strong> توانایی سیستم برای مقابله با افزایش بار (load).<br><br>
      <strong>نکته مهم:</strong> scalability یک برچسب یک‌بعدی نیست — «X قابل مقیاس است» یا «Y مقیاس نمی‌شود» بی‌معنی است. باید پرسید: اگر سیستم به شکل خاصی رشد کند، گزینه‌های ما چیست؟ چطور منابع اضافه کنیم؟ چه زمانی به حد معماری فعلی می‌خوریم؟<br><br>
      <strong>Load Parameters:</strong> بار را با معیارهای درست توصیف کنید:
      <ul>
        <li>تعداد درخواست در ثانیه، حجم داده جدید در روز، تعداد checkout فروشگاه در ساعت</li>
        <li>گاهی پیک کمیت متغیر مهم است (مثل تعداد کاربران هم‌زمان آنلاین)</li>
        <li>ویژگی‌های آماری بار: نسبت خواندن/نوشتن، hit rate کش، تعداد آیتم‌ها per user (فالوورها در کیس‌استادی)</li>
      </ul>
      <strong>دو سوال کلیدی:</strong> (۱) اگر بار را زیاد کنیم و منابع ثابت بمانند، performance چطور تغییر می‌کند؟ (۲) اگر بار زیاد شود، چقدر منابع لازم است تا performance ثابت بماند؟<br><br>
      <strong>Linear scalability:</strong> اگر دو برابر کردن منابع، دو برابر بار را با همان performance اداره کند. گاهی کمتر از دو برابر منابع لازم است (economies of scale)، اما معمولاً هزینه سریع‌تر از خطی رشد می‌کند.<br><br>
      <strong>هشدار کتاب:</strong> برای استارتاپ با کاربر کم، نگرانی از مقیاس فرضی <strong>بهینه‌سازی زودهنگام</strong> است — در بدترین حالت شما را به طراحی غیرمنعطف قفل می‌کند. صبر کنید تا bottleneck واقعی ظاهر شود.`
    },
    {
      id: 15,
      q: 'معماری‌های Shared-Memory، Shared-Disk و Shared-Nothing چه تفاوتی دارند؟ و Maintainability چیست؟',
      a: `<strong>Vertical scaling (scaling up):</strong> رفتن به ماشین قوی‌تر — هسته‌های بیشتر، RAM بیشتر، دیسک بیشتر. همه thread های یک process به RAM مشترک دسترسی دارند → <strong>Shared-Memory architecture</strong>.<br>
      <strong>مشکل:</strong> هزینه سریع‌تر از خطی رشد می‌کند (ماشین دو برابر گران‌تر از ۲ برابر معمولاً بیشتر است) و به‌خاطر bottleneck ها، معمولاً نمی‌تواند واقعاً دو برابر بار را اداره کند.<br><br>
      <strong>Shared-Disk:</strong> چند ماشین با CPU/RAM مستقل، اما داده روی آرایه دیسک مشترک (NAS/SAN). سنتی برای data warehousing on-premises — اما <strong>contention و سربار قفل‌گذاری</strong> scalability را محدود می‌کند. سیستم‌های cloud native (جداسازی storage و compute) این مدل را با API تخصصی به‌جای فایل‌سیستم بهبود داده‌اند.<br><br>
      <strong>Shared-Nothing (horizontal scaling / scaling out):</strong> چند گره که هر کدام CPU، RAM و دیسک خودش را دارد؛ هماهنگی در سطح نرم‌افزار. مزایا: پتانسیل scaling خطی، استفاده از سخت‌افزار با بهترین نسبت قیمت/عملکرد (مخصوصاً در ابر)، تنظیم آسان منابع، fault tolerance بهتر. معایب: نیاز به <strong>sharding</strong> صریح (فصل ۷) و همه پیچیدگی‌های سیستم‌های توزیع‌شده (فصل ۹).<br><br>
      <strong>اصول کلی scalability:</strong> «سس جادویی» وجود ندارد — سیستمی برای ۱۰۰,۰۰۰ درخواست/ثانیه با حجم ۱kB با سیستمی برای ۳ درخواست/دقیقه با حجم ۲GB کاملاً متفاوت است (حتی با throughput یکسان ۱۰۰MB/s). معماری را باید در هر <strong>مرتبه بزرگی (order of magnitude)</strong> رشد بار بازاندیشی کرد؛ سیستم را به اجزای مستقل بشکنید (مایکروسرویس، sharding، stream processing) و ساده نگه دارید.<br><br>
      <strong>Maintainability — سه اصل:</strong>
      <ul>
        <li><strong>Operability:</strong> آسان‌کردن کار تیم عملیات — «عملیات خوب می‌تواند نرم‌افزار بد را دور بزند، اما نرم‌افزار خوب با عملیات بد قابل اجرا نیست»</li>
        <li><strong>Simplicity:</strong> آسان‌کردن درک سیستم برای مهندسان جدید — مدیریت پیچیدگی با <strong>abstraction</strong> (مثل SQL)؛ فرق پیچیدگی ذاتی (essential) و اتفاقی (accidental)</li>
        <li><strong>Evolvability:</strong> آسان‌کردن تغییرات آینده — سامانه‌های loose-coupled ساده‌تر تغییر می‌کنند؛ <strong>irreversibility</strong> (مثل مهاجرت دیتابیس بدون برگشت) تغییر را خطرناک می‌کند</li>
      </ul>`
    }
  ],
  interview: [
    { category: 'sd', difficulty: 'medium', q: 'خانه تایم‌لاین یک شبکه اجتماعی (مثل X) را طراحی کنید — polling یا push؟', a: `<strong>گام ۱ — درک بار:</strong> ۵,۸۰۰ پست/ثانیه میانگین (پیک ۱۵۰k)، میانگین ۲۰۰ فالوور per user.<br>
      <strong>گام ۲ — رد polling:</strong> کوئری JOIN در هر ۵ ثانیه برای ۱۰M کاربر آنلاین = ۲M کوئری/ثانیه و ۴۰۰M lookup — غیرممکن.<br>
      <strong>گام ۳ — materialized timeline:</strong> تایم‌لاین هر کاربر از قبل ساخته می‌شود؛ پست جدید به صندوق تایم‌لاین همه فالوورها تحویل می‌شود (fan-out ≈ ۱M نوشتن/ثانیه) و خواندن از کش است.<br>
      <strong>گام ۴ — سلیبریتی‌ها:</strong> پست‌های سلیبریتی جدا ذخیره و موقع خواندن merge می‌شوند.<br>
      <strong>گام ۵ — fault tolerance:</strong> تحویل پست نباید گم شود یا تکراری شود (exactly-once) — اگر ماشین fan-out از کار افتاد، ماشین دیگر بدون gap ادامه دهد.
      <div class="tip">💡 Always discuss the read/write trade-off: fan-out moves cost from read to write</div>` },
    { category: 'sd', difficulty: 'hard', q: 'برای یک سرویس، SLO و سیستم مانیتورینگ response time تعریف کنید.', a: `۱. <strong>تعریف SLI:</strong> معیار قابل اندازه‌گیری — مثلاً درصد درخواست‌های معتبر با response time کمتر از حد مشخص.<br>
      ۲. <strong>SLO:</strong> مثل کتاب: median &lt; 200ms، p99 &lt; 1s، و ≥ 99.9٪ درخواست‌ها بدون خطا.<br>
      ۳. <strong>SLA:</strong> تعهد قراردادی با پیامد (refund).<br>
      ۴. <strong>محاسبه percentile ها:</strong> پنجره غلتان ۱۰ دقیقه‌ای؛ هر دقیقه percentile ها را محاسبه و نمودار کنید — با کتابخانه‌های تخمین مثل HdrHistogram یا t-digest (برای حجم بالا).<br>
      ۵. <strong>اشتباه رایج:</strong> میانگین‌گیری از percentile ها بی‌معنی است — histogram ها را جمع کنید.<br>
      ۶. <strong>Error budget:</strong> مثلاً ۰.۱٪ budget خطا — وقتی مصرف شد، سرعت توسعه را کم کنید و روی قابلیت اطمینان تمرکز کنید.<br>
      <strong>نکته:</strong> p99 باید سمت کلاینت سنجیده شود (queueing delay را می‌بیند) و tail latency amplification در زنجیره فراخوانی‌ها را در نظر بگیرید.
      <div class="tip">💡 The slowest requests are often your most valuable users (Amazon's 99.9th percentile)</div>` },
    { category: 'cp', difficulty: 'easy', q: 'Functional و Nonfunctional Requirements را با مثال توضیح دهید.', a: `<strong>Functional:</strong> چه کاری باید انجام شود — «کاربر می‌تواند سفارش ثبت کند»، «فاکتور نمایش داده شود».<br>
      <strong>Nonfunctional:</strong> چقدر خوب انجام شود — «پرداخت باید زیر ۲۰۰ms جواب دهد»، «سیستم در سال ۹۹.۹٪ در دسترس باشد»، «در صورت crash دیسک، داده از دست نرود»، «قابل نگهداری و توسعه باشد».<br><br>
      <strong>نکته:</strong> NFRها اغلب نوشته نمی‌شوند چون «بدیهی» به نظر می‌رسند — اما یک اپ فوق‌العاده کند یا ناپایدار عملاً وجود ندارد. امنیت و GDPR هم NFR هستند (خارج از حیطه کتاب).` },
    { category: 'cp', difficulty: 'medium', q: 'چرا میانگین (average) response time گمراه‌کننده است و p99 اهمیت دارد؟', a: `۱. میانگین به‌عنوان معیار «زمان معمول» گمراه‌کننده است: یک outlier بزرگ میانگین را بالا می‌کشد ولی اکثر کاربران تجربه خوبی دارند — و برعکس.<br>
      ۲. <strong>p50 (median)</strong> نشان می‌دهد نیمی از کاربران چه چیزی تجربه می‌کنند؛ <strong>p95/p99/p999</strong> بدترین تجربه‌ها را نشان می‌دهند.<br>
      ۳. کندترین کاربران اغلب باارزش‌ترین‌اند — آمازون SLO داخلی را روی 99.9th می‌گذارد چون مشتریان با بیشترین داده/خرید، کندترین درخواست‌ها را دارند.<br>
      ۴. در زنجیره فراخوانی‌های موازی، یک فراخوانی کند کل درخواست را کند می‌کند (tail latency amplification) — درصد کمی کندی در backend، درصد زیادی کندی در تجربه کاربر می‌سازد.<br>
      ۵. میانگین‌گیری از percentile ها هم بی‌معنی است — histogram ها را جمع کنید.
      <div class="tip">💡 Measure what the user experiences, not what the server averages</div>` },
    { category: 'cp', difficulty: 'hard', q: 'Metastable Failure چیست؟ با مثال توضیح دهید و راه‌های پیشگیری را بگویید.', a: `<strong>تعریف:</strong> سیستمی که به اشباع نزدیک شده وارد چرخه معیوب می‌شود: صف طولانی → response time بالا → کلاینت‌ها timeout و retry → نرخ درخواست بیشتر → اشباع بیشتر. حتی بعد از کاهش بار، سیستم در حالت اشباع می‌ماند تا reboot یا reset شود.<br><br>
      <strong>مثال:</strong> سرویس A کند می‌شود، سرویس B که به آن وابسته است شروع به retry سنگین می‌کند، صف B پر می‌شود و دیگر سرویس‌های وابسته به B هم آسیب می‌بینند — حتی وقتی مشکل اولیه حل شد، سیستم خودش را در حالت اشباع نگه می‌دارد.<br><br>
      <strong>پیشگیری:</strong>
      <ul>
        <li><strong>Exponential backoff با جitter:</strong> فاصله retry ها افزایشی و رندوم</li>
        <li><strong>Circuit breaker:</strong> قطع موقت ترافیک به سرویس خطادار</li>
        <li><strong>Token bucket:</strong> محدودیت نرخ درخواست</li>
        <li><strong>Load shedding:</strong> رد فعالانه درخواست‌ها نزدیک اشباع (به‌جای صف بی‌نهایت)</li>
        <li><strong>Backpressure:</strong> درخواست کاهش سرعت به کلاینت</li>
      </ul>
      <div class="tip">💡 Retries are dangerous: they turn a transient overload into a permanent one</div>` },
    { category: 'cp', difficulty: 'medium', q: 'Fault و Failure چه فرقی دارند؟ SPOF و Chaos Engineering را توضیح دهید.', a: `<strong>Fault:</strong> یک جزء از کار می‌افتد (دیسک، ماشین، سرویس خارجی).<br>
      <strong>Failure:</strong> کل سیستم سرویس نمی‌دهد — SLO نقض می‌شود. یک fault ممکن است failure باشد یا نباشد؛ بستگی به معماری دارد.<br><br>
      <strong>SPOF:</strong> جزئی که fault آن = failure کل سیستم. هدف طراحی: حذف SPOF ها (کپی داده، failover).<br><br>
      <strong>Fault injection:</strong> افزایش عمدی نرخ fault ها — مثلاً کشتن رندوم process ها بدون هشدار — تا مطمئن شویم مکانیزم‌های fault tolerance مدام تمرین و تست می‌شوند. <strong>Chaos engineering</strong> دقیقاً همین است: آزمایش عمدی fault ها برای افزایش اعتماد به مکانیزم‌ها.<br><br>
      <strong>نکته:</strong> بیشتر باگ‌های بحرانی ناشی از error handling ضعیف است — fault injection آن مسیرها را همیشه زنده نگه می‌دارد. تحمل fault همیشه بهتر از پیشگیری از آن است، جز در امنیت (اگر مهاجم به داده حساس رسید، قابل بازگشت نیست).` },
    { category: 'sc', difficulty: 'easy', q: 'سرویس شما نزدیک اشباع است و کلاینت‌ها timeout می‌خورند و retry می‌کنند — مشکل بدتر می‌شود. چه می‌کنید؟', a: `۱. <strong>تشخیص:</strong> این همان <strong>retry storm / metastable failure</strong> است — حلقه بازخورد منفی.<br>
      ۲. <strong>اقدام فوری:</strong> circuit breaker روی کلاینت‌ها فعال کنید تا ترافیک به سرویس خطادار موقتاً قطع شود و فرصت تخلیه صف بدهد.<br>
      ۳. <strong>Load shedding در سرور:</strong> درخواست‌های اضافه را سریعاً رد کنید (خطای صریح) به‌جای صف‌کردن بی‌نهایت.<br>
      ۴. <strong>Backpressure:</strong> از کلاینت‌ها بخواهید نرخ را کم کنند.<br>
      ۵. <strong>رفع ریشه‌ای:</strong> exponential backoff با jitter در سمت کلاینت؛ token bucket برای محدودکردن نرخ؛ مانیتورینگ صف‌ها و زمان پاسخ.<br>
      ۶. <strong>بعد از incident:</strong> blameless postmortem — چرا صف‌ها انباشته شدند؟ چرا retry ها کنترل نشدند؟
      <div class="tip">💡 Reject fast beats queue forever — fail fast, fail clear</div>` },
    { category: 'sc', difficulty: 'medium', q: 'سرویس شما از ۱ میلیون به ۱۰ میلیون کاربر رسیده و کند شده. راهبرد مقیاس‌پذیری چیست؟', a: `۱. <strong>مشخص‌کردن بار:</strong> کدام معیار رشد کرده؟ درخواست/ثانیه؟ داده؟ کاربران هم‌زمان؟ نسبت read/write؟ bottleneck را پیدا کنید (CPU، I/O، شبکه، دیتابیس).<br>
      ۲. <strong>اول vertical scaling:</strong> ماشین قوی‌تر (طبق توصیه فصل ۱: تا جایی که ممکن است single-node) — اما هزینه سریع‌تر از خطی رشد می‌کند و در این مقیاس کافی نیست.<br>
      ۳. <strong>کش و read replicas</strong> برای read-heavy.<br>
      ۴. <strong>Shared-nothing:</strong> مقیاس افقی با sharding — نیاز به فصل ۷ دارد و پیچیدگی فصل ۹ را می‌آورد (هماهنگی بین گره‌ها در سطح نرم‌افزار).<br>
      ۵. <strong>شکستن به اجزای مستقل:</strong> مایکروسرویس/stream processing — خط جداکردن را با دقت انتخاب کنید.<br>
      <strong>نکته:</strong> معماری مناسب هر مرتبه بزرگی رشد باید بازاندیشی شود — «سس جادویی» وجود ندارد. بار غیرقابل پیش‌بینی؟ autoscaling. بار قابل پیش‌بینی؟ مقیاس دستی ساده‌تر.
      <div class="tip">💡 Doubling resources should double capacity — if it doesn't, you've hit an architectural limit</div>` },
    { category: 'sc', difficulty: 'hard', q: 'سرویس شما SLA سه‌نه (99.9٪) دارد. چطور availability را می‌سنجید و هزینه‌ها را مدیریت می‌کنید؟', a: `۱. <strong>تعریف دقیق «available»:</strong> فقط uptime ماشین نیست — درصد درخواست‌های معتبر موفق. (مثال کتاب: «درخواست معتبر» یعنی چه؟ پاسخ نادرست را هم باید حساب کرد).<br>
      ۲. <strong>SLI → SLO → SLA:</strong> SLI معیار خام (مثلاً ۹۹.۹۵٪ درخواست‌ها موفق زیر ۱ ثانیه)، SLO هدف فنی، SLA تعهد قراردادی با penalty.<br>
      ۳. <strong>اندازه‌گیری درست:</strong> percentile ها از سمت کلاینت؛ histogram ها را جمع کنید نه میانگین‌ها؛ tail latency amplification را در زنجیره فراخوانی در نظر بگیرید.<br>
      ۴. <strong>Error budget:</strong> در ۹۹.۹٪، budget خطا = ۰.۱٪ ≈ ۴۳ دقیقه در ماه — وقتی مصرف شد، توسعه فیچرها را متوقف و روی قابلیت اطمینان سرمایه‌گذاری کنید؛ این باعث می‌شود تیم‌ها trade-off را آگاهانه انجام دهند.<br>
      ۵. <strong>هشدار کتاب:</strong> «nines به تنهایی کافی نیست» — معیارهای معنادار تعریف کنید (مثل درصد کاربران آسیب‌دیده)، نه فقط درصد زمان.
      <div class="tip">💡 99.9% is 43 minutes/month of downtime — decide consciously where it goes</div>` },
    { category: 'sc', difficulty: 'medium', q: 'یک incident بزرگ رخ داده و تیم می‌خواهد مقصر را پیدا کند. رویکرد درست چیست؟', a: `۱. <strong>مقصرشناسی اشتباه است:</strong> «خطای انسانی» علت نیست، <strong>نشانه</strong> مشکل سیستم اجتماعی-فنی است. تغییرات config توسط اپراتورها علت اصلی outage ها هستند — اما تقصیر اپراتور نیست؛ مشکل اولویت‌های سازمان است (فیچر بیشتر به‌جای تست بیشتر).<br>
      ۲. <strong>Blameless postmortem:</strong> بعد از incident، همه بدون ترس از تنبیه جزئیات کامل را به اشتراک بگذارند — دیگران یاد می‌گیرند چگونه مشابه آن را پیشگیری کنند.<br>
      ۳. <strong>به‌دنبال پاسخ ساده نباشید:</strong> «باب باید دقت می‌کرد» سازنده نیست؛ «باید backend را در Haskell بازنویسی کنیم» هم نه. جزئیات کار روزانه سیستم را از دید افراد بشنوید.<br>
      ۴. <strong>اقدامات فنی:</strong> تست کامل‌تر (property testing)، rollback سریع، rollout تدریجی، observability بهتر، رابط‌هایی که «کار درست» را تشویق می‌کنند.
      <div class="tip">💡 The postmortem's goal is learning, not blame — the system failed, not the person</div>` }
  ]
});
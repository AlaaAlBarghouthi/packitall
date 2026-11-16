# Pack It All 🕳️🎁🏙️

لعبة موبايل ثلاثية الأبعاد: بتحرّك ثقب بيبلع الأغراض، كل غرض بيعطيك كوينز، وبالكوينز بتبني وبتطوّر مدينتك.
مبنية بـ **Three.js** وملفوفة كتطبيق أصلي بـ **Capacitor 8** لأندرويد وiOS.

---

## شو في باللعبة

| القسم | التفاصيل |
|---|---|
| **العب** | مراحل بلا نهاية بخمس عوالم (الجمال، الحلويات، الألعاب، النزهة، المدينة). كل مرحلة إلها أهداف ووقت. الثقب بيكبر كل ما يبلع، والأغراض الكبيرة (XL) بتحتاج ثقب كبير. |
| **المساعدات** | مغناطيس، إعصار، تجميد الوقت، تكبير الثقب. |
| **المدينة** | 16 أرض بتنفتح مع تقدّمك، و16 نوع مبنى (بيت، كافيه، محل بوظة، نافورة، بيت زجاجي، سينما، فندق، برج، دولاب الهوا، قصر...)، كل مبنى إله 3 مستويات وبيجيب دخل بالساعة. |
| **المهام** | 4 مهام يومية بمكافآت كوينز وجواهر. |
| **المتجر** | هدية مجانية كل 8 ساعات، شراء مساعدات، تعبئة القلوب، تبديل جواهر بكوينز. |
| **القلوب** | 5 قلوب، بتخسر قلب إذا خسرت، وبيرجع قلب كل 20 دقيقة. |
| **غير هيك** | حفظ تلقائي، عربي/إنجليزي، صوت واهتزاز، زر الرجوع بأندرويد، الوضع العمودي. |

---

## تجربة سريعة على الكمبيوتر

```bash
npm run dev        # بعدين افتح http://localhost:8080
```
(أو أي سيرفر ملفات بيشغّل مجلد `www`.) استعمل الماوس أو الأسهم/WASD.

---

## بناء التطبيق

```bash
npm install
npx cap sync       # بينسخ اللعبة جوّا مشاريع أندرويد وiOS وبيركّب الإضافات
```

### أندرويد (Windows / Mac / Linux)
1. نزّل **Android Studio**.
2. `npm run android` (بيفتح المشروع بـ Android Studio).
3. للتجربة: وصّل موبايلك واكبس ▶️ Run.
4. للنشر: **Build ▸ Generate Signed App Bundle ▸ Android App Bundle** واعمل ملف مفتاح (keystore) جديد. **احتفظ بالمفتاح وكلمة السر بمكان آمن** لأنك بتحتاجهم لكل تحديث.

### iOS (بدها Mac فيه Xcode 16 أو أحدث)
1. `npm run ios` (بيفتح المشروع بـ Xcode).
2. من **Signing & Capabilities** اختار الـ Team تبعك.
3. **Product ▸ Archive** وبعدين **Distribute App ▸ App Store Connect**.

### ما عندك Mac؟ استعمل Codemagic
الملف `codemagic.yaml` جاهز: ارفع المشروع على GitHub، واربطه بـ [codemagic.io](https://codemagic.io)، وضيف مفتاح App Store Connect API. هيك بيبني نسخة iOS وبيرفعها على TestFlight تلقائياً، وكمان بيبني نسخة أندرويد.

### GitHub Actions
- `android.yml`: مع كل push بيبني APK للتجربة وAAB لـ Google Play. حتى يكون الـ AAB موقّع، ضيف هالأسرار: `KEYSTORE_BASE64` و`KEYSTORE_PASSWORD` و`KEY_ALIAS` و`KEY_PASSWORD`.
- `ios.yml`: بيتأكد إن مشروع iOS بينبني على Mac تبع GitHub.

---

## النشر على المتاجر — الخطوات

### Google Play
1. افتح حساب مطوّر على [play.google.com/console](https://play.google.com/console) (25$ مرة وحدة).
2. اعمل تطبيق جديد واختار إنه **لعبة** و**مجانية**.
3. عبّي صفحة المتجر من `store/STORE_LISTING.md` (الأيقونة موجودة بـ `assets/icon.png`).
4. **Data safety**: اللعبة ما بتجمع أي بيانات (كل شي محفوظ على الجهاز).
5. حط رابط سياسة الخصوصية: انشر `store/PRIVACY.md` على أي صفحة عامة.
6. ارفع ملف `.aab` على **Internal testing** أولاً، وبعدين **Production**.
   > الحسابات الشخصية الجديدة لازم تعمل اختبار مغلق مع 12 مختبِر لمدة 14 يوم قبل الإنتاج.

### Apple App Store
1. اشترك بـ [Apple Developer Program](https://developer.apple.com/programs/) (99$ بالسنة).
2. من [App Store Connect](https://appstoreconnect.apple.com) اعمل تطبيق جديد بالـ Bundle ID `com.packitall.game`.
3. ارفع النسخة من Xcode أو Codemagic، وجرّبها على TestFlight.
4. عبّي الوصف والصور من `store/STORE_LISTING.md`. **App Privacy**: Data Not Collected.
5. ابعتها للمراجعة (Submit for Review).

> 💡 **غيّر الـ appId قبل النشر** إذا بدك اسم خاص فيك (مثلاً `com.yourname.packitall`): بـ `capacitor.config.json` و`android/app/build.gradle` و`ios/App/App.xcodeproj/project.pbxproj`، وانقل `MainActivity.java` لمجلد الاسم الجديد.

---

## هيكل المشروع

```
www/                    ← اللعبة نفسها (HTML/CSS/JS + Three.js)
  js/main.js            ← الشاشات والتنقل والنوافذ
  js/game.js            ← مرحلة الثقب: الحركة، البلع، الأهداف، المساعدات
  js/levels.js          ← توليد المراحل والعوالم
  js/models.js          ← موديلات 3D مولّدة بالكود (هدايا، دونات، دبدوب، سيارات...)
  js/city.js            ← المدينة والمباني
  js/state.js           ← الحفظ والاقتصاد والقلوب والمهام
  js/data.js            ← الأسعار والمباني (عدّل التوازن من هون)
  js/i18n.js            ← النصوص بالعربي والإنجليزي
android/                ← مشروع Android Studio
ios/                    ← مشروع Xcode (Swift Package Manager)
assets/                 ← الأيقونة وشاشة البداية
store/                  ← نصوص المتجر وسياسة الخصوصية
```

## الإعلانات (اختيارية بس)
- ما في ولا إعلان إجباري. الإعلان بيطلع بس لما اللاعب يكبس زر ▶ ليربح: قلب، ضعف الكوينز، +20 ثانية، مساعدة مجانية، أو الهدية قبل وقتها.
- كل زر بينفع 5 مرات باليوم (بتغيّرها من `DAILY_CAP` بـ `www/js/config.js`).
- أعلى تصنيف للإعلانات **T** (مراهقين). بتغيّره من `MAX_RATING` بـ `www/js/config.js`، ولازم يطابق إعداد AdMob.
- بالنسخة اللي على الويب في "إعلان تجريبي" مدته 3 ثواني بس، حتى تجرب النظام.

### لتفعيل الإعلانات الحقيقية
1. افتح حساب على [admob.google.com](https://admob.google.com) (الدفع بالتحويل البنكي مدعوم بالإمارات).
2. **Apps ← Add app**: ضيف تطبيق Android وتطبيق iOS، وانسخ **App ID** تبع كل واحد (فيه علامة `~`).
3. لكل تطبيق: **Ad units ← Add ad unit ← Rewarded**، وانسخ **Ad unit ID** (فيه علامة `/`).
4. حط الأرقام:
   - `www/js/config.js`: الـ Ad unit IDs، وغيّر `TEST: true` لـ `false`.
   - `android/app/src/main/res/values/strings.xml`: الـ `admob_app_id`.
   - `ios/App/App/Info.plist`: الـ `GADApplicationIdentifier`.
5. **حماية المحتوى** من لوحة AdMob:
   - **Blocking controls ← All apps ← Content ratings**: اختار **G**.
   - **Sensitive categories**: احظر المواعدة، والقمار، والكحول، والمحتوى الجنسي، والأدوية، والسياسة، وأي شي ما بدك ياه.
   - **Ad review center**: من هون بتشوف الإعلانات اللي طلعت وبتحظر أي واحد.
6. **Privacy & messaging ← GDPR**: اعمل رسالة موافقة لأوروبا. اللعبة بتعرضها لحالها.
7. بالآيفون: ضيف باقي أرقام `SKAdNetworkItems` من [دليل Google](https://developers.google.com/admob/ios/quick-start#update_your_infoplist) جوّا `Info.plist`.

> ⚠️ لا تكبس على إعلاناتك الحقيقية بنفسك، لأن Google ممكن تسكّر الحساب. وخلّي `TEST: true` وإنت عم تجرّب.

## خطوات جاية مقترحة
- **مشتريات داخل التطبيق** (جواهر، إزالة إعلانات): عن طريق RevenueCat (`@revenuecat/purchases-capacitor`).
- موسيقى خلفية ومراحل خاصة (Boss levels).

الترخيص: Three.js (MIT)، خط Baloo Bhaijaan 2 (SIL OFL، الملف بـ `www/fonts/OFL.txt`).

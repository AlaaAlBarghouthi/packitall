// Simple bilingual strings (Arabic / English)
const STR = {
  ar: {
    play: 'العب', city: 'المدينة', tasks: 'المهام', shop: 'المتجر',
    level: 'المرحلة', start: 'ابدأ', next: 'التالي', retry: 'أعد المحاولة',
    home: 'الرئيسية', resume: 'تابع', quit: 'اخرج', paused: 'استراحة',
    win: 'أحسنت!', lose: 'انتهى الوقت!', earned: 'ربحت', goals: 'الأهداف',
    collect: 'اجمع', build: 'ابنِ', upgrade: 'طوّر', locked: 'مقفل',
    unlockAt: 'تفتح بالمرحلة', maxed: 'أعلى مستوى', income: 'الدخل',
    perHour: '/ساعة', notEnough: 'ما معك كوينز كفاية', built: 'تم البناء!',
    upgraded: 'تم التطوير!', noHearts: 'خلصت القلوب', refill: 'عبّي القلوب',
    nextHeart: 'القلب الجاي بعد', settings: 'الإعدادات', sound: 'الصوت',
    vibration: 'الاهتزاز', language: 'اللغة', reset: 'مسح التقدم',
    resetConfirm: 'أكيد بدك تمسح كل شي؟', yes: 'نعم', no: 'لا', close: 'سكّر',
    daily: 'مهام اليوم', claim: 'استلم', claimed: 'تم', boosters: 'المساعدات',
    magnet: 'مغناطيس', tornado: 'إعصار', freeze: 'تجميد', grow: 'تكبير',
    magnetD: 'يسحب الأغراض القريبة', tornadoD: 'يجيب أغراض الأهداف لعندك',
    freezeD: 'يوقّف الوقت ١٠ ثواني', growD: 'يكبّر الثقب لفترة',
    buy: 'اشتري', freeGift: 'هدية مجانية', comeBack: 'ارجع بعد',
    hearts: 'قلوب', plus20: '+٢٠ ثانية', cityLevel: 'مستوى المدينة',
    population: 'السكان', tapToMove: 'اسحب لتحرّك الثقب', size: 'الحجم',
    combo: 'كومبو', tooBig: 'كبير كتير! كبّر الثقب', theme_beauty: 'عالم الجمال',
    theme_sweets: 'عالم الحلويات', theme_toys: 'عالم الألعاب', theme_city: 'شوارع المدينة',
    theme_picnic: 'نزهة', goalsDone: 'خلصت الأهداف!', stars: 'نجوم',
    t_swallow: 'ابلع {n} غرض', t_levels: 'خلّص {n} مراحل', t_booster: 'استخدم {n} مساعدات',
    t_collect: 'اجمع دخل المدينة {n} مرات', t_build: 'ابنِ أو طوّر {n} مباني', t_coins: 'اربح {n} كوين',
    allDone: 'خلصت كل المهام! ارجع بكرا', bld_house: 'بيت', bld_cafe: 'كافيه',
    bld_icecream: 'محل بوظة', bld_boutique: 'بوتيك', bld_fountain: 'نافورة',
    bld_greenhouse: 'بيت زجاجي', bld_bakery: 'مخبز', bld_toystore: 'محل ألعاب',
    bld_park: 'حديقة', bld_mansion: 'فيلا', bld_tower: 'برج', bld_cinema: 'سينما',
    bld_hotel: 'فندق', bld_stadium: 'ملعب', bld_ferris: 'دولاب الهوا', bld_castle: 'قصر',
    emptyPlot: 'أرض فاضية', chooseBuilding: 'اختار شو بدك تبني', lvl: 'مستوى',
    welcome: 'ابلع كل شي، اجمع كوينز، وابنِ مدينتك!', gems: 'جواهر', bonus: 'مكافأة',
    timeBonus: 'مكافأة الوقت', swallowedC: 'كوينز البلع', ready: 'جاهز؟', go: 'يلا!', reached: 'وصلت',
  },
  en: {
    play: 'Play', city: 'City', tasks: 'Tasks', shop: 'Shop',
    level: 'Level', start: 'Start', next: 'Next', retry: 'Retry',
    home: 'Home', resume: 'Resume', quit: 'Quit', paused: 'Paused',
    win: 'Great job!', lose: "Time's up!", earned: 'Earned', goals: 'Goals',
    collect: 'Collect', build: 'Build', upgrade: 'Upgrade', locked: 'Locked',
    unlockAt: 'Unlocks at level', maxed: 'Max level', income: 'Income',
    perHour: '/hr', notEnough: 'Not enough coins', built: 'Built!',
    upgraded: 'Upgraded!', noHearts: 'Out of hearts', refill: 'Refill hearts',
    nextHeart: 'Next heart in', settings: 'Settings', sound: 'Sound',
    vibration: 'Vibration', language: 'Language', reset: 'Reset progress',
    resetConfirm: 'Erase all progress?', yes: 'Yes', no: 'No', close: 'Close',
    daily: 'Daily tasks', claim: 'Claim', claimed: 'Done', boosters: 'Boosters',
    magnet: 'Magnet', tornado: 'Tornado', freeze: 'Freeze', grow: 'Grow',
    magnetD: 'Pulls nearby items', tornadoD: 'Brings goal items to you',
    freezeD: 'Stops the clock for 10s', growD: 'Makes the hole bigger for a while',
    buy: 'Buy', freeGift: 'Free gift', comeBack: 'Come back in',
    hearts: 'Hearts', plus20: '+20 seconds', cityLevel: 'City level',
    population: 'Population', tapToMove: 'Drag to move the hole', size: 'Size',
    combo: 'Combo', tooBig: 'Too big! Grow first', theme_beauty: 'Beauty World',
    theme_sweets: 'Sweet Land', theme_toys: 'Toy Box', theme_city: 'City Streets',
    theme_picnic: 'Picnic', goalsDone: 'Goals complete!', stars: 'Stars',
    t_swallow: 'Swallow {n} items', t_levels: 'Finish {n} levels', t_booster: 'Use {n} boosters',
    t_collect: 'Collect city income {n} times', t_build: 'Build or upgrade {n} buildings', t_coins: 'Earn {n} coins',
    allDone: 'All tasks done! Come back tomorrow', bld_house: 'House', bld_cafe: 'Café',
    bld_icecream: 'Ice Cream Shop', bld_boutique: 'Boutique', bld_fountain: 'Fountain',
    bld_greenhouse: 'Greenhouse', bld_bakery: 'Bakery', bld_toystore: 'Toy Store',
    bld_park: 'Park', bld_mansion: 'Mansion', bld_tower: 'Tower', bld_cinema: 'Cinema',
    bld_hotel: 'Hotel', bld_stadium: 'Stadium', bld_ferris: 'Ferris Wheel', bld_castle: 'Castle',
    emptyPlot: 'Empty plot', chooseBuilding: 'Choose what to build', lvl: 'Lv',
    welcome: 'Swallow everything, earn coins, build your city!', gems: 'Gems', bonus: 'Bonus',
    timeBonus: 'Time bonus', swallowedC: 'Items', ready: 'Ready?', go: 'Go!', reached: 'Reached',
  },
};

let lang = 'ar';
export function setLang(l) {
  lang = STR[l] ? l : 'en';
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}
export function getLang() { return lang; }
export function t(key, vars) {
  let s = (STR[lang] && STR[lang][key]) || STR.en[key] || key;
  if (vars) for (const k in vars) s = s.replace('{' + k + '}', fmt(vars[k]));
  return s;
}
export function fmt(n) {
  if (typeof n !== 'number') return n;
  return Math.floor(n).toLocaleString('en-US');
}
export function fmtTime(sec) {
  sec = Math.max(0, Math.ceil(sec));
  const m = Math.floor(sec / 60), s = sec % 60;
  return m + ':' + String(s).padStart(2, '0');
}
export function fmtDuration(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  if (h > 0) return h + 'h ' + m + 'm';
  return m + ':' + String(r).padStart(2, '0');
}

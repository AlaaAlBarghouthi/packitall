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
    timeBonus: 'مكافأة الوقت', swallowedC: 'كوينز البلع', adHeart: 'قلب مجاني', adDouble: 'ضاعف الكوينز', adFree: 'خدها مجاناً', adNow: 'افتحها هلأ', adWatch: 'احضر', adBoostTitle: 'مساعدة مجانية', adBoostDesc: 'احضر إعلان قصير واربح مساعدة عشوائية', adFail: 'الإعلان مش جاهز، جرّب كمان شوي', adDemo: 'نسخة تجريبية', privacy: 'خيارات الخصوصية',
    mat_gift: 'هدايا', mat_sweet: 'حلويات', mat_toy: 'ألعاب', mat_nature: 'طبيعة', mat_city: 'مدينة',
    materials: 'مواد البناء', bonuses: 'قوى المدينة', needMats: 'ناقصك مواد! ابلع أغراض أكتر', perk: 'القوة', nowLv: 'هلأ', nextLv: 'المستوى الجاي',
    pk_coinPct: '+{n}% كوينز من البلع', pk_regenMin: 'القلب بيرجع أسرع {n} دقايق', pk_magnetS: 'المغناطيس +{n} ث', pk_timeS: '+{n} ثانية لكل مرحلة',
    pk_sizePct: 'الثقب بيبلّش أكبر {n}%', pk_gemPct: '{n}% فرصة جوهرة مع كل فوز', pk_freezeS: 'التجميد +{n} ث', pk_dailyBoost: '{n} مساعدات مجانية كل يوم',
    pk_tornadoS: 'الإعصار +{n} ث', pk_maxHearts: '+{n} قلب إضافي', pk_capH: 'الدخل بيتجمّع +{n} ساعات', pk_giftH: 'الهدية أسرع بـ {n} ساعات',
    pk_growS: 'التكبير +{n} ث', pk_tbPct: '+{n}% مكافأة الوقت', noBonuses: 'ابنِ مباني لتاخد قوى باللعب!',
    login: 'مكافأة الدخول اليومية', day: 'يوم', comeTomorrow: 'ارجع بكرا للمكافأة الجاية!', toyGift: 'محل الألعاب عطاك:', gemBonus: 'جوهرة من البوتيك!',
    tut1: 'اسحب إصبعك لتحرّك الثقب 👆', tut2: 'ابلع الأغراض الصغيرة! 🕳️', tut3: 'كل ما تبلع بتكبر... الأغراض الكبيرة بدها ثقب أكبر', tut4: 'خلّص الأهداف قبل ما يخلص الوقت! 🎯',
    cityHint: 'كبسة على الأرض لتبني أول بيت 🏠',
    kind_hard: 'صعبة 💪', kind_boss: 'مرحلة الزعيم 👑', bossTooBig: 'الزعيم ضخم! كبّر الثقب أكتر 👑', bossOnly: 'جائزة أول زعيم', newSkin: 'شكل جديد', skinFire: 'ثقب النار', skinIce: 'ثقب الثلج', skinHearts: 'ثقب القلوب', skinStars: 'ثقب النجوم', skinGold: 'الثقب الذهبي',
    streakBag: 'حقيبة الفوز', streakHint: 'اربح مراحل ورا بعض لتاخد ⚡ و⏳ مجاناً! إذا خسرت بيروحوا.', streakHave: 'عندك ⚡×{n} و⏳×{n} مجاناً بهالمرحلة!', streakLost: 'خسرت حقيبة الفوز 😢', selectBooster: 'اختار مساعدة', pre_bolt: 'برق', pre_hourglass: 'ساعة رملية', pre_boltD: 'بيكبّر الثقب ببداية المرحلة', pre_hourglassD: '+10 ثواني ببداية المرحلة',
    bombHintTitle: 'دير بالك! ⚠️', bombHintText: 'إذا بلعت هاي القنبلة 💣 بتنفجر وبتخسر المرحلة! بعّد عنها، والحلقة الحمرا بتساعدك تشوفها.', gotIt: 'فهمت!', boom: 'انفجرت! 💥', boomText: 'بلعت قنبلة! بدك تكمّل من وين وقفت؟', revive: 'كمّل',
    theme_xmas: 'عالم العيد 🎄', theme_beach: 'الشط 🏖️', theme_farm: 'المزرعة 🐄', theme_space: 'الفضاء 🚀', mat_festive: 'زينة العيد', bld_workshop: 'ورشة بابا نويل', pk_festivePct: '+{n}% زينة 🎄 من مراحل العيد',
    xmasTitle: 'موسم الأعياد', xmasBanner: 'مراحل العيد كل مرحلتين! ❄️', xmasEnds: 'بيخلص بعد {n} يوم', xmasGiftTitle: 'عيد ميلاد مجيد! 🎅',
    xmasGiftText: 'هديتك بمناسبة الأعياد:', skinCandy: 'ثقب عصا الحلوى', skinClassic: 'الثقب الكلاسيكي', skins: 'أشكال الثقب', use: 'استعمل', inUse: 'مستعمل', eventOnly: 'بس بموسم الأعياد', open: 'افتح', matsHint: 'كل شي بتبلعه بيصير مواد بناء للمدينة!', ready: 'جاهز؟', go: 'يلا!', reached: 'وصلت',
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
    timeBonus: 'Time bonus', swallowedC: 'Items', adHeart: 'Free heart', adDouble: 'Double coins', adFree: 'Get it free', adNow: 'Open now', adWatch: 'Watch', adBoostTitle: 'Free booster', adBoostDesc: 'Watch a short ad to get a random booster', adFail: 'Ad not ready, try again soon', adDemo: 'demo', privacy: 'Privacy options',
    mat_gift: 'Gifts', mat_sweet: 'Sweets', mat_toy: 'Toys', mat_nature: 'Nature', mat_city: 'City',
    materials: 'Materials', bonuses: 'City powers', needMats: 'Need more materials! Swallow more items', perk: 'Power', nowLv: 'Now', nextLv: 'Next level',
    pk_coinPct: '+{n}% coins from swallowing', pk_regenMin: 'Hearts refill {n} min faster', pk_magnetS: 'Magnet +{n}s', pk_timeS: '+{n} seconds every level',
    pk_sizePct: 'Hole starts {n}% bigger', pk_gemPct: '{n}% chance of a gem per win', pk_freezeS: 'Freeze +{n}s', pk_dailyBoost: '{n} free boosters every day',
    pk_tornadoS: 'Tornado +{n}s', pk_maxHearts: '+{n} extra heart', pk_capH: 'Income stores +{n}h longer', pk_giftH: 'Gift {n}h sooner',
    pk_growS: 'Grow +{n}s', pk_tbPct: '+{n}% time bonus', noBonuses: 'Build to unlock powers in levels!',
    login: 'Daily login reward', day: 'Day', comeTomorrow: 'Come back tomorrow for the next reward!', toyGift: 'The toy store gave you:', gemBonus: 'A gem from the boutique!',
    tut1: 'Drag your finger to move the hole 👆', tut2: 'Swallow the small items! 🕳️', tut3: 'Swallowing makes you grow... big items need a bigger hole', tut4: 'Finish the goals before time runs out! 🎯',
    cityHint: 'Tap the plot to build your first house 🏠',
    kind_hard: 'Hard 💪', kind_boss: 'Boss level 👑', bossTooBig: 'The boss is huge! Grow bigger 👑', bossOnly: 'First boss reward', newSkin: 'New skin', skinFire: 'Fire Hole', skinIce: 'Ice Hole', skinHearts: 'Hearts Hole', skinStars: 'Stars Hole', skinGold: 'Golden Hole',
    streakBag: 'Win streak bag', streakHint: 'Win levels in a row to get free ⚡ and ⏳! Losing empties the bag.', streakHave: 'You get ⚡×{n} and ⏳×{n} free this level!', streakLost: 'Win streak bag lost 😢', selectBooster: 'Select booster', pre_bolt: 'Lightning', pre_hourglass: 'Hourglass', pre_boltD: 'Bigger hole at the start', pre_hourglassD: '+10 seconds at the start',
    bombHintTitle: 'Watch out! ⚠️', bombHintText: 'If you swallow this bomb 💣 it explodes and you lose the level! Stay away — the red ring helps you spot it.', gotIt: 'Got it!', boom: 'Boom! 💥', boomText: 'You swallowed a bomb! Continue where you left off?', revive: 'Continue',
    theme_xmas: 'Holiday World 🎄', theme_beach: 'Beach 🏖️', theme_farm: 'Farm 🐄', theme_space: 'Space 🚀', mat_festive: 'Festive', bld_workshop: "Santa's Workshop", pk_festivePct: '+{n}% 🎄 from holiday levels',
    xmasTitle: 'Holiday Season', xmasBanner: 'Holiday levels every 2nd level! ❄️', xmasEnds: 'Ends in {n} days', xmasGiftTitle: 'Merry Christmas! 🎅',
    xmasGiftText: 'Your holiday gift:', skinCandy: 'Candy Cane Hole', skinClassic: 'Classic Hole', skins: 'Hole skins', use: 'Use', inUse: 'In use', eventOnly: 'Holiday season only', open: 'Open', matsHint: 'Everything you swallow becomes building material!', ready: 'Ready?', go: 'Go!', reached: 'Reached',
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
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(fmt(vars[k]));
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

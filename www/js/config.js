// ============================================================
//  AD SETTINGS — put your real AdMob IDs here before publishing
// ============================================================
// While TEST is true the app shows Google's TEST ads (safe to click, no money).
// After you create your app + a "Rewarded" ad unit in AdMob:
//   1) paste the two ad unit IDs below
//   2) set TEST to false
//   3) also replace the APP IDs in:
//        android/app/src/main/res/values/strings.xml   (admob_app_id)
//        ios/App/App/Info.plist                        (GADApplicationIdentifier)
export const AD = {
  TEST: true,
  android: {
    rewarded: 'ca-app-pub-3940256099942544/5224354917', // Google test rewarded unit
  },
  ios: {
    rewarded: 'ca-app-pub-3940256099942544/1712485313', // Google test rewarded unit
  },
  // How many times per day each reward button can be used
  DAILY_CAP: 5,
  // In the web version there are no real ads: show a short demo instead
  WEB_DEMO: true,
};

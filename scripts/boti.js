const login = require("./index.js");
const fs = require("fs");

try {
  const appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));
  
  console.log("جاري محاولة تسجيل الدخول...");
  login({ appState }, (err, api) => {
    if (err) {
      console.error("❌ فشل تسجيل الدخول بأسف:", err);
      return;
    }
    console.log("✅ تم تسجيل الدخول بنجاح تام!");
  });
} catch (e) {
  console.error("❌ خطأ: ملف appstate.json غير موجود أو تالف أو ليس بصيغة JSON صحيحة!", e);
}

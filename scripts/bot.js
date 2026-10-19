const login = require("./index.js");
const fs = require("fs");

// قراءة ملف appstate.json الخاص بك
const credentials = {
  appState: JSON.parse(fs.readFileSync("appstate.json", "utf8"))
};

login(credentials, (err, api) => {
  if (err) return console.error("خطأ في تسجيل الدخول:", err);

  console.log("تم تسجيل الدخول بنجاح! البوت يعمل الآن...");

  // ضبط إعدادات الاستماع
  api.setOptions({
    listenEvents: true,
    selfListen: false
  });

  // الاستماع للرسائل والأوامر في القروبات والخاص
  api.listenMqtt((err, event) => {
    if (err) return console.error("خطأ في الاستماع:", err);

    if (event.type === "message" || event.type === "message_reply") {
      const msgBody = event.body;
      
      // تجربة أمر !زواج
      if (msgBody === "!زواج") {
        api.sendMessage("مبروك مسبقاً! تم استلام أمر الزواج بنجاح 💍😂", event.threadID);
      }
    }
  });
});

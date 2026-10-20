
const fs = require("fs");
const login = require("facebook-chat-api");

let appState;

try {
  appState = JSON.parse(
    fs.readFileSync("appstate.json", "utf8")
  );
} catch (err) {
  console.error("خطأ في قراءة appstate.json:", err.message);
  process.exit(1);
}

login({ appState }, (err, api) => {
  if (err) {
    console.error("فشل تسجيل الدخول:", err.message || err);
    return;
  }

  console.log("تم تشغيل البوت بنجاح!");

  api.listenMqtt((err, event) => {
    if (err) {
      console.error("خطأ في استقبال الرسائل:", err);
      return;
    }

    if (event.type === "message" && event.body) {
      api.sendMessage(
        event.body,
        event.threadID,
        (sendErr) => {
          if (sendErr) {
            console.error("فشل إرسال الرسالة:", sendErr);
          }
        }
      );
    }
  });
});

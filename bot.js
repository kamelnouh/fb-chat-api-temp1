const login = require("./index.js");
const fs = require("fs");

if (!fs.existsSync("./appstate.json")) {
  console.error("ملف appstate.json غير موجود!");
  process.exit(1);
}

let appState;

try {
  appState = JSON.parse(
    fs.readFileSync("./appstate.json", "utf8")
  );
} catch (err) {
  console.error("ملف appstate.json غير صالح أو فيه خطأ.");
  process.exit(1);
}

login({ appState }, (err, api) => {
  if (err) {
    console.error("فشل تسجيل الدخول:", err.message || err);
    return;
  }

  console.log("البوت راه يخدم!");

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
            console.error("فشل إرسال الرد:", sendErr);
          }
        }
      );
    }
  });
});

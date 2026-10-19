"use strict";

const login = require("./index");
const fs = require("fs");
const path = require("path");

const appState = JSON.parse(
  fs.readFileSync("./appstate.json", "utf8")
);

// تحميل جميع الأوامر من مجلد scripts
const commands = new Map();
const scriptsPath = path.join(__dirname, "scripts");

for (const file of fs.readdirSync(scriptsPath)) {
  if (!file.endsWith(".js")) continue;

  try {
    const command = require(path.join(scriptsPath, file));

    if (command.config && command.config.name && typeof command.run === "function") {
      commands.set(command.config.name.toLowerCase(), command);
      console.log(`✅ تم تحميل الأمر: ${command.config.name}`);
    }
  } catch (error) {
    console.error(`❌ خطأ في تحميل ${file}:`, error.message);
  }
}

login({ appState }, {}, async (err, api) => {
  if (err) {
    console.error("❌ LOGIN ERROR:", err);
    return;
  }

  console.log("✅ تم تسجيل الدخول بنجاح");
  console.log("👤 User ID:", api.getCurrentUserID());
  console.log(`📦 عدد الأوامر: ${commands.size}`);

  api.listenMqtt(async (err, event) => {
    if (err) {
      console.error("❌ MQTT ERROR:", err);
      return;
    }

    if (!event || event.type !== "message") return;

    const body = (event.body || "").trim();
    if (!body) return;

    const args = body.split(/\s+/);
    const commandName = args.shift().toLowerCase();

    const command = commands.get(commandName);

    if (!command) return;

    try {
      await command.run({
        api,
        event,
        args
      });
    } catch (error) {
      console.error(`❌ خطأ في الأمر ${commandName}:`, error);

      api.sendMessage(
        "❌ حدث خطأ أثناء تنفيذ الأمر.",
        event.threadID,
        event.messageID
      );
    }
  });
});

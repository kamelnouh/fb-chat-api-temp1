const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "ذكاء",
  version: "2.2.0",
  hasPermssion: 0,
  credits: "𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤",
  description: "قياس نسبة الذكاء والقدرات الذهنية مع سيناريوهات ساخرة ومختلفة حسب الجنس",
  commandCategory: "الخصائص الترفيهية",
  usages: "[منشن أو رد على رسالة]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  try {
    let targetID;
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions || {}).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } else {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const participantIDs = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID() && id !== event.senderID);
      if (participantIDs.length === 0) {
        return api.sendMessage("❌ لا يوجد أشخاص آخرون في المجموعة لاختيارهم!", event.threadID, event.messageID);
      }
      targetID = participantIDs[Math.floor(Math.random() * participantIDs.length)];
    }

    const senderID = event.senderID;

    // جلب معلومات الطرفين
    const userInfo = await api.getUserInfo([senderID, targetID]);
    const senderUser = userInfo[senderID] || {};
    const targetUser = userInfo[targetID] || {};

    const senderName = senderUser.name || "صاحب الأمر";
    const targetName = targetUser.name || "المستهدف";

    const senderGender = senderUser.gender === 1 ? "female" : "male";
    const targetGender = targetUser.gender === 1 ? "female" : "male";

    // =========================================================================
    // الحالة 1: صاحب الأمر (ذَكَر) والمستهدف (أُنثى) -> سيناريو الحلاب أو التمسخير
    // =========================================================================
    if (senderGender === "male" && targetGender === "female") {
      const option = Math.floor(Math.random() * 3);

      if (option === 0) {
        const msg = `🚨 **كشف التحلاب المباشر!** 🚨\n\nيا ${senderName} حاب تكبر برأس ${targetName} وتقولها ذكية؟ المطبخ يستنى فيها وأنت روح كمل تحلابك بعيد! 😂🥛💀`;
        return api.sendMessage(msg, event.threadID, event.messageID);
      } else if (option === 1) {
        const iqScore = Math.floor(Math.random() * 30) + 30;
        const msg = `🤡 **تحليل القدرات العقلية!**\n\n👤 **المقصودة:** ${targetName}\n📊 **مستوى الذكاء:** IQ ${iqScore}\n\nعقلها يحبس في كيفية إشعال الطابونة! روح حكي القدرة خيرلك 😂🧹🍲`;
        return await sendIqCard({ api, event, targetID, targetName, msg, iqScore, theme: "low" });
      } else {
        const iqScore = Math.floor(Math.random() * 21) + 120;
        const msg = `💡 **ذكاء ورزانة ما شاء الله!**\n\n👤 **الأميرة الذكية:** ${targetName}\n📊 **مستوى الذكاء:** IQ ${iqScore}\n\nمخها يوزن بلاد، رزانة وذكاء وحكمة! ✨🌸`;
        return await sendIqCard({ api, event, targetID, targetName, msg, iqScore, theme: "high" });
      }
    }

    // =========================================================================
    // الحالة 2: صاحب الأمر (أُنثى) والمستهدف (أُنثى) -> غيرة أو تمسخير
    // =========================================================================
    else if (senderGender === "female" && targetGender === "female") {
      if (Math.random() < 0.4) {
        return api.sendMessage(`الغيرة تعذب صح 😹🙉\nيا ${senderName} خايفة تطلع هي أذكى منك في الجروب؟ 😂💅`, event.threadID, event.messageID);
      }
      const iqScore = Math.floor(Math.random() * 50) + 40;
      const msg = `🧠 **تحليل القدرات العقلية للطفلات!**\n\n👤 **المستهدفة:** ${targetName}\n📊 **مستوى الذكاء:** IQ ${iqScore}\n\nنصف العقل رايح في التقرعيج وتثبات المكياج 😂💄🤦‍♀️`;
      return await sendIqCard({ api, event, targetID, targetName, msg, iqScore, theme: "low" });
    }

    // =========================================================================
    // الحالة 3: باقي الحالات (ذَكَر لـ ذَكَر أو أُنثى لـ ذَكَر)
    // =========================================================================
    else {
      const isHigh = Math.random() < 0.5;
      const iqScore = isHigh ? Math.floor(Math.random() * 41) + 100 : Math.floor(Math.random() * 41) + 50;

      let msg = "";
      if (iqScore < 80) {
        msg = `🤡 **مستوى الذكاء تحت الصيانة!**\n\n👤 **المقصود:** ${targetName}\n📊 **مستوى الذكاء:** IQ ${iqScore}\n\nيخمم برجليه مش برأسه! روح اشرب حليبك وارقد خيرلك 😂🥛💤`;
      } else {
        msg = `🧠 **عبقري الجروب الرسمي!**\n\n👤 **المتوج:** ${targetName}\n📊 **مستوى الذكاء:** IQ ${iqScore}\n\nمخ شغال 100%، صاحب تحليلات وذكاء خارق! 💡⚡`;
      }

      return await sendIqCard({ api, event, targetID, targetName, msg, iqScore, theme: isHigh ? "high" : "low" });
    }

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ حدث خطأ أثناء تنفيذ أمر ذكاء!", event.threadID, event.messageID);
  }
};

// ==========================================
// دالة تصميم بطاقة الذكاء باستخدام الـ Canvas
// ==========================================
async function sendIqCard({ api, event, targetID, targetName, msg, iqScore, theme }) {
  await api.sendMessage("🎨 جاري تحليل القدرات العقلية ورسم الخريطة الذهنية...", event.threadID, event.messageID);

  const avatarUrl = `https://graph.facebook.com/${targetID}/picture?height=500&width=500&access_token=6628568379%CC%1e620fa708a1d5696fb991c1bde5662`;
  const avatarImg = await loadImage(avatarUrl);

  const canvasWidth = 600;
  const canvasHeight = 600;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
  if (theme === "high") {
    gradient.addColorStop(0, "#1e3c72");
    gradient.addColorStop(1, "#2a5298");
  } else {
    gradient.addColorStop(0, "#2c3e50");
    gradient.addColorStop(1, "#000000");
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const avatarSize = 240;
  const xPos = (canvasWidth - avatarSize) / 2;
  const yPos = 110;

  ctx.save();
  ctx.beginPath();
  ctx.arc(canvasWidth / 2, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatarImg, xPos, yPos, avatarSize, avatarSize);
  ctx.restore();

  const strokeColor = theme === "high" ? "#00d2d3" : "#e74c3c";
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(canvasWidth / 2, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.stroke();

  ctx.font = "60px Arial";
  ctx.textAlign = "center";
  ctx.fillText(iqScore > 100 ? "💡" : "🤡", canvasWidth / 2, 95);

  const barX = 100;
  const barY = 410;
  const barWidth = 400;
  const barHeight = 28;

  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, barHeight, 14);
  ctx.fill();

  const percentage = Math.min(Math.floor((iqScore / 160) * 100), 100);
  const fillWidth = (barWidth * percentage) / 100;
  ctx.fillStyle = strokeColor;
  ctx.beginPath();
  ctx.roundRect(barX, barY, fillWidth, barHeight, 14);
  ctx.fill();

  ctx.font = "bold 28px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(`مستوى الذكاء: IQ ${iqScore} 🧠`, canvasWidth / 2, 480);

  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "#f1c40f";
  ctx.fillText("𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤", canvasWidth / 2, 540);

  const imagePath = path.join(__dirname, "cache", `thaka_${Date.now()}.png`);
  await fs.ensureDir(path.join(__dirname, "cache"));
  const buffer = canvas.toBuffer("image/png");
  await fs.writeFile(imagePath, buffer);

  return api.sendMessage({
    body: msg,
    attachment: fs.createReadStream(imagePath)
  }, event.threadID, () => {
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  }, event.messageID);
}

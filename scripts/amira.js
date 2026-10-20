const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "اميرة",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤",
  description: "تتويج أميرة المجموعة ",
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

    // جلب معلومات المرسل والمستهدف
    const userInfo = await api.getUserInfo([senderID, targetID]);
    const senderUser = userInfo[senderID] || {};
    const targetUser = userInfo[targetID] || {};

    const senderName = senderUser.name || "المرسل";
    const targetName = targetUser.name || "المستهدف";

    // تحديد الجنس (1 أنثى, 2 ذكر)
    const senderGender = senderUser.gender === 1 ? "female" : "male";
    const targetGender = targetUser.gender === 1 ? "female" : "male";

    // ==========================================
    // حالة 1: المستهدف ذَكَر
    // ==========================================
    if (targetGender === "male") {
      const maleTargetScenarios = [
        // أ) نص مباشر لمرسل الأمر
        { type: "text", msg: "احشم 😒👍" },
        // ب) تمنيك بمرسل الأمر لأنه حاول يقنع صاحبه الذكر باللقب
        { type: "text", msg: `يا واحد طحان بغيت طيح بصاحبك لي ميشبه لوالو 😂😂😂😂🐗\n👤 المقصودين: ${senderName} & ${targetName}` },
        // ج) تصميم بطاقة تمسخير ساخرة بالذكر المستهدف
        { 
          type: "card_roast", 
          msg: `🐗 **أميرة بوعو والغابات!** 😂💀\n\n👤 **المتوج باللقب:** ${targetName}\n📊 **نسبة الأنوثة والرقة:** 0%\n\nقالك أميرة! روح نحي اللحية وهز الماعين الكوزينة تستنى فيك 😂💔🧹` 
        }
      ];

      const selected = maleTargetScenarios[Math.floor(Math.random() * maleTargetScenarios.length)];

      if (selected.type === "text") {
        return api.sendMessage(selected.msg, event.threadID, event.messageID);
      } else {
        return await sendAmiraCard({ api, event, targetID, targetName, msg: selected.msg, isRoast: true });
      }
    } 
    
    // ==========================================
    // حالة 2: المستهدف أُنثى
    // ==========================================
    else {
      // إمكانية ظهور مقولة "الغيرة تعذب صح" إذا كانت المرسلة أنثى واستهدفت أنثى أخرى
      if (senderGender === "female" && Math.random() < 0.35) {
        return api.sendMessage(`الغيرة تعذب صح 😹🙉\nراكي حابة تكوني أميرة في بلاصتها يا ${senderName}؟ 😂💅`, event.threadID, event.messageID);
      }

      // الاختيار العشوائي بين المدح والتمسخير
      const isRoast = Math.random() < 0.5;

      if (isRoast) {
        // عبارات تمسخير ساخرة بالأنثى
        const roastPhrases = [
          `🤡 **أميرة الماعين والمقلة!**\n\n👤 **المقصودة:** ${targetName}\n📊 **نسبة الشبه بالأميرة:** 10%\n\nما تشبهي لوالو، غير نحي التاج وطيري للكوزينة حكي القدرة 😂💔🧹`,
          `🥱 **أميرة بدون عرش!**\n\n👤 **المقصودة:** ${targetName}\n📊 **مستوى الجمال:** بالسيف لا لحقتي 15%\n\nشكون قالك باللي أنتِ أميرة؟ وجهك يقطع رزق الزواج 😂🤡💔`
        ];

        const randomRoast = roastPhrases[Math.floor(Math.random() * roastPhrases.length)];
        return await sendAmiraCard({ api, event, targetID, targetName, msg: randomRoast, isRoast: true });
      } else {
        // عبارات مدح وتحيل بالجمال
        const percentage = Math.floor(Math.random() * 21) + 80; // بين 80% و 100%
        const praiseMsg = `👑 **مراسم تتويج أميرة المجموعة!** 💖\n\n👤 **الأميرة المتوجة:** ${targetName}\n📊 **مستوى الجمال والرقة:** ${percentage}%\n\nأميرة الجروب والزين كامل، بوبيا تاعنا المدللة! 🥳✨🌸`;

        return await sendAmiraCard({ api, event, targetID, targetName, msg: praiseMsg, isRoast: false, percentage });
      }
    }

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ حدث خطأ أثناء تنفيذ أمر اميرة!", event.threadID, event.messageID);
  }
};

// ==========================================
// دالة تصميم بطاقة أميرة بالـ Canvas
// ==========================================
async function sendAmiraCard({ api, event, targetID, targetName, msg, isRoast, percentage = 100 }) {
  await api.sendMessage("🎨 جاري تجهيز تاج وأوراق التتويج...", event.threadID, event.messageID);

  const avatarUrl = `https://graph.facebook.com/${targetID}/picture?height=500&width=500&access_token=6628568379%CC%1e620fa708a1d5696fb991c1bde5662`;
  const avatarImg = await loadImage(avatarUrl);

  const canvasWidth = 600;
  const canvasHeight = 600;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  // تحديد خلفية الثيم (وردية ملكية أو مظلمة ساخرة)
  const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
  if (isRoast) {
    gradient.addColorStop(0, "#2c3e50");
    gradient.addColorStop(1, "#000000");
  } else {
    gradient.addColorStop(0, "#ff9a9e");
    gradient.addColorStop(1, "#fecfef");
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const avatarSize = 240;
  const xPos = (canvasWidth - avatarSize) / 2;
  const yPos = 120;

  ctx.save();
  ctx.beginPath();
  ctx.arc(canvasWidth / 2, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.clip();
  ctx.drawImage(avatarImg, xPos, yPos, avatarSize, avatarSize);
  ctx.restore();

  const strokeColor = isRoast ? "#e74c3c" : "#ffffff";
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(canvasWidth / 2, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.stroke();

  // رسم التاج أو الأيقونة فوق الصورة
  ctx.font = "65px Arial";
  ctx.textAlign = "center";
  ctx.fillText(isRoast ? "🤡" : "👑", canvasWidth / 2, 105);

  const barX = 100;
  const barY = 410;
  const barWidth = 400;
  const barHeight = 28;

  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, barHeight, 14);
  ctx.fill();

  const fillWidth = (barWidth * (isRoast ? 15 : percentage)) / 100;
  ctx.fillStyle = isRoast ? "#e74c3c" : "#d63031";
  ctx.beginPath();
  ctx.roundRect(barX, barY, fillWidth, barHeight, 14);
  ctx.fill();

  ctx.font = "bold 26px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(isRoast ? `معدل الأنوثة: ${isRoast ? 15 : percentage}% 💔` : `أميرة المجموعة رسميًا: ${percentage}% 💖`, canvasWidth / 2, 475);

  // الحقوق المزخرفة
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "#f1c40f";
  ctx.fillText("𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤", canvasWidth / 2, 535);

  const imagePath = path.join(__dirname, "cache", `amira_${Date.now()}.png`);
  await fs.ensureDir(path.join(__dirname, "cache"));
  await fs.writeFile(imagePath, canvas.toBuffer("image/png"));

  return api.sendMessage({
    body: msg,
    attachment: fs.createReadStream(imagePath)
  }, event.threadID, () => {
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  }, event.messageID);
}

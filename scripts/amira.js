const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "اميرة",
  version: "3.1.0",
  hasPermssion: 0,
  credits: "𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤",
  description: "تتويج أميرة المجموعة أو التمسخير بين الأعضاء بالحقائق والضحك",
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

    if (senderID === targetID) {
      return api.sendMessage("❌ حابة تتوجي روحك أميرة بالسيف؟ روح تغسلي الماعين خيرلك 😂🧹", event.threadID, event.messageID);
    }

    // جلب معلومات الطرفين
    const userInfo = await api.getUserInfo([senderID, targetID]);
    const senderUser = userInfo[senderID] || {};
    const targetUser = userInfo[targetID] || {};

    const senderName = senderUser.name || "صاحب الأمر";
    const targetName = targetUser.name || "المستهدف";

    // تحديد الجنس (1 أنثى, 2 ذكر)
    const senderGender = senderUser.gender === 1 ? "female" : "male";
    const targetGender = targetUser.gender === 1 ? "female" : "male";

    // ===================================================
    // حالة 1: صاحب الأمر (أُنثى) والمستهدف (أُنثى)
    // ===================================================
    if (senderGender === "female" && targetGender === "female") {
      const option = Math.floor(Math.random() * 3); // 0, 1, أو 2

      if (option === 0) {
        // أ) التمسخير بلي عطات الأمر (صاحبة الأمر)
        const msg = `الغيرة تعذب صح 😹🙉\nيا ${senderName} راكي حابة تكوني أميرة في بلاصتها بالسيف؟ روح تعلمي تطبيخ الشربة خيرلك 😂🍲`;
        return api.sendMessage(msg, event.threadID, event.messageID);

      } else if (option === 1) {
        // ب) التمسخير بالمستهدفة
        const msg = `🤡 **أميرة الماعين والمقلة!**\n\n👤 **المقصودة:** ${targetName}\n📊 **نسبة الشبه بالأميرة:** 10%\n\nما تشبهي لراس زبي يا ${targetName}، نحي التاج وطيري للكوزينة حكي القدرة 😂💔🧹`;
        return await sendAmiraCard({ api, event, targetID, targetName, msg, isRoast: true, percentage: 10 });

      } else {
        // ج) مدح المستهدفة
        const percentage = Math.floor(Math.random() * 21) + 80;
        const msg = `👑 **مراسم تتويج أميرة المجموعة!** 💖\n\n👤 **الأميرة المتوجة:** ${targetName}\n📊 **مستوى الجمال والرقة:** ${percentage}%\n\nأميرة الجروب والزين كامل، بوبيا تاعنا المدللة! 🥳✨🌸`;
        return await sendAmiraCard({ api, event, targetID, targetName, msg, isRoast: false, percentage });
      }
    }

    // ===================================================
    // حالة 2: صاحب الأمر (أُنثى) والمستهدف (ذَكَر)
    // ===================================================
    else if (senderGender === "female" && targetGender === "male") {
      const maleRoasts = [
        `🐗 **أميرة بوعو والغابات!** 😂💀\n\n👤 **المتوج باللقب:** ${targetName}\n📊 **نسبة الأنوثة والرقة:** 0%\n\nقالك أميرة! روح نحي اللحية وهز الماعين الكوزينة تستنى فيك يا الشيكور 😂💔🧹`,
        `🤡 **أميرة الجروب الفاشل!**\n\n👤 **المتوج:** ${targetName}\n\nيا ${targetName} طيحولك الهيبة ورجعوك أميرة الطفلات في الجروب 😂💀🔥`,
        `📌 **تنبيه رسمـي!**\n\n${targetName} يطلب العطف والرحمة وحاب يولي أميرة بالسيف 😂💔 احشم على شاربك يا راجل 😒👍`
      ];

      const selectedRoast = maleRoasts[Math.floor(Math.random() * maleRoasts.length)];

      if (Math.random() < 0.5) {
        return api.sendMessage(selectedRoast, event.threadID, event.messageID);
      } else {
        return await sendAmiraCard({ api, event, targetID, targetName, msg: selectedRoast, isRoast: true, percentage: 0 });
      }
    }

    // ===================================================
    // حالة 3: صاحب الأمر (ذَكَر) والمستهدف (أُنثى) -> سيناريو الحلاب
    // ===================================================
    else if (senderGender === "male" && targetGender === "female") {
      const option = Math.floor(Math.random() * 4); // 0, 1, 2, أو 3

      if (option === 0) {
        // أ) مدح المستهدفة
        const percentage = Math.floor(Math.random() * 21) + 80;
        const msg = `👑 **مراسم تتويج أميرة المجموعة!** 💖\n\n👤 **الأميرة المتوجة:** ${targetName}\n📊 **مستوى الجمال والرقة:** ${percentage}%\n\nأميرة الجروب والزين كامل بفضل المنشن المباشر! 🥳✨🌸`;
        return await sendAmiraCard({ api, event, targetID, targetName, msg, isRoast: false, percentage });

      } else if (option === 1) {
        // ب) التمسخير بالمستهدفة
        const msg = `🥱 **أميرة بدون عرش!**\n\n👤 **المقصودة:** ${targetName}\n📊 **مستوى الجمال:** بالسيف لا لحقتي 15%\n\nشكون قالك باللي أنتِ أميرة؟ وجهك يقطع رزق الزواج يا ${targetName} 😂🤡💔`;
        return await sendAmiraCard({ api, event, targetID, targetName, msg, isRoast: true, percentage: 15 });

      } else if (option === 2) {
        // ج) التمسخير بصاحب الأمر وفضحه قدام الجماعة (حلاب)
        const msg = `🚨 **فضاط للجروب كاملاً!** 🚨\n\nالمدعو **${senderName}** حلاب رسمي ومقطع! 🥛😂\nداير أمر أميرة لـ **${targetName}** باش يتقرب منها ويطيحها! احشم على روحك يا الحلاب بهدلتنا قدام الغاشي 🤡💀🔥`;
        return api.sendMessage(msg, event.threadID, event.messageID);

      } else {
        // د) التمسخير بيهم لزوج (صاحب الأمر الحلاب والمستهدفة)
        const msg = `🤡 **ثنائي التحلاب والكارثة!**\n\n👤 **الحلاب الرسمي:** ${senderName}\n👤 **أميرة الغبرة:** ${targetName}\n\nواحد ينشن ويحلّب والثانية مصدقة روحها باللي صح أميرة! زوج ما يسواوش حبة بطاطا في الجروب 😂🥔💀`;
        return await sendAmiraCard({ api, event, targetID, targetName, msg, isRoast: true, percentage: 5 });
      }
    }

    // ===================================================
    // حالة 4: صاحب الأمر (ذَكَر) والمستهدف (ذَكَر)
    // ===================================================
    else {
      const maleToMaleOption = Math.floor(Math.random() * 3); // 0, 1, أو 2

      if (maleToMaleOption === 0) {
        // أ) البوت يقول لصاحب الأمر احشم بدون ثيم
        return api.sendMessage("احشم 😒👍", event.threadID, event.messageID);

      } else if (maleToMaleOption === 1) {
        // ب) التمسخير بصاحب الأمر وصاحبه
        const msg = `يا واحد طحان بغيت طيح بصاحبك لي ميشبه لوالو 😂😂😂😂🐗\n👤 **المقصودين:** ${senderName} & ${targetName}`;
        return api.sendMessage(msg, event.threadID, event.messageID);

      } else {
        // ج) التمسخير بالمستهدف الذكر مع ثيم بطاقة Canvas
        const msg = `🐗 **أميرة الغابات والأشجار!** 😂💀\n\n👤 **المقصود:** ${targetName}\n📊 **نسبة الأنوثة:** 0%\n\nيا ${targetName} طيحولك قدرك قدام الجروب ورجعوك أميرة! روح نحي الشارب والكوسكة خيرلك 😂💔🧹`;
        return await sendAmiraCard({ api, event, targetID, targetName, msg, isRoast: true, percentage: 0 });
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

  // خلفية وردية ملونة للمدح أو سوداء ساخرة للتمسخير
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

  // أيقونة فوق الصورة (تاج أو مهرج)
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

  const fillWidth = (barWidth * percentage) / 100;
  ctx.fillStyle = isRoast ? "#e74c3c" : "#d63031";
  ctx.beginPath();
  ctx.roundRect(barX, barY, fillWidth, barHeight, 14);
  ctx.fill();

  ctx.font = "bold 26px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(isRoast ? `معدل الأنوثة: ${percentage}% 💔` : `أميرة المجموعة رسميًا: ${percentage}% 💖`, canvasWidth / 2, 475);

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

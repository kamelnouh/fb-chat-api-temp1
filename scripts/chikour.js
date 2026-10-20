const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

// معرف الأدمين الأساسي الخاص بك
const ADMIN_ID = "61593976169222";

module.exports.config = {
  name: "شيكور",
  version: "2.3.0",
  hasPermssion: 0,
  credits: "𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤",
  description: "تحديد شيكور المجموعة ",
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
        return api.sendMessage("❌ لا يوجد أعضاء آخرون في المجموعة لاختيارهم!", event.threadID, event.messageID);
      }
      targetID = participantIDs[Math.floor(Math.random() * participantIDs.length)];
    }

    const senderID = event.senderID;

    // جلب معلومات صاحب الأمر والمستهدف
    const userInfo = await api.getUserInfo([senderID, targetID]);
    const senderUser = userInfo[senderID] || {};
    const targetUser = userInfo[targetID] || {};

    const senderName = senderUser.name || "صاحب الأمر";
    const targetName = targetUser.name || "المستهدف";

    const senderGender = senderUser.gender === 1 ? "female" : "male";
    const targetGender = targetUser.gender === 1 ? "female" : "male";

    // =========================================================================
    // الحالة 1: إذا كان الشخص المستهدف هو أنت (الأدمير / كمال بومرداسي) -> مدح عراقي فخم
    // =========================================================================
    if (targetID === ADMIN_ID || targetName.toLowerCase().includes("kamel") || targetName.includes("كمال")) {
      const adminPraisesIraqi = [
        `🔥 **يا معود هذا تاج راس القروب والسبع!**\n\n👤 **الزعيم الذهب:** 𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤\n\nلك يا ${senderName} وين تقارن نفسك ويا الكنج؟ هذا الطاك والمطك، الهيبة والزلم كلها توقف تصفكله وترفعله القبعة! 🗿👑🔥`,
        `👑 **هذا فحل القروب والأسطورة الحية!**\n\n👤 **السيّد الغالي:** 𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤\n\nيا ${senderName} شجابك عليّه؟ هذا تاج راسك وتاج الكل، الكفو والسبع الي ماكو مثله بالكون! 🥶🔥💎`
      ];
      const selectedMsg = adminPraisesIraqi[Math.floor(Math.random() * adminPraisesIraqi.length)];
      return await sendChikourCard({ api, event, targetID: ADMIN_ID, targetName: "𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤", msg: selectedMsg, theme: "admin_praise" });
    }

    // =========================================================================
    // الحالة 2: صاحب الأمر (ذكر) والمستهدف (أنثى) -> طفلة تقيص رجلة
    // =========================================================================
    if (senderGender === "male" && targetGender === "female") {
      const msgs = [
        `😹 تقيص رجلة يا ${senderName}؟ طفلة هي الشيكورة عليك وتأمر فيك؟ بهدلتنا صحبي بهدلتنا! 🤣🤣👍`,
        `💀 عشنا وشفنا.. ${senderName} (الذكر) دايرها شيكورة عليه ${targetName}! روح تقيل وسيع المرجلة خيرلك 😂💔`
      ];
      const chosen = msgs[Math.floor(Math.random() * msgs.length)];
      return await sendChikourCard({ api, event, targetID, targetName: senderName, msg: chosen, theme: "shame" });
    }

    // =========================================================================
    // الحالة 3: صاحب الأمر (أنثى) والمستهدف (ذكر) -> خطيك ازبي / مذلة
    // =========================================================================
    else if (senderGender === "female" && targetGender === "male") {
      const msgs = [
        `خطيك ازبي 😒💪\nيا ${senderName} راكي تحوسي على شيكور وهو أصلاً ما يسوش حبة بطاطا مقلية! 😂🍟`,
        `📉 ${targetName} صبحت شيكور على غفلة بفضل ${senderName}! غير روح ترقد برك ما تخلينيش نضحك عليك الغاشي 😂💀`
      ];
      const chosen = msgs[Math.floor(Math.random() * msgs.length)];
      return await sendChikourCard({ api, event, targetID, targetName: senderName, msg: chosen, theme: "roast" });
    }

    // =========================================================================
    // الحالة 4: صاحب الأمر (أنثى) والمستهدف (أنثى) أو العكس (تمسخير عام ومش كل يوم عيد)
    // =========================================================================
    else {
      const percentage = Math.floor(Math.random() * 15); // نسبة معدومة
      const roastList = [
        `مش كل يوم عيد 😹😹😹💔\nيا ${targetName} تحوسي تكوني الشيكورة والقروب كامل ضاحك عليك؟ روح تلعب بعيد 😕💘🪻`,
        `🤡 الشيكورة على الميتين برك يا ${targetName}! مشكلتك تحلمي بزف 🥺😹😹😂💔`,
        `🗿 وين رايح تتشوكر يا ${targetName} والهيبة تحت الصفر؟ اقلب وجهك اسكت برك مش كل يوم عيد 🤫😹`
      ];
      const chosenRoast = roastList[Math.floor(Math.random() * roastList.length)];
      return await sendChikourCard({ api, event, targetID, targetName, msg: chosenRoast, theme: "roast", percentage });
    }

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ حدث خطأ أثناء تنفيذ أمر شيكور!", event.threadID, event.messageID);
  }
};

// ==========================================
// دالة تصميم البطاقات والثيمات المتنوعة بالـ Canvas
// ==========================================
async function sendChikourCard({ api, event, targetID, targetName, msg, theme, percentage = 0 }) {
  await api.sendMessage("🎨 جاري تحضير هيبة الشيكور والبطاقة...", event.threadID, event.messageID);

  const avatarUrl = `https://graph.facebook.com/${targetID}/picture?height=500&width=500&access_token=6628568379%CC%1e620fa708a1d5696fb991c1bde5662`;
  const avatarImg = await loadImage(avatarUrl);

  const canvasWidth = 600;
  const canvasHeight = 600;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  // تصميم الخلفيات والثيمات حسب الحالة
  const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
  if (theme === "admin_praise") {
    gradient.addColorStop(0, "#f39c12");
    gradient.addColorStop(1, "#d35400"); // فخامة ملكية ذهبية
  } else if (theme === "shame" || theme === "roast") {
    gradient.addColorStop(0, "#2c3e50");
    gradient.addColorStop(1, "#000000"); // مظلمة ساخرة للمذلة
  } else {
    gradient.addColorStop(0, "#111111");
    gradient.addColorStop(1, "#434343");
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

  const strokeColor = theme === "admin_praise" ? "#f1c40f" : "#e74c3c";
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(canvasWidth / 2, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.stroke();

  const barX = 100;
  const barY = 410;
  const barWidth = 400;
  const barHeight = 28;

  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, barHeight, 14);
  ctx.fill();

  const fillWidth = (barWidth * (theme === "admin_praise" ? 100 : percentage)) / 100;
  ctx.fillStyle = strokeColor;
  ctx.beginPath();
  ctx.roundRect(barX, barY, fillWidth, barHeight, 14);
  ctx.fill();

  ctx.font = "bold 24px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(theme === "admin_praise" ? "معدل الهيبة المطلقة: 1000% 👑" : `معدل الهيبة: ${percentage}% 📉`, canvasWidth / 2, 480);

  // التوقيع الخاص بك المزخرف
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "#f1c40f";
  ctx.fillText("𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤", canvasWidth / 2, 535);

  const imagePath = path.join(__dirname, "cache", `chikour_${Date.now()}.png`);
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

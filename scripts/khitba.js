cat << 'EOF' > scripts/khitba.js
module.exports.config = {
  name: "خطبة",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Kamel",
  description: "طلب خطبة شخص وعمل بطاقة خطوبة تجمعكما",
  commandCategory: "الخصائص الترفيهية",
  usages: "[منشن أو رد على رسالة أو بدون تحديد للاختيار العشوائي]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const fs = require("fs-extra");
  const path = require("path");
  const { createCanvas, loadImage } = require("canvas");

  try {
    let targetID;
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } else {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const participantIDs = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID() && id !== event.senderID);
      if (participantIDs.length === 0) {
        return api.sendMessage("❌ لا يوجد أشخاص آخرون في المجموعة لاختيارهم!", event.threadID, event.messageID);
      }
      targetID = participantIDs[Math.floor(Math.random() * participantIDs.length)];
    }

    const userID1 = event.senderID;
    const userID2 = targetID;

    const userInfo1 = await api.getUserInfo(userID1);
    const userInfo2 = await api.getUserInfo(userID2);

    const name1 = userInfo1[userID1].name;
    const name2 = userInfo2[userID2].name;

    const avatarUrl1 = `https://graph.facebook.com/${userID1}/picture?height=500&width=500&access_token=6628568379%CC%1e620fa708a1d5696fb991c1bde5662`;
    const avatarUrl2 = `https://graph.facebook.com/${userID2}/picture?height=500&width=500&access_token=6628568379%CC%1e620fa708a1d5696fb991c1bde5662`;

    const img1 = await loadImage(avatarUrl1);
    const img2 = await loadImage(avatarUrl2);

    // مقاسات الصورة
    const canvasWidth = 800;
    const canvasHeight = 450;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    // خلفية دافئة بلون خطوبة مُميّز
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, "#8e44ad");
    gradient.addColorStop(1, "#c0392b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const avatarSize = 180;
    const yPos = 110;

    // رسم صورة الشخص الأول بشكل دائري
    ctx.save();
    ctx.beginPath();
    ctx.arc(200, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img1, 200 - avatarSize / 2, yPos, avatarSize, avatarSize);
    ctx.restore();

    // رسم صورة الشخص الثاني بشكل دائري
    ctx.save();
    ctx.beginPath();
    ctx.arc(600, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img2, 600 - avatarSize / 2, yPos, avatarSize, avatarSize);
    ctx.restore();

    // الكتابة على الصورة
    ctx.font = "italic 24px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("💍 تمت الخطوبة بنجاح", canvasWidth / 2, 410);

    // حفظ ونشر الصورة
    const imagePath = path.join(__dirname, "cache", `khitba_${Date.now()}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    const buffer = canvas.toBuffer("image/png");
    await fs.writeFile(imagePath, buffer);

    const msg = `💍 **تمت الخطوبة بنجاح!** 💍\n👨‍💼 ${name1}  💍  👩‍💼 ${name2}\n\nنبارك للعروسين وعقبال الفرحة الكبرى إن شاء الله! ✨`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(imagePath)
    }, event.threadID, () => {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }, event.messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ حدث خطأ أثناء إجراء الخطبة! الرجاء المحاولة لاحقاً.", event.threadID, event.messageID);
  }
};
EOF

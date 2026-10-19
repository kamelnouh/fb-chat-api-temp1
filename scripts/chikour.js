module.exports.config = {
  name: "شيكور",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤",
  description: "تحديد شيكور المجموعة أو التمسخر به عشوائيًا عبارات مضحكة",
  commandCategory: "الخصائص الترفيهية",
  usages: "[منشن أو رد على رسالة]",
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

    const userInfo = await api.getUserInfo(targetID);
    const targetName = userInfo[targetID].name;

    // احتمالية 50% للتتويج و 50% للتمسخير
    const isRoast = Math.random() < 0.5;
    const percentage = isRoast ? Math.floor(Math.random() * 20) : Math.floor(Math.random() * 51) + 50;

    // قائمة عبارات التمسخير العشوائية
    const roastPhrases = [
      "مش كل يوم يابني 🥳😹😹💔 روح تلعب بعيد 😕💘🪻",
      "تحلم بزف 🥺😹😹😂💔 شيكور فحتشون يماك !",
      " شيكور في داركم ؟ 🥱🤡 روح اشرب حليبك واخطيك 🍼😂",
      "وين رايح تتشيكر وهيبة ماكانش 🗿📉 اقلب وجهك اسكت برك 🤫😹",
      "شيكور على الميتين برك 💀😂 روح ترقد ما تكسرش راسنا 🪻💤"
    ];

    const randomRoast = roastPhrases[Math.floor(Math.random() * roastPhrases.length)];

    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?height=500&width=500&access_token=6628568379%CC%1e620fa708a1d5696fb991c1bde5662`;
    const avatarImg = await loadImage(avatarUrl);

    const canvasWidth = 600;
    const canvasHeight = 600;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    let msg = "";
    let strokeColor = "#f1c40f";

    if (isRoast) {
      const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      gradient.addColorStop(0, "#2c3e50");
      gradient.addColorStop(1, "#000000");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      strokeColor = "#e74c3c";

      msg = `🤡 **يا حسراه عليك!**\n\n👤 **المقصود:** ${targetName}\n📊 **نسبة الشيطنة والهيبة:** ${percentage}%\n\n${randomRoast}`;
    } else {
      const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      gradient.addColorStop(0, "#111111");
      gradient.addColorStop(1, "#434343");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      strokeColor = "#f1c40f";

      msg = `🕶️ **شيكور الجروب الصحيح لهذا اليوم!** 🔥\n\n👤 **المتوج باللقب:** ${targetName}\n📊 **نسبة الهيبة والسيطرة:** ${percentage}%\n\nصاحب الكلمة الأولى والأخيرة، الكل يسمع ويطيع اليوم! 🗿💥`;
    }

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

    const fillWidth = (barWidth * percentage) / 100;
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillWidth, barHeight, 14);
    ctx.fill();

    ctx.font = "bold 26px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(isRoast ? `معدل الهيبة: ${percentage}% 💔` : `نسبة الهيبة والسيطرة: ${percentage}% 🕶️`, canvasWidth / 2, 490);

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

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ حدث خطأ أثناء تنفيذ الأمر!", event.threadID, event.messageID);
  }
};

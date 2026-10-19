module.exports.config = {
  name: "بخيل",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤",
  description: "قياس نسبة البخل لشخص في المحادثة",
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

    const percentage = Math.floor(Math.random() * 101);

    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?height=500&width=500&access_token=6628568379%CC%1e620fa708a1d5696fb991c1bde5662`;
    const avatarImg = await loadImage(avatarUrl);

    const canvasWidth = 600;
    const canvasHeight = 600;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    // خلفية
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, "#11998e");
    gradient.addColorStop(1, "#38ef7d");
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

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.stroke();

    // شريط التقدم
    const barX = 100;
    const barY = 410;
    const barWidth = 400;
    const barHeight = 28;

    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 14);
    ctx.fill();

    const fillWidth = (barWidth * percentage) / 100;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillWidth, barHeight, 14);
    ctx.fill();

    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(`نسبة البخل: ${percentage}% 💸`, canvasWidth / 2, 490);

    const imagePath = path.join(__dirname, "cache", `bakhil_${Date.now()}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    const buffer = canvas.toBuffer("image/png");
    await fs.writeFile(imagePath, buffer);

    const msg = `💸 **رادار الشح والبخل!** 💸\n\n👤 **الشخص:** ${targetName}\n📊 **نسبة البخل:** ${percentage}%\n\nهل يخرج الفرنك بسهولة أم الجيب مغلق بالمفتاح؟ 😂`;

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

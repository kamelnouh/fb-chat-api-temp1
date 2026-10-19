module.exports.config = {
  name: "غيرة",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤",
  description: "قياس نسبة الغيرة بينك وبين شخص في المجموعة",
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

    const giraPercentage = Math.floor(Math.random() * 101);

    const canvasWidth = 800;
    const canvasHeight = 450;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    // خلفية نارية تعبر عن الغيرة
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, "#f12711");
    gradient.addColorStop(1, "#f5af19");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const avatarSize = 160;
    const yPos = 80;

    // رسم الصور
    ctx.save();
    ctx.beginPath();
    ctx.arc(180, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img1, 180 - avatarSize / 2, yPos, avatarSize, avatarSize);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(620, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img2, 620 - avatarSize / 2, yPos, avatarSize, avatarSize);
    ctx.restore();

    // شريط التقدم
    const barX = 150;
    const barY = 290;
    const barWidth = 500;
    const barHeight = 30;

    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 15);
    ctx.fill();

    const fillWidth = (barWidth * giraPercentage) / 100;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillWidth, barHeight, 15);
    ctx.fill();

    ctx.font = "bold 32px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(`${giraPercentage}% 🔥`, canvasWidth / 2, 380);

    const imagePath = path.join(__dirname, "cache", `gira_${Date.now()}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    const buffer = canvas.toBuffer("image/png");
    await fs.writeFile(imagePath, buffer);

    const msg = `🔥 **مقياس الغيرة المشتعل:**\n👤 ${name1}  ⚡  👤 ${name2}\n\n🌡️ **نسبة الغيرة بينهما:** ${giraPercentage}%`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(imagePath)
    }, event.threadID, () => {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }, event.messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ حدث خطأ أثناء حساب نسبة الغيرة! الرجاء المحاولة لاحقاً.", event.threadID, event.messageID);
  }
};

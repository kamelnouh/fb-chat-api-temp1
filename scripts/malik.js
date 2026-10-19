module.exports.config = {
  name: "ملك",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤",
  description: "تتويج ملك أو ملكة المحادثة ببطاقة ذهبية",
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
        return api.sendMessage("❌ لا يوجد أشخاص آخرون في المجموعة لتتويجهم!", event.threadID, event.messageID);
      }
      targetID = participantIDs[Math.floor(Math.random() * participantIDs.length)];
    }

    const userInfo = await api.getUserInfo(targetID);
    const targetName = userInfo[targetID].name;

    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?height=500&width=500&access_token=6628568379%CC%1e620fa708a1d5696fb991c1bde5662`;
    const avatarImg = await loadImage(avatarUrl);

    const canvasWidth = 600;
    const canvasHeight = 600;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    // خلفية ذهبية ملكية
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, "#BF953F");
    gradient.addColorStop(0.5, "#FCF6BA");
    gradient.addColorStop(1, "#B38728");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const avatarSize = 250;
    const xPos = (canvasWidth - avatarSize) / 2;
    const yPos = 140;

    ctx.save();
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, xPos, yPos, avatarSize, avatarSize);
    ctx.restore();

    // إطار ملكي
    ctx.strokeStyle = "#4A3B00";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.stroke();

    // تاج رسم على أعلى الصورة
    ctx.font = "70px Arial";
    ctx.textAlign = "center";
    ctx.fillText("👑", canvasWidth / 2, 120);

    ctx.font = "bold 32px Arial";
    ctx.fillStyle = "#302200";
    ctx.fillText("ملك المجموعة اليوم 👑", canvasWidth / 2, 470);

    const imagePath = path.join(__dirname, "cache", `malik_${Date.now()}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    const buffer = canvas.toBuffer("image/png");
    await fs.writeFile(imagePath, buffer);

    const msg = `👑 **مراسم التتويج الملكية!** 👑\n\nيعلن البوت رسمياً عن تتويج 👤 **${targetName}** ملكاً على هذه المحادثة اليوم!\n\nانحنوا وحيوا الملك! 🫡✨`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(imagePath)
    }, event.threadID, () => {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }, event.messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ حدث خطأ أثناء تتويج الملك!", event.threadID, event.messageID);
  }
};

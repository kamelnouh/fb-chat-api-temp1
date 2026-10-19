module.exports.config = {
  name: "سجن",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "​ 𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤",
  description: "وضع شخص في السجن مع إمكانية تحديده بالمنشن أو الرد على رسالته",
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
        return api.sendMessage("❌ لا يوجد أشخاص آخرون في المجموعة لإدخالهم السجن!", event.threadID, event.messageID);
      }
      targetID = participantIDs[Math.floor(Math.random() * participantIDs.length)];
    }

    const userInfo = await api.getUserInfo(targetID);
    const targetName = userInfo[targetID].name;

    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?height=500&width=500&access_token=6628568379%CC%1e620fa708a1d5696fb991c1bde5662`;
    const avatarImg = await loadImage(avatarUrl);

    // مقاسات التصميم (600x600)
    const canvasWidth = 600;
    const canvasHeight = 600;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    // رسم صورة الشخص المستهدف خلف قضبان السجن
    ctx.drawImage(avatarImg, 0, 0, canvasWidth, canvasHeight);

    // رسم تأثير إعتام داكن (ظل السجن)
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // رسم قضبان السجن باللون الرمادي والأبيض
    const barWidth = 16;
    const barSpacing = 65;

    ctx.fillStyle = "#2c3e50";
    for (let x = 30; x < canvasWidth; x += barSpacing) {
      // إطار وثقل القضبان
      ctx.fillStyle = "#34495e";
      ctx.fillRect(x, 0, barWidth, canvasHeight);
      
      // إضاءة على القضبان لإعطاء مظهر حديدي 3D
      ctx.fillStyle = "#7f8c8d";
      ctx.fillRect(x + 3, 0, 4, canvasHeight);
    }

    // إطار أسود حول الصورة
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 15;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    // حفظ الصورة المؤقتة
    const imagePath = path.join(__dirname, "cache", `jail_${Date.now()}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    const buffer = canvas.toBuffer("image/png");
    await fs.writeFile(imagePath, buffer);

    // نص الرسالة
    const msg = `🚨 **تم القاء القبض على المتهم!** 🚨\n\n⚖️ **المسجون:** ${targetName}\n⛓️ **التهمة:** إثارة الشغب في المجموعة!\n\nنتمنى لك إقامة سعيدة وراء القضبان 👮‍♂️🔒`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(imagePath)
    }, event.threadID, () => {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }, event.messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ حدث خطأ أثناء إدخال الشخص السجن! الرجاء المحاولة لاحقاً.", event.threadID, event.messageID);
  }
};

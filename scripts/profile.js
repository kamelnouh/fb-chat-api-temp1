module.exports.config = {
  name: "بروفايلي",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤",
  description: "عرض بطاقة بروفايل شخصية مع 15 ثيمًا وتصميمًا يتغير عشوائيًا",
  commandCategory: "الخصائص الترفيهية",
  usages: "[منشن أو رد على رسالة أو فارغ لرؤية حسابك]",
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
      targetID = event.senderID;
    }

    const userInfo = await api.getUserInfo(targetID);
    const targetName = userInfo[targetID].name || "عضو مميز";

    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?height=500&width=500&access_token=6628568379%CC%1e620fa708a1d5696fb991c1bde5662`;
    const avatarImg = await loadImage(avatarUrl);

    const canvasWidth = 700;
    const canvasHeight = 400;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    // قائمة الـ 15 ثيم المتنوعة
    const themes = [
      { bgStart: "#0f2027", bgMid: "#203a43", bgEnd: "#2c5364", accent: "#00d2d3", tag: "VIP Dynamic 💎" },
      { bgStart: "#141e30", bgMid: "#243b55", bgEnd: "#141e30", accent: "#ff9f43", tag: "Legendary Gold 🏆" },
      { bgStart: "#200122", bgMid: "#6f0000", bgEnd: "#200122", accent: "#ff4757", tag: "Royal Crimson 👑" },
      { bgStart: "#11998e", bgMid: "#38ef7d", bgEnd: "#11998e", accent: "#ffffff", tag: "Cyber Emerald 🌿" },
      { bgStart: "#8E2DE2", bgMid: "#4A00E0", bgEnd: "#8E2DE2", accent: "#f1c40f", tag: "Neon Galaxy 🌌" },
      { bgStart: "#000000", bgMid: "#434343", bgEnd: "#000000", accent: "#eccc68", tag: "Dark Obsidian 🖤" },
      { bgStart: "#d31027", bgMid: "#ea384d", bgEnd: "#d31027", accent: "#ffffff", tag: "Red Lava 🔥" },
      { bgStart: "#1f4037", bgMid: "#99f2c8", bgEnd: "#1f4037", accent: "#2ecc71", tag: "Forest Breeze 🍃" },
      { bgStart: "#ff7e5f", bgMid: "#feb47b", bgEnd: "#ff7e5f", accent: "#ffffff", tag: "Sunset Glow 🌅" },
      { bgStart: "#3a1c71", bgMid: "#d76d77", bgEnd: "#ffaf7b", accent: "#ffffff", tag: "Cosmic Twilight 🪐" },
      { bgStart: "#2C3E50", bgMid: "#4CA1AF", bgEnd: "#2C3E50", accent: "#00cec9", tag: "Ocean Blue 🌊" },
      { bgStart: "#1a2a6c", bgMid: "#b21f1f", bgEnd: "#fdbb2d", accent: "#f1c40f", tag: "Fire & Ice 🌗" },
      { bgStart: "#2b5876", bgMid: "#4e4376", bgEnd: "#2b5876", accent: "#a29bfe", tag: "Deep Violet 🔮" },
      { bgStart: "#000428", bgMid: "#004e92", bgEnd: "#000428", accent: "#74b9ff", tag: "Midnight Aurora 🌌" },
      { bgStart: "#E8CBC0", bgMid: "#636FA4", bgEnd: "#E8CBC0", accent: "#ffffff", tag: "Soft Lavender 🌸" }
    ];

    const currentTheme = themes[Math.floor(Math.random() * themes.length)];

    // رسم الخلفية المتدرجة
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, currentTheme.bgStart);
    gradient.addColorStop(0.5, currentTheme.bgMid);
    gradient.addColorStop(1, currentTheme.bgEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // إضافة أشكال هندسية عشوائية في الخلفية
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.beginPath();
    ctx.arc(Math.floor(Math.random() * 200) + 500, Math.floor(Math.random() * 200), 160, 0, Math.PI * 2);
    ctx.fill();

    // رسم الصورة الشخصية دائرية
    const avatarSize = 180;
    const avatarX = 50;
    const avatarY = 110;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // إطار مضيء ملون حسب الثيم
    ctx.strokeStyle = currentTheme.accent;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.stroke();

    // كتابة معلومات الحساب
    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(targetName, 260, 155);

    ctx.font = "bold 20px Arial";
    ctx.fillStyle = currentTheme.accent;
    ctx.fillText(`ID: ${targetID}`, 260, 200);

    ctx.font = "18px Arial";
    ctx.fillStyle = "#eccc68";
    ctx.fillText(`الرتبة: ${currentTheme.tag}`, 260, 240);

    ctx.font = "18px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`الحالة: عضو متفاعل في الجروب 🔥`, 260, 275);

    // خط فاصل سفلي مع التوقيع
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 330);
    ctx.lineTo(650, 330);
    ctx.stroke();

    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤", canvasWidth / 2, 365);

    const imagePath = path.join(__dirname, "cache", `profile_${Date.now()}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    const buffer = canvas.toBuffer("image/png");
    await fs.writeFile(imagePath, buffer);

    const msg = `💳 **بطاقة بروفايل متجددة!** ✨\n\n👤 **الاسم:** ${targetName}\n🆔 **الآيدي:** ${targetID}\n🎨 **الثيم المطبق:** ${currentTheme.tag}`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(imagePath)
    }, event.threadID, () => {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }, event.messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ حدث خطأ أثناء إنشاء بطاقة البروفايل!", event.threadID, event.messageID);
  }
};

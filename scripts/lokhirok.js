module.exports.config = {
  name: "لوخيروك",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤",
  description: "عرض سؤال لو خيروك ممتع وبطاقة تحدي لشخص في المجموعة",
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

    const questions = [
      { a: "تعيش بدون هاتف لمدة سنة 📱", b: "تنام في الغابة ليلة كاملة بمفردك 🌲" },
      { a: "تسافر للماضي وتغير حدث واحد ⏳", b: "تسافر للمستقبل وتكتشف قدرك 🚀" },
      { a: "تأكل أكلة حارة جداً أمام الجميع 🌶️", b: "تشرب عصير بصل وثوم دفعة واحدة 🧄" },
      { a: "تخسر حسابك في فيسبوك للأبد ❌", b: "تتكلم باللغة الإنجليزية يوم كامل فقط 🇬🇧" },
      { a: "تصبح شخصية مشهورة ومراقب دائماً 📸", b: "تعيش هادئ ومجهول في مكان نائي 🏞️" },
      { a: "تسمع أفكار الناس من حولك 🧠", b: "تختفي وتصبح غير مرئي متى أردت 👻" }
    ];

    const selected = questions[Math.floor(Math.random() * questions.length)];

    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?height=500&width=500&access_token=6628568379%CC%1e620fa708a1d5696fb991c1bde5662`;
    const avatarImg = await loadImage(avatarUrl);

    const canvasWidth = 800;
    const canvasHeight = 450;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    // خلفية حماسية
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, "#11998e");
    gradient.addColorStop(1, "#38ef7d");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // صورة العضو
    const avatarSize = 180;
    const xPos = (canvasWidth - avatarSize) / 2;
    const yPos = 80;

    ctx.save();
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, xPos, yPos, avatarSize, avatarSize);
    ctx.restore();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.stroke();

    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("🤔 تحدي لو خيروك 🎯", canvasWidth / 2, 340);

    const imagePath = path.join(__dirname, "cache", `lokhirok_${Date.now()}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    const buffer = canvas.toBuffer("image/png");
    await fs.writeFile(imagePath, buffer);

    const msg = `🎯 **تحدي الصراحة والخيارات الصعبة!** 🎯\n\nيا 👤 **${targetName}** لو خيروك بين:\n\n1️⃣ **الخيار الأول:** ${selected.a}\n\n2️⃣ **الخيار الثاني:** ${selected.b}\n\nما هو اختيارك الحقيقي؟ اختر وبدون تهرب! 😂`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(imagePath)
    }, event.threadID, () => {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }, event.messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ حدث خطأ أثناء تنفيذ أمر لوخيروك!", event.threadID, event.messageID);
  }
};

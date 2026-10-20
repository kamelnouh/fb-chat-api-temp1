const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "ورطة",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤",
  description: "وضع شخص في ورطة وموقف محرج عشوائي داخل المجموعة",
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
        return api.sendMessage("❌ لا يوجد أشخاص آخرون في المجموعة لإيقاعهم في الورطة!", event.threadID, event.messageID);
      }
      targetID = participantIDs[Math.floor(Math.random() * participantIDs.length)];
    }

    const userInfo = await api.getUserInfo(targetID);
    const targetName = userInfo[targetID]?.name || "المتورط";

    // قائمة بـ 15 ورطة متنوعة ومضحكة
    const wortaList = [
      "💸 **الورطة:** العشاء والقهوة تع المجموعة كاملة عليك اليوم!",
      "🎤 **الورطة:** لازم تبعث تسجيل صوتي تغني فيه مقطع من أغنيتك المفضلة قدام المجموعة!",
      "🤫 **الورطة:** كشف أسرار.. لازم تعترف بأكبر مصيبة درتها هذا الأسبوع!",
      "🧽 **الورطة:** تنظيف البيت وغسل الأواني عليك اليوم بدون هرب!",
      "📱 **الورطة:** تعبئة فليكسي أو أنترنت لأول واحد يرد على رسالتك هذه!",
      "🤐 **الورطة:** ممنوع تتكلم أو تبعث أي رسالة في القروب لمدة ساعة كاملة!",
      "📸 **الورطة:** لازم تبدل صورة بروفايلك لأحد الصور الساخرة اللي يختارها لك القروب!",
      "🎭 **الورطة:** لازم تقلد صوت شخصية معروفة أو أدمن القروب بتسجيل صوتي!",
      "💬 **الورطة:** لازم تبعث رسالة اعتراف محتالة لأول شخص في قائمة المحادثات عندك وتصور لنا الرد!",
      "🧹 **الورطة:** تسلف هاتفك لأقرب شخص ليك لمدة 10 دقائق بدون ما تمسحه!",
      "🤡 **الورطة:** تكتب في البايو تع حسابك كلمة (أنا كلب بنات) لمدة يوم كامل!",
      "🍕 **الورطة:** تطلب بيتزا أو أكلة سريعة وتصورها وتغيض بيها القروب بدون ما تجيب لهم!",
      "🧠 **الورطة:** تجاوب على 3 أسئلة صريحة وقوية يطرحهم عليك القروب بدون كذب!",
      "🔋 **الورطة:** لازم تقفل هاتفك وتخليه في الشاحن وتبتعد عليه ساعتين كاملين!",
      "🙈 **الورطة:** تبعث ملصق (استيكر) مضحك في كل محادثة تفتحها اليوم!"
    ];

    const randomWorta = wortaList[Math.floor(Math.random() * wortaList.length)];

    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?height=500&width=500&access_token=6628568379%CC%1e620fa708a1d5696fb991c1bde5662`;
    const avatarImg = await loadImage(avatarUrl);

    const canvasWidth = 600;
    const canvasHeight = 600;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    // خلفية تحذيرية
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, "#f39c12");
    gradient.addColorStop(1, "#d35400");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const avatarSize = 260;
    const xPos = (canvasWidth - avatarSize) / 2;
    const yPos = 120;

    // رسم صورة الشخص
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, xPos, yPos, avatarSize, avatarSize);
    ctx.restore();

    // إطار الصورة
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.stroke();

    // العنوان داخل الصورة
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("⚠️ وقع في الورطة الرسمية! 🚨", canvasWidth / 2, 70);

    // التوقيع المزخرف داخل الصورة
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "#f1c40f";
    ctx.fillText("𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤", canvasWidth / 2, 545);

    const imagePath = path.join(__dirname, "cache", `worta_${Date.now()}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    const buffer = canvas.toBuffer("image/png");
    await fs.writeFile(imagePath, buffer);

    const msg = `🚨 **انتبه يا صاحب النصيب!** 🚨\n\n👤 **المتورط:** ${targetName}\n\n${randomWorta}\n\nشوف كيفاش تخرج منها الآن! 😂`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(imagePath)
    }, event.threadID, () => {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }, event.messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ حدث خطأ أثناء تنفيذ الأمر! الرجاء المحاولة لاحقاً.", event.threadID, event.messageID);
  }
};

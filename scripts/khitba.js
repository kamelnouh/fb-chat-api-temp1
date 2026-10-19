module.exports.config = {
  name: "خطبة",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "​🌸🤭 𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🌸🤭",
  description: "طلب خطبة عشوائي ومضحك مع بطاقات وسيناريوهات متعددة",
  commandCategory: "الخصائص الترفيهية",
  usages: "[منشن أو رد على رسالة أو فارغ]",
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
    } else if (Object.keys(event.mentions || {}).length > 0) {
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

    if (userID1 === userID2) {
      return api.sendMessage("❌ لا يمكنك خطبة نفسك يا محترم! 😂", event.threadID, event.messageID);
    }

    const userInfo1 = await api.getUserInfo(userID1);
    const userInfo2 = await api.getUserInfo(userID2);

    const user1 = userInfo1[userID1] || {};
    const user2 = userInfo2[userID2] || {};

    const name1 = user1.name || "الخاطب";
    const name2 = user2.name || "المخطوبة";

    const gender1 = user1.gender === 1 ? "female" : "male";
    const gender2 = user2.gender === 1 ? "female" : "male";

    // دالة شروط وسينية الخطوبة الجزائرية
    const generateEngagementMahr = () => {
      const goldItems = ["خاتم سوليتير + محزمة ذهب 💍", "سلسلة لويز + مقياس ذهب ✨", "خاتم فالصو + ساعة Tecno ⌚😂"];
      const gifts = ["سينية طبق الحنة 🌸", "قصعة شخشوخة بالدجاج 🍗", "علبة باتيسري + ريحة فالصو 🍰"];
      const randomGold = goldItems[Math.floor(Math.random() * goldItems.length)];
      const randomGift = gifts[Math.floor(Math.random() * gifts.length)];
      return `${randomGold} + ${randomGift}`;
    };

    // ==========================================
    // سيناريوهات عندما يكون الخاطب (ذَكَر)
    // ==========================================
    if (gender1 === "male") {
      const maleScenarios = [
        // 1. بطاقة خطوبة مباركة
        { 
          action: "card", type: "romantic", 
          msg: `🎉 **تمت الخطوبة بنجاح!** 🎉\n\n💐 تم لبس الخواتم وقراءة الفاتحة بين:\n🤵 **${name1}** 💍 **${name2}** 👰\n\nربي يكمل بالخير وعقبال العرس إن شاء الله! ✨🤍` 
        },
        // 2. سيناريو شرط الخطوبة والسينية
        { 
          action: "card", type: "mahr", 
          msg: `💍 **شرط وطبق الخطوبة!** 💐\n🤵 ${name1}  ❤️  👰 ${name2}\n\n🎁 **الشرط المتفق عليه في خطبة اليوم:**\n${generateEngagementMahr()}` 
        },
        // 3. خطبة ملونة في حال اختيار شاب مع شاب
        { 
          action: "card", type: "rainbow", 
          msg: `🏳️‍🌈 **خطوبة ملونة ومباركة!** 🥳😹\n🤵 ${name1} 💍 🤵 ${name2}\nخطبة على الطريقة الأوروبية الحديثة 😂🌈` 
        },
        // 4. تمنيك على صاحب الطلب وحده (بدون صورة)
        { action: "text", msg: "روح شوفلك خدمة واجمع دراهم الشاي والسكر وبعدها ارواح تخطب ☕😂💔" },
        { action: "text", msg: "تخطب بواش؟ ببطاقة فرلكس فارغة؟ روح ترقد خيرلك 🥱🤡" },
        { action: "text", msg: "قالك حاب يخطب! روح وجد روحك لقرايتك ولا لخدمتك 🛠️😂" },
        // 5. تمنيك بالطرفين في زوج
        { 
          action: "card", type: "ugly", 
          msg: `🚨 **أكبر خطوبة فاشلة في تاريخ الجروب!**\n${name1} & ${name2}\nزوج خلاطات رايحين يجيبو كوارث 💀😂` 
        },
        { action: "text", msg: `يا حسراه! ${name1} و ${name2} يخطبو بعضهم؟ الفاتحة تقرات بالعكس اليوم 😂💔` }
      ];

      const selected = maleScenarios[Math.floor(Math.random() * maleScenarios.length)];

      if (selected.action === "text") {
        return api.sendMessage(selected.msg, event.threadID, event.messageID);
      } else {
        return await sendKhitbaCard({ api, event, userID1, userID2, name1, name2, msg: selected.msg, themeType: selected.type });
      }
    } 
    
    // ==========================================
    // سيناريوهات عندما تكون الخاطبة (أُنثى)
    // ==========================================
    else {
      const femaleScenarios = [
        // 1. بطاقة خطوبة رومانسية
        { 
          action: "card", type: "romantic", 
          msg: `🌸 **ألف مبروك الخطوبة!** 🌸\n\n👰 **${name1}** 💍 **${name2}** 🤵\nربي يتمم بالخير ويهنيكم ✨💖` 
        },
        // 2. سيناريو شرط الخطوبة والسينية
        { 
          action: "card", type: "mahr", 
          msg: `💍 **طبق وسينية الخطوبة!** ✨\n👰 ${name1}  ❤️  🤵 ${name2}\n\n🎁 **شرط خطبتك الميمونة:**\n${generateEngagementMahr()}` 
        },
        // 3. خطبة بنت مع بنت
        { 
          action: "card", type: "rainbow", 
          msg: `😹😹😋🤭 **سبحان الله!**\n👰 ${name1} 💍 👰 ${name2}\nخطوبة بنوتات مع بعضهم في الجروب 😹😋🤭` 
        },
        // 4. تمنيك بالأنثى نفسها (بدون صورة أو بطاقة منفردة)
        { action: "text", msg: "تخطبي أنتِ؟ يخي زمن عجيب! روح تعلمي تطبيخ العيش خيرلك 🍲😂💔" },
        { action: "text", msg: "اقعدي في داركم مكانش خطوبة اليوم 😒💋" },
        { 
          action: "single_card", 
          msg: `مخطوبة لعرش الخلاطين برتبة شرفية 😂💪\n👤 **المقصودة:** ${name1}` 
        },
        // 5. تمنيك بالطرفين معاً
        { 
          action: "card", type: "ugly", 
          msg: `🤡 **خطوبة الموسم الساخرة!**\n${name1} & ${name2}\nثنائي المصايب والتقرعيج 😂🔥` 
        }
      ];

      const selected = femaleScenarios[Math.floor(Math.random() * femaleScenarios.length)];

      if (selected.action === "text") {
        return api.sendMessage(selected.msg, event.threadID, event.messageID);
      } else if (selected.action === "single_card") {
        return await sendSingleKhitbaCard({ api, event, userID: userID1, name: name1, msg: selected.msg });
      } else {
        return await sendKhitbaCard({ api, event, userID1, userID2, name1, name2, msg: selected.msg, themeType: selected.type });
      }
    }

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ حدث خطأ أثناء إجراء الخطبة!", event.threadID, event.messageID);
  }
};

// ==========================================
// دالة تصميم بطاقة الخطوبة المزدوجة بـ Themes متغيرة
// ==========================================
async function sendKhitbaCard({ api, event, userID1, userID2, name1, name2, msg, themeType }) {
  const fs = require("fs-extra");
  const path = require("path");
  const { createCanvas, loadImage } = require("canvas");

  await api.sendMessage("🎨 جاري تحضير طبق الخطوبة وبطاقة المناسبة...", event.threadID, event.messageID);

  const avatarUrl1 = `https://graph.facebook.com/${userID1}/picture?height=500&width=500&access_token=6628568379%CC%1e620fa708a1d5696fb991c1bde5662`;
  const avatarUrl2 = `https://graph.facebook.com/${userID2}/picture?height=500&width=500&access_token=6628568379%CC%1e620fa708a1d5696fb991c1bde5662`;

  const img1 = await loadImage(avatarUrl1);
  const img2 = await loadImage(avatarUrl2);

  const canvasWidth = 800;
  const canvasHeight = 450;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  // تحديد الخلفيات حسب ثيم الخطوبة
  if (themeType === "rainbow") {
    const grad = ctx.createLinearGradient(0, 0, canvasWidth, 0);
    grad.addColorStop(0, "#e74c3c");
    grad.addColorStop(0.25, "#f1c40f");
    grad.addColorStop(0.5, "#2ecc71");
    grad.addColorStop(0.75, "#3498db");
    grad.addColorStop(1, "#9b59b6");
    ctx.fillStyle = grad;
  } else if (themeType === "mahr") {
    const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    grad.addColorStop(0, "#f39c12");
    grad.addColorStop(1, "#d35400");
    ctx.fillStyle = grad;
  } else if (themeType === "ugly") {
    const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    grad.addColorStop(0, "#34495e");
    grad.addColorStop(1, "#2c3e50");
    ctx.fillStyle = grad;
  } else {
    // ثيم بنفسجي وعنابي دافئ مخصص للخطوبة
    const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    grad.addColorStop(0, "#8e44ad");
    grad.addColorStop(1, "#c0392b");
    ctx.fillStyle = grad;
  }

  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const avatarSize = 180;
  const yPos = 110;

  // صورة الطرف الأول
  ctx.save();
  ctx.beginPath();
  ctx.arc(180, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.clip();
  ctx.drawImage(img1, 90, yPos, avatarSize, avatarSize);
  ctx.restore();

  // صورة الطرف الثاني
  ctx.save();
  ctx.beginPath();
  ctx.arc(620, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.clip();
  ctx.drawImage(img2, 530, yPos, avatarSize, avatarSize);
  ctx.restore();

  // إطارات بيضاء
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(180, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(620, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.stroke();

  // أيقونة الوسط
  ctx.font = "bold 50px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";

  let centerIcon = "💍💐";
  if (themeType === "rainbow") centerIcon = "🏳️‍🌈🤭";
  if (themeType === "mahr") centerIcon = "🎁💎";
  if (themeType === "ugly") centerIcon = "💀🔥";
  ctx.fillText(centerIcon, canvasWidth / 2, yPos + avatarSize / 2 + 15);

  // الأسماء
  ctx.font = "bold 26px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(name1, 180, yPos + avatarSize + 40);
  ctx.fillText(name2, 620, yPos + avatarSize + 40);

  // الحقوق
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "#f1c40f";
  ctx.fillText("​🌸🤭 𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🌸🤭", canvasWidth / 2, 420);

  const imagePath = path.join(__dirname, "cache", `khitba_${Date.now()}.png`);
  await fs.ensureDir(path.join(__dirname, "cache"));
  await fs.writeFile(imagePath, canvas.toBuffer("image/png"));

  return api.sendMessage({
    body: msg,
    attachment: fs.createReadStream(imagePath)
  }, event.threadID, () => {
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  }, event.messageID);
}

// ==========================================
// دالة بطاقة فردية للخطوبة
// ==========================================
async function sendSingleKhitbaCard({ api, event, userID, name, msg }) {
  const fs = require("fs-extra");
  const path = require("path");
  const { createCanvas, loadImage } = require("canvas");

  const avatarUrl = `https://graph.facebook.com/${userID}/picture?height=500&width=500&access_token=6628568379%CC%1e620fa708a1d5696fb991c1bde5662`;
  const img = await loadImage(avatarUrl);

  const canvasWidth = 600;
  const canvasHeight = 500;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
  gradient.addColorStop(0, "#e67e22");
  gradient.addColorStop(1, "#2c3e50");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const avatarSize = 200;
  const xPos = (canvasWidth - avatarSize) / 2;
  const yPos = 80;

  ctx.save();
  ctx.beginPath();
  ctx.arc(canvasWidth / 2, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.clip();
  ctx.drawImage(img, xPos, yPos, avatarSize, avatarSize);
  ctx.restore();

  ctx.strokeStyle = "#f1c40f";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(canvasWidth / 2, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.stroke();

  ctx.font = "bold 28px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(name, canvasWidth / 2, yPos + avatarSize + 50);

  ctx.font = "bold 20px Arial";
  ctx.fillStyle = "#f1c40f";
  ctx.fillText("👑 ملكة الخلاطين بدون خطوبة 👑", canvasWidth / 2, yPos + avatarSize + 95);

  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("​🌸🤭 𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🌸🤭", canvasWidth / 2, 470);

  const imagePath = path.join(__dirname, "cache", `khitba_single_${Date.now()}.png`);
  await fs.ensureDir(path.join(__dirname, "cache"));
  await fs.writeFile(imagePath, canvas.toBuffer("image/png"));

  return api.sendMessage({
    body: msg,
    attachment: fs.createReadStream(imagePath)
  }, event.threadID, () => {
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  }, event.messageID);
}

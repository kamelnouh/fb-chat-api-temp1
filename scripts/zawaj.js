const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "زواج",
    version: "4.1.0",
    author: "​🐰🌷 𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🎀",
    countDown: 5,
    role: 0,
    description: "بطاقة وأحداث زواج عشوائية ومضحكة للغاية",
    category: "fun",
    usages: "[قم بالرد على شخص أو اكتب الأمر مباشرة]"
  },

  run: async function ({ api, event }) {
    const user1ID = event.senderID;
    let user2ID;

    try {
      // 1. تحديد الشخص الثاني (إما عبر الرد أو المنشن أو اختيار عشوائي)
      if (event.type === "message_reply") {
        user2ID = event.messageReply.senderID;
      } else if (Object.keys(event.mentions || {}).length > 0) {
        user2ID = Object.keys(event.mentions)[0];
      } else {
        const threadInfo = await api.getThreadInfo(event.threadID);
        const participantIDs = threadInfo.participantIDs;
        const availableUsers = participantIDs.filter(id => id !== user1ID && id !== api.getCurrentUserID());

        if (availableUsers.length === 0) {
          return api.sendMessage("⚠️ لا يوجد أعضاء آخرين في هذه المجموعة لخطبة أحدهم!", event.threadID, event.messageID);
        }

        const randomIndex = Math.floor(Math.random() * availableUsers.length);
        user2ID = availableUsers[randomIndex];
      }

      if (user1ID === user2ID) {
        return api.sendMessage("❌ لا يمكنك الزواج من نفسك!", event.threadID, event.messageID);
      }

      // جلب معلومات الطرفين والجنس
      const userInfo = await api.getUserInfo([user1ID, user2ID]);
      const user1 = userInfo[user1ID] || {};
      const user2 = userInfo[user2ID] || {};

      const name1 = user1.name || "الطرف الأول";
      const name2 = user2.name || "الطرف الثاني";

      const gender1 = user1.gender === 1 ? "female" : "male";
      const gender2 = user2.gender === 1 ? "female" : "male";

      // دالة لتوليد مهر عشوائي ومضحك
      const generateMahr = () => {
        const millions = Math.floor(Math.random() * 90) + 10;
        const items = [
          "كبش العيد 🐑 + Tecno Spark 📱😂",
          "قرعة ريحة + شواية كهربائية 🍢",
          "سلسلة ذهب + 10 كغ بطاطا 🥔",
          "تريبيداي + كارت فرلكس 💳",
          "قصعة شخشوخة + بيبسي 1.5L 🥤",
          "سوار ذهب فالصو + بطاقة حافلة 🚌"
        ];
        const randomItem = items[Math.floor(Math.random() * items.length)];
        return `${millions} مليون + ${randomItem}`;
      };

      // ==========================================
      // إذا كان مرسل الأمر (ذَكَر)
      // ==========================================
      if (gender1 === "male") {
        const maleScenarios = [
          // 1. مباركة عادية بالبطاقة (سواء ذكر مع ذكر أو ذكر مع أنثى)
          { 
            action: "card", type: "normal", 
            msg: `✨ **ألف مبروك للزوجين!** 💍💖\n🤵 ${name1} ❤️ ${gender2 === 'male' ? '🤵' : '👰'} ${name2}` 
          },
          // 2. العرس المالي بالبطاقة
          { 
            action: "card", type: "mahr", 
            msg: `💰 **العرس المالي والشرط!** 💍\n🤵 ${name1} ❤️ ${gender2 === 'male' ? '🤵' : '👰'} ${name2}\n\n💵 **المهر المتفق عليه:** ${generateMahr()}` 
          },
          // 3. زواج ملون 
          { 
            action: "card", type: "rainbow", 
            msg: `🏳️‍🌈 **مبروك الزواج الملون!** 🥳😹\n🤵 ${name1} ❤️ 🤵 ${name2}\nعلى الطريقة الخاصة 😂` 
          },
          // 4. تمنيك على اللي دار الأمر وحده (بدون ذكر الشخص الثاني)
          { action: "text", msg: "خطيك من زواج كاين قوقل 😹😹💔" },
          { action: "text", msg: "اقعد عزبة خيرلك 😂💔" },
          { action: "text", msg: "تزوج بزبي 😕🪻" },
          { action: "text", msg: "راك تحلم بزف روح ترقد 🥱🤡" },
          // 5. تمنيك بيهم لزوج (مرسل الأمر والشخص الثاني)
          { 
            action: "card", type: "ugly", 
            msg: `🤡 **كارثة في الجروب!**\n🤵 ${name1} & ${name2}\nزواج خلاطات مايسواوش حبة بطاطا 🥔😂` 
          },
          { 
            action: "text", 
            msg: `محال يتعدلو هادو لزوج! 🪻 ${name1} و ${name2} زواج الفشل الذريع 😂💔` 
          }
        ];

        const selected = maleScenarios[Math.floor(Math.random() * maleScenarios.length)];

        if (selected.action === "text") {
          return api.sendMessage(selected.msg, event.threadID, event.messageID);
        } else {
          return await sendWeddingCard({ api, event, user1ID, user2ID, name1, name2, msg: selected.msg, themeType: selected.type });
        }
      } 
      
      // ==========================================
      // إذا كانت مرسلة الأمر (أُنثى)
      // ==========================================
      else {
        const femaleScenarios = [
          // 1. مباركة عادية بالبطاقة
          { 
            action: "card", type: "romantic", 
            msg: `🌸 **مبروك الزواج المبارك!**\n👰 ${name1} ❤️ ${gender2 === 'female' ? '👰' : '🤵'} ${name2}\nألف مبروك للعروسين 💖` 
          },
          // 2. العرس المالي بالبطاقة
          { 
            action: "card", type: "mahr", 
            msg: `💰 **العرس المالي والشرط!** 💅✨\n👰 ${name1} ❤️ ${gender2 === 'female' ? '👰' : '🤵'} ${name2}\n\n💵 **الشرط المتفق عليه:** ${generateMahr()}` 
          },
          // 3. تمسخير فتاة مع فتاة
          { 
            action: "card", type: "rainbow", 
            msg: `😹😹😋🤭 **سبحان الله!**\n👰 ${name1} ❤️ 👰 ${name2}\nنا جامي شفت طفلة تتزوج بطفلة صبحان الله 😹😹😋🤭` 
          },
          // 4. تمنيك على اللي دارت الأمر وحدها (تمسخير بالأنثى نفسها)
          { action: "text", msg: "قعدي عزبة احسن 🙂💔" },
          { action: "text", msg: "تقعدي عزبة مكانش رجال 😒💋" },
          { action: "text", msg: "نتي تاعي ربك 😠❤️‍🔥" },
          { action: "text", msg: `شكون هذا اللي يقبل يتزوج بيك يا ${name1}؟ روحي طيبي الشربة خيرلك 🍲😹💔` },
          { action: "text", msg: `قالك حابة تتزوج! روحي كملي قرايتك والا اغسلي الماعين خيرلك 😂🧹` },
          { 
            action: "single_card", 
            msg: `أكبر خلاطة على وجه الكرة الأرضية 😂😂😂😂💪\n👤 **المقصودة:** ${name1}` 
          },
          // 5. تمنيك بيهم لزوج
          { 
            action: "card", type: "ugly", 
            msg: `🚨 **ثنائي الكارثة!**\n${name1} & ${name2}\nزوج مصايب متلاقين في جروب واحد 😂💀` 
          },
          { 
            action: "text", 
            msg: `يا لطيف! ${name1} و ${name2} لزوج راهم يخلوطو في نفس القازان 😂🔥` 
          }
        ];

        const selected = femaleScenarios[Math.floor(Math.random() * femaleScenarios.length)];

        if (selected.action === "text") {
          return api.sendMessage(selected.msg, event.threadID, event.messageID);
        } else if (selected.action === "single_card") {
          return await sendSingleCard({ api, event, userID: user1ID, name: name1, msg: selected.msg });
        } else {
          return await sendWeddingCard({ api, event, user1ID, user2ID, name1, name2, msg: selected.msg, themeType: selected.type });
        }
      }

    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ حدث خطأ أثناء تنفيذ أمر الزواج.", event.threadID, event.messageID);
    }
  }
};

// ==========================================
// دالة تصميم بطاقة الزواج المزدوجة بـ Themes متنوعة
// ==========================================
async function sendWeddingCard({ api, event, user1ID, user2ID, name1, name2, msg, themeType }) {
  await api.sendMessage("🎨 جاري تصميم بطاقة الزواج...", event.threadID, event.messageID);

  const avatarUrl1 = `https://graph.facebook.com/${user1ID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
  const avatarUrl2 = `https://graph.facebook.com/${user2ID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

  const img1 = await loadImage(avatarUrl1);
  const img2 = await loadImage(avatarUrl2);

  const canvasWidth = 800;
  const canvasHeight = 450;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  if (themeType === "rainbow") {
    const grad = ctx.createLinearGradient(0, 0, canvasWidth, 0);
    grad.addColorStop(0, "#e74c3c");
    grad.addColorStop(0.2, "#e67e22");
    grad.addColorStop(0.4, "#f1c40f");
    grad.addColorStop(0.6, "#2ecc71");
    grad.addColorStop(0.8, "#3498db");
    grad.addColorStop(1, "#9b59b6");
    ctx.fillStyle = grad;
  } else if (themeType === "mahr") {
    const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    grad.addColorStop(0, "#11998e");
    grad.addColorStop(1, "#38ef7d");
    ctx.fillStyle = grad;
  } else if (themeType === "ugly") {
    const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    grad.addColorStop(0, "#7f8c8d");
    grad.addColorStop(1, "#2c3e50");
    ctx.fillStyle = grad;
  } else {
    const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    grad.addColorStop(0, "#ff758c");
    grad.addColorStop(1, "#ff7eb3");
    ctx.fillStyle = grad;
  }

  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const avatarSize = 180;
  const yPos = 110;

  ctx.save();
  ctx.beginPath();
  ctx.arc(180, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.clip();
  ctx.drawImage(img1, 90, yPos, avatarSize, avatarSize);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(620, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.clip();
  ctx.drawImage(img2, 530, yPos, avatarSize, avatarSize);
  ctx.restore();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(180, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(620, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.stroke();

  ctx.font = "bold 50px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  
  let centerIcon = "💍❤️";
  if (themeType === "rainbow") centerIcon = "🏳️‍🌈🤣";
  if (themeType === "mahr") centerIcon = "💰💵";
  if (themeType === "ugly") centerIcon = "💀🔥";
  ctx.fillText(centerIcon, canvasWidth / 2, yPos + avatarSize / 2 + 15);

  ctx.font = "bold 26px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(name1, 180, yPos + avatarSize + 40);
  ctx.fillText(name2, 620, yPos + avatarSize + 40);

  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "#f1c40f";
  ctx.fillText("𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤", canvasWidth / 2, 420);

  const imagePath = path.join(__dirname, "cache", `zawaj_${Date.now()}.png`);
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
// دالة بطاقة فردية (خاصة بالتمسخير على المرسل وحده)
// ==========================================
async function sendSingleCard({ api, event, userID, name, msg }) {
  const avatarUrl = `https://graph.facebook.com/${userID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
  const img = await loadImage(avatarUrl);

  const canvasWidth = 600;
  const canvasHeight = 500;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
  gradient.addColorStop(0, "#8e44ad");
  gradient.addColorStop(1, "#c0392b");
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

  ctx.font = "bold 22px Arial";
  ctx.fillStyle = "#f1c40f";
  ctx.fillText("🌪️ أكبر خلاطة على وجه الكرة الأرضية 💪", canvasWidth / 2, yPos + avatarSize + 95);

  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤", canvasWidth / 2, 470);

  const imagePath = path.join(__dirname, "cache", `khallata_${Date.now()}.png`);
  await fs.ensureDir(path.join(__dirname, "cache"));
  await fs.writeFile(imagePath, canvas.toBuffer("image/png"));

  return api.sendMessage({
    body: msg,
    attachment: fs.createReadStream(imagePath)
  }, event.threadID, () => {
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  }, event.messageID);
}

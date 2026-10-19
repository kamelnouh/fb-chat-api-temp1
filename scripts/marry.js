const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
    config: {
        name: "زواج",
        version: "2.1.0",
        author: "𝑲𝒂𝒎𝒆𝒍 𝑩𝒐𝒖𝒎𝒓𝒅𝒂𝒔𝒔𝒊 🪻💤",
        countDown: 5,
        role: 0,
        description: "بطاقة زواج مدمجة، إما بالرد على شخص أو اختيار شخص عشوائي من القروب",
        category: "fun",
        usages: "[قم بالرد على شخص أو اكتب !زواج مباشرة]"
    },

    onStart: async function ({ api, event }) {
        const user1ID = event.senderID;
        let user2ID;

        try {
            // 1. إذا قام المستخدم بالرد على رسالة شخص
            if (event.type === "message_reply") {
                user2ID = event.messageReply.senderID;
            } 
            // 2. إذا كتب الأمر لوحده بدون رد، نختار شخصاً عشوائياً من أعضاء القروب
            else {
                const threadInfo = await api.getThreadInfo(event.threadID);
                const participantIDs = threadInfo.participantIDs;

                // تصفية القائمة لعدم اختيار البوت أو نفس الشخص الذي كتب الأمر
                const availableUsers = participantIDs.filter(id => id !== user1ID && id !== api.getCurrentUserID());

                if (availableUsers.length === 0) {
                    return api.sendMessage("⚠️ لا يوجد أعضاء آخرين في هذه المجموعة لخطبة أحدهم!", event.threadID, event.messageID);
                }

                // اختيار شخص عشوائي عشوائية تامة
                const randomIndex = Math.floor(Math.random() * availableUsers.length);
                user2ID = availableUsers[randomIndex];
            }

            if (user1ID === user2ID) {
                return api.sendMessage("❌ لا يمكنك الزواج من نفسك!", event.threadID, event.messageID);
            }

            await api.sendMessage("🎨 جاري اختيار الشريك وتصميم بطاقة الزواج...", event.threadID, event.messageID);

            // جلب أسماء الطرفين
            const userInfo = await api.getUserInfo([user1ID, user2ID]);
            const name1 = userInfo[user1ID]?.name || "الزوج";
            const name2 = userInfo[user2ID]?.name || "الزوجة";

            // روابط صور البروفايل بجودة عالية
            const avatarUrl1 = `https://graph.facebook.com/${user1ID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            const avatarUrl2 = `https://graph.facebook.com/${user2ID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

            const img1 = await loadImage(avatarUrl1);
            const img2 = await loadImage(avatarUrl2);

            // إعداد أبعاد اللوحة (مستطيلة: 800x450)
            const canvasWidth = 800;
            const canvasHeight = 450;
            const canvas = createCanvas(canvasWidth, canvasHeight);
            const ctx = canvas.getContext("2d");

            // خلفية متدرجة أنيقة
            const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
            gradient.addColorStop(0, "#2c3e50");
            gradient.addColorStop(1, "#000000");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // رسم الصورتين بشكل دائري على الجانبين
            const avatarSize = 180;
            const yPos = 110;

            // صورة الشخص الأول (على اليسار)
            ctx.save();
            ctx.beginPath();
            ctx.arc(180, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img1, 90, yPos, avatarSize, avatarSize);
            ctx.restore();

            // صورة الشخص الثاني (على اليمين)
            ctx.save();
            ctx.beginPath();
            ctx.arc(620, yPos + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img2, 530, yPos, avatarSize, avatarSize);
            ctx.restore();

            // رسم رمز القلب وإطار بين الصورتين
            ctx.font = "bold 60px Arial";
            ctx.fillStyle = "#e74c3c";
            ctx.textAlign = "center";
            ctx.fillText("💍❤️", canvasWidth / 2, yPos + avatarSize / 2 + 15);

            // كتابة النصوص العربية
            ctx.font = "bold 42px Arial";
            ctx.fillStyle = "#f1c40f"; // لون ذهبي
            ctx.fillText("زواج مبارك لهم 💖", canvasWidth / 2, 60);

            // أسماء الزوجين تحت الصور
            ctx.font = "bold 26px Arial";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(name1, 180, yPos + avatarSize + 40);
            ctx.fillText(name2, 620, yPos + avatarSize + 40);

            // عبارة ختامية
            ctx.font = "italic 22px Arial";
            ctx.fillStyle = "#ecf0f1";
            ctx.fillText("😋🌸 بارك الله لهما وبارك عليهما وجمع بينهما في خير", canvasWidth / 2, 410);

            // حفظ الصورة مؤقتاً وإرسالها
            const imagePath = path.join(__dirname, "cache", `marry_${Date.now()}.png`);
            await fs.ensureDir(path.join(__dirname, "cache"));
            const buffer = canvas.toBuffer("image/png");
            await fs.writeFile(imagePath, buffer);

            const msg = '✨️ **ألف مبروك للزوجين الجديدين!**\n🤵 ${name1}  ❤️  👰 ${name2}`;

            return api.sendMessage({
                body: msg,
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => {
                if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            }, event.messageID);

        } catch (error) {
            console.error(error);
            return api.sendMessage("❌ حدث خطأ أثناء اختيار الشريك أو إنشاء البطاقة.", event.threadID, event.messageID);
        }
    }
};


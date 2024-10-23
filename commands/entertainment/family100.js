const {
    monospace,
    quote
} = require("@mengkodingan/ckptw");
const axios = require("axios");

const session = new Map();

module.exports = {
    name: "family100",
    category: "entertainment",
    handler: {
        banned: true,
        cooldown: true,
        group: true
    },
    code: async (ctx) => {
        const {
            status,
            message
        } = await global.handler(ctx, module.exports.handler);
        if (status) return await ctx.reply(message);

        if (session.has(ctx.id)) return await ctx.reply(quote(`🎮 Sesi permainan sedang berjalan!`));

        try {
            const apiUrl = global.tools.api.createUrl("https://raw.githubusercontent.com", "/BochilTeam/database/master/games/family100.json", {});
            const response = await axios.get(apiUrl);
            const data = response.data[Math.floor(Math.random() * response.data.length)];
            const coin = {
                answered: 5,
                allAnswered: 50
            };
            const timeout = 60000;
            const senderNumber = ctx.sender.jid.split(/[:@]/)[0];
            const remainingAnswers = new Set(data.jawaban.map(j => j.toLowerCase()));
            const participants = new Set();

            session.set(ctx.id, true);

            await ctx.reply(
                `${quote(`Soal: ${data.soal}`)}\n` +
                `${quote(`Jumlah jawaban: ${remainingAnswers.size}`)}\n` +
                `${quote(`Batas waktu ${(timeout / 1000).toFixed(2)} detik.`)}\n\n` +
                global.config.msg.footer
            );

            const collector = ctx.MessageCollector({
                time: timeout
            });

            collector.on("collect", async (m) => {
                const userAnswer = m.content.toLowerCase();
                const participantJid = m.jid;
                const participantNumber = participantJid.split(/[:@]/)[0]

                if (remainingAnswers.has(userAnswer)) {
                    remainingAnswers.delete(userAnswer);
                    participants.add(participantNumber);

                    await global.db.add(`user.${participantNumber}.coin`, coin.answered);
                    await ctx.sendMessage(ctx.id, {
                        text: quote(`✅ ${global.tools.general.ucword(userAnswer)} benar! Jawaban tersisa: ${remainingAnswers.size}`),
                        quoted: m
                    });

                    if (remainingAnswers.size === 0) {
                        session.delete(ctx.id);
                        for (const participant of participants) {
                            await global.db.add(`user.${participant}.coin`, coin.allAnswered);
                            await global.db.add(`user.${participant}.winGame`, 1);
                        }
                        await ctx.reply(quote(`🎉 Selamat! Semua jawaban telah ditemukan! Setiap peserta yang menjawab mendapat 10 koin.`));
                        return collector.stop();
                    }
                }
            });

            collector.on("end", async () => {
                const remaining = [...remainingAnswers].map(global.tools.general.ucword).join(", ").replace(/, ([^,]*)$/, ", dan $1");

                if (session.has(ctx.id)) {
                    session.delete(ctx.id);
                    await ctx.reply(
                        `${quote("⌛ Waktu habis!")}\n` +
                        quote(`Jawaban yang belum terjawab adalah: ${remaining}`)
                    );
                }
            });
        } catch (error) {
            console.error(`[${global.config.pkg.name}] Error:`, error);
            return await ctx.reply(quote(`❎ Terjadi kesalahan: ${error.message}`));
        }
    }
};
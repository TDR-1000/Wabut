const {
    quote
} = require("@mengkodingan/ckptw");
const {
    MessageType
} = require("@mengkodingan/ckptw/lib/Constant");
const axios = require("axios");
const mime = require("mime-types");

module.exports = {
    name: "whatanime",
    aliases: ["wait"],
    category: "tools",
    handler: {
        banned: true,
        cooldown: true,
        coin: [10, "image", 3]
    },
    code: async (ctx) => {
        const {
            status,
            message
        } = await global.handler(ctx, module.exports.handler);
        if (status) return await ctx.reply(message);

        const msgType = ctx.getMessageType();
        const [checkMedia, checkQuotedMedia] = await Promise.all([
            global.tools.general.checkMedia(msgType, "image", ctx),
            global.tools.general.checkQuotedMedia(ctx.quoted, "image")
        ]);

        if (!checkMedia && !checkQuotedMedia) return await ctx.reply(quote(global.tools.msg.generateInstruction(["send", "reply"], "image")));

        try {
            const buffer = await ctx.msg.media.toBuffer() || await ctx.quoted?.media.toBuffer();
            const uploadUrl = await global.tools.general.upload(buffer);
            const apiUrl = global.tools.api.createUrl("ryzendesu", "/api/weebs/whatanime", {
                url: uploadUrl
            });
            const {
                data
            } = await axios.get(apiUrl);

            return await ctx.reply({
                video: {
                    url: data.videoURL
                },
                mimetype: mime.lookup("mp4"),
                caption: `${quote(`Judul: ${data.judul}`)}\n` +
                    `${quote(`Episode: ${data.episode}`)}\n` +
                    `${quote(`Kesamaan: ${data.similarity}%`)}\n` +
                    "\n" +
                    global.config.msg.footer,
                gifPlayback: false
            });
        } catch (error) {
            console.error(`[${global.config.pkg.name}] Error:`, error);
            if (error.status !== 200) return await ctx.reply(global.config.msg.notFound);
            return await ctx.reply(quote(`❎ Terjadi kesalahan: ${error.message}`));
        }
    }
};
const {
    quote
} = require("@mengkodingan/ckptw");
const mime = require("mime-types");

module.exports = {
    name: "videydl",
    category: "downloader",
    handler: {
        banned: true,
        cooldown: true,
        coin: [10, "text", 1],
        premium: true
    },
    code: async (ctx) => {
        const {
            status,
            message
        } = await global.handler(ctx, module.exports.handler);
        if (status) return await ctx.reply(message);

        const url = ctx.args[0] || null;

        if (!url) return await ctx.reply(
            `${quote(global.tools.msg.generateInstruction(["send"], ["text"]))}\n` +
            quote(global.tools.msg.generateCommandExample(ctx._used.prefix + ctx._used.command, "https://example.com/"))
        );

        const urlRegex = /^(https?:\/\/)?(www\.)?videy\.co\/v\?id=([a-zA-Z0-9]+)/i;
        const match = urlRegex.exec(url);
        if (!match) return await ctx.reply(global.config.msg.urlInvalid);

        try {
            const videoId = match[3];
            const videoUrl = `https://cdn.videy.co/${videoId}.mp4`;

            return await ctx.reply({
                video: {
                    url: videoUrl
                },
                mimetype: mime.lookup("mp4"),
                caption: `${quote(`URL: ${url}`)}\n` +
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
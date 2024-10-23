const {
    quote
} = require("@mengkodingan/ckptw");
const axios = require("axios");
const mime = require("mime-types");

module.exports = {
    name: "xdl",
    aliases: ["twit", "twitdl", "twitter", "twitterdl", "x"],
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

        const urlRegex = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i;
        if (!urlRegex.test(url)) return await ctx.reply(global.config.msg.urlInvalid);

        try {
            const apiUrl = global.tools.api.createUrl("ryzendesu", "/api/downloader/twitter", {
                url
            });
            const {
                data
            } = await axios.get(apiUrl);

            if (data.status && data.type === "image" && data.media.length > 0) {
                for (let i = 0; i < data.media.length; i++) {
                    await ctx.reply({
                        image: {
                            url: data.media[i]
                        },
                        mimetype: mime.lookup("png")
                    });
                }
            }

            if (data.status && data.type === "video" && data.media.length > 0) {
                for (let i = 0; i < data.media.length; i++) {
                    const videoData = data.media[i];
                    await ctx.reply({
                        video: {
                            url: videoData.url
                        },
                        mimetype: mime.lookup("mp4"),
                        gifPlayback: false
                    });
                }
            }
        } catch (error) {
            console.error(`[${global.config.pkg.name}] Error:`, error);
            if (error.status !== 200) return await ctx.reply(global.config.msg.notFound);
            return await ctx.reply(quote(`❎ Terjadi kesalahan: ${error.message}`));
        }
    }
};
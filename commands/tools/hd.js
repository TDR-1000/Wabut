const {
    monospace,
    quote
} = require("@mengkodingan/ckptw");
const {
    MessageType
} = require("@mengkodingan/ckptw/lib/Constant");
const axios = require("axios");
const Jimp = require("jimp");
const mime = require("mime-types");

module.exports = {
    name: "hd",
    aliases: ["hd", "hdr"],
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

        const input = ctx.args.join(" ") || null;
        const msgType = ctx.getMessageType();

        const [checkMedia, checkQuotedMedia] = await Promise.all([
            global.tools.general.checkMedia(msgType, "image", ctx),
            global.tools.general.checkQuotedMedia(ctx.quoted, "image")
        ]);

        if (!checkMedia && !checkQuotedMedia) return await ctx.reply(
            `${quote(global.tools.msg.generateInstruction(["send", "reply"], "image"))}\n` +
            quote(global.tools.msg.generatesFlagInformation({
                "-t <text>": "Jenis pemrosesan gambar (tersedia: modelx2, modelx2 25 JXL, modelx4, minecraft_modelx4).",
            }))
        );

        try {
            const type = ["modelx2", "modelx2 25 JXL", "modelx4", "minecraft_modelx4"];
            const flag = global.tools.general.parseFlag(input, {
                "-t": {
                    type: "value",
                    key: "type",
                    validator: (val) => type.includes(val),
                    parser: (val) => val
                }
            });

            const buffer = await ctx.msg?.media?.toBuffer() || await ctx.quoted?.media?.toBuffer();
            const uploadUrl = await global.tools.general.upload(buffer);
            const apiUrl = global.tools.api.createUrl("itzpire", "/tools/enhance", {
                url: uploadUrl,
                type: flag.type || global.tools.general.getRandomElement(type)
            });
            const {
                data
            } = await axios.get(apiUrl);

            return await ctx.reply({
                image: {
                    url: data.result.img
                },
                mimetype: mime.lookup("png")
            });
        } catch (error) {
            console.error(`[${global.config.pkg.name}] Error:`, error);
            if (error.status !== 200) return await ctx.reply(global.config.msg.notFound);
            return await ctx.reply(quote(`❎ Terjadi kesalahan: ${error.message}`));
        }
    }
};
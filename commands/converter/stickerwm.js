const {
    quote
} = require("@mengkodingan/ckptw");
const {
    MessageType
} = require("@mengkodingan/ckptw/lib/Constant");
const {
    Sticker,
    StickerTypes
} = require("wa-sticker-formatter");

module.exports = {
    name: "stickerwm",
    aliases: ["swm", "stikerwm"],
    category: "converter",
    handler: {
        banned: true,
        cooldown: true
    },
    code: async (ctx) => {
        const {
            status,
            message
        } = await global.handler(ctx, module.exports.handler);
        if (status) return await ctx.reply(message);

        const input = ctx.args.join(" ") || null;

        if (!input) return await ctx.reply(
            `${quote(global.tools.msg.generateInstruction(["send", "reply"], ["text", "sticker"]))}\n` +
            quote(global.tools.msg.generateCommandExample(ctx._used.prefix + ctx._used.command, "i want to be a cat|just meow meow"))
        );

        if (!(await global.tools.general.checkQuotedMedia(ctx.quoted, ["sticker"]))) return await ctx.reply(quote(global.tools.msg.generateInstruction(["send", "reply"], ["sticker"])));

        try {
            const buffer = await ctx.msg.media.toBuffer() || await ctx.quoted?.media.toBuffer();
            const [packname, author] = input.split("|");
            const sticker = new Sticker(buffer, {
                pack: packname || "",
                author: author || "",
                type: StickerTypes.FULL,
                categories: ["🤩", "🎉"],
                id: ctx.id,
                quality: 50
            });

            return await ctx.reply(await sticker.toMessage());
        } catch (error) {
            console.error(`[${global.config.pkg.name}] Error:`, error);
            return await ctx.reply(quote(`❎ Terjadi kesalahan: ${error.message}`));
        }
    }
};
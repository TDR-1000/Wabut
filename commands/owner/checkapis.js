const {
    quote
} = require("@mengkodingan/ckptw");
const axios = require("axios");

module.exports = {
    name: "checkapis",
    aliases: ["cekapi", "checkapi"],
    category: "owner",
    handler: {
        owner: true
    },
    code: async (ctx) => {
        const {
            status,
            message
        } = await global.handler(ctx, module.exports.handler);
        if (status) return await ctx.reply(message);

        try {
            const wait = await ctx.reply(global.config.msg.wait);

            const APIs = global.tools.api.listUrl();
            let result = "";

            for (const [name, api] of Object.entries(APIs)) {
                try {
                    const response = await axios.get(api.baseURL, {
                        timeout: 5000,
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
                        }
                    });

                    if (response.status >= 200 && response.status < 500) {
                        result += quote(`${api.baseURL} 🟢 (${response.status})\n`);
                    } else {
                        result += quote(`${api.baseURL} 🔴 (${response.status})\n`);
                    }
                } catch (error) {
                    if (error.response) {
                        result += quote(`${api.baseURL} 🔴 (${error.response.status})\n`);
                    } else if (error.request) {
                        result += quote(`${api.baseURL} 🔴 (Tidak ada respon)\n`);
                    } else {
                        result += quote(`${api.baseURL} 🔴 (Kesalahan: ${error.message})\n`);
                    }
                }
            }

            await ctx.editMessage(wait.key,
                `${result.trim()}\n` +
                "\n" +
                global.config.msg.footer
            );
        } catch (error) {
            console.error(`[${global.config.pkg.name}] Error:`, error);
            return await ctx.reply(quote(`❎ Terjadi kesalahan: ${error.message}`));
        }
    }
};
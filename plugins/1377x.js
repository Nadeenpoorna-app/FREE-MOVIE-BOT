const config = require('../config'),
  { cmd, commands } = require('../command'),
  axios = require('axios'),
  sharp = require('sharp'),
  https = require("https"),
  {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson,
  } = require('../lib/functions'),
  fetch = (..._0x528df7) =>
    import('node-fetch').then(({ default: _0x1863f6 }) =>
      _0x1863f6(..._0x528df7)
    ),
  { Buffer } = require('buffer'),
  FormData = require('form-data'),
  fs = require('fs'),
  path = require('path'),
  fileType = require('file-type'),
  l = console.log



// 1. Search Command
cmd({
    pattern: "moviego",
    react: '🔎',
    category: "movie",
    desc: "Search torrents on 1337x",
    use: ".moviego <query>",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isPre;

        if (!isAuthorized) {
            // API එකෙන් පණිවිඩය ලබාගැනීම
            const { data } = await axios.get('https://nadeen-botzdatabse.vercel.app/data.json');
            
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii


        if (!q) return await reply('*Please enter a search query! 🎬*');
        const { data } = await axios.get(`https://1377x-api.vercel.app/api/search?q=${encodeURIComponent(q)}`);
        
        if (!data || !data.results.length) return await reply('*No results found ❌*');

        let srh = data.results.map(v => ({
            title: v.title.substring(0, 60),
            rowId: `${prefix}13info ${v.link}`
        }));

        const sections = [{ title: "[Movie.go Results]", rows: srh }];

        if (config.BUTTON === "true") {
            await conn.sendMessage(from, {
                caption: `_*MOVIEGO SEARCH RESULTS*_\n\n\`🔍Input:\` ${q}`,
                footer: config.FOOTER,
                buttons: [{
                    buttonId: "torrent_list",
                    buttonText: { displayText: "🎥 Select Torrent" },
                    type: 4,
                    nativeFlowInfo: { name: "single_select", paramsJson: JSON.stringify({ title: "Choose a Torrent 🎬", sections }) }
                }],
                headerType: 1
            }, { quoted: mek });
        } else {
            await conn.listMessage(from, { text: `_*MOVIEGO SEARCH RESULTS*_\n\n\`🔍Input:\` ${q}`, footer: config.FOOTER, title: 'Results 🎥', buttonText: '*Select Number 🔢*', sections }, mek);
        }
    } catch (e) { reply('🚫 Error: ' + e.message); }
});

// 2. Info Command
cmd({
    pattern: "13info",
    react: "🎥",
	 category: "movie",
    filename: __filename
}, async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isPre;

        if (!isAuthorized) {
            // API එකෙන් පණිවිඩය ලබාගැනීම
            const { data } = await axios.get('https://nadeen-botzdatabse.vercel.app/data.json');
            
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii


        const { data } = await axios.get(`https://1377x-api.vercel.app/api/info?url=${encodeURIComponent(q)}`);
const title = `${data.title.replace(/%20/g, '')}`;
		
        let msg = `🎬 *${title}*\n\n`;
        msg += `▫🔊 *Language:* ${data.language}\n`;
        msg += `▫👥 *Leechers:* ${data.leechers}\n`;
		msg += `▫🛒 *Category:* ${data.category}\n`;
        msg += `▫⬆️ *Uploader:* ${data.uploader}\n\n`;
        msg += `*Click the button below to start torrent download.*\n*⚠2GB වලට අඩු ඒවා විතරක් ගන්න*`;

        // Image URL එකේ මුලට https: එකතු කිරීම (API එකේ එය අඩුවෙන් ඇති නිසා)
        const fullImg = data.image.startsWith('//') ? `https:${data.image}` : config.LOGO;

        // torren කමාන්ඩ් එකට යැවීමට අවශ්‍ය දත්ත
        const payload = `${data.magnetLink}±${fullImg}±${title}±${data.type}`;

        if (config.BUTTON === "true") {
            await conn.sendMessage(from, {
                image: { url: fullImg },
                caption: msg,
                footer: config.FOOTER,
                buttons: [{
                    buttonId: `${prefix}torren ${payload}`,
                    buttonText: { displayText: "📥 Download via Torrent" },
                    type: 1
                }],
                headerType: 4
            }, { quoted: mek });
        } else {
            let buttons = [{
                buttonId: `${prefix}torren ${payload}`,
                buttonText: { displayText: `📥 Download (${data.size})` },
                type: 1
            }];
            await conn.buttonMessage(from, { image: { url: fullImg }, caption: msg, footer: config.FOOTER, buttons, headerType: 4 }, mek);
        }
    } catch (err) { reply("🚫 *Error:* " + err.message); }
});

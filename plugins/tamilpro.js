
const config = require('../config'),
  { cmd, commands } = require('../command'),
  axios = require('axios'),
	fg = require('api-dylux'),
  sharp = require('sharp'),
  download = require('../lib/yts'),
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
  l = console.log,
  cinesubz_tv = require('sadasytsearch'),
  {
    cinesubz_info,
    cinesubz_tv_firstdl,
    cinesubz_tvshow_info,
  } = require('../lib/cineall'),
	key = `82406ca340409d44`
var { updateCMDStore,isbtnID,getCMDStore,getCmdForCmdId,connectdb,input,get, updb,updfb } = require("../lib/database")

//---------------------------------------------
// TAMILPRO SEARCH (HDHub4u)
//---------------------------------------------
cmd({
  pattern: "tamilpro",
  react: '🔎',
  category: "movie",
  desc: "HDHub4u movie search",
  use: ".tamilpro 2025",
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
        if (!q) return reply("*❗ Please give a movie name*");

        const api = `https://api-shan.vercel.app/movie/hdhub4u-search?q=${q}&limit=15`;
        const response = await axios.get(api);
        const data = response.data;

        if (!data.status || !data.data || data.data.length === 0)
            return reply("*❌ No results found!*");

        if (config.BUTTON === "true") {
            const rows = data.data.map(v => ({
                title: v.title,
                id: `${prefix}tamildl ${v.link}±${v.thumbail}±${v.title}`
            }));

            const listButtons = {
                title: "🎬 TAMILPRO Results",
                sections: [{ title: "Search Results", rows }]
            };

            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: `_*TAMILPRO SEARCH RESULTS 🎬*_\n\n*Input:* ${q}`,
                footer: config.FOOTER,
                buttons: [{
                    buttonId: "movie_list",
                    buttonText: { displayText: "🎥 Select Movie" },
                    type: 4,
                    nativeFlowInfo: {
                        name: "single_select",
                        paramsJson: JSON.stringify(listButtons)
                    }
                }],
                headerType: 1,
                viewOnce: true
            }, { quoted: mek });
        } else {
            let rows = data.data.map(v => ({
                title: v.title,
                rowId: `${prefix}tamildl ${v.link}±${v.thumbail}±${v.title}`
            }));

            await conn.listMessage(from, {
                text: `_*TAMILPRO SEARCH RESULTS 🎬*_\n\n\`🕵️‍♂️Input:\` ${q}`,
                footer: config.FOOTER,
                title: "tamilpro Results",
                buttonText: "Select a Movie 🔢",
                sections: [{ title: "Results", rows }]
            }, mek);
        }
    } catch (e) {
        console.log(e);
        reply("*Error ❗*");
    }
});

//---------------------------------------------
// TAMILPRO INFO (HDHub4u)
//---------------------------------------------
cmd({
  pattern: "tamildl",
  react: "🎥",
  category: "movie",
  dontAddCommandList: true,
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
        if (!q) return reply("*❗ Invalid input!*");
        const [url, img, movieTitle] = q.split("±");
        
        const infoAPI = `https://api-shan.vercel.app/movie/hdhub4u-info?url=${encodeURIComponent(url)}&apikey=${key}`;
        const response = await axios.get(infoAPI);
        const d = response.data.data;

        if (!d) return reply("*❌ Movie info not found!*");

        let msg = `*_▫🍿 Title ➽ ${d.title}_*\n\n` +
                  `▫⭐ IMDB ➽ ${d.rating}\n` +
                  `▫🎭 Genre ➽ ${d.genre}\n` +
                  `▫🕵️ Director ➽ ${d.director}\n` +
                  `▫🔉 Language ➽ ${d.language}\n`;

        let buttons = [];
        d.download.forEach(v => {
            let sizeMatch = v.quality.match(/\[(\d+(\.\d+)?)GB\]/i);
            let isTooLarge = false;
            if (sizeMatch && parseFloat(sizeMatch[1]) >= 2.0) isTooLarge = true;

            if (!isTooLarge && !v.quality.includes("WATCHPLAYER")) {
                buttons.push({
                    buttonId: `${prefix}tamil_upload ${img}±${v.link}±${d.title}±${v.quality}`,
                    buttonText: { displayText: `📥 ${v.quality}` },
                    type: 1
                });
            }
        });

        if (buttons.length === 0) return reply("*❌ No suitable links under 2GB!*");

        await conn.buttonMessage(from, {
            image: { url: img },
            caption: msg,
            footer: config.FOOTER,
            buttons,
            headerType: 4
        }, mek);
    } catch (e) {
        console.log(e);
        reply("*Error fetching info!*");
    }
});

//---------------------------------------------
// TAMILPRO FINAL UPLOAD (Like 'paka')
//---------------------------------------------
cmd({
  pattern: "tamil_upload",
  react: "⬇️",
  dontAddCommandList: true,
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
        if (!q) return reply("*❗ Missing data!*");
        const [img, url, title, quality] = q.split("±");

        const upmsg = await conn.sendMessage(from, { text: "*⬆️ Uploading movie...*" });

        // Document එක විදිහට වීඩියෝව යැවීම (With Thumbnail)
        const botimgResponse = await fetch(img);
        const botimgBuffer = await botimgResponse.buffer();
        const resizedBotImg = await sharp(botimgBuffer).resize(200, 200).toBuffer();

        await conn.sendMessage(config.JID || from, {
            document: { url: url },
            mimetype: "video/mp4",
            caption: `🎬 *${title}*\n\n\`[${quality}]\`\n\n> *•ɴᴀᴅᴇᴇɴ-ᴍᴅ•*`,
            jpegThumbnail: resizedBotImg,
            fileName: `${title}.mp4`
        });

        await conn.sendMessage(from, { delete: upmsg.key });
        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    } catch (e) {
        console.log("❌ Upload error:", e);
        reply("*❗ Error while uploading the movie!*");
    }
});

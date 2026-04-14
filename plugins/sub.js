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
  l = console.log



// 1. ZOOM SEARCH COMMAND (OLD MODE)
cmd({
    pattern: "zoom",
    react: '🔎',
    category: "movie",
    alias: ["zsearch"],
    desc: "Search movies from Zoom.lk",
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


        if (!q) return reply("*❗ Please provide a movie name!*");

        const searchUrl = `https://my-apis-site.vercel.app/movie/zoom/search?text=${encodeURIComponent(q)}&apikey=charuka-key-666`;
        const response = await axios.get(searchUrl);
        const results = response.data.result;

        if (!results || results.length === 0) return reply("*❌ No results found on Zoom.lk!*");

        let msg = `🎬 *ZOOM.LK SEARCH RESULTS*\n\n*Input:* ${q}\n\n[zoom.lk Results]`;
        let buttons = [];

        results.forEach((v) => {
            // Title එක පිරිසිදු කිරීම
            let cleanTitle = v.title
            
            buttons.push({
                buttonId: `${prefix}zoominfo ${v.link}±${v.img}`,
                buttonText: { displayText: cleanTitle },
                type: 1
            });
        });

        // පැරණි Button Mode එක
        await conn.buttonMessage(from, {
            image: { url: results[0].image || config.LOGO },
            caption: msg,
            footer: config.FOOTER,
            buttons: buttons,
            headerType: 4
        }, mek);

    } catch (e) {
        console.log(e);
        reply("*Error fetching search results!*");
    }
});

// 2. ZOOM MOVIE INFO COMMAND (OLD MODE)
cmd({
    pattern: "zoominfo",
    react: '📄',
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


        if (!q) return;
        const [url, img] = q.split("±");

        const infoUrl = `https://my-apis-site.vercel.app/movie/zoom/movie?url=${encodeURIComponent(url)}&apikey=charuka-key-666`;
        const response = await axios.get(infoUrl);
        
        // ඔබ එවූ API එකට අනුව data path එක: result.data
        const d = response.data.result.data;

        if (!d) return reply("*❌ Movie details not found!*");

       // const cleanTitle = d.title || "Unknown Movie";
        
        let infoMsg = `🎬 *${d.title}*\n\n`;
        infoMsg += `📅 *Date:* ${d.date.split('T')[0]}\n`;
        infoMsg += `👤 *Uploader:* ${d.uploader}\n`;
        infoMsg += `📁 *Categories:* ${d.categories.join(', ')}\n\n`;
        infoMsg += `📝 *Description:* ${d.desc[1] || d.desc[0]}\n\n`;
        infoMsg += `*Click below to download as ZIP:*`;

        let buttons = [
            {
                buttonId: `${prefix}zoom_dl ${d.dl_link}±${d.title}`,
                buttonText: { displayText: "📥 Download Movie ZIP" },
                type: 1
            }
        ];

        await conn.buttonMessage(from, {
            image: { url: img },
            caption: infoMsg,
            footer: config.FOOTER,
            buttons: buttons,
            headerType: 4
        }, mek);

    } catch (e) {
        console.log(e);
        reply("*Error fetching movie info!*");
    }
});

// 3. ZOOM FINAL DOWNLOADER (ZIP)
cmd({
    pattern: "zoom_dl",
    react: "📦",
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


        if (!q) return;
        const [dlUrl, title] = q.split("±");

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });
        const upmsg = await conn.sendMessage(from, { text: `*📦 Uploading ${title} as ZIP...*` });

        // ZIP එකක් ලෙස කෙලින්ම යැවීම
        await conn.sendMessage(from, {
            document: { url: dlUrl },
            mimetype: "application/zip",
            fileName: `${title}.zip`,
            caption: `🎬 *${title}*\n\n*ZIP File - Zoom.lk*\n\n${config.FOOTER}`,
        }, { quoted: mek });

        await conn.sendMessage(from, { delete: upmsg.key });
        await conn.sendMessage(from, { react: { text: "✔️", key: m.key } });

    } catch (e) {
        console.log("Download error:", e);
        reply("*❌ Download failed! Link may be invalid.*");
    }
});

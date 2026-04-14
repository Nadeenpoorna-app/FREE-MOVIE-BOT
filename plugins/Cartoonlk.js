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

cmd({
  pattern: "cartoon",
  react: "🐭",
   category: "movie",
  desc: "Search cartoons",
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



    if (!q) return reply("*❗ Give a cartoon name to search*");

    const searchAPI =
      `https://sadaslk-apis.vercel.app/api/v1/movie/cartoon/search?q=${encodeURIComponent(q.trim())}&apiKey=vispermdv4`;

    const res = (await axios.get(searchAPI)).data;
    const results = res?.results || res?.data || [];

    if (!results.length)
      return reply("*❌ No cartoons found!*");

    // 🔹 CREATE RAW ID ROWS
    const rows = results.slice(0, 15).map(v => ({
      title: v.title,
      description: v.year ? `Year: ${v.year}` : "",
      rowId: `${prefix}cartoondl ${v.url}±${v.title}±${v.image}`
    }));

    const listMessage = {
      title: "🐭 Cartoon Search",
      text: `Results for: *${q}*\n\nSelect a cartoon to download ⬇️`,
      footer: config.FOOTER,
      buttonText: "📥 Select Cartoon",
      sections: [{
        title: "Available Cartoons",
        rows
      }]
    };

    await conn.listMessage(from, listMessage, mek);

  } catch (e) {
    console.log(e);
    reply("*❌ Error while searching cartoons*");
  }
});


cmd({
  pattern: "cartoondl",
  react: "⬇️",
   category: "movie",
  desc: "Download cartoon movie",
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



    if (!q) return reply("*❗ Missing cartoon data!*");

    const [url, title, img] = q.split("±");

    const dlAPI =
      `https://cartoon-lk-search.vercel.app/api/download?url=${encodeURIComponent(url)}`;

    const data = (await axios.get(dlAPI)).data;
    const links = data?.download || data?.links;

    if (!links || !links.length)
      return reply("*❌ No download links found!*");

    const final =
      links.find(v => v.quality?.includes("720")) ||
      links.find(v => v.quality?.includes("480")) ||
      links[0];

    let thumb;
    try {
      const imgRes = await fetch(img);
      const imgBuf = await imgRes.buffer();
      thumb = await resizeImage(imgBuf, 200, 200);
    } catch {
      thumb = null;
    }

    await conn.sendMessage(config.JID || from, {
      document: { url: final.url || final.link },
      mimetype: "video/mp4",
      jpegThumbnail: thumb,
      fileName: `${title}.mp4`,
      caption:
        `🐭 *${title}*\n` +
        `🎞 Quality: ${final.quality || "Unknown"}\n` +
        `★━━━━━━━━✩━━━━━━━━★`
    }, { quoted: mek });

    await conn.sendMessage(from, {
      react: { text: "✔️", key: mek.key }
    });

  } catch (e) {
    console.log(e);
    reply("*❌ Error while downloading cartoon*");
  }
});



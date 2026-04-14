const config = require('../config')
const os = require('os')
const axios = require('axios');
const mimeTypes = require("mime-types");
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { generateForwardMessageContent, prepareWAMessageFromContent, generateWAMessageContent, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')
const https = require("https")
const { URL } = require('url');
const { Octokit } = require("@octokit/core");
const file_size_url = (...args) => import('file_size_url')
    .then(({ default: file_size_url }) => file_size_url(...args));

cmd({
  pattern: "mv2",
  react: "🔎",
  alias: ["movie", "film", "cinema"],
  desc: "Smart movie search using central API",
  category: "movie",
  use: '.movie',
  filename: __filename
},
async (conn, mek, m, {
  from, prefix, l, quoted, q,
  isPre, isSudo, isOwner, isMe, reply
}) => {
  try {
    // 1. Premium check
    const pr = (await axios.get('https://mv-visper-full-db.pages.dev/Main/main_var.json')).data;
    const isFree = pr.mvfree === "true";

    if (!isFree && !isMe && !isPre) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return await reply("*`You are not a premium user⚠️`*\n\n*Contact : 0778500326*");
    }

    if (!q) return await reply('*Enter movie name..🎬*');

    // සෙවීම ආරම්භ කරන විට React එක මාරු කිරීම
    await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

    // 2. Main API එකට Call කිරීම
    const apiUrl = `https://all-mvv-nadeen.vercel.app/api/search?q=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    
    // දත්ත සැකසෙන අතරතුර React එක මාරු කිරීම
    await conn.sendMessage(from, { react: { text: '✔', key: mek.key } });
    
    const data = response.data;

    // 3. Results තියෙනවාදැයි පරීක්ෂා කිරීම
    if (!data.status || !data.available_sites || data.available_sites.length === 0) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return await reply(`❌ No results found for "${q}" on any verified site.`);
    }

    const caption = `*╭─────────⦿────────*
*│🎬𝗡𝙰𝙳𝙴𝙴𝙽-𝗠𝙳 𝗠𝙾𝗩𝙸𝙴乂𝐆🄾*


\`📝 INPUT:\` *${q.toUpperCase()}*
\`📊 SOURCES:\` *${data.count}*

*✨ Select your preferred movie site below.*

> *Powered by NadeenXDev*\n*╰─────────⦿────────*`;

    let finalResponse;

    // 4. Button / List Message එක යැවීම
    if (config.BUTTON === "true") {
      const listButtons = {
        title: "❯❯ Available Movie Sources ❮❮",
        sections: [{
          title: "Verified Results ✅",
          rows: data.available_sites.map(src => ({
            title: `${src.name} Results 🎬`,
            description: `Click to view movies from ${src.name}`,
            id: prefix + src.cmd + ' ' + q
          }))
        }]
      };

      finalResponse = await conn.sendMessage(from, {
        image: { url: 'https://mv-visper-full-db.pages.dev/Data/visper_main.jpeg' },
        caption,
        footer: config.FOOTER,
        buttons: [{
          buttonId: "mv_select",
          buttonText: { displayText: "🎥 Select Source" },
          type: 4,
          nativeFlowInfo: {
            name: "single_select",
            paramsJson: JSON.stringify(listButtons)
          }
        }],
        headerType: 1
      }, { quoted: mek });

    } else {
      const buttons = data.available_sites.slice(0, 15).map(src => ({
        buttonId: prefix + src.cmd + ' ' + q,
        buttonText: { displayText: `${src.name}` },
        type: 1
      }));

      finalResponse = await conn.buttonMessage2(from, {
        image: { url: 'https://mv-visper-full-db.pages.dev/Data/visper_main.jpeg' },
        caption,
        footer: config.FOOTER,
        buttons,
        headerType: 4
      }, mek);
    }

    // සාර්ථකව අවසන් වූ පසු ✔ React එක දැමීම
    if (finalResponse) {
      await conn.sendMessage(from, { react: { text: '✔', key: mek.key } });
    }

  } catch (e) {
    l(e);
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    reply('*❌ API Error or Connection Issue*');
  }
});

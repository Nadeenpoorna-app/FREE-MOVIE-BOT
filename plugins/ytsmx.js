const config = require('../config'),
	 Seedr = require("seedr"),
  { cmd, commands } = require('../command'),
  axios = require('axios'),
  sharp = require('sharp'),
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

cmd({
  pattern: "ytsmx",
  react: "🔎",
  category: "movie",
  alias: ["yts"],
  desc: "YTS.mx movie search",
  use: ".ytsmx avengers",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isMe, isPre, isSudo, isOwner, reply }) => {
  try {

    // ---------------- PREMIUM CHECK ----------------
    const pr = (await axios.get(
      "https://mv-visper-full-db.pages.dev/Main/main_var.json"
    )).data;

    const isFree = pr.mvfree === "true";

    if (!isFree && !isMe && !isPre) {
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      return await conn.sendMessage(from, {
        text:
          "*`You are not a premium user⚠️`*\n\n" +
          "_Price : 200 LKR ✔️_\n\n" +
          "*👨‍💻 Contact : 0778500326 , 0722617699*"
      }, { quoted: mek });
    }

    if (config.MV_BLOCK === "true" && !isMe && !isSudo && !isOwner) {
      return reply("*🚫 Command blocked by owner*");
    }

    if (!q) return reply("*❗ Please give a movie name*");

    // ---------------- SEARCH API ----------------
    const api =
      `https://api-dark-shan-yt.koyeb.app/movie/ytsmx-search?q=${encodeURIComponent(q)}&apikey=${key}`;

    const res = (await axios.get(api)).data;

    if (!res.data || res.data.length === 0)
      return reply("*❌ No movies found!*");

    // ---------------- ROWS (IMPORTANT FIX) ----------------
    const rowsButton = [];
    const rowsList = [];

    res.data.forEach(v => {
      const title = v.title.replace(/download/gi, "").trim();
      const cmd = `${prefix}ytnx ${v.title}±${v.link}±${v.image}`;

      // button mode
      rowsButton.push({
        title,
        id: cmd
      });

      // number reply mode
      rowsList.push({
        title,
        rowId: cmd
      });
    });

    // ---------------- BUTTON TRUE ----------------
    if (config.BUTTON === "true") {

      const listButtons = {
        title: "🎬 Choose a Movie",
        sections: [{
          title: "YTS Results",
          rows: rowsButton
        }]
      };

      await conn.sendMessage(from, {
        image: { url: config.LOGO },
        caption: `🎬 *YTS SEARCH RESULT*\n\n🔍 *Input:* ${q}`,
        footer: config.FOOTER,
        buttons: [{
          buttonId: "download_list",
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

    } 
    // ---------------- BUTTON FALSE ----------------
    else {

      await conn.listMessage(from, {
        text: `🎬 *YTS SEARCH RESULT*\n\n🔍 *Input:* ${q}`,
        footer: config.FOOTER,
        title: "YTS.MX Results",
        buttonText: "Reply Number ⤵",
        sections: [{
          title: "Movies",
          rows: rowsList
        }]
      }, mek);

    }

  } catch (e) {
    console.log(e);
    reply("*🚩 Error while searching!*");
  }
});
cmd({
  pattern: "ytnx",
  react: "🎥",
	 category: "movie",
  desc: "movie downloader",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
  try {

    if (!q || !q.includes("movies"))
      return reply("*❗ Please use movie link only!*");
console.log(`🧿Input`,q)
    const [title, url, img] = q.split("±");

    const infoAPI =
      `https://api-dark-shan-yt.koyeb.app/movie/ytsmx-download?url=${encodeURIComponent(url)}&apikey=${key}`;
    const data = (await axios.get(infoAPI)).data;
    const d = data.data;

    const directors =
      (d.directors || "").replace(/Director:?/gi, "").trim();

    let msg =
`*_▫🍿 Title ➽ ${d.title}_*

▫📅 Year ➽ ${d.year}
▫⭐ IMDB ➽ ${d.rating}
▫🎬 Info ➽ ${d.time}

*⚠2GB වලට අඩු ඒවා විතරක් ගන්න*
`;

    // ================= BUTTON MODE =================
    if (config.BUTTON === "true") {

      let rows = d.downloads.map(v => ({
        title: `${v.size} (${v.quality})`,
        id: `${prefix}torren ${v.magnet}±${d.image}±${d.title}±${v.quality}`
      }));

      rows.unshift({
        title: "📄 Movie Details",
        id: `${prefix}ytsinfo ${url}`
      });

      const listButtons = {
        title: "🎬 Choose Option",
        sections: [{
          title: "Available Links",
          rows
        }]
      };

      await conn.sendMessage(from, {
        image: { url: img },
        caption: msg,
        footer: config.FOOTER,
        buttons: [{
          buttonId: "download_list",
          buttonText: { displayText: "⬇️ Download" },
          type: 4,
          nativeFlowInfo: {
            name: "single_select",
            paramsJson: JSON.stringify(listButtons)
          }
        }],
        headerType: 1,
        viewOnce: true
      }, { quoted: mek });

    }
    // ================= OLD MODE =================
    else {

      let buttons = [];

      buttons.push({
        buttonId: `${prefix}ytsinfo ${url}`,
        buttonText: { displayText: "Movie Details\n" },
        type: 1
      });

      d.downloads.forEach(v => {
        buttons.push({
          buttonId: `${prefix}torren ${v.magnet}±${d.image}±${d.title}±${v.quality}`,
          buttonText: { displayText: `${v.size} (${v.quality})`.replace("WEBDL", "")
	     .replace("WEB DL", "")
        .replace("BluRay HD", "") 
	.replace("BluRay SD", "") 
	.replace("BluRay FHD", "") 
	.replace("Telegram BluRay SD", "") 
	.replace("Telegram BluRay HD", "") 
		.replace("Direct BluRay SD", "") 
		.replace("Direct BluRay HD", "") 
		.replace("Direct BluRay FHD", "") 
		.replace("FHD", "") 
		.replace("HD", "") 
		.replace("SD", "") 
		.replace("Telegram BluRay FHD", "") },
          type: 1
        });
      });

      await conn.buttonMessage(from, {
        image: { url: img },
        caption: msg,
        footer: config.FOOTER,
        buttons,
        headerType: 4
      }, mek);
    }

  } catch (e) {
    console.log(e);
    reply("*Error ❗*");
  }
});

cmd({
  pattern: "ytsinfo",
  react: "🎬",
	 category: "movie",
  desc: "YTS movie downloader",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
  try {

    if (!q) return reply("*❗ Missing movie data!*");

   // const [url, img, title] = q.split("±");

    const api =
      `https://api-dark-shan-yt.koyeb.app/movie/ytsmx-download?url=${encodeURIComponent(q)}&apikey=${key}`;

    const res = (await axios.get(api)).data;
    const d = res.data;

    let msg =
`*_▫🍿 Title ➽ ${d.title}_*

▫📅 Year ➽ ${d.year}
▫⭐ IMDB ➽ ${d.rating}
▫🎬 Info ➽ ${d.time}
*➣➣➣➣➣➣➣➣➣➣➣➣➣*
🪀Follow us : https://whatsapp.com/channel/0029VbCA4fF9RZAfkahNsr0s
*➣➣➣➣➣➣➣➣➣➣➣➣➣*
${config.FOOTER}
`;


      await conn.sendMessage(config.JID || from, {
        image: { url: d.image },
        caption: msg
      }, { quoted: mek });

  } catch (e) {
    console.log(e);
    reply("*🚩 Error fetching movie!*");
  }
});


const uploader = "nadeen";

cmd({
    pattern: "torren",
    react: '⬇️',
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        const [dllink, img, title, qulity] = q.split("±");
        const mail = config.SEEDR_MAIL;
        const password = config.SEEDR_PASSWORD;

        if (!mail || !password) return reply("*Please add Seedr credentials!*");

        const seedr = new Seedr();
        await seedr.login(mail, password);

        const msg = await conn.sendMessage(from, { text: '*Checking Seedr status... 🔍*' }, { quoted: mek });

        // 1. පරණ ෆයිල්ස් මකාදැමීම හෝ පවතින ෆයිල් එක පරීක්ෂා කිරීම
        const currentFiles = await seedr.getVideos();
        let fileAlreadyExists = false;

        if (currentFiles && currentFiles.length > 0) {
            for (let folder of currentFiles) {
                for (let file of folder) {
                    if (file.name.includes(title)) fileAlreadyExists = true;
                }
            }
        }

        if (!fileAlreadyExists) {
            await conn.sendMessage(from, { text: '*Uploading movie... ⬆*', edit: msg.key });
            if (currentFiles) {
                for (let folder of currentFiles) {
                    for (let file of folder) await seedr.deleteFile(file.id);
                    if (folder && folder.fid) await seedr.deleteFolder(folder.fid);
                }
            }
            await seedr.addMagnet(dllink);
        }

        // 2. ෆයිල් එක සම්පූර්ණයෙන්ම Seedr එකට බාගත වෙනකල් බලන් ඉන්න (Polling)
        let success = false;
        for (let i = 0; i < 40; i++) { // මිනිත්තු 20ක් විතර බලමු
            await new Promise(r => setTimeout(r, 30000));
            const info = await seedr.getVideos();
            
            if (info && info.length > 0) {
                for (let folder of info) {
                    for (let file of folder) {
                        // මෙතනදී අපි file.size එක පරීක්ෂා කරනවා (සමහර විට progress එක බලාගන්න පුළුවන්)
                        // Seedr එකේ file එක ලෑස්ති නම් පමණක් ගොඩක් වෙලාවට fileData.url එක එනවා
                        const fileData = await seedr.getFile(file.id);
                        
                        if (fileData && fileData.url) {
                            success = true;
                            // 3. බාගත වීම සාර්ථක නම් බොට් හරහා fetch කර යැවීම
                            const buffer = await (await fetch(img)).buffer();
                            await conn.sendMessage(config.JID || from, {
                                document: { url: fileData.url },
                                mimetype: "video/mp4",
                                fileName: `${title}.mp4`,
                                jpegThumbnail: buffer,
                                caption: `*🎬 Name :* ${title}\n\n\`[${qulity}]\`\n${config.NAME}\n\n${config.FOOTER}`
                            });
                            break;
                        }
                    }
                    if (success) break;
                }
            }
            if (success) break;
            console.log(`Still downloading to Seedr... Attempt ${i+1}`);
        }

        if (!success) {
            return await conn.sendMessage(from, { text: '*❌ Error: Link not found or download took too long! Restarting...*', edit: msg.key });
        }
        
        await conn.sendMessage(from, { text: `*Movie sent successfully! ✔*`, edit: msg.key });
        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        console.error(e);
        reply(`❌ *Error:* ${e.message}`);
    }
});

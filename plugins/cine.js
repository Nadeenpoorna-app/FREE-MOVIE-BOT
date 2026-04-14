
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
// CINESUBZ SEARCH  (NEW API)
//---------------------------------------------
//---------------------------------------------
// CINESUBZ SEARCH
//---------------------------------------------
cmd({
  pattern: "cine",
  react: '🔎',
  category: "movie",
  alias: ["cinesubz"],
  desc: "cinesubz.lk movie search",
  use: ".cine 2025",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        


    if (!q) return reply("*❗ Please give a movie name*");

    const api =
      `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-search?q=${q}&apikey=${key}`;
    const data = (await axios.get(api)).data;

    if (!data?.data?.length)
      return reply("*❌ No results found!*");

    // ================= BUTTON MODE =================
    if (config.BUTTON === "true") {

      const rows = data.data.map(v => {
        let cmdType = v.link.includes("/tvshows/")
          ? "cinetvdl"
          : "cinedl";

        return {
          title: v.title.replace("Sinhala Subtitles", "").trim(),
          id: `${prefix}${cmdType} ${v.link}±${v.image}±${v.title}`
        };
      });

      const listButtons = {
        title: "🎬 Choose a Movie",
        sections: [{
          title: "Cinesubz Results",
          rows
        }]
      };

      await conn.sendMessage(from, {
        image: { url: config.LOGO },
        caption: `_*CINESUBZ SEARCH RESULTS 🎬*_\n\n*Input:* ${q}`,
        footer: config.FOOTER,
        buttons: [{
          buttonId: "movie_list",
          buttonText: { displayText: "🎥 Select Option" },
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

      let rows = [];
      data.data.forEach(v => {
        let cmdType = v.link.includes("/tvshows/")
          ? "cinetvdl"
          : "cinedl";

        rows.push({
          title: v.title.replace("Sinhala Subtitles | සිංහල උපසිරැසි සමඟ", "").replace("Sinhala Subtitle | සිංහල උපසිරැසි සමඟ", "").trim(),
          rowId: `${prefix}${cmdType} ±${v.link}±${v.image}±${v.title}`
        });
      });

      await conn.listMessage(from, {
        text: `_*CINESUBZ SEARCH RESULTS 🎬*_\n\n\`🕵️‍♂️Input:\` ${q}`,
        footer: config.FOOTER,
        title: "Cinesubz Results",
        buttonText: "Reply Below Number 🔢",
        sections: [{
          title: "Results",
          rows
        }]
      }, mek);
    }

  } catch (e) {
    console.log(e);
    reply("*Error ❗*");
  }
});



//---------------------------------------------
// CINESUBZ INFO + DL LINKS
//---------------------------------------------
//---------------------------------------------
// CINESUBZ INFO + DL LINKS
//---------------------------------------------
cmd({
  pattern: "cinedl",
  react: "🎥",
  category: "movie",
  desc: "movie downloader",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        if (!q || !q.includes("movies"))
            return reply("*❗ Please use movie link only!*");

        console.log(`🧿Input`, q);
        const [title, url, img] = q.split("±");

        const infoAPI = `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-info?url=${encodeURIComponent(url)}&apikey=${key}`;
        const data = (await axios.get(infoAPI)).data;
        const d = data.data;

        const directors = (d.directors || "").replace(/Director:?/gi, "").trim();

        let msg = `*_▫🍿 Title ➽ ${d.title}_*\n\n▫📅 Year ➽ ${d.year}\n▫⭐ IMDB ➽ ${d.rating}\n▫⏳ Runtime ➽ ${d.duration}\n▫🌎 Country ➽ ${d.country}\n▫💎 Quality ➽ ${d.quality}\n▫🕵️ Director ➽ ${directors}\n▫🔉 Language ➽ ${d.tag}\n`;

        // ================= BUTTON MODE (List View) =================
        if (config.BUTTON === "true") {
            let rows = [];

            // මුලින්ම Movie Details Button එක එකතු කරනවා
            rows.push({
                title: "📄 Movie Details",
                id: `${prefix}ctdetails ±±${url}±${img}±${d.title}`
            });

            // 2GB ට අඩු download links පමණක් filter කර rows වලට එකතු කරනවා
            d.downloads.forEach(v => {
                let isLarge = v.size.includes('GB') && parseFloat(v.size) >= 2.0;
                if (!isLarge) {
                    rows.push({
                        title: `${v.size} (${v.quality})`,
                        id: `${prefix}paka ${img}±${v.link}±${d.title}±${v.quality}`
                    });
                }
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
        // ================= OLD MODE (Normal Buttons) =================
        else {
            let buttons = [];

            buttons.push({
                buttonId: `${prefix}ctdetails ±±${url}±${img}±${d.title}`,
                buttonText: { displayText: "Movie Details\n" },
                type: 1
            });

            d.downloads.forEach(v => {
                // මෙතනදීත් 2GB check එක සිදු කරනවා
                let isLarge = v.size.includes('GB') && parseFloat(v.size) >= 2.0;

                if (!isLarge) {
                    buttons.push({
                        buttonId: `${prefix}paka ${img}±${v.link}±${d.title}±${v.quality}`,
                        buttonText: { 
                            displayText: `${v.size} (${v.quality})`
                                .replace(/WEBDL|WEB DL|BluRay HD|BluRay SD|BluRay FHD|Telegram BluRay SD|Telegram BluRay HD|Direct BluRay SD|Direct BluRay HD|Direct BluRay FHD|FHD|HD|SD|Telegram BluRay FHD/gi, "")
                                .trim() 
                        },
                        type: 1
                    });
                }
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


// ------------------ CINETVDL ------------------
// ------------------ CINETVDL ------------------
cmd({
  pattern: "cinetvdl",
  react: "📺",
 category: "movie",
  desc: "TV Show details + season selector",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
       

    if (!q || !q.includes("tvshows"))
      return reply("*❗ Please use a valid TV Show link!*");

    console.log("📺 Input:", q);

    const [title, urls, img] = q.split("±");
let url = urls.replace('cinesubz.net', 'cinesubz.lk');
    const infoAPI =
      `https://episodes-cine.vercel.app/api/details?url=${encodeURIComponent(url)}`;

    const data = (await axios.get(infoAPI)).data;
    const d = data.result;

    /* ================= DETAILS CARD ================= */

    let detailsMsg =
      `*_▫️️🍀 Tɪᴛʟᴇ ➽ ${d.title}_*\n` +
      `*_▫️️📅 Yᴇᴀʀ ➽ ${d.year}_*\n` +
      `*_▫️️⭐ Iᴍᴅʙ ➽ ${d.imdb}_*\n` +
      `*_▫️️📺 Sᴇᴀsᴏɴs ➽ ${d.seasons.length}_*\n\n` +
      `*_▫️️🧿 Dᴇsᴄʀɪᴘᴛɪᴏɴ ➽_*\n${d.description}`;

    await conn.sendMessage(from, {
      image: { url: img },
      caption: detailsMsg,
      footer: config.FOOTER
    }, { quoted: mek });

    /* ================= SEASON SELECT ================= */

    let msg =
      `📂 *Select a Season Below*\n` +
      `🎬 *${d.title}*`;

    // ===== BUTTON MODE =====
    if (config.BUTTON === "true") {

      const rows = d.seasons.map(s => ({
        title: `Season ${s.season}`,
        id: `${prefix}cinetvep ${img}±${url}±${d.title}±${s.season}`
      }));

      const listButtons = {
        title: "📺 Select Season",
        sections: [{
          title: "Available Seasons",
          rows
        }]
      };

      await conn.sendMessage(from, {
        text: msg,
        footer: config.FOOTER,
        buttons: [{
          buttonId: "season_list",
          buttonText: { displayText: "📂 Open Seasons" },
          type: 4,
          nativeFlowInfo: {
            name: "single_select",
            paramsJson: JSON.stringify(listButtons)
          }
        }],
        viewOnce: true
      });

    } 
    // ===== OLD LIST MODE =====
    else {

      let rows = [];
      d.seasons.forEach(s => {
        rows.push({
          title: `Season ${s.season}`,
          rowId: `${prefix}cinetvep ${img}±${url}±${d.title}±${s.season}`
        });
      });

      const listMessage = {
        text: msg,
        footer: config.FOOTER,
        title: "📺 TV Show Seasons",
        buttonText: "Reply Below Number 🔢",
        sections: [{
          title: "Available Seasons",
          rows
        }]
      };

      await conn.listMessage(from, listMessage, mek);
    }

  } catch (e) {
    console.log(e);
    reply("*❌ Error fetching TV show!*");
  }
});

// ------------------ CINETVEP ------------------
// ------------------ CINETVEP ------------------
cmd({
  pattern: "cinetvep",
  react: "📺",
category: "movie",
  desc: "Select episodes for a season",
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
    if (!q) return reply("*❗ Missing season data!*");

    const [img, url, title, seasonNumber] = q.split("±");

    const infoAPI =
      `https://episodes-cine.vercel.app/api/details?url=${encodeURIComponent(url)}`;

    const data = (await axios.get(infoAPI)).data;
    const d = data.result;

    const season = d.seasons.find(s => s.season == seasonNumber);
    if (!season) return reply("*❌ Season not found!*");

    let msg =
      `🎬 *${title}*\n` +
      `📺 *Season:* ${seasonNumber}\n\n` +
      `📂 *Select Option Below*`;

    // ================= BUTTON MODE =================
    if (config.BUTTON === "true") {

      let rows = [];

      // 🔥 ALL EPISODES OPTION (FIRST)
      rows.push({
        title: "📦 ALL EPISODES",
        id: `${prefix}cineall ${img}±${url}±${title}±${seasonNumber}`
      });

      // 🔹 NORMAL EPISODES
      season.episodes.forEach(ep => {
        rows.push({
          title: `Episode ${ep.episode}`,
          id: `${prefix}cinetvepi ${img}±${ep.url}±${title}±${ep.episode}±${seasonNumber}`
        });
      });

      const listButtons = {
        title: `📺 Episodes – Season ${seasonNumber}`,
        sections: [{
          title: "Available Options",
          rows
        }]
      };

      await conn.sendMessage(from, {
        image: { url: img },
        caption: msg,
        footer: config.FOOTER,
        buttons: [{
          buttonId: "episode_list",
          buttonText: { displayText: "📥 Open List" },
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

      let rows = [];

      rows.push({
        title: "📦 ALL EPISODES",
        rowId: `${prefix}cineall ${img}±${url}±${title}±${seasonNumber}`
      });

      season.episodes.forEach(ep => {
        rows.push({
          title: `Episode ${ep.episode}`,
          rowId: `${prefix}cinetvepi ${img}±${ep.url}±${title}±${ep.episode}±${seasonNumber}`
        });
      });

      await conn.listMessage(from, {
        text: msg,
        footer: config.FOOTER,
        title: `📺 Episodes – Season ${seasonNumber}`,
        buttonText: "Reply Below Number 🔢",
        sections: [{
          title: "Available Options",
          rows
        }]
      }, mek);
    }

  } catch (e) {
    console.log(e);
    reply("*❌ Error fetching episodes!*");
  }
});


// ------------------ CINETVEPI ------------------
// ------------------ CINETVEPI ------------------
cmd({
  pattern: "cinetvepi",
  react: "📥",
	 category: "movie",
  desc: "TV Episode download links",
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

    if (!q) return reply("*❗ Missing episode data!*");

    console.log("📡 Episode Input:", q);

    const [img, epUrl, title, episodeNumber, season] = q.split("±");

    const api = `https://api-dark-shan-yt.koyeb.app/episode/cinesubz-info?url=${encodeURIComponent(epUrl)}&apikey=${key}`;
		const response = await axios.get(api);
const res = response.data; 

        // API එකේ 'status' true ද සහ 'result.data.download' තිබේදැයි බලන්න
        if (!res.status || !res.data || !res.data.download || res.data.download.length === 0) {
            console.log("API Response Error:", res); // Debugging සඳහා
            return reply("*❌ No download links found!*");
        }

    let msg =
      `🎬 *${title}*\n` +
      `📺 *Episode:* ${episodeNumber}\n\n` +
      `⬇️ *Select download quality below*`;

    // ================= BUTTON MODE =================
    if (config.BUTTON === "true") {

      const rows = res.data.download.map(dl => ({
        title: `${dl.quality} (${dl.size})`,
        id: `${prefix}pakatv ${img}±${dl.link}±${title}±${episodeNumber}±${dl.quality}±${season}`
      }));

      const listButtons = {
        title: `📥 Episode ${episodeNumber} Downloads`,
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
          buttonText: { displayText: "⬇️ Select Download" },
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

      let rows = [];
      res.data.download.forEach(dl => {
        rows.push({
          title: `${dl.quality} (${dl.size})`,
          rowId: `${prefix}pakatv ${img}±${dl.link}±${title}±${episodeNumber}±${dl.quality}±${season}`
        });
      });

      const listMessage = {
        text: msg,
        footer: config.FOOTER,
        title: `📥 Episode ${episodeNumber}`,
        buttonText: "Reply Below Number 🔢",
        sections: [{
          title: "Available Downloads",
          rows
        }]
      };

      await conn.listMessage(from, listMessage, mek);
    }

  } catch (e) {
    console.log(e);
    reply("*❌ Error fetching episode download links!*");
  }
});




let isUploading = false;

cmd({
  pattern: "paka",
  react: "⬇️",
  dontAddCommandList: true,
  filename: __filename
},
async (conn, mek, m, { from, q, isSudo,isOwner,isMe,isPre, reply }) => {

	 try {
		

  if (!q) return reply("*❗ Missing download data!*");
  if (isUploading) return reply("*⏳ Another upload is in progress…*");

 // try {
    isUploading = true;

    console.log(`🤹🏼‍♂️ Final-dl:`, q);

    // q → img ± url ± title ± quality
    const [img, url, title, quality] = q.split("±");

    // Fetch download list
    const finalAPI =
      `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-download?url=${encodeURIComponent(url)}&apikey=${key}`;

    const data = (await axios.get(finalAPI)).data;

    const downloads = data?.data?.download;
    if (!downloads) return reply("*❌ No download links found!*");

    // ============================================
    // 🔥 SELECT BEST LINK (cloud → pix fallback)
    // ============================================
    let finalLink = null;

    // Remove Telegram links completely
    const filtered = downloads.filter(v => v.name !== "telegram");

    // 1) Try "cloud"
    const cloud = filtered.find(v => v.name === "unknown");
    if (cloud) finalLink = cloud.url;

	  if (!finalLink) {
	  const pix = filtered.find(v => v.name === "pix");
    if (pix) finalLink = pix.url;
	  }

    // 2) Else try pix
    if (!finalLink) {
      const gdrive = filtered.find(v => v.name === "gdrive");
      const GLink = gdrive.url;
let res = await fg.GDriveDl(GLink.replace('https://drive.usercontent.google.com/download?id=', 'https://drive.google.com/file/d/').replace('&export=download' , '/view'))

if (gdrive) finalLink = res.downloadUrl;
    }

    if (!finalLink)
      return reply("*❌ Valid download link not found!*");

    // Send uploading message
    const upmsg = await conn.sendMessage(from, { text: "*⬆️ Uploading movie...*" });

    console.log(`link:`, finalLink)

//https://i.ibb.co/m1fg0Cx/IMG-20251031-WA0012.jpg
	 const botimg = img;
async function resizeImage(buffer, width, height) {
  return await sharp(buffer)
    .resize(width, height)
    .toBuffer();
}
	  const botimgUrl = botimg;
        const botimgResponse = await fetch(botimgUrl);
        const botimgBuffer = await botimgResponse.buffer();
        
        // Resize image to 200x200 before sending
        const resizedBotImg = await resizeImage(botimgBuffer, 200, 200); 
	  
    await conn.sendMessage(config.JID || from, {
      document: { url: finalLink },
      mimetype: "video/mp4",
      caption: `🎬 *${title}*\n\n\`[${quality}]\`\n\n★━━━━━━━━✩━━━━━━━━★\n\n> *•ɴᴀᴅᴇᴇɴ-ᴍᴅ•*`,
      jpegThumbnail: resizedBotImg,
      fileName: `〽${title}.mp4`
    });

    await conn.sendMessage(from, { delete: upmsg.key });
    await conn.sendMessage(from, {
      react: { text: '✔️', key: mek.key }
    });

  } catch (e) {
    console.log("❌ paka error:", e);
    reply("*❗ Error while downloading*");
  }

  isUploading = false;
});


let isUploadingzm = false;

cmd({
  pattern: "pakatv",
  react: "⬇️",
	 category: "movie",
  dontAddCommandList: true,
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
		 isUploadingzm = false;
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isPre;

        if (!isAuthorized) {
            // API එකෙන් පණිවිඩය ලබාගැනීම
            const { data } = await axios.get('https://nadeen-botzdatabse.vercel.app/data.json');
            
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii


  if (!q) return reply("*❗ Missing download data!*");
  if (isUploadingzm) return reply("*⏳ Another upload is in progress…*");
   
 

    console.log(`🤹🏼‍♂️ Final-dl:`, q);

    // q → img ± url ± title ± quality
    const [img, url, title, num, quality, season] = q.split("±");
console.log(`🤹🏼‍♂️ link:`, url);
    // Fetch download list
    const finalAPI =
      `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-download?url=${encodeURIComponent(url)}&apikey=${key}`;

    const data = (await axios.get(finalAPI)).data;

    const downloads = data?.data?.download;
    if (!downloads) return reply("*❌ No download links found!!!*");

    // ============================================
    // 🔥 SELECT BEST LINK (cloud → pix fallback)
    // ============================================
    let finalLink = null;

    // Remove Telegram links completely
    const filtered = downloads.filter(v => v.name !== "telegram");

  // 1. මුලින්ම Google Drive (GDrive) පරීක්ෂා කිරීම
const gdrive = filtered.find(v => v.name === "gdrive");
if (gdrive) {
    try {
        const GLink = gdrive.url;
        // URL එක convert කර download link එක ලබා ගැනීම
        let res = await fg.GDriveDl(GLink.replace('https://drive.usercontent.google.com/download?id=', 'https://drive.google.com/file/d/').replace('&export=download' , '/view'));
        if (res && res.downloadUrl) {
            finalLink = res.downloadUrl;
        }
    } catch (e) {
        console.log("GDrive Download Error:", e);
    }
}

// 2. GDrive නැත්නම් හෝ වැඩ නොකරයි නම් "pix" පරීක්ෂා කිරීම
if (!finalLink) {
    const pix = filtered.find(v => v.name === "pix");
    if (pix) finalLink = pix.url;
}

// 3. තවමත් link එකක් නැත්නම් "unknown" පරීක්ෂා කිරීම
if (!finalLink) {
    const unknown = filtered.find(v => v.name === "unknown");
    if (unknown) finalLink = unknown.url;
}

// අවසාන පරීක්ෂාව
if (!finalLink) return reply("*❌ Could not retrieve a direct download link!*");

    // Send uploading message
    const upmsg = await conn.sendMessage(from, { text: "*⬆️ Uploading Episode...*" });

    console.log(`link:`, finalLink)
	  const botimgUrl = img;
        const botimgResponse = await fetch(botimgUrl);
        const botimgBuffer = await botimgResponse.arrayBuffer();
        
        // Resize image to 200x200 before sending
        const resizedBotImg = await resizeImage(botimgBuffer, 200, 200);
	  
    await conn.sendMessage(config.JID || from, {
      document: { url: finalLink},
      mimetype: "video/mp4",
      caption: `📺 *${title}*\n*[S0${season} | Episode ${num}]*\n\n\`[WEB-DL ${quality}]\`\n\n★━━━━━━━━✩━━━━━━━━★`,
      jpegThumbnail: resizedBotImg,
      fileName: `${title}(${quality}).mp4`
    });

    await conn.sendMessage(from, { delete: upmsg.key });
    await conn.sendMessage(from, {
      react: { text: '✔️', key: mek.key }
    });

  } catch (e) {
    console.log("❌ paka error:", e);
    reply("*❗ Error while downloading*");
  }

  isUploadingzm = false;
});

// ------------------ CINEALL ------------------
cmd({
  pattern: "cineall",
  react: "📦",
	 category: "movie",
  desc: "Select quality for ALL episodes",
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

    const [img, url, title, season] = q.split("±");

    const msg =
`📦 *ALL EPISODES*
🎬 ${title}
📺 *Season ${season}*

⬇️ *Select Quality*`;

    // ================= BUTTON MODE =================
    if (config.BUTTON === "true") {

      const rows = [
        { title: "480p", id: `${prefix}cineallq 480p±${q}` },
        { title: "720p", id: `${prefix}cineallq 720p±${q}` },
        { title: "1080p", id: `${prefix}cineallq 1080p±${q}` }
      ];

      await conn.sendMessage(from, {
        image: { url: img },
        caption: msg,
        footer: config.FOOTER,
        buttons: [{
          buttonId: "quality",
          buttonText: { displayText: "🎞 Choose Quality" },
          type: 4,
          nativeFlowInfo: {
            name: "single_select",
            paramsJson: JSON.stringify({
              title: "Select Quality",
              sections: [{
                title: "Available Qualities",
                rows
              }]
            })
          }
        }],
        headerType: 1,
        viewOnce: true
      }, { quoted: mek });

    }

    // ================= OLD MODE =================
    else {

      const rows = [
        { title: "480p", rowId: `${prefix}cineallq 480p±${q}` },
        { title: "720p", rowId: `${prefix}cineallq 720p±${q}` },
        { title: "1080p", rowId: `${prefix}cineallq 1080p±${q}` }
      ];

      await conn.listMessage(from, {
        text: msg,
        footer: config.FOOTER,
        title: "📦 Select Quality",
        buttonText: "Reply Below Number 🔢",
        sections: [{
          title: "Available Qualities",
          rows
        }]
      }, mek);
    }

  } catch (e) {
    console.log(e);
    reply("*❌ Error showing quality list*");
  }
});

// ------------------ CINEALLQ ------------------
// ------------------ CINEALLQ (Download All Episodes) ------------------
cmd({
    pattern: "cineallq",
    react: "📥",
    category: "movie",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply, config }) => {
    try {
        // 1. බලය පරීක්ෂා කිරීම (Authorization)
        const isAuthorized = isMe || isOwner || isSudo || isPre;
        if (!isAuthorized) {
            const { data } = await axios.get('https://nadeen-botzdatabse.vercel.app/data.json');
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }

        if (!q) return reply("*❗ දත්ත අසම්පූර්ණයි!*");
        const [quality, img, urlz, title, season] = q.split("±");
        
        const url = urlz.replace('cinesubz.net', 'cinesubz.lk');
        const wantQ = quality.replace("p", ""); // 480p -> 480
        
        // ඉහතින් ඇති key එක භාවිතා කරයි (82406ca340409d44)
        const apikey = key; 

        await reply(`✅ *Qulity:* ${quality}\n🚀 *Season ${season} All Episodes Downalding Start...*`);

        // 2. එපිසෝඩ් ලැයිස්තුව ලබා ගැනීම
        const infoAPI = `https://episodes-cine.vercel.app/api/details?url=${encodeURIComponent(url)}`;
        const { data: episodeListData } = await axios.get(infoAPI);
        const seasonData = episodeListData.result.seasons.find(s => s.season == season);
        
        if (!seasonData) return reply(`*❌ සීසන් ${season} සොයාගත නොහැකි විය!*`);

        // 3. එපිසෝඩ් එකින් එක ලූප් එකක් හරහා යැවීම
        for (const ep of seasonData.episodes) {
            try {
                console.log(`🎬 Processing Episode: ${ep.episode}`);

                // Step A: එපිසෝඩ් එකේ ඩවුන්ලෝඩ් ලින්ක්ස් ලබාගැනීම
                const epInfoAPI = `https://api-dark-shan-yt.koyeb.app/episode/cinesubz-info?url=${encodeURIComponent(ep.url)}&apikey=${apikey}`;
                const epRes = (await axios.get(epInfoAPI)).data;

                if (!epRes.data || !epRes.data.download) continue;

                // Step B: අවශ්‍ය Quality එකට අදාළ ලින්ක් එක සෙවීම
                const selectedQuality = epRes.data.download.find(v => v.quality.includes(wantQ));
                if (!selectedQuality) continue;

                // Step C: Direct ඩවුන්ලෝඩ් ලින්ක් එක (Pixeldrain/Cloud) ලබාගැනීම
                const finalAPI = `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-download?url=${encodeURIComponent(selectedQuality.link)}&apikey=${apikey}`;
                const finalData = (await axios.get(finalAPI)).data;

                if (!finalData.status || !finalData.data.download) continue;

                const downloads = finalData.data.download;
                // Pixeldrain හෝ unknown (cloud) ලින්ක් එක තෝරා ගැනීම
                const bestLinkObj = downloads.find(v => v.name === "pix") || downloads.find(v => v.name === "unknown");

                if (!bestLinkObj || !bestLinkObj.url) continue;
configs = require('../config');
                // 4. වීඩියෝව WhatsApp වෙත යැවීම
                let thumbBuffer = null;
                try {
                    const imgRes = await axios.get(img, { responseType: 'arraybuffer' });
                    thumbBuffer = Buffer.from(imgRes.data);
                } catch (e) { thumbBuffer = null; }
console.log(`🎬 Processing URL: ${bestLinkObj.url}`);
                await conn.sendMessage( configs.JID || from, {
                    document: { url: bestLinkObj.url },
                    mimetype: "video/mp4",
                    fileName: `${title} S${season}E${ep.episode} [${quality}].mp4`,
                    jpegThumbnail: thumbBuffer ? await resizeImage(thumbBuffer, 200, 200) : null,
                    caption: `📺 *${title}*\n` +
                             `*[Season ${season} | Episode ${ep.episode}]*\n\n` +
                             `\`[Quality: ${quality}]\`\n\n` +
                             `> ${configs.FOOTER}`
                });

                // WhatsApp තහනම් වීම වැළැක්වීමට තත්පර 5 ක විවේකයක් (Delay)
                await new Promise(resolve => setTimeout(resolve, 5000));

            } catch (err) {
                console.log(`❌ Error in Ep ${ep.episode}:`, err.message);
            }
        }

        await reply("✅ *All Episodes Uploaded!*");

    } catch (e) {
        console.log(e);
        reply("*❌ පද්ධතියේ දෝෂයක් පවතී. පසුව උත්සාහ කරන්න.*");
    }
});

cmd({
  pattern: "ctdetails",
  react: "🎬",
	 category: "movie",
  desc: "Show movie details with Join Us link",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
       


    if (!q) return await reply("*❗ Please provide a movie link!*");

    const [title, test, url, img] = q.split("±");
console.log(`💤Input:`, q)
	  console.log(`💤img:`, img)
	  console.log(`💤link:`, url)
    const infoAPI = `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-info?url=${encodeURIComponent(url)}&apikey=${key}`;
    const data = (await axios.get(infoAPI)).data;
    const d = data.data;

    const directors = (d.directors || "").replace(/Director:?/gi, "").trim();

    let msg = `*_▫️️🍀 Tɪᴛʟᴇ ➽ ${d.title}_*\n` +
      `*_▫️️📅 Yᴇᴀʀ ➽ ${d.year}_*\n` +
      `*_▫️️⭐ Iᴍᴅʙ ➽ ${d.rating}_*\n` +
      `*_▫️️⏳ Rᴜɴᴛɪᴍᴇ ➽ ${d.duration}_*\n` +
      `*_▫️️🌎 Cᴏᴜɴᴛʀʏ ➽ ${d.country}_*\n` +
      `*_▫️️💎 Qᴜᴀʟɪᴛʏ ➽ ${d.quality}_*\n` +
      `*_▫️️🕵️ Dɪʀᴇᴄᴛᴏʀ ➽ ${directors}_*\n` +
      `*_▫️️🔉 Lᴀɴɢᴜᴀɢᴇ ➽ ${d.tag}_*\n\n` +
	   `*➣➣➣➣➣➣➣➣➣➣➣➣➣*`+
      `_🔗 *J๏เи µร*_ ➽ *https://whatsapp.com/channel/0029VagN2qW3gvWUBhsjcn3I*\n*➣➣➣➣➣➣➣➣➣➣➣➣➣*`;

    // Send details card only (no download buttons)
    await conn.sendMessage(config.JID, {
      image: { url: img },
      caption: msg,
      footer: config.FOOTER
    }, { quoted: mek });

    // React with ✔️
    await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

  } catch (e) {
    console.log(e);
    await reply("*❗ Error fetching movie details*");
  }
});

cmd({
  pattern: "ctvdetails",
  react: "📺",
	 category: "movie",
  desc: "Show TV series details",
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


    if (!q) return reply("*❗ Please provide a TV show link!*");

    const [title, test, url, img] = q.split("±");

    console.log("📺 Input:", q);
    console.log("🖼 Image:", img);
    console.log("🔗 Link:", url);

    const infoAPI =
      `https://episodes-cine.vercel.app/api/details?url=${encodeURIComponent(url)}`;

    const data = (await axios.get(infoAPI)).data;
    const d = data.result;

    let msg =
      `*_▫️️🍀 Tɪᴛʟᴇ ➽ ${d.title}_*\n` +
      `*_▫️️📅 Yᴇᴀʀ ➽ ${d.year}_*\n` +
      `*_▫️️⭐ Iᴍᴅʙ ➽ ${d.imdb}_*\n` +
      `*_▫️️📺 Sᴇᴀsᴏɴs ➽ ${d.seasons.length}_*\n` +
      `*_▫️️🌎 Cᴏᴜɴᴛʀʏ ➽ ${d.country || "N/A"}_*\n\n` +
      `*_▫️️🧿 Dᴇsᴄʀɪᴘᴛɪᴏɴ ➽_*\n${d.description}\n\n` +
      `*➣➣➣➣➣➣➣➣➣➣➣➣➣*\n` +
      `_🔗 *J๏เи µร*_ ➽ *https://whatsapp.com/channel/0029VagN2qW3gvWUBhsjcn3I*\n` +
      `*➣➣➣➣➣➣➣➣➣➣➣➣➣*`;

    // 📺 SEND IMAGE + DETAILS
    await conn.sendMessage(config.JID || from, {
      image: { url: img },
      caption: msg,
      footer: config.FOOTER
    }, { quoted: mek });

    // ✔️ react
    await conn.sendMessage(from, {
      react: { text: "✔️", key: mek.key }
    });

  } catch (e) {
    console.log(e);
    reply("*❗ Error fetching TV show details*");
  }
});

cmd(
  {
    pattern: 'pupilvideo',
    react: '\uD83D\uDD0E',
    category: 'movie',
    alias: ['sinhalafilm'],
    desc: 'pupilvideo.blogspot.com movie search',
    use: '.pupilvideot ape',
    filename: __filename,
  },
  async (
    _0x3c4d2a,
    _0x311992,
    _0x5ba3d1,
    {
      from: _0x18fe40,
      q: _0x4ea248,
      prefix: _0x2fb128,
      isMe: _0x491a7a,
      reply: _0x14cd3f,
    }
  ) => {
    try {
      if (!_0x4ea248) {
        return await _0x14cd3f('*Please provide a movie name!*')
      }
      let _0x141e7a = await fetchJson(
        'https://darksadas-yt-new-movie-search.vercel.app/?url=' + _0x4ea248
      )
      if (!_0x141e7a || !_0x141e7a.data || _0x141e7a.data.length === 0) {
        return (
          await _0x3c4d2a.sendMessage(_0x18fe40, {
            react: {
              text: '\u274C',
              key: _0x5ba3d1.key,
            },
          }),
          await _0x3c4d2a.sendMessage(
            _0x18fe40,
            { text: '*No results found \u274C*' },
            { quoted: _0x5ba3d1 }
          )
        )
      }
      var _0x102193 = []
      for (var _0x4cb9e3 = 0; _0x4cb9e3 < _0x141e7a.data.length; _0x4cb9e3++) {
        _0x102193.push({
          title: _0x141e7a.data[_0x4cb9e3].title,
          description: '',
          rowId: _0x2fb128 + 'newdl ' + _0x141e7a.data[_0x4cb9e3].link,
        })
      }
      const _0xc369 = [
          {
            title: 'pupilvideo.blogspot.com results',
            rows: _0x102193,
          },
        ],
        _0x5f0a95 = {
          text:
            '_*\uD83C\uDFACPUPILVIDEO MOVIE SEARCH RESULTS \uD83C\uDFAC*_\n\n*Movie Search : ' +
            _0x4ea248 +
            ' \uD83D\uDD0E*',
          footer: config.FOOTER,
          title: 'Search Results \uD83C\uDFAC',
          buttonText: '*Reply Below Number \uD83D\uDD22*',
          sections: _0xc369,
        }
      await _0x3c4d2a.listMessage(_0x18fe40, _0x5f0a95, _0x5ba3d1)
    } catch (_0x2c3eec) {
      console.log(_0x2c3eec)
      await _0x3c4d2a.sendMessage(
        _0x18fe40,
        { text: '\uD83D\uDEA9 *Error occurred!!*' },
        { quoted: _0x5ba3d1 }
      )
    }
  }
)
cmd(
  {
    pattern: 'newdl',
    react: '\uD83C\uDFA5',
	   category: "movie",
    desc: 'moive downloader',
    filename: __filename,
  },
  async (
    _0x407c64,
    _0x19e839,
    _0x23a6bb,
    {
      from: _0x143ba1,
      q: _0x11485c,
      isMe: _0x2fa8bb,
      prefix: _0x307246,
      reply: _0x806f15,
    }
  ) => {
    try {
      if (!_0x11485c) {
        return await _0x806f15('*please give me text !..*')
      }
      let _0x15d24d = await fetchJson(
          'https://darksadasyt-new-mv-site-info.vercel.app/?url=' + _0x11485c
        ),
        _0xad7e09 =
          '*\uD83C\uDF5F \uD835\uDDE7ɪᴛʟᴇ \u27AE*  _' +
          (_0x15d24d.title || 'N/A') +
          '_\n\n*\uD83D\uDCC5 \uD835\uDDE5ᴇʟᴇꜱᴇᴅ ᴅᴀᴛᴇ \u27AE*  _' +
          (_0x15d24d.date || 'N/A') +
          '_\n*\uD83D\uDC64 \uD835\uDDE6ᴜʙᴛɪᴛʟᴇ ʙʏ \u27AE* _' +
          (_0x15d24d.subtitle_author || 'N/A') +
          '_'
      if (_0x15d24d.downloadLinks.length < 1) {
        return await _0x407c64.sendMessage(
          _0x143ba1,
          { text: 'erro !' },
          { quoted: _0x23a6bb }
        )
      }
      var _0x5f49ed = []
      _0x5f49ed.push({
        buttonId: _0x307246 + 'dubdet ' + _0x11485c,
        buttonText: { displayText: 'Details send' },
        type: 1,
      })
      _0x15d24d.downloadLinks.map((_0x46cfda) => {
        _0x5f49ed.push({
          buttonId:
            _0x307246 +
            ('ndll ' +
              _0x15d24d.image +
              '\xB1' +
              _0x46cfda.link +
              '\xB1' +
              _0x15d24d.title),
          buttonText: { displayText: '' + _0x46cfda.title },
          type: 1,
        })
      })
      const _0xea21b7 = {
        image: { url: _0x15d24d.image },
        caption: _0xad7e09,
        footer: config.FOOTER,
        buttons: _0x5f49ed,
        headerType: 4,
      }
      return await _0x407c64.buttonMessage(_0x143ba1, _0xea21b7, _0x23a6bb)
    } catch (_0x19dacf) {
      console.log(_0x19dacf)
      await _0x407c64.sendMessage(
        _0x143ba1,
        { text: '\uD83D\uDEA9 *Error !!*' },
        { quoted: _0x23a6bb }
      )
    }
  }
)
async function resizeImage(_0x13f5d6, _0x5b7bd4, _0x43def1) {
  try {
    return await sharp(_0x13f5d6).resize(_0x5b7bd4, _0x43def1).toBuffer()
  } catch (_0x4c0996) {
    return console.error('Error resizing image:', _0x4c0996), _0x13f5d6
  }
}
cmd(
  {
    pattern: 'ndll',
    react: '\u2B07️',
	   category: "movie",
    dontAddCommandList: true,
    filename: __filename,
  },
  async (
    _0x2f0ef6,
    _0xd77443,
    _0x545d16,
    { from: _0x14af92, q: _0x16142, isMe: _0x3ce2c9, reply: _0x3e4568 }
  ) => {
    if (!_0x16142) {
      return await _0x3e4568('*Please provide a direct URL!*')
    }
    try {
      await _0x2f0ef6.sendMessage(
        _0x14af92,
        { text: '*Downloading your movie..\u2B07️*' },
        { quoted: _0xd77443 }
      )
      const _0x13ee02 = _0x16142.split('\xB1')[0],
        _0x5399c1 = _0x16142.split('\xB1')[1],
        _0x1a3677 = _0x16142.split('\xB1')[2],
        _0x29f4d8 = _0x5399c1 + '&download=true',
        _0x24c123 = _0x29f4d8.trim(),
        _0x49581f = await axios.get(_0x24c123, { responseType: 'arraybuffer' }),
        _0x27fa04 = Buffer.from(_0x49581f.data, 'binary'),
        _0x80bac7 = _0x13ee02,
        _0x3d0418 = await fetch(_0x80bac7),
        _0x17a7d5 = await _0x3d0418.buffer(),
        _0x2da743 = await resizeImage(_0x17a7d5, 200, 200),
        _0x2a71be = {
          document: _0x27fa04,
          caption:
            '\uD83C\uDFAC ' +
            _0x1a3677 +
            '\n\n' +
            config.NAME +
            '\n\n> _*\uD83C\uDFACNADEEN MD\uD83C\uDFAC*_',
          jpegThumbnail: _0x2da743,
          mimetype: 'video/mp4',
          fileName: _0x1a3677 + '.mp4',
        }
      await _0x2f0ef6.sendMessage(_0x14af92, {
        react: {
          text: '\u2B06️',
          key: _0xd77443.key,
        },
      })
      await _0x2f0ef6.sendMessage(
        _0x14af92,
        { text: '*Uploading your movie..\u2B06️*' },
        { quoted: _0xd77443 }
      )
      await _0x2f0ef6.sendMessage(config.JID, _0x2a71be)
      await _0x2f0ef6.sendMessage(_0x14af92, {
        react: {
          text: '\u2714️',
          key: _0xd77443.key,
        },
      })
    } catch (_0x5baf73) {
      console.error('Error fetching or sending', _0x5baf73)
      await _0x2f0ef6.sendMessage(_0x14af92, '*Error fetching or sending *', {
        quoted: _0xd77443,
      })
    }
  }
)
cmd(
  {
    pattern: 'dubmv',
    react: '\u2B07️',
	category: "movie",
    dontAddCommandList: true,
    filename: __filename,
  },
  async (
    _0x2f0ef6,
    _0xd77443,
    _0x545d16,
    { from: _0x14af92, q: _0x16142, isMe: _0x3ce2c9, reply: _0x3e4568 }
  ) => {
    if (!_0x16142) {
      return await _0x3e4568('*Please provide a direct URL!*')
    }
    try {
      await _0x2f0ef6.sendMessage(
        _0x14af92,
        { text: '*Downloading your movie..\u2B07️*' },
        { quoted: _0xd77443 }
      )
      const _0x13ee02 = _0x16142.split('\xB1')[0],
        _0x5399c1 = _0x16142.split('\xB1')[1],
        _0x1a3677 = _0x16142.split('\xB1')[2],
        _0x29f4d8 = _0x5399c1,
        _0x24c123 = _0x29f4d8.trim(),
        _0x49581f = await axios.get(_0x24c123, { responseType: 'arraybuffer' }),
        _0x27fa04 = Buffer.from(_0x49581f.data, 'binary'),
        _0x80bac7 = _0x13ee02,
        _0x3d0418 = await fetch(_0x80bac7),
        _0x17a7d5 = await _0x3d0418.buffer(),
        _0x2da743 = await resizeImage(_0x17a7d5, 200, 200),
        _0x2a71be = {
          document: _0x27fa04,
          caption:
            '\uD83C\uDFAC ' +
            _0x1a3677 +
            '\n\n' +
            config.NAME +
            '\n\n> _*\uD83C\uDFACNADEEN MD\uD83C\uDFAC*_',
          jpegThumbnail: _0x2da743,
          mimetype: 'video/mp4',
          fileName: _0x1a3677 + '.mp4',
        }
      await _0x2f0ef6.sendMessage(_0x14af92, {
        react: {
          text: '\u2B06️',
          key: _0xd77443.key,
        },
      })
      await _0x2f0ef6.sendMessage(
        _0x14af92,
        { text: '*Uploading your movie..\u2B06️*' },
        { quoted: _0xd77443 }
      )
      await _0x2f0ef6.sendMessage(config.JID, _0x2a71be)
      await _0x2f0ef6.sendMessage(_0x14af92, {
        react: {
          text: '\u2714️',
          key: _0xd77443.key,
        },
      })
    } catch (_0x5baf73) {
      console.error('Error fetching or sending', _0x5baf73)
      await _0x2f0ef6.sendMessage(_0x14af92, '*Error fetching or sending *', {
        quoted: _0xd77443,
      })
    }
  }
)
cmd(
  {
    pattern: 'dubdet',
    react: '\uD83C\uDFA5',
	   category: "movie",
    desc: 'moive downloader',
    filename: __filename,
  },
  async (
    _0x1875c6,
    _0x63b81d,
    _0x102c8d,
    { from: _0x5e2ca4, q: _0x3c3a9e, isMe: _0x4a995d, reply: _0x1e2b99 }
  ) => {
    try {
      if (!_0x3c3a9e) {
        return await _0x1e2b99('*please give me text !..*')
      }
      let _0x2f20f2 = await fetchJson(
        'https://darksadasyt-new-mv-site-info.vercel.app/?url=' + _0x3c3a9e
      )
      const _0x430178 = (
        await axios.get(
          'https://nadeen-botzdatabse.vercel.app/data.json'
        )
      ).data
      let _0x341eab =
        '*\uD83C\uDF5F \uD835\uDDE7ɪᴛʟᴇ \u27AE*  _' +
        (_0x2f20f2.title || 'N/A') +
        '_\n\n*\uD83D\uDCC5 \uD835\uDDE5ᴇʟᴇꜱᴇᴅ ᴅᴀᴛᴇ \u27AE*  _' +
        (_0x2f20f2.date || 'N/A') +
        '_\n*\uD83D\uDC81‍\u2642️ \uD835\uDDE6ᴜʙᴛɪᴛʟᴇ ʙʏ \u27AE* _' +
        (_0x2f20f2.subtitle_author || 'N/A') +
        '_\n\n> \uD83C\uDF1F Follow us : *' +
        _0x430178.chlink +
        '*\n\n> _*\uD83C\uDFACNADEEN MD\uD83C\uDFAC*_\n'
      await _0x1875c6.sendMessage(config.JID, {
        image: { url: _0x2f20f2.image },
        caption: _0x341eab,
      })
      await _0x1875c6.sendMessage(_0x5e2ca4, {
        react: {
          text: '\u2714️',
          key: _0x102c8d.key,
        },
      })
    } catch (_0x56c49e) {
      console.error('Error fetching or sending', _0x56c49e)
      await _0x1875c6.sendMessage(_0x5e2ca4, '*Error fetching or sending *', {
        quoted: _0x102c8d,
      })
    }
  }
)



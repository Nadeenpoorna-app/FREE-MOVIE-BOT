const config = require('../config'),
  { cmd, commands } = require('../command'),
  axios = require('axios'),
  sharp = require('sharp'),
	fg = require('api-dylux'),
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

//---------------------------------------------
// CINESUBZ SEARCH  (NEW API)
//---------------------------------------------
cmd({
  pattern: "dnk",
  react: '🔎',
  category: "movie",
  alias: ["dnkz"],
  desc: "cinesubz.lk movie search",
  use: ".cine 2025",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
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
          ? "cinetvdl2"
          : "cinedl2";

        return {
          title: v.title.replace("Sinhala Subtitles", "").trim(),
          id: `${prefix}${cmdType} ±${v.link}±${v.image}±${v.title}`
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
        caption: `_*DINKA SEARCH RESULTS 🎬*_\n\n*Input:* ${q}`,
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
          ? "cinetvdl2"
          : "cinedl2";

        rows.push({
          title: v.title.replace("Sinhala Subtitles | සිංහල උපසිරැසි සමඟ", "").replace("Sinhala Subtitle | සිංහල උපසිරැසි සමඟ", "").trim(),
          rowId: `${prefix}${cmdType} ±${v.link}±${v.image}±${v.title}`
        });
      });

      await conn.listMessage(from, {
        text: `_*DINKA SEARCH RESULTS 🎬*_\n\n\`🧿Input:\` ${q}`,
        footer: config.FOOTER,
        title: "Cinesubz Results",
        buttonText: "Reply Below Number 🔢",
        sections: [{
          title: "[Dinka.lk Results]",
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
  pattern: "cinedl2",
  react: "🎥",
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
      `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-info?url=${encodeURIComponent(url)}&apikey=${key}`;
    const data = (await axios.get(infoAPI)).data;
    const d = data.data;

    const directors =
      (d.directors || "").replace(/Director:?/gi, "").trim();

    let msg =
`*_▫🍿 Title ➽ ${d.title}_*

▫📅 Year ➽ ${d.year}
▫⭐ IMDB ➽ ${d.rating}
▫⏳ Runtime ➽ ${d.duration}
▫🌎 Country ➽ ${d.country}
▫💎 Quality ➽ ${d.quality}
▫🕵️ Director ➽ ${directors}
▫🔉 Language ➽ ${d.tag}
`;

    // ================= BUTTON MODE =================
    if (config.BUTTON === "true") {

      let rows = d.downloads.map(v => ({
        title: `${v.size} (${v.quality})`,
        id: `${prefix}paka2 ${img}±${v.link}±${d.title}±${v.quality}`
      }));

      rows.unshift({
        title: "📄 Movie Details",
        id: `${prefix}ctdetails2 ±±${img}±${url}±${d.title}`
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
        buttonId: `${prefix}ctdetails2 ±±${url}±${img}±${d.title}`,
        buttonText: { displayText: "Movie Details\n" },
        type: 1
      });

      d.downloads.forEach(v => {
        buttons.push({
          buttonId: `${prefix}paka2 ${img}±${v.link}±${d.title}±${v.quality}`,
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


// ------------------ CINETVDL ------------------
// ------------------ CINETVDL ------------------
cmd({
  pattern: "cinetvdl2",
  react: "📺",
  desc: "TV Show details + season selector",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
  try {

    if (!q || !q.includes("tvshows"))
      return reply("*❗ Please use a valid TV Show link!*");

    console.log("📺 Input:", q);

    const [title, url, img] = q.split("±");

    const infoAPI =
      `https://episodes-cine.vercel.app/api/details?url=${encodeURIComponent(url)}`;

    const data = (await axios.get(infoAPI)).data;
    const d = data.result;

    /* ================= DETAILS CARD ================= */

    let detailsMsg =
      `*\`꧁Ðł₦Kλ MØVłEŞ ŁK꧂\`*\n *_▫️️🍀 Tɪᴛʟᴇ ➽ ${d.title}_*\n` +
      `*_▫️️📅 Yᴇᴀʀ ➽ ${d.year}_*\n` +
      `*_▫️️⭐ Iᴍᴅʙ ➽ ${d.imdb}_*\n` +
      `*_▫️️📺 Sᴇᴀsᴏɴs ➽ ${d.seasons.length}_*\n\n` +
      `*_▫️️🧿 Dᴇsᴄʀɪᴘᴛɪᴏɴ ➽_*\n${d.description}\n*🎈Join us* : http://whatsapp.com/channel/0029VbCA4fF9RZAfkahNsr0s`;

    await conn.sendMessage(config.JID3 || from, {
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
        id: `${prefix}cinetvep2 ${img}±${url}±${d.title}±${s.season}`
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
          rowId: `${prefix}cinetvep2 ${img}±${url}±${d.title}±${s.season}`
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
  pattern: "cinetvep2",
  react: "📺",
  desc: "Select episodes for a season",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
  try {
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
        id: `${prefix}cineall2 ${img}±${url}±${title}±${seasonNumber}`
      });

      // 🔹 NORMAL EPISODES
      season.episodes.forEach(ep => {
        rows.push({
          title: `Episode ${ep.episode}`,
          id: `${prefix}cinetvepi2 ${img}±${ep.url}±${title}±${ep.episode}±${seasonNumber}`
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
        rowId: `${prefix}cineall2 ${img}±${url}±${title}±${seasonNumber}`
      });

      season.episodes.forEach(ep => {
        rows.push({
          title: `Episode ${ep.episode}`,
          rowId: `${prefix}cinetvepi2 ${img}±${ep.url}±${title}±${ep.episode}±${seasonNumber}`
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
  pattern: "cinetvepi2",
  react: "📥",
  desc: "TV Episode download links",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
  try {

    if (!q) return reply("*❗ Missing episode data!*");

    console.log("📡 Episode Input:", q);

    const [img, epUrl, title, episodeNumber, season] = q.split("±");

    const api =
      `https://cine-dl-links.vercel.app/api/downLinks?url=${encodeURIComponent(epUrl)}`;

    const data = (await axios.get(api)).data;

    if (!data.download_links || data.download_links.length === 0)
      return reply("*❌ No download links found!*");

    let msg =
      `🎬 *${title}*\n` +
      `📺 *Episode:* ${episodeNumber}\n\n` +
      `⬇️ *Select download quality below*`;

    // ================= BUTTON MODE =================
    if (config.BUTTON === "true") {

      const rows = data.download_links.map(dl => ({
        title: `${dl.quality} (${dl.size})`,
        id: `${prefix}pakatv2 ${img}±${dl.link}±${title}±${episodeNumber}±${dl.quality}±${season}`
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
      data.download_links.forEach(dl => {
        rows.push({
          title: `${dl.quality} (${dl.size})`,
          rowId: `${prefix}pakatv2 ${img}±${dl.link}±${title}±${episodeNumber}±${dl.quality}±${season}`
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




let isUploadingz = false;

cmd({
  pattern: "pakatv2",
  react: "⬇️",
  dontAddCommandList: true,
  filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {

  if (!q) return reply("*❗ Missing download data!*");
  if (isUploadingz) return reply("*⏳ Another upload is in progress…*");

  try {
    isUploadingz = false;

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

    // 1) Try "cloud"

   
      const gdrive = filtered.find(v => v.name === "gdrive");
      const GLink = gdrive.url;
let res = await fg.GDriveDl(GLink.replace('https://drive.usercontent.google.com/download?id=', 'https://drive.google.com/file/d/').replace('&export=download' , '/view'))

if (gdrive) finalLink = res.downloadUrl;
	  //2
	  if (!finalLink) {
		 const unknown = filtered.find(v => v.name === "unknown");
    if (unknown) finalLink = unknown.url;
    }

    if (!finalLink)
      return reply("*❌ Valid download link not found!*");

    // Send uploading message
    const upmsg = await conn.sendMessage(from, { text: "*⬆️ Uploading Episode...*" });

    console.log(`link:`, finalLink)
	  const botimgUrl = img;
        const botimgResponse = await fetch(botimgUrl);
        const botimgBuffer = await botimgResponse.arrayBuffer();
        
        // Resize image to 200x200 before sending
        const resizedBotImg = await resizeImage(botimgBuffer, 200, 200);
	  
    await conn.sendMessage(config.JID || from, {
      document: { url: finalLink },
      mimetype: "video/mp4",
      caption: `📺 *${title}*\n*[S0${season} | Episode ${num}]*\n\n\`[WEB-DL ${quality}]\`\n\n> *•ɴᴀᴅᴇᴇɴ-ᴍᴅ•*`,
      jpegThumbnail: resizedBotImg,
      fileName: `📺DINKA📺${title}(${quality}).mp4`
    });

    await conn.sendMessage(from, { delete: upmsg.key });
    await conn.sendMessage(from, {
      react: { text: '✔️', key: mek.key }
    });

  } catch (e) {
    console.log("❌ paka error:", e);
    reply("*❗ Error while downloading*");
  }

  isUploadingz = false;
});

// ------------------ CINEALL ------------------
cmd({
  pattern: "cineall2",
  react: "📦",
  desc: "Select quality for ALL episodes",
  filename: __filename
},
async (conn, m, mek, { from, q, reply, prefix }) => {
  try {
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
cmd({
  pattern: "cineallq2",
  react: "⬇️",
  dontAddCommandList: true,
  filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
  try {
    if (!q) return reply("*❗ Missing quality data!*");

    const [quality, img, url, title, season] = q.split("±");

    // ✅ SAVE QUALITY
    await input("MV_SIZE", quality);

    await reply(`✅ *Quality:* ${quality}\n📥 *Downloading ALL Episodes...*`);

    // 🔹 GET EPISODE LIST
    const infoAPI =
      `https://episodes-cine.vercel.app/api/details?url=${encodeURIComponent(url)}`;
    const data = (await axios.get(infoAPI)).data;
    const d = data.result;

    const seasonData = d.seasons.find(s => s.season == season);
    if (!seasonData) return reply("*❌ Season not found!*");

    // 🔁 EPISODE LOOP
    for (const ep of seasonData.episodes) {
      try {

        const epAPI =
          `https://cine-dl-links.vercel.app/api/downLinks?url=${encodeURIComponent(ep.url)}`;
        const epRes = (await axios.get(epAPI)).data;
        if (!epRes.download_links?.length) continue;

        const wantQ = quality.replace("p", "");
        const pageLinkObj = epRes.download_links.find(v =>
          v.quality.includes(wantQ)
        );
        if (!pageLinkObj) continue;

        const finalAPI =
          `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-download?url=${encodeURIComponent(pageLinkObj.link)}&apikey=${key}`;

        const finalData = (await axios.get(finalAPI)).data;
        const downloads = finalData?.data?.download;
        if (!downloads) continue;

        const filtered = downloads.filter(v => v.name !== "telegram");

        let finalLink = null;

        const gdrive = filtered.find(v => v.name === "gdrive");
        if (gdrive) {
          const res = await fg.GDriveDl(
            gdrive.url
              .replace('https://drive.usercontent.google.com/download?id=', 'https://drive.google.com/file/d/')
              .replace('&export=download', '/view')
          );
          finalLink = res?.downloadUrl;
        }

        if (!finalLink) {
          const unknown = filtered.find(v => v.name === "unknown");
          if (unknown) finalLink = unknown.url;
        }

        if (!finalLink) continue;

        // 🖼 Thumbnail
        const imgRes = await fetch(img);
        const imgBuffer = await imgRes.buffer();
        const thumb = await resizeImage(imgBuffer, 200, 200);

        await conn.sendMessage(config.JID3 || from, {
          document: { url: finalLink },
          mimetype: "video/mp4",
          jpegThumbnail: thumb,
          fileName: `📺DINKA📺${title}-S${season}-E${ep.episode}-${quality}.mp4`,
          caption:
            `📺 *${title}*\n` +
            `*[Season ${season} | Episode ${ep.episode}]*\n\n` +
            `\`[WEB-DL ${quality}]\`\n\n` +
            `> *•ɴᴀᴅᴇᴇɴ-ᴍᴅ•*`
        });

        await sleep(2000);

      } catch (epErr) {
        console.log("Episode error:", epErr);
      }
    }

    await reply("✅ *ALL episodes sent successfully!*");

  } catch (e) {
    console.log(e);
    reply("*❌ Error in cineall downloader*");
  }
});

let isUploading = false;

cmd({
  pattern: "paka2",
  react: "⬇️",
  dontAddCommandList: true,
  filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {

  if (!q) return reply("*❗ Missing download data!*");
  if (isUploading) return reply("*⏳ Another upload is in progress…*");

  try {
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
	 const botimg = 'https://i.ibb.co/DfF50r25/DINKA-MOVIES-LK-2026.png';
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
	  
    await conn.sendMessage(config.DINKA || from, {
      document: { url: finalLink },
      mimetype: "video/mp4",
      caption: `🍦 *${title}*\n\n\`[${quality}]\`\n\n\`🎬𝗗ɪɴᴋᴀ 𝗠ᴏᴠɪᴇꜱ 𝗟ᴋ🎬\`\n\n> *•ɴᴀᴅᴇᴇɴ-ᴍᴅ•*`,
      jpegThumbnail: resizedBotImg,
      fileName: `📽️DINKA📽️${title}.mp4`
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

cmd({
  pattern: "ctdetails2",
  react: "🎬",
  desc: "Show movie details with Join Us link",
  filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
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

    let msg = `*꧁Ðł₦Kλ MØVłEŞ ŁK꧂*\n\n*_▫️️🍭 Tɪᴛʟᴇ ➽ ${d.title}_*\n` +
      `*_▫️️📅 Yᴇᴀʀ ➽ ${d.year}_*\n` +
      `*_▫️️⭐ Iᴍᴅʙ ➽ ${d.rating}_*\n` +
      `*_▫️️⏳ Rᴜɴᴛɪᴍᴇ ➽ ${d.duration}_*\n` +
      `*_▫️️🌎 Cᴏᴜɴᴛʀʏ ➽ ${d.country}_*\n` +
      `*_▫️️💎 Qᴜᴀʟɪᴛʏ ➽ ${d.quality}_*\n` +
      `*_▫️️🕵️ Dɪʀᴇᴄᴛᴏʀ ➽ ${directors}_*\n` +
      `*_▫️️🔉 Lᴀɴɢᴜᴀɢᴇ ➽ ${d.tag}_*\n\n` +
	   `*➣➣➣➣➣➣➣➣➣➣➣➣➣*`+
      `_🔗 *J๏เи µร*_ ➽ *${config.LINK}*\n*➣➣➣➣➣➣➣➣➣➣➣➣➣*\n\n> *•ɴᴀᴅᴇᴇɴ-ᴍᴅ•*`;

    // Send details card only (no download buttons)
    await conn.sendMessage(config.DINKA, {
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

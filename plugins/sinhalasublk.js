const config = require('../config'),
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
  fetch = (..._0x1c20f7) =>
    import('node-fetch').then(({ default: _0x557a09 }) =>
      _0x557a09(..._0x1c20f7)
    ),
  { Buffer } = require('buffer'),
  FormData = require('form-data'),
  fs = require('fs'),
  {
    sinhalasub_search,
    sinhalasub_info,
    sinhalasub_dl,
  } = require('../lib/sinhalasubli'),
  {
    sinhalasubb_search,
    sinhalasubtv_info,
    sinhalasubtv_dl,
  } = require('../lib/sinhalasubtv'),
  path = require('path'),
  fileType = require('file-type'),
  l = console.log
cmd({
    pattern: "sinhalasub",
    react: '🔎',
    category: "movie",
    alias: ["sinsub", "sinhalasub"],
    desc: "Search movies on sinhalasub.lk",
    use: ".sinhalasub <movie name>",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
       


       

        if (config.MV_BLOCK == "true" && !isMe && !isSudo && !isOwner) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { 
                text: "*This command currently only works for the Bot owner. To disable it for others, use the .settings command 👨‍🔧.*" 
            }, { quoted: mek });
        }

        if (!q) return await reply('*Please enter a movie name! 🎬*');

        // 🔗 Fetch SinhalaSub API
        const { data: apiRes } = await axios.get(`https://visper-md-ap-is.vercel.app/movie/sinhalasub/search?q=${encodeURIComponent(q)}`);

        // 🧠 Normalize structure
        let results = [];
        if (Array.isArray(apiRes)) results = apiRes;
        else if (Array.isArray(apiRes.result)) results = apiRes.result;
        else if (Array.isArray(apiRes.results)) results = apiRes.results;
        else if (Array.isArray(apiRes.data)) results = apiRes.data;
        else results = [];

        if (!results.length) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: '*No results found ❌*' }, { quoted: mek });
        }

        // 🧩 Create list
        let srh = results.map(v => ({
            title: (v.Title || v.title || "Unknown Title")
                .replace(/Sinhala Subtitles\s*\|?\s*සිංහල උපසිරසි.*/gi, "")
                .trim(),
            description: "",
            rowId: `${prefix}sininfo ${v.Link}±${v.Img}`
        }));

        const sections = [{
            title: "[sinhalasub.lk results]",
            rows: srh
        }];

        const listMessage = {
            text: `_*SINHALASUB MOVIE SEARCH RESULTS 🎬*_\n\n*🔎 Input:* ${q}`,
            footer: config.FOOTER,
            title: 'sinhalasub.lk Results 🎥',
            buttonText: '*Reply Below Number 🔢*',
            sections
        };

        const caption = `_*SINHALASUB MOVIE SEARCH RESULTS 🎬*_\n\n*🏔️ Input:* ${q}`;

        // 🎛️ Interactive button or list
        if (config.BUTTON === "true") {
            const listButtons = {
                title: "Choose a Movie 🎬",
                sections: [
                    {
                        title: "Available Movies",
                        rows: srh
                    }
                ]
            };

            await conn.sendMessage(from, {
        image: { url: config.LOGO },
        caption: caption,
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
        } else {
            await conn.listMessage(from, listMessage, mek);
        }

    } catch (e) {
        console.error("🔥 SinhalaSub Error:", e);
        reply('🚫 *Error Occurred !!*\n\n' + e.message);
    }
});
cmd({
  pattern: "sininfo",
  alias: ["mdv"],
  use: ".sininfo <url>",
	 category: "movie",
  react: "🎥",
  desc: "Download movies from sinhalasub.lk",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
       

    if (!q) return reply("🚩 *Please give me a valid movie URL!*");

    const [url, img] = q.split("±");

    // URL check
    if (!url || !url.includes("https://sinhalasub.lk/movies/")) {
      return reply("*❗ This appears to be a TV series or invalid link*");
    }

    // API call
    const { data } = await axios.get(
      `https://my-apis-site.vercel.app/movie/sinhalasub/movie?url=${encodeURIComponent(url)}&apikey=charuka-key-666`
    );

    const sadas = data.result;

    if (!sadas) {
      return reply("🚩 *Movie info not found!*");
    }

    // Movie caption
    const msg = `🎬 *${sadas.title || "N/A"}*

📅 *Release:* ${sadas.releaseDate || "N/A"}
🌍 *Country:* ${sadas.country || "N/A"}
⭐ *Rating:* ${sadas.rating || "N/A"}
⏰ *Runtime:* ${sadas.duration || "N/A"}
🕵️ *Directed By:* ${sadas.director || "N/A"}

⬇️ *Select download option below*`;

    const movieImage = img || config.LOGO;

    /* ==================================================
       BUTTON MODE
    ================================================== */
    if (config.BUTTON === "true") {

      const listRows = [];

      Object.values(sadas.dl_links || {}).forEach(serverArr => {
        serverArr.forEach(v => {
          if (
            !v.url ||
            v.url.includes("❌") ||
            !v.url.startsWith("https://pixeldrain.com/")
          ) return;

          listRows.push({
            title: `${v.quality} • ${v.size}`,
            id: `${prefix}sindl ${v.url}±${movieImage}±${sadas.title}±${v.quality}`
          });
        });
      });

      if (listRows.length === 0) {
        return reply("❌ *No ddl.sinhalasub.net links found!*");
      }

      const listButtons = {
        title: "🎬 Download Links",
        sections: [{ title: "Available Quality", rows: listRows }]
      };

      await conn.sendMessage(from, {
        image: { url: movieImage },
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

    /* ==================================================
       BUTTON FALSE (NUMBER / NORMAL BUTTONS)
    ================================================== */
    else {

      let buttons = [];
		
		buttons.push({
        buttonId: `${prefix}daqt ${url}`,
        buttonText: { displayText: "Movie Details\n" },
        type: 1
      });
		
      Object.values(sadas.dl_links || {}).forEach(serverArr => {
        serverArr.forEach(v => {

          if (
            !v.url ||
            v.url.includes("❌") ||
            !v.url.startsWith("https://pixeldrain.com/")
          ) return;

			  
          buttons.push({
            buttonId: `${prefix}sindl ${v.url}±${movieImage}±${sadas.title}±${v.quality}`,
            buttonText: {
              displayText: `${v.quality} • ${v.size}`
            },
            type: 1
          });

        });
      });

      if (buttons.length === 0) {
        return reply("❌ *No direct download links available!*");
      }

      await conn.buttonMessage(from, {
        image: { url: movieImage },
        caption: msg,
        footer: config.FOOTER,
        buttons,
        headerType: 4
      }, mek);
    }

  } catch (err) {
    console.error(err);
    reply("🚫 *Error Occurred!*\n\n" + err.message);
  }

});


let isUploadinggg = false; // Track upload status

cmd({
    pattern: "sindl",
    react: "⬇️",
	 category: "movie",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    if (isUploadinggg) {
        return await conn.sendMessage(from, { 
            text: '*A movie is already being uploaded. Please wait until it finishes.* ⏳', 
            quoted: mek 
        });
    }
console.log(`Input:`, q)
    try {
		 
        //===================================================
        const [pix, imglink, title, qulity] = q.split("±");
        if (!pix || !imglink || !title || !qulity) return await reply("⚠️ Invalid format. Use:\n`sindl link±img±title±$quality`");
        //===================================================

       /* const da = pix.split("https://pixeldrain.com/u/")[1];
		console.log(da)
        if (!da) return await reply("⚠️ Couldn’t extract Pixeldrain file ID.");

        const fhd = `https://pixeldrain.com/api/file/${da}`;
        isUploadinggg = true; // lock start
		const down = await axios.get(`https://api-dark-shan-yt.koyeb.app/download/pixeldrain?url=${fhd}&apikey=d4a5c39da3e24d13`);
		const pixn = down.data.data.download */
		const pix2 = pix.replace('https://pixeldrain.com/u/','https://pixeldrain.com/api/file/')
		const pixn = pix2 + '?download'
		console.log(`🏵️Input:`, pixn)
        //===================================================
        const botimg = imglink.trim();
       try {
    const resImg = await axios.get(botimg, { responseType: 'arraybuffer' });
    thumbBuffer = Buffer.from(resImg.data, 'binary');
} catch (err) {
    console.log("Thumbnail fetch failed, using default logo:", err.message);
    const defaultLogo = config.LOGO; // fallback
    const resImg = await axios.get(defaultLogo, { responseType: 'arraybuffer' });
    thumbBuffer = Buffer.from(resImg.data, 'binary');
}
		async function resizeImage(buffer, width, height) {
  return await sharp(buffer)
    .resize(width, height)
    .toBuffer();
}
const botimgUrl = imglink;
        const botimgResponse = await fetch(botimgUrl);
        const botimgBuffer = await botimgResponse.buffer();
        
        // Resize image to 200x200 before sending
        const resizedBotImg = await resizeImage(botimgBuffer, 200, 200);
const message = {
    document: { url: pixn },
    caption: `🎬 ${title}\n\n\`[${qulity}]\`\n\n${config.NAME}`,
    mimetype: "video/mp4",
    jpegThumbnail: resizedBotImg || config.LOGO,
    fileName: `${title}.mp4`,
};

        // Send "uploading..." msg without blocking
        conn.sendMessage(from, { text: '*Uploading your movie.. ⬆️*', quoted: mek });

        // Upload + react + success (parallel tasks)
        await Promise.all([
            conn.sendMessage(config.JID || from, message),
            conn.sendMessage(from, { react: { text: '✔️', key: mek.key } })
            
        ]);

    } catch (e) {
        reply('🚫 *Error Occurred !!*\n\n' + e.message);
        console.error("sindl error:", e);
    } finally {
        isUploadinggg = false; // reset lock always
    }
});


cmd({
    pattern: "daqt",
    alias: ["mdv"],
    use: '.moviedl <url>',
	 category: "movie",
    react: "🎥",
    desc: "Send full movie details from sinhalasub.lk",
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



    if (!q) return reply('🚩 *Please give me a valid movie URL!*');
//const [url, img] = q.split("±");
    // ✅ Fetch movie info from API
    const { data } = await axios.get(`https://my-apis-site.vercel.app/movie/sinhalasub/movie?url=${encodeURIComponent(q)}&apikey=charuka-key-666`);
    const sadas = data.result;

    if (!sadas || Object.keys(sadas).length === 0)
        return await reply('*🚫 No details found for this movie!*');

    // ✅ Fetch extra details (for footer / channel link)
    const details = (await axios.get('https://raw.githubusercontent.com/Nadeenpoorna-app/main-data/refs/heads/main/master.json')).data;

    // 🧾 Caption Template
    const msg = `*🍿 𝗧ɪᴛʟᴇ ➮* *_${sadas.title || 'N/A'}_*

*📅 𝗥𝗲𝗹𝗲𝗮𝘀𝗲𝗱 𝗗𝗮𝘁𝗲 ➮* _${sadas.releaseDate || 'N/A'}_
*🌎 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 ➮* _${sadas.country || 'N/A'}_
*💃 𝗥𝗮𝘁𝗶𝗻𝗴 ➮* _${sadas.imdb || 'N/A'}_
*⏰ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲 ➮* _${sadas.duration || 'N/A'}_
*🕵️‍♀️ 𝗗𝗶𝗿𝗲𝗰𝘁𝗲𝗱 𝗕𝘆 ➮* _${sadas.director || 'N/A'}_
*🔉𝗟𝗮𝗻𝗴𝘂𝗮𝗴𝗲 ➮* _${sadas.language || 'N/A'}_

> 🌟 *Follow us :* ${config.LINK || 'N/A'}
${config.FOOTER}
`;

    // ✅ Send movie info message
    await conn.sendMessage(
        config.JID || from,
        {
            image: { url: sadas.poster|| config.LOGO },
            caption: msg,
            footer: config.FOOTER || "VISPER-MD 🎬",
        },
        { quoted: mek }
    );

    // ✅ React confirmation
    await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

} catch (error) {
    console.error('Error fetching or sending:', error);
    await conn.sendMessage(from, { text: `🚫 *Error Occurred While Fetching Movie Data!* \n\n${error.message}` }, { quoted: mek });
}
});
  
//sinhalasub tv show
 
        
cmd({
  pattern: "sinhalasubtv",	
  react: '📺',
  category: "movie",
  alias: ["sinhalatv"],
  desc: "Search TV shows from sinhalasub.lk",
  use: ".sinhalasubtv Loki",
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




  if (!q) return reply('*Please enter a search term, e.g. `.sinhalasubtv Loki`*');

  // ✅ Correct way (API has result array)
  const { data } = await axios.get(`https://visper-md-ap-is.vercel.app/movie/sinhalasub/search?q=${encodeURIComponent(q)}`);

  const list = data?.result;
  if (!Array.isArray(list)) {
    console.log("⚠️ Invalid API structure:", data);
    return reply('*🚫 SinhalaSub API returned invalid response!*');
  }

  // 🧩 Filter only TV shows
  const results = list.filter(v => v?.Title && /tv|series|season/i.test(v.Title));

  if (results.length === 0) {
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    return reply('*No TV show results found ❌*');
  }

  const srh = results.map(v => ({
    title: v.Title.replace("Sinhala Subtitles", "").trim(),
    description: '',
    rowId: prefix + 'sintvinfo ' + v.Link
  }));

  const caption = `*_SINHALASUB TV SHOW SEARCH RESULTS 📺_*\n\n🔍 *Search:* ${q}`;

  const sections = [{ title: "🎬 sinhalasub.lk - TV Shows", rows: srh }];

  await conn.listMessage(from, {
    text: caption,
    footer: config.FOOTER,
    title: "sinhalasub.lk results 🎥",
    buttonText: "*Select a show 🎬*",
    sections
  }, mek);

} catch (e) {
  reply('🚫 *Error occurred !!*\n\n' + e.message);
  console.log(e);
}
});

// ====================================================================================================
// other cmds stay same as before (sintvinfo, sintvfirstdl, sintvdl, dtaqt)


//==========================================================================================================

cmd({
  pattern: "sintvinfo",
  alias: ["mdv"],
	 category: "movie",
  react: "🎥",
  desc: "Get TV show info and download links from sinhalasub.lk",
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



  if (!q) return reply('🚩 *Please provide a valid SinhalaSub link!*');
  if (!q.includes('https://sinhalasub.lk/tvshows/')) return reply('*❗ Invalid link! Use `.mv` for movies.*');

  const { data } = await axios.get(`https://test-sadaslk-apis.vercel.app/api/v1/movie/sinhalasub/tv/info?q=${encodeURIComponent(q)}&apiKey=vispermdv4`);
  const show = data?.result;
  if (!show) return reply('*No information found ❌*');

  const msg = `*📺 Title:* _${show.title || 'N/A'}_\n*📅 Date:* _${show.date || 'N/A'}_\n*⭐ IMDB:* _${show.imdb || 'N/A'}_\n*🧑‍💻 Subtitle By:* _${show.director || 'N/A'}_`;
  const imageUrl = show.image?.[0] || config.LOGO;

  const rowss = (show.episodes || []).map(v => ({
    title: v.title.replace(/BluRay|HD|FHD|SD|WEBDL|Telegram/gi, "").trim(),
    id: prefix + `sintvfirstdl ${v.episode_link}+${show.image[0]}`
  }));

  const listButtons = {
    title: "📺 Choose an Episode to Download",
    sections: [{ title: "Available Episodes", rows: rowss }]
  };

  await conn.sendMessage(from, {
    image: { url: imageUrl },
    caption: msg,
    footer: config.FOOTER,
    buttons: [
      { buttonId: prefix + 'dtaqt ' + q, buttonText: { displayText: "📜 Show Details" }, type: 1 },
      { buttonId: "download_list", buttonText: { displayText: "🎥 Select Episode" }, type: 4, nativeFlowInfo: { name: "single_select", paramsJson: JSON.stringify(listButtons) } }
    ],
    headerType: 1,
    viewOnce: true
  }, { quoted: mek });

} catch (e) {
  reply('🚫 *Error Occurred !!*\n\n' + e);
  console.log(e);
}
});

//==========================================================================================================

cmd({
  pattern: "sintvfirstdl",	
  react: '🎬',
	 category: "movie",
  alias: ["tvs"],
  desc: "TV Episode Downloader - SinhalaSub",
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



  if (!q) return reply('*🚩 Please give me episode link!*');

  const dllink = q.split("+")[0];
  const img = q.split("+")[1];

  const { data } = await axios.get(`https://test-sadaslk-apis.vercel.app/api/v1/movie/sinhalasub/tv/dl?q=${encodeURIComponent(dllink)}&apiKey=vispermdv4`);
  if (!data?.result?.dl_links?.length) return reply('*🚫 No download links found!*');

  const episodeTitle = data.result.title || 'Unknown Episode';
  const links = data.result.dl_links;

  const srh = links.map(v => ({
    title: `${v.quality} - ${v.size}`,
    description: '',
    rowId: `${prefix}sintvdl ${v.link}&${episodeTitle}&${img}&${v.quality}`
  }));

  const sections = [{ title: "🎬 Select Quality to Download", rows: srh }];
  const caption = `*🍿 Episode:* _${episodeTitle}_`;

  await conn.listMessage(from, { text: caption, footer: config.FOOTER, title: '📺 SinhalaSub TV Downloader', buttonText: '*Select a quality 🎥*', sections }, mek);

} catch (e) {
  reply('🚫 *Error Occurred !!*\n\n' + e);
  console.log(e);
}
});

//==========================================================================================================

cmd({
  pattern: "sintvdl",
  react: "⬇️",
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



  if (!q) return reply('*🚩 Invalid download data!*');

  const [dllink, title, image, quality] = q.split("&");
  const da = dllink.split("https://pixeldrain.com/u/")[1];
  const fhd = `https://pixeldrain.com/api/file/${da}`;

  if (global.isUploading)
    return await conn.sendMessage(from, { text: '*⏳ A file is already uploading. Please wait!*', quoted: mek });

  global.isUploading = true;
  await conn.sendMessage(from, { text: `*⬆️ Uploading your episode...*\n🎬 *${title} (${quality})*` }, { quoted: mek });

  const message = {
    document: { url: fhd },
    mimetype: "video/mp4",
    fileName: `${title}.mp4`,
    caption: `🎬 *${title}*\n📺 *Quality:* ${quality}\n\n${config.FOOTER}`,
    jpegThumbnail: await (await fetch(image || config.LOGO)).buffer(),
  };

  await conn.sendMessage(from, message, { quoted: mek });
  await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
  global.isUploading = false;

} catch (e) {
  global.isUploading = false;
  reply('🚫 *Error Occurred !!*\n\n' + e);
  console.log(e);
}
});

//==========================================================================================================

cmd({
  pattern: "dtaqt",
  alias: ["mdv"],
  react: "🎥",
	 category: "movie",
  desc: "Download movie details from SinhalaSub TV",
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



  if (!q) return reply('🚩 *Please give me a valid SinhalaSub TV link!*');

  const sadas = await axios.get(`https://test-sadaslk-apis.vercel.app/api/v1/movie/sinhalasub/tv/info?q=${encodeURIComponent(q)}&apiKey=vispermdv4`);
  const details = (await axios.get('https://raw.githubusercontent.com/Nadeenpoorna-app/main-data/refs/heads/main/master.json')).data;

  const result = sadas.data.result;
  if (!result) return reply('❌ *No data found!*');

  const caption = `*☘️ Title:* *_${result.title || 'N/A'}_*\n\n` +
    `*📅 Date:* _${result.date || 'N/A'}_\n` +
    `*💃 Rating:* _${result.imdb || 'N/A'}_\n` +
    `*💁‍♂️ Subtitle By:* _${result.director || 'Unknown'}_\n\n` +
    `> 🌟 Follow us : *${details.chlink || 'N/A'}*\n\n` +
    `> _*${config.FOOTER}*_`;

  await conn.sendMessage(from, { image: { url: result.image[0] }, caption }, { quoted: mek });
  await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

} catch (error) {
  console.error('Error fetching or sending:', error);
  reply('🚫 *Error fetching movie details!*');
}
});

  
//==================================================================
// 🖼️ SinhalaSub TV All Images Sender
//==================================================================
cmd({
    pattern: "ch",
    alias: ["tvimg"],
    use: '.ch <url>',
    react: "🖼️",
    desc: "Send all SinhalaSub TV screenshots/posters",
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



        if (!q) return reply('🚩 *Please provide a SinhalaSub TV URL!*');

        // API request
        let sadas = await axios.get(`https://test-sadaslk-apis.vercel.app/api/v1/movie/sinhalasub/tv/info?q=${encodeURIComponent(q)}&apiKey=vispermdv4`);

        const result = sadas.data.result;
        if (!result || !result.image || result.image.length === 0)
            return reply('⚠️ *No images found for this title!*');

        for (let url of result.image) {
            await conn.sendMessage(from, { image: { url } }, { quoted: mek });
        }

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    } catch (error) {
        console.error('Error fetching or sending images:', error);
        reply('🚫 *Error while sending images!*');
    }
});

//===========================================================================================================

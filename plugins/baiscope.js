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
    pattern: "baiscopes",    
    react: '🔎',
    category: "movie",
    desc: "Baiscopes.lk movie search",
    use: ".baiscopes 2025",
    filename: __filename
},
async (conn, m, mek, { from, isPre, q, prefix, isMe, isSudo, isOwner, reply }) => {
try {

    // --- Premium & Config Check ---
      // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isPre;

        if (!isAuthorized) {
            // API එකෙන් පණිවිඩය ලබාගැනීම
            const { data } = await axios.get('https://nadeen-botzdatabse.vercel.app/data.json');
            
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii

    if (!q) return await reply('*Please provide a movie name! (e.g. .baiscopes Batman)*');

    // --- Fetching Search Results ---
    // මම මෙතනට ඔයා දුන්න අලුත් API එක ඇතුලත් කළා
    let res = await fetchJson(`https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/search?q=${q}&apiKey=sadasggggg`);

    if (!res || !res.data || res.data.length === 0) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return await conn.sendMessage(from, { text: '*No results found for your search ❌*' }, { quoted: mek });
    }

    var srh = [];  
    for (var i = 0; i < res.data.length; i++) {
        srh.push({
            title: `${res.data[i].title}`,
         //   description: `Year: ${res.data[i].year || 'N/A'}`,
            rowId: prefix + `bdl ${res.data[i].link}&${res.data[i].imageUrl}` // Download cmd එකට link එක යවනවා
        });
    }

    const sections = [{
        title: "Baiscopes.lk Search Results",
        rows: srh
    }];

    const listMessage = {
        text: `*_BAISCOPES MOVIE SEARCH RESULT 🎬_*\n\n*\`Input :\`* ${q}`,
        footer: config.FOOTER,
        title: '[Baiscopes.lk Results]',
        buttonText: '*Select Your Movie 🔢*',
        sections
    };

    await conn.listMessage(from, listMessage, mek);

} catch (e) {
    console.log(e);
    await conn.sendMessage(from, { text: '🚩 *Error occurred while fetching movies!*' }, { quoted: mek });
}
});

cmd({
    pattern: "bdl",    
    react: '🎥',
    desc: "movie downloader",
    filename: __filename
},
async (conn, m, mek, { from, q, isMe, isSudo, isOwner, prefix, reply }) => {
try {
 const datae = q.split("&")[0];
        const datas = q.split("&")[1];
    if (!q) return await reply('*Please provide the movie link!*');

    // API එකට request එක යැවීම (q ලෙස ලැබෙන්නේ search එකෙන් ආපු movie link එකයි)
    let sadas = await fetchJson(`https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/infodl?q=${datae}&apiKey=sadasggggg`);

    if (!sadas || !sadas.status || !sadas.data) {
        return await conn.sendMessage(from, { text: '🚩 *Error: Could not fetch movie details!*' }, { quoted: mek });
    }

    const movie = sadas.data.movieInfo;
    const dlLinks = sadas.data.downloadLinks;

    let msg = `*☘️ 𝗧ɪᴛʟᴇ ➮* _${movie.title || 'N/A'}_

*📅 𝗥ᴇʟᴇꜱᴇᴅ ᴅᴀᴛᴇ ➮* _${movie.releaseDate || 'N/A'}_
*💃 𝗥ᴀᴛɪɴɢ ➮* _${movie.ratingValue || 'N/A'}_ (${movie.ratingCount} votes)
*⏰ 𝗥ᴜɴᴛɪᴍᴇ ➮* _${movie.runtime || 'N/A'}_
*🌍 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 ➮* _${movie.country || 'N/A'}_
*🎭 𝗚ᴇɴᴀʀᴇꜱ ➮* ${movie.genres ? movie.genres.join(', ') : 'N/A'}
`;

    var rows = [];  

rows.push(
    { buttonId: prefix + 'bdetails ' + `${datae}&${datas}`, buttonText: { displayText: 'Details Card\n' }, type: 1 }
    
);
	

    // Download links බොත්තම් ලෙස එකතු කිරීම
    if (dlLinks && dlLinks.length > 0) {
        dlLinks.map((v) => {
            rows.push({
                buttonId: prefix + `cdl ${v.directLinkUrl}±${movie.title}±${datas}±${v.quality}`,
                buttonText: { displayText: `${v.quality} (${v.size})` },
                type: 1
            });
        });
    } else {
        return await reply("No download links found for this movie.");
    }



    const buttonMessage = {
        image: { url: datas },    
        caption: msg,
        footer: config.FOOTER,
        buttons: rows,
        headerType: 4
    };

    return await conn.buttonMessage(from, buttonMessage, mek);

} catch (e) {
    console.log(e);
    await conn.sendMessage(from, { text: '🚩 *Error !!*' }, { quoted: mek });
}
});


let isUploading = false; // Track upload status



cmd({
    pattern: "cdl",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, isMe, reply }) => {
    
    if (!q) {
        return await reply('*Please provide a direct URL!*');
    }





	
    if (isUploading) {
        return await conn.sendMessage(from, { 
            text: '*A movie is already being uploaded. Please wait a while before uploading another one.* ⏳', 
            quoted: mek 
        });
    }

    try {
        isUploading = true; // Set upload in progress

        

        const datae = q.split("±")[0];
        const datas = q.split("±")[1];
        const dat = q.split("±")[2];    
		const dattt = q.split("±")[3];    




if (!datae.includes('https://drive.baiscopeslk')) {
    console.log('Invalid input:', q);
    return await reply('*❗ Sorry, this download url is incorrect please choose another number*');
}
        const mediaUrl = datae;

     

        const botimg = `${dat}`;

       
 await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

       await conn.sendMessage(from, { text: '*Uploading your movie..⬆️*' });

       
 await conn.sendMessage(config.JID || from, { 
            document: { url: mediaUrl },
            caption: `*🎬 Name :* *${datas}*\n\n*\`${dattt}\`*\n\n${config.NAME}`,
            mimetype: "video/mp4",
            jpegThumbnail: await (await fetch(botimg)).buffer(),
            fileName: `🎬 ${datas}.mp4`
        });



        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
       // await conn.sendMessage(from, { text: `*Movie sent successfully to JID ${config.JID} ✔*` }, { quoted: mek });

    } catch (error) {
        console.error('Error fetching or sending:', error);
        await conn.sendMessage(from, { text: "*Erro fetching this moment retry now ❗*" }, { quoted: mek });
    } finally {
        isUploading = false; // Reset upload status
    }
});

cmd({
  pattern: "bdetails",
  react: '🎬',
  desc: "Movie details sender",
  filename: __filename
},
async (conn, m, mek, { from, q, isMe, reply }) => {
  try {
    if (!q) 
      return await reply('⚠️ *Please provide the movie URL!*');
 const [url, imgUrl] = q.split("&");
    // API එකෙන් විස්තර ලබා ගැනීම
    let sadas = await fetchJson(`https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/infodl?q=${url}&apiKey=sadasggggg`);
    
    if (!sadas || !sadas.status || !sadas.data) {
        return await conn.sendMessage(from, { text: '🚩 *Error: Could not fetch movie details!*' }, { quoted: mek });
    }

    const movie = sadas.data.movieInfo;
    let details = (await axios.get('https://mv-visper-full-db.pages.dev/Main/main_var.json')).data;

    // විස්තර පෙළ සැකසීම
    let msg = `*☘️ 𝗧ɪᴛʟᴇ ➮* *_${movie.title || 'N/A'}_*

*📅 𝗥ᴇʟᴇꜱᴇᴅ ᴅᴀᴛᴇ ➮* _${movie.releaseDate || 'N/A'}_
*💃 𝗥ᴀᴛɪɴɢ ➮* _${movie.ratingValue || 'N/A'}_
*⏰ 𝗥ᴜɴᴛɪᴍᴇ ➮* _${movie.runtime || 'N/A'}_
*🌍 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 ➮* _${movie.country || 'N/A'}_
*🎭 𝗚ᴇɴᴀʀᴇꜱ ➮* ${movie.genres ? movie.genres.join(', ') : 'N/A'}

✨ *Follow us:* https://www.whatsapp.com/channel/0029VbCA4fF9RZAfkahNsr0s`;

    // Gallery එකේ පළමු රූපය හෝ Poster එක තෝරා ගැනීම
    const displayImg = (movie.galleryImages && movie.galleryImages.length > 0) 
        ? movie.galleryImages[0] 
        : movie.posterUrl;

    // පණිවිඩය යැවීම (config.JID තිබේ නම් එයට, නැතිනම් current chat එකට)
    await conn.sendMessage(config.JID || from, {
      image: { url: imgUrl },
      caption: msg
    });

    await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

  } catch (error) {
    console.error('Error:', error);
    await conn.sendMessage(from, '⚠️ *An error occurred while fetching details.*', { quoted: mek });
  }
});



                           //pirateslk

cmd({
  pattern: "pirate",
  react: "🔎",
  category: "movie",
  desc: "Search movies from pirate.lk",
  use: ".pirate <movie name>",
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



    if (!q) return reply("*❗ Movie name missing!*");

    const api =
      `https://my-apis-site.vercel.app/movie/pirate/search?text=${encodeURIComponent(q)}&apikey=charuka-key-666`;

    const { data } = await axios.get(api);

    let results = [];
    if (Array.isArray(data)) results = data;
    else if (Array.isArray(data.result)) results = data.result;
    else if (Array.isArray(data.data)) results = data.data;

    if (!results.length)
      return reply("*❌ No movies found!*");

    const rows = results.map(v => ({
      title: v.title || "Unknown",
      id: `${prefix}pirateinfo ${v.url}`
    }));

    const listButtons = {
      title: "🎬 Choose Movie",
      sections: [{ title: "Results", rows }]
    };

    if (config.BUTTON === "true") {
      await conn.sendMessage(from, {
        image: { url: config.LOGO },
        caption: `🏴‍☠️ *PIRATE SEARCH*\n\n🔍 *Input:* ${q}`,
        footer: config.FOOTER,
        buttons: [{
          buttonId: "pirate_list",
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
      await conn.listMessage(from, {
        text: `🏴‍☠️ *PIRATE SEARCH*\n\n🔍 *Input:* ${q}`,
        footer: config.FOOTER,
        title: "Pirate Movies",
        buttonText: "Reply Number ⤵",
        sections: [{ title: "[Pirates.lk Results]", rows }]
      }, mek);
    }

  } catch (e) {
    console.error(e);
    reply("*🚫 Pirate search error!*");
  }
});

cmd({
  pattern: "pirateinfo",
  react: "🎬",
	 category: "movie",
  desc: "Pirate movie info & download",
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



    if (!q || !q.startsWith("http"))
      return reply("*❗ Invalid movie URL!*");

    const api =
      `https://my-apis-site.vercel.app/movie/pirate/movie?url=${encodeURIComponent(q)}&apikey=charuka-key-666`;

    const { data } = await axios.get(api);
    const info = data?.result;

    if (!info)
      return reply("*🚫 Movie info not found!*");

    const caption = `🎬 *${info.title || "N/A"}*

📅 Release : ${info.year || "N/A"}
⭐ Rating : ${info.rating || "N/A"}
⏰ Runtime : ${info.runtime || "N/A"}
🌐 Country : ${info.country || "N/A"}
📝 Director : ${info.tagline || "N/A"}`;

    const image = info.poster || config.LOGO;

    const rows = (info.dl_links || []).map(v => ({
      title: `${v.quality} - ${v.size}`,
      id: `${prefix}sindl ${encodeURIComponent(v.link)}±${encodeURIComponent(image)}±${encodeURIComponent(info.title)}±${v.quality}`
    }));

    const listButtons = {
      title: "⬇️ Choose Quality",
      sections: [{ title: "Downloads", rows }]
    };

    if (config.BUTTON === "true") {
      await conn.sendMessage(from, {
        image: { url: image },
        caption,
        footer: config.FOOTER,
        buttons: [{
          buttonId: "pirate_dl",
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
    } else {
      await conn.listMessage(from, {
        text: caption,
        footer: config.FOOTER,
        title: "Download Options",
        buttonText: "Reply Number ⤵",
        sections: [{ title: "Qualities", rows }]
      }, mek);
    }

  } catch (e) {
    console.error(e);
    reply("*🚫 Pirate info error!*");
  }
});



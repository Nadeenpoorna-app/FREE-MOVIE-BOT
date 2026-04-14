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
    pattern: "sublk",	
    react: '🎬',
    category: "movie",
    desc: "SUB.LK movie search",
    use: ".sublk Avatar",
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


    if (!q) return await reply('*Please give me a movie name 🎥*')

    // Fetch data from SUB.LK API
    let url = await fetchJson(`https://visper-md-ap-is.vercel.app/movie/sublk/SEARCH?q=${encodeURIComponent(q)}`)

    if (!url || !url.result || url.result.length === 0) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return await conn.sendMessage(from, { text: '*No results found ❌*' }, { quoted: mek });
    }

    // Create rows with rowId
    var srh = [];  
    for (var i = 0; i < url.result.length; i++) {
        srh.push({
            title: url.result[i].title,
            //description: url.result[i].year || '',
            rowId: prefix + `sdl ${url.result[i].link}&${url.result[i].year}`
        });
    }

    const listMessage = {
        text: `*_SUB.LK MOVIE SEARCH RESULT 🎬_*

*\`Input :\`* ${q}`,
        footer: config.FOOTER,
        title: 'SUB.LK Results',
        buttonText: '*Reply Below Number 🔢*',
        sections: [{
            title: "SUB.LK Results",
            rows: srh
        }]
    }

    const caption = `*_SUB.LK MOVIE SEARCH RESULT 🎬_*

*\`Input :\`* ${q}
_Total results:_ ${url.result.length}`

    // Also create listButtons for button mode
    const rowss = url.result.map((v, i) => {
        return {
            title: v.title || `Result ${i+1}`,
            id: prefix + `sdl ${v.link}&${v.year}`
        }
    });

    const listButtons = {
        title: "Choose a Movie 🎬",
        sections: [
            {
                title: "SUB.LK Search Results",
                rows: rowss
            }
        ]
    };

    // Send as buttons or list depending on config
    if (config.BUTTON === "true") {
        await conn.sendMessage(from, {
            image: { url: config.LOGO },
            caption: caption,
            footer: config.FOOTER,
            buttons: [
                {
                    buttonId: "download_list",
                    buttonText: { displayText: "🎥 Select Option" },
                    type: 4,
                    nativeFlowInfo: {
                        name: "single_select",
                        paramsJson: JSON.stringify(listButtons)
                    }
                }
            ],
            headerType: 1,
            viewOnce: true
        }, { quoted: mek });
    } else {
        await conn.listMessage(from, listMessage, mek)
    }

} catch (e) {
    console.log(e)
    await conn.sendMessage(from, { text: '🚩 *Error fetching results !!*' }, { quoted: mek })
}
})
cmd({
    pattern: "sdl",    
    react: '🎥',
	 category: "movie",
    desc: "SUB.LK movie downloader",
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


    if (!q || !q.includes('https://sub.lk/movies/')) {
        return await reply('*❗ Invalid link. Please search using .sublk and select a movie.*');
    }

    let data = await fetchJson(`https://sadaslk-apis.vercel.app/api/v1/movie/sublk/infodl?q=${q}&apiKey=sadasggggg`);
    
    // JSON එකේ ඇතුලත තියෙන්නේ 'data' කියන object එකයි
    const res = data.data;

    if (!res) return await reply('*🚩 No details found !*');

    let msg = `*☘️ 𝗧ɪᴛʟᴇ ➮* *_${res.title || 'N/A'}_*
${res.tagline ? `*✨ Tagline:* _${res.tagline}_` : ''}

*📅 𝗥ᴇʟᴇᴀꜱᴇ 𝗗𝗮𝘁𝗲 ➮* _${res.releaseDate || 'N/A'}_
*🌎 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 ➮* _${res.country || 'N/A'}_
*💃 𝗥𝗮𝘁𝗶𝗻𝗴 ➮* _Value: ${res.ratingValue || 'N/A'} (Count: ${res.ratingCount || 'N/A'})_
*⏰ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲 ➮* _${res.runtime || 'N/A'}_
*🎭 𝗚𝗲𝗻𝗿𝗲𝘀 ➮* ${res.genres?.join(', ') || 'N/A'}
`;

    let rows = [];

rows.push({
      buttonId: prefix + 'ssdetails ' + q, buttonText: {displayText: 'Details send'}, type: 1}

);
	
    // මෙහි downloads array එකේ නම 'pixeldrainDownloads' වේ
    if (res.pixeldrainDownloads && res.pixeldrainDownloads.length > 0) {
        res.pixeldrainDownloads.forEach((dl) => {
            rows.push({
                buttonId: `${prefix}subdl ${dl.finalDownloadUrl}±${res.imageUrl}±${res.title}±[${dl.quality}]`,
                buttonText: { 
                    displayText: `${dl.size} - ${dl.quality}`
                },
                type: 1
            });
        });
    }

    const buttonMessage = {
        image: { url: res.imageUrl.replace('-200x300', '') }, // High quality image එක සඳහා
        caption: msg,
        footer: config.FOOTER,
        buttons: rows,
        headerType: 4
    };

    return await conn.buttonMessage(from, buttonMessage, mek);

} catch (e) {
    console.log(e);
    await conn.sendMessage(from, { text: '🚩 *Error occurred while fetching data!*' }, { quoted: mek });
}
})

cmd({
    pattern: "subdl",
    react: "⬇️",
	 category: "movie",
    dontAddCommandList: true,
    filename: __filename
}, 
    async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    


    if (typeof isUploadinggggg !== 'undefined' && isUploadinggggg) {
        return await conn.sendMessage(from, { 
            text: '*A movie is already being uploaded. Please wait until it finishes.* ⏳', 
            quoted: mek 
        });
    }

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
        // split කිරීමේදී "±" භාවිතා කරන්න
        const [megaUrl, imglink, title, quality] = q.split("±");

        if (!megaUrl || !imglink || !title) {
            return await reply("⚠️ Invalid format.");
        }

        isUploadingggggggggg = true; 
      await conn.sendMessage(from, { text: '*Fetching direct link from Mega...* ⏳', quoted: mek });

        // මෙතැනදී encodeURIComponent භාවිතා කර API Request එක යැවීම
        const apiUrl = `https://sadaslk-fast-mega-dl.vercel.app/mega?q=${encodeURIComponent(megaUrl.trim())}`;
        let megaApi = await fetchJson(apiUrl);
        
        if (!megaApi.status || !megaApi.result || !megaApi.result.download) {
            isUploadinggggg = false;
            return await reply("🚫 *Failed to fetch download link from Mega! Check the link again.*");
        }

        const directDownloadUrl = megaApi.result.download;
        const fileName = megaApi.result.name || title;

        await conn.sendMessage(from, { text: '*Uploading your movie.. ⬆️*', quoted: mek });

        const message = {
            document: { url: directDownloadUrl },
            caption: `🎬 *${title}*\n\n*\`${quality}\`*\n\n${config.NAME}`,
            mimetype: "video/mp4",
            jpegThumbnail: await (await fetch(imglink.trim())).buffer(),
            fileName: `🎬 ${fileName}.mp4`,
        };

        await conn.sendMessage(config.JID || from, message);
        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    } catch (e) {
        console.error("sindl error:", e);
        reply('🚫 *Error Occurred !!*\n\n' + e.message);
    } finally {
        isUploadingggggggggg = false; 
    }
});



cmd({
    pattern: "ssdetails",
    react: '🎬',
    desc: "Movie details sender (Details Only)",
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


        if (!q) 
            return await reply('⚠️ *Please provide the movie URL!*');

        // URL එක ලබා ගැනීම
        const movieUrl = q;

        // API එකෙන් විස්තර ලබා ගැනීම
        let sadas = await fetchJson(`https://sadaslk-apis.vercel.app/api/v1/movie/sublk/infodl?q=${movieUrl}&apiKey=sadasggggg`);

        if (!sadas || !sadas.status || !sadas.data) {
            return await conn.sendMessage(from, { text: '🚩 *Error: Could not fetch movie details!*' }, { quoted: mek });
        }

        const movie = sadas.data;
        let details = (await axios.get('https://mv-visper-full-db.pages.dev/Main/main_var.json')).data;

        // විස්තර පෙළ සැකසීම (Download links රහිතව)
        let msg = `*☘️ 𝗧ɪᴛʟᴇ ➮* *_${movie.title || 'N/A'}_*
*✨ 𝗧𝗮𝗴𝗹𝗶𝗻𝗲 ➮* _${movie.tagline || 'N/A'}_

*📅 𝗥𝗲𝗹𝗲𝗮𝘀𝗲 ➮* _${movie.releaseDate || 'N/A'}_
*💃 𝗥𝗮𝘁𝗶𝗻𝗴 ➮* _${movie.ratingValue || 'N/A'} (${movie.ratingCount})_
*⏰ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲 ➮* _${movie.runtime || 'N/A'}_
*🌍 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 ➮* _${movie.country || 'N/A'}_
*🎭 𝗚𝗲𝗻ﺮ𝗲𝘀 ➮* ${movie.genres ? movie.genres.join(', ') : 'N/A'}
*🔞 𝗖𝗼𝗻𝘁𝗲𝗻𝘁 𝗥𝗮𝘁𝗶𝗻𝗴 ➮* _${movie.contentRating || 'N/A'}_

✨ *Follow us:* ${details.chlink}`;

        // පණිවිඩය යැවීම
        await conn.sendMessage(config.JID || from, {
            image: { url: movie.imageUrl },
            caption: msg
        });

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    } catch (error) {
        console.error('Error:', error);
        await conn.sendMessage(from, '⚠️ *An error occurred while fetching details.*', { quoted: mek });
    }
});



const config = require('../config')
const { cmd, commands } = require('../command')
const axios = require('axios'); 
const sharp = require('sharp');
const fg = require('api-dylux');
const fetch = require('node-fetch');

let isUploadingAni = false;
const FOOTER_TEXT = `${config.FOOTER}`

async function getResizedThumb(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');
        return await sharp(buffer)
            .resize(200, 200, { fit: 'cover' }) 
            .jpeg({ quality: 80 }) 
            .toBuffer();
    } catch (e) {
        console.error("Sharp Error:", e.message);
        return null;
    }
}

// ==================== 1. ANIME SEARCH ====================
cmd({
    pattern: "anime",
    react: '🔍',
    category: "movie",
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



        if (!q) return await reply('\*Please enter an Anime name! ⛩️\*');

        const { data } = await axios.get(`https://www.movanest.xyz/v2/animeko/search?q=${encodeURIComponent(q)}&your_api_key=movanest-key9HJRIO45DC`);

        // Changed data.result to data.results
        if (!data || !data.results || !Array.isArray(data.results) || data.results.length === 0) {
            return await reply('\*No results found ❌\*');
        }

        let srh = data.results.map(v => ({
            title: v.title.trim(),
            rowId: `${prefix}aniinfo ${v.url}`
        }));

        await conn.listMessage(from, {
            text: `\_*ANIMEKO SEARCH RESULTS ⛩️*_\n\n\*🔎 Input:\* ${q}\n\n\*Select an anime from the list below.\*`,
            footer: config.FOOTER,
            title: '', 
            buttonText: 'Click to View Results 🎬',
            sections: [{ title: "[Available Anime]", rows: srh }]
        }, mek);

    } catch (e) { reply('🚩 \*Error during search!\*'); }
});

// ==================== 2. ANIME INFO & EPISODES ====================
cmd({
    pattern: "aniinfo",
     category: "movie",
    react: "⛩️",
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



        const { data } = await axios.get(`https://www.movanest.xyz/v2/animeko/detail?url=${encodeURIComponent(q)}&your_api_key=movanest-key9HJRIO45DC`);
        // Changed data.result to data.results
        const anime = data.results;

        if (!anime) return await reply("\*Couldn't find Anime info!\*");
        const posterUrl = anime.imageUrl.cover || config.LOGO;

        let rows = [];

         rows.push({
            buttonId: `${prefix}anidetails ${q}`,
            buttonText: { displayText: 'View Details Card 📋\n' },
            type: 1
        });
        
        rows.push({
            buttonId: `${prefix}aniallquality ${q}±${anime.imageUrl.cover}±${anime.title}`,
            buttonText: { displayText: `📥 Download All Episodes` },
            type: 1
        });

        anime.episodes.forEach(ep => {
            rows.push({
                buttonId: `${prefix}aniquality ${ep.url}±${anime.imageUrl.cover}±${ep.title}±${q}`,
                buttonText: { displayText: ep.title },
                type: 1
            });
        });

        const captionText = `\*🍿 𝗧ɪᴛ𝗹𝗲 ➮\* \*\_${anime.title}\_\*\n\*🎭 𝐆𝐞𝐧𝐫𝐞𝐬 ➮\* \_${anime.genres || 'N/A'}\_\n\n\*Select an Episode below:\*`;

        await conn.buttonMessage(from, {
            image: { url: posterUrl },
            caption: captionText,
            footer: config.FOOTER,
            buttons: rows.slice(0, 25), 
            headerType: 4
        }, mek);

    } catch (e) { reply('🚩 \*Error fetching episodes!\*'); }
});

// ==================== 3. DETAILS CARD ====================
cmd({
    pattern: "anidetails",
    react: '📋',
     category: "movie",
    desc: "Rich Anime info card",
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



        const { data } = await axios.get(`https://www.movanest.xyz/v2/animeko/detail?url=${encodeURIComponent(q)}&your_api_key=movanest-key9HJRIO45DC`);
        // Changed data.result to data.results
        const anime = data.results;

        let msg = `\*✨ 𝐀𝐍𝐈𝐌𝐄 𝐃𝐄𝐓𝐀𝐈𝐋𝐒 ✨\*\n\n` +
                  `\*🍿 𝐓ɪ𝐓ʟ𝐄 ➮\* \*\_${anime.title || 'N/A'}\_\*\n` +
                  `\*🌟 𝐒𝐭𝐚𝐭𝐮𝐬 ➮\* \_${anime.status || 'N/A'}\_\n` +
                  `\*🎞️ 𝐓𝐲𝐩𝐞 ➮\* \_${anime.type || 'N/A'}\_\n` +
                  `\*⚡ 𝐒𝐞𝐚𝐬𝐨𝐧 ➮\* \_${anime.season || 'N/A'}\_\n` +
                  `\*⛩ 𝐒𝐭𝐮𝐝𝐢𝐨 ➮\* \_${anime.studio || 'N/A'}\_\n` +
                  `\*🎭 𝐆𝐞𝐧𝐫𝐞𝐬 ➮\* \_${anime.genres || 'N/A'}\_\n\n` +
                  `${config.FOOTER}`;

        await conn.sendMessage(config.JID ||from, { 
            image: { url: anime.imageUrl.cover }, 
            caption: msg 
        }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
    } catch (e) { reply('🚩 \*Error fetching details card!\*'); }
});

// ==================== 4. QUALITY SELECTION ====================
cmd({
    pattern: "aniquality",
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



        const [epUrl, imgLink, title, mainUrl] = q.split("±");
        
        const { data } = await axios.get(`https://www.movanest.xyz/v2/animeko/stream?url=${encodeURIComponent(epUrl)}&your_api_key=movanest-key9HJRIO45DC`);

        let rows = [];

        if (data.results && data.results.downloadLinks) {
            data.results.downloadLinks.forEach(item => {
                const quality = item.quality; 
                item.links.forEach(dl => {
                    // PixelD සබැඳි පමණක් තෝරාගැනීම
                    if (dl.name === "PixelD") {
                        rows.push({
                            buttonId: `${prefix}anidl ${dl.url}±${imgLink}±${title}±${mainUrl}±${quality}`,
                            buttonText: { displayText: `PixelD - ${quality}` },
                            type: 1
                        });
                    }
                });
            });
        }

        if (rows.length === 0) return await reply('🚩 \*No PixelD download links found for this episode!\*');

        await conn.buttonMessage(from, {
            image: { url: imgLink || config.LOGO },
            caption: `\*🎥 Select Quality for:\* \n_${title}_\n`,
            footer: config.FOOTER,
            buttons: rows.slice(0, 35),
            headerType: 4
        }, mek);

    } catch (e) { 
        console.error("Error Detail:", e);
        reply(`🚩 Error fetching qualities!`); 
    }
});
// ==================== 5. ALL EPISODES QUALITY SELECTION ====================
cmd({
    pattern: "aniallquality",
    react: "📑",
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



        const [mainUrl, imgLink, title] = q.split("±");
        
        const detailRes = await axios.get(`https://www.movanest.xyz/v2/animeko/detail?url=${encodeURIComponent(mainUrl)}&your_api_key=movanest-key9HJRIO45DC`);

        if (!detailRes.data.results || !detailRes.data.results.episodes || detailRes.data.results.episodes.length === 0) {
            return await reply("🚩 No episodes found to fetch quality!");
        }

        const firstEpUrl = detailRes.data.results.episodes.url;
        const streamRes = await axios.get(`https://www.movanest.xyz/v2/animeko/stream?url=${encodeURIComponent(firstEpUrl)}&your_api_key=movanest-key9HJRIO45DC`);

        let rows = [];
        
        if (streamRes.data.results && streamRes.data.results.downloadLinks) {
            streamRes.data.results.downloadLinks.forEach(dl => {
                // අදාළ quality එකේ PixelD ලින්ක් එකක් තියෙනවද කියලා check කිරීම
                const hasPixelD = dl.links.some(link => link.name === "PixelD");
                
                if (hasPixelD) {
                    rows.push({
                        buttonId: `${prefix}anidlall ${mainUrl}±${imgLink}±${title}±${dl.quality}`,
                        buttonText: { displayText: dl.quality },
                        type: 1
                    });
                }
            });
        }

        if (rows.length === 0) return await reply("🚩 No PixelD qualities found in API response.");

        await conn.buttonMessage(from, {
            image: { url: imgLink || config.LOGO },
            caption: `\*📥 DOWNLOAD ALL EPISODES\*\n\n\*Anime:\* ${title}\n\*Select the quality for all episodes:*\n`,
            footer: config.FOOTER,
            buttons: rows,
            headerType: 4
        }, mek);

    } catch (e) { 
        console.error("Error Detail:", e);
        reply(`🚩 Error fetching quality list!`); 
    }
});
// ==================== 6. DOWNLOAD ALL EXECUTION ====================
cmd({
    pattern: "anidlall",
    react: "⏳",
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



        const [mainUrl, imgLink, title, selectedQuality] = q.split("±");
        await reply(`\*🚀 Downloading all episodes in ${selectedQuality}...\*`);

        const { data: detailData } = await axios.get(`https://www.movanest.xyz/v2/animeko/detail?url=${encodeURIComponent(mainUrl)}&your_api_key=movanest-key9HJRIO45DC`);

        for (const ep of detailData.results.episodes) {
            const { data: streamData } = await axios.get(`https://www.movanest.xyz/v2/animeko/stream?url=${encodeURIComponent(ep.url)}&your_api_key=movanest-key9HJRIO45DC`);

            let downloadUrl = null;
            // PixelD සබැඳිය සොයාගැනීම
            for (const item of streamData.results.downloadLinks) {
                if (item.quality === selectedQuality) {
                    const pixelLink = item.links.find(l => l.name === "PixelD");
                    if (pixelLink) {
                        downloadUrl = pixelLink.url.replace("/u/", "/api/file/");
                    }
                }
            }
const resizedThumb = await getResizedThumb(imgLink);
            if (downloadUrl) {
                await conn.sendMessage(config.JID || from, { 
                    document: { url: downloadUrl }, 
                    fileName: "⛩️ " + ep.title + ".mp4", 
                    mimetype: "video/mp4",
                    jpegThumbnail: resizedThumb,
                    caption: `🎬 \*𝗡𝗮𝗺𝗲 :\* ${ep.title}\n\n\`[${selectedQuality}]\`\n\n${config.FOOTER}`
                });
                await new Promise(resolve => setTimeout(resolve, 3000)); // Rate limit මගහැරීමට
            }
        }
        await reply(`\*✅ All episodes sent successfully!\*`);
    } catch (e) { 
        console.error(e);
        reply('\*Critical error in Download All!\*'); 
    }
});
// ==================== 7. FINAL INDIVIDUAL DOWNLOAD ====================
cmd({
    pattern: "anidl",
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



        // q.split("±") මගින් දත්ත ලබාගැනීම
        let [downloadUrl, imgLink, title, mainUrl, quality] = q.split("±");

        // PixelD link එකක් නම් URL එක වෙනස් කිරීම
        if (downloadUrl.includes("pixeldrain.com/u/")) {
            downloadUrl = downloadUrl.replace("/u/", "/api/file/");
        }
const resizedThumb = await getResizedThumb(imgLink);
        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

        await conn.sendMessage(config.JID || from, { 
            document: { url: downloadUrl }, 
            fileName: title.trim() + ".mp4", 
            mimetype: "video/mp4",
            jpegThumbnail: resizedThumb,
            caption: `🎬 *𝗡𝗮𝗺𝗲 :* ${title}\n\n\`[${quality}]\`\n\n${config.FOOTER}`
        });

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
    } catch (e) { 
        console.error(e);
        reply('\*Download Error !!\*'); 
    }
});

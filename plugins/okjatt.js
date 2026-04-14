const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');
const sharp = require('sharp');

// 1. Search Command
cmd({
    pattern: "okjatt",
    react: '🔎',
    category: "movie",
    desc: "Search movies on okjatt",
    use: ".okjatt <movie name>",
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



        if (!q) return await reply('*Please enter a movie name! 🎬*');
        const { data } = await axios.get(`https://okjact-mv.vercel.app/api/search?q=${encodeURIComponent(q)}`);
        
        if (!data || !data.results.length) return await reply('*No results found ❌*');

        let srh = data.results.map(v => ({
            title: v.title.substring(0, 60),
            rowId: `${prefix}okinfo ${v.link}±${encodeURIComponent(v.img)}`
        }));

        const sections = [{ title: "Results", rows: srh }];

        if (config.BUTTON === "true") {
            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: `_*OKJATT SEARCH RESULTS*_\n\n*Input:* ${q}`,
                footer: config.FOOTER,
                buttons: [{
                    buttonId: "movie_list",
                    buttonText: { displayText: "🎥 Select Movie" },
                    type: 4,
                    nativeFlowInfo: { name: "single_select", paramsJson: JSON.stringify({ title: "Choose a Movie 🎬", sections }) }
                }],
                headerType: 4,
                viewOnce: true
            }, { quoted: mek });
        } else {
            await conn.listMessage(from, { text: `_*OKJATT SEARCH RESULTS*_\n\n*Input:* ${q}`, footer: config.FOOTER, title: 'Results 🎥', buttonText: '*Select Number 🔢*', sections }, mek);
        }
    } catch (e) { reply('🚫 Error: ' + e.message); }
});

// 2. Info Command
cmd({
    pattern: "okinfo",
    react: "🎥",
     category: "movie",
    filename: __filename
}, async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
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



        const [url, thumb] = q.split("±");
        const decodedThumb = decodeURIComponent(thumb);
        
        const { data } = await axios.get(`https://okjact-mv.vercel.app/api/info?url=${encodeURIComponent(url)}`);
        
        let msg = `🎬 *${data.title}*\n\n`;
        msg += `✨ *Genre:* ${data.genres}\n`;
        msg += `📅 *Release:* ${data.releaseDate}\n`;
        msg += `⏳ *Duration:* ${data.duration}\n`;
        msg += `🔊 *Languages:* ${data.languages}\n`;
        msg += `📝 *Description:* ${data.description.substring(0, 100)}...`;

        if (config.BUTTON === "true") {
            await conn.sendMessage(from, {
                image: { url: decodedThumb },
                caption: msg,
                footer: config.FOOTER,
                buttons: [{
                    buttonId: `${prefix}okdl ${data.downloadLink}±${decodedThumb}±${encodeURIComponent(data.title)}`,
                    buttonText: { displayText: `⬇️ Download ${data.quality} (${data.size})` },
                    type: 1
                }],
                headerType: 4
            }, { quoted: mek });
        } else {
            let buttons = [{
                buttonId: `${prefix}okdl ${data.downloadLink}±${decodedThumb}±${encodeURIComponent(data.title)}`,
                buttonText: { displayText: "⬇️ Download Now" },
                type: 1
            }];
            await conn.buttonMessage(from, { image: { url: decodedThumb }, caption: msg, footer: config.FOOTER, buttons, headerType: 4 }, mek);
        }
    } catch (err) { reply("🚫 *Error:* " + err.message); }
});

// 3. Download Command
cmd({
    pattern: "okdl",
    react: "⬇️",
     category: "movie",
    filename: __filename
}, async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
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



        const [url, thumb, title] = q.split("±");
        const decodedTitle = decodeURIComponent(title);
        const fetchingMsg = await conn.sendMessage(from, { text: '*Fetching download link... ⏳*' }, { quoted: mek });

        const { data } = await axios.get(`https://okjact-mv.vercel.app/api/download?url=${encodeURIComponent(url)}`);
        
        if (!data.downloadLink) return await conn.sendMessage(from, { text: '❌ *Could not get download link.*', edit: fetchingMsg.key });

        await conn.sendMessage(from, { text: '*Uploading your movie... ⬆️*', edit: fetchingMsg.key });

        let thumbBuffer;
        try {
            const resImg = await axios.get(decodeURIComponent(thumb), { responseType: 'arraybuffer' });
            thumbBuffer = await sharp(resImg.data).resize(200, 200).toBuffer();
        } catch (err) { thumbBuffer = undefined; }

        await conn.sendMessage(from, {
            document: { url: data.downloadLink },
            caption: `🎬 *${decodedTitle}*\n\n✅ *Downloaded via Okjatt*\n\n ${config.FOOTER}`,
            fileName: `${decodedTitle}.mp4`,
            mimetype: "video/mp4",
            jpegThumbnail: thumbBuffer
        }, { quoted: mek });
        
        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
    } catch (e) { reply('🚫 Error: ' + e.message); }
});

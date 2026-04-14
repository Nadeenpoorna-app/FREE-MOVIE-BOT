const { cmd,command } = require('../command');
const axios = require('axios');
const config = require('../config');
const sharp = require('sharp');
const { fetchJson, sleep, getBuffer } = require('../lib/functions');

// 1. Thenkiri Search
cmd({
    pattern: "thenkiri",
    react: '🔎',
    category: "movie",
    desc: "Search movies on thenkiri.com",
    use: ".thenkiri <movie name>",
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


        if (!q) return await reply('*කරුණාකර චිත්‍රපටයේ නම ඇතුළත් කරන්න! 🎬*');
        const { data } = await axios.get(`https://thenkiri-api.vercel.app/api/search?q=${encodeURIComponent(q)}`);
        
        if (!data.results || data.results.length === 0) return await reply('*කිසිදු ප්‍රතිඵලයක් හමු නොවීය ❌*');

        let rows = data.results.map(v => ({
            title: v.title.substring(0, 60),
            rowId: `${prefix}theninfo ${v.url}±${v.image}±${encodeURIComponent(v.title)}`
        }));

        const sections = [{ title: "[Thenkiri.com Search Results]", rows }];
        const msg = `_*THENKIRI SEARCH RESULTS*_\n\n*Input:* ${q}`;

        if (config.BUTTON === "true") {
            await conn.sendMessage(from, {
                image: { url: data.results.image || config.LOGO },
                caption: msg,
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
            await conn.listMessage(from, { text: msg, footer: config.FOOTER, title: 'Results 🎥', buttonText: '*Select Number 🔢*', sections }, mek);
        }
    } catch (e) { reply('🚫 Search Error: ' + e.message); }
});

// 2. Info Command (Image Fix)
cmd({
    pattern: "theninfo",
    react: "🎥",
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
        const { data } = await axios.get(`https://thenkiri-api.vercel.app/api/info?url=${encodeURIComponent(url)}`);
        
        let msg = `🎬 *${decodedTitle}*\n\n*🧿Description:* ${data.description}\n\n⬇️ *Select download option below*`;

        // Button Mode (True)
        if (config.BUTTON === "true") {
            const listRows = data.download_links.map(v => ({
                title: v.text[0],
                id: `${prefix}thendl ${v.url[0]}±${thumb}±${encodeURIComponent(decodedTitle)}`
            }));
            await conn.sendMessage(from, {
                image: { url: thumb },
                caption: msg,
                footer: config.FOOTER,
                buttons: [{
                    buttonId: "download_list",
                    buttonText: { displayText: "⬇️ Download" },
                    type: 4,
                    nativeFlowInfo: { name: "single_select", paramsJson: JSON.stringify({ title: "Available Quality", sections: [{ title: "Quality", rows: listRows }] }) }
                }],
                headerType: 1
            }, { quoted: mek });
        } 
        // Button False (Normal Buttons)
    else {
            let buttons = data.download_links.map(v => {
    // 1. ප්‍රමාණය (v.size) පිරිසිදු කිරීම
    // එය array එකක් නම් තෝරන්න, නැත්නම් කෙලින්ම ගන්න
    let rawSize = Array.isArray(v.size) ? v.size : (v.size || "");
    
    // 2. "This Video is" කොටස ඉවත් කිරීම
    let cleanSize = rawSize.toString().replace(/This Video is/gi, "").trim();

    return {
        buttonId: `${prefix}thendl ${v.url}±${data.image}±${encodeURIComponent(decodedTitle)} - ${v.text}`,
        // 3. දැන්displayText එකට v.text සහ පිරිසිදු කළ cleanSize එක එකතු කරන්න
        buttonText: { displayText: `${v.text} - ${cleanSize}` },
        type: 1
    };
});
            // පින්තූරය සමඟ බොත්තම් යැවීම
            await conn.buttonMessage(from, { image: { url: data.image }, caption: msg, footer: config.FOOTER, buttons, headerType: 4 }, mek);
        }
    } catch (err) { reply("🚫 *Error:* " + err.message); }
});
// 3. Download Command (Final URL Fix)
cmd({
    pattern: "thendl",
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


        console.log("Input variable (q):", q);
        if (!q) return;
        const [url, thumb, title] = q.split("±");
        const decodedTitle = decodeURIComponent(title);
       
        const fetchingMsg = await conn.sendMessage(from, { text: '🚀 *Downloading File...*' }, { quoted: mek });

        // Download API Call
        const { data } = await axios.get(`https://thenkiri-api.vercel.app/api/download?url=${encodeURIComponent(url)}`);
        
        // මෙහිදී data.final_url තිබේදැයි පරීක්ෂා කරයි
        if (!data.final_url) {
            return await conn.sendMessage(from, { text: '❌ *සෘජු බාගත කිරීමේ ලින්ක් එක සොයාගත නොහැක. වෙබ් අඩවියේ ගැටලුවක් විය හැක.*' }, { edit: fetchingMsg.key });
        }

       const fetchingMsg2 = await conn.sendMessage(from, { text: '⬆️ *Uploading File...*' }, { edit: fetchingMsg.key });

        // Thumbnail එක Buffer එකක් ලෙස ලබා ගැනීම
       let thumbnailBuffer = null;
try {
    const res = await axios.get(thumb, { responseType: 'arraybuffer' });
    
    // sharp මගින් jpg බවට හරවා, ප්‍රමාණය වෙනස් කර, buffer එකක් ලෙස ලබා ගනී
    thumbnailBuffer = await sharp(res.data)
        .resize(200, 200, { fit: 'cover' }) // ප්‍රමාණය 300x300 ලෙස ස්ථාවර කරයි
        .toFormat('jpeg')                   // අනිවාර්යයෙන්ම JPG/JPEG කරයි
        .jpeg({ quality: 80 })              // ගුණාත්මක භාවය
        .toBuffer();
} catch (e) {
    console.log("Thumbnail processing error:", e.message);
    thumbnailBuffer = null; // දෝෂයක් වුවහොත් thumbnail එක නැතිව යවයි
}

// ෆයිල් එක යැවීම
await conn.sendMessage( config.JID || from, {
    document: { url: data.final_url },
    caption: `🎬 *${decodedTitle}*\n\n✅ *Downloaded via Thenkiri*\n\n${config.FOOTER}`,
    fileName: `${decodedTitle}.mkv`,
    mimetype: "video/mp4",
    // මෙතැනදී jpgThumbnail ලෙස buffer එක ලබා දෙයි
    jpegThumbnail: thumbnailBuffer 
}, { quoted: mek });
        
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
        await conn.sendMessage(from, { delete: fetchingMsg.key });
        await conn.sendMessage(from, { delete: fetchingMsg2.key });

    } catch (e) {
        reply('🚫 Download Error: ' + e.message);
        console.log("🚫Up error:", e.message);
    }
});

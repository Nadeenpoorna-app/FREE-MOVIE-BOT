const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

const API_KEY = "charuka-key-666";

// 1. Search Command
cmd({
    pattern: "subz",
    react: '🔎',
    category: "movie",
    desc: "Search movies on subz.lk",
    use: ".subz <query>",
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
        const { data } = await axios.get(`https://my-apis-site.vercel.app/movie/subz/search?text=${encodeURIComponent(q)}&apikey=${API_KEY}`);
        
        if (!data.status || !data.result.length) return await reply('*No results found ❌*');

        let srh = data.result.map(v => ({
            title: v.title.substring(0, 60),
            rowId: `${prefix}subinfo ${v.url}`
        }));

        const sections = [{ title: "[Subz.lk Search Results]", rows: srh }];

        if (config.BUTTON === "true") {
            await conn.sendMessage(from, {
                caption: `_*SUBZ.LK SEARCH RESULTS*_\n\n*Input:* ${q}`,
                footer: config.FOOTER,
                buttons: [{
                    buttonId: "subz_list",
                    buttonText: { displayText: "🎥 Select Movie" },
                    type: 4,
                    nativeFlowInfo: { name: "single_select", paramsJson: JSON.stringify({ title: "Choose a Movie 🎬", sections }) }
                }],
                headerType: 1
            }, { quoted: mek });
        } else {
            await conn.listMessage(from, { text: `_*SUBZ.LK SEARCH RESULTS*_\n\n*Input:* ${q}`, footer: config.FOOTER, title: 'Results 🎥', buttonText: '*Select Number 🔢*', sections }, mek);
        }
    } catch (e) { reply('🚫 Error: ' + e.message); }
});

// 2. Info Command (Fixed Button/List Mode)
cmd({
    pattern: "subinfo",
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


        const { data } = await axios.get(`https://my-apis-site.vercel.app/movie/subz/movie?url=${encodeURIComponent(q)}&apikey=${API_KEY}`);
        const info = data.result;

        let msg = `🎬 *${info.title.split('\n')}*\n\n📝 *Description:* ${info.description.substring(0, 100)}...`;

        // 1. BUTTON MODE TRUE (Single Select Button)
        if (config.BUTTON === "true") {
            const listRows = info.torrentLinks.map((v, i) => ({
                title: `${v.quality || 'HD'} (${v.size})`,
                id: `${prefix}torren ${v.link}±${info.image}±${encodeURIComponent(info.title.split('\n'))}±${v.quality}`
            }));

            await conn.sendMessage(from, {
                image: { url: info.image },
                caption: msg,
                footer: config.FOOTER,
                buttons: [{
                    buttonId: "torrent_list",
                    buttonText: { displayText: "📥 Download Torrent" },
                    type: 4,
                    nativeFlowInfo: { 
                        name: "single_select", 
                        paramsJson: JSON.stringify({ 
                            title: "Select Quality", 
                            sections: [{ title: "Available Torrents", rows: listRows }] 
                        }) 
                    }
                }],
                headerType: 4
            }, { quoted: mek });
        } 
        // 2. BUTTON MODE FALSE (Standard Buttons)
        else {
            let buttons = info.torrentLinks.slice(0, 3).map((v, i) => ({
                buttonId: `${prefix}torren ${v.link}±${info.image}±${encodeURIComponent(info.title.split('\n'))}±${v.quality}`,
                buttonText: { displayText: `${v.quality || 'Quality'} - ${v.size}` },
                type: 1
            }));

            await conn.buttonMessage(from, {
                image: { url: info.image },
                caption: msg + "\n\n*Select quality below:*",
                footer: config.FOOTER,
                buttons: buttons,
                headerType: 4
            }, mek);
        }
    } catch (err) { 
        reply("🚫 *Error:* " + err.message); 
    }
});

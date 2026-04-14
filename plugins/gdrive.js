const config = require('../config')
const fg = require('api-dylux');
const axios = require('axios'); // axios අනිවාර්යයෙන් අවශ්‍යයි
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

cmd({
    pattern: "gdrive",
    alias: ["gd"],
    react: '📑',
    desc: "Download googledrive files with limit bypass.",
    category: "download",
    use: '.gdrive <googledrive link>',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isPre, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try {
    // 1. Authorization Check

    if (!q) return await reply('*Please give me a Google Drive URL !!*');
    if (!isUrl(q) && !q.includes('drive.google.com')) return await reply('*Invalid Google Drive URL !!*');

    await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

    // 2. Extract File ID
    const fileId = q.match(/(?:\/d\/|id=)([\w-]+)/)?.[1];
    if (!fileId) return reply("❌ මට මේ ලින්ක් එකෙන් File ID එක හොයාගන්න බැහැ.");

    // 3. Bypass Logic - මෙතනදී අපි confirm code එක auto-fetch කරනවා
    const baseLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
    let finalDlUrl = baseLink;

    try {
        const response = await axios.get(baseLink, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'
            }
        });
        const confirmCode = response.data.match(/confirm=([0-9A-Za-z_]+)/)?.[1];
        if (confirmCode) {
            finalDlUrl = `${baseLink}&confirm=${confirmCode}`;
        }
    } catch (e) {
        console.log("Bypass Fetch Error: ", e.message);
    }

    // 4. Get File Info using api-dylux
    let res;
    try {
        // ලින්ක් එක dylux එකට ගැලපෙන ලෙස සකසා දීම
        let cleanUrl = q.split('?')[0].split('&')[0];
        res = await fg.gdrive(cleanUrl);
    } catch (e) {
        // dylux fail වුණොත් default අගයන් දෙනවා
        res = {
            fileName: `Nadeen_GD_${fileId}.mkv`,
            fileSize: 'Unknown',
            mimetype: 'video/x-matroska',
            downloadUrl: finalDlUrl
        };
    }

    // 5. Console එකේ විස්තර පෙන්වීම (ඔයා ඉල්ලපු විදියට)
    console.log("=========================================");
    console.log(`📄 Title: ${res.fileName}`);
    console.log(`⚖️ Size: ${res.fileSize}`);
    console.log(`🚀 Generated URL: ${finalDlUrl}`);
    console.log("=========================================");

    // 6. Reply the Details
    let info = `*⬇ NADEEN-MD GDRIVE DOWNLOADER ⬇* \n\n` +
               `*📃 File name:* ${res.fileName}\n` +
               `*💈 File Size:* ${res.fileSize}\n` +
               `*🕹️ File type:* ${res.mimetype}\n\n` +
               `*•ɴᴀᴅᴇᴇɴ-ᴍᴅ•*`;
    
    await reply(info);

    // 7. Send the Document
    await conn.sendMessage(from, { 
        document: { url: finalDlUrl }, 
        fileName: res.fileName, 
        mimetype: res.mimetype, 
        caption: res.fileName.replace('[Cinesubz.co]' ,'') + '\n\n> *•ɴᴀᴅᴇᴇɴ-ᴍᴅ•*' 
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

} catch (e) {
    console.log(e);
    reply('*Error !! Google Drive ලිමිට් පැනලා හෝ ලින්ක් එකේ ගැටලුවක්.*');
    l(e);
}
})

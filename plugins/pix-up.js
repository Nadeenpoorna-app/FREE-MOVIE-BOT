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
  fileType = require('file-type')

cmd({
    pattern: "uploadfile",
    alias: ["up"],
	react: "💿",
    desc: "Direct or GDrive link to Pixeldrain",
    category: "main",
    use: '.upload filename , link',
    filename: __filename
},
async (conn, mek, m, { reply, q, from }) => {
    try {
        if (!q || !q.includes(',')) return await reply("⚠️ Usage: .upload filename , link");

        let parts = q.split(',');
        let userFileName = parts[0].trim(); // User dena name eka
        let inputUrl = parts[1].trim();
        let finalDirectLink = inputUrl;
        let finalFileName = userFileName; // Default name eka widiyata user deepu eka gannawa

        // 1. Google Drive Check
        const isGDrive = inputUrl.includes('drive.google.com') || inputUrl.includes('drive.usercontent.google.com');

        if (isGDrive) {
            await reply("*🔍 GDrive detected. Extracting details...*");
            try {
                let driveUrl = inputUrl
                    .replace('https://drive.usercontent.google.com/download?id=', 'https://drive.google.com/file/d/')
                    .replace('&export=download', '/view');

                let res = await fg.GDriveDl(driveUrl);

                if (res && res.downloadUrl) {
                    finalDirectLink = res.downloadUrl;

                    // API eken real fileName ekak awilla thiyeda balala eka gannawa
                    if (res.fileName) {
                        finalFileName = res.fileName.replace('CineSubz.com', 'DinkaMoviesLk.app');
                    }
                } else {
                    return await reply("❌ Could not extract Direct Link from Google Drive.");
                }
            } catch (driveErr) {
                return await reply("❌ GDrive Error: " + driveErr.message);
            }
        }

        // 2. Upload Process
        await reply(`*📤 Uploading:* ${finalFileName}\n*Status:* Processing...`);

        const uploadRes = await axios.post('https://mega-uploder-sadaslk-393123781d0e.herokuapp.com/upload', {
            fileName: finalFileName,
            fileUrl: finalDirectLink
        });

        const jobId = uploadRes.data.jobId || uploadRes.data.id;
        if (!jobId) return await reply("❌ Failed to start upload.");

        let attempts = 0;
        const maxAttempts = 10;

        // 3. Status Polling
        const checkStatus = setInterval(async () => {
            try {
                attempts++;

                const statusRes = await axios.get(`https://mega-uploder-sadaslk-393123781d0e.herokuapp.com/status/${jobId}`);
                const data = statusRes.data || {};

                if (data.status === "completed") {
                    clearInterval(checkStatus);

                    // ✅ build DIRECT download link safely
                   let rawLink = data.link;


                    return await reply(
                        `*✅ Upload Successful!*\n\n*🎬File:* ${finalFileName}\n\n*📎Link:* ${rawLink}`
	    );
                }

                if (data.status === "failed") {
                    clearInterval(checkStatus);
                    return await reply("❌ Server reported a failure.");
                }

                if (attempts >= maxAttempts) {
                    clearInterval(checkStatus);
                    return await reply(`*⚠️ Timeout:* Tried ${maxAttempts} times. Job ID: ${jobId}`);
                }

            } catch (err) {
                console.log("Polling error:", err.message);
            }
        }, 5000);

    } catch (e) {
        console.log("Final error:", e);
        await reply('*❌ Error occurred!*');
    }
});

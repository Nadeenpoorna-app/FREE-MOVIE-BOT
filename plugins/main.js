const config = require('../config')
const os = require('os')
const axios = require('axios');
const mimeTypes = require("mime-types");
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { generateForwardMessageContent, prepareWAMessageFromContent, generateWAMessageContent, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')
const https = require("https")
const { getPremiumInfo } = require('../lib/github_db');
const { URL } = require('url');
const { Octokit } = require("@octokit/core");
const file_size_url = (...args) => import('file_size_url')
    .then(({ default: file_size_url }) => file_size_url(...args));


cmd({
  pattern: "mv",
  react: "🔎",
  alias: ["movie", "film", "cinema"],
  desc: "Smart movie search using central API",
  category: "movie",
  use: '.movie',
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




    if (!q) return await reply('*Enter movie name..🎬*');

    // සෙවීම ආරම්භ කරන විට React එක මාරු කිරීම
    await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

    // 2. Main API එකට Call කිරීම
    const apiUrl = `https://all-mvv-nadeen.vercel.app/api/search?q=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    
    // දත්ත සැකසෙන අතරතුර React එක මාරු කිරීම
    await conn.sendMessage(from, { react: { text: '✔', key: mek.key } });
    
    const data = response.data;

    // 3. Results තියෙනවාදැයි පරීක්ෂා කිරීම
    if (!data.status || !data.available_sites || data.available_sites.length === 0) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return await reply(`❌ No results found for *"${q}"* on any site.`);
    }

    const caption = `╭─────────── 🎬𝗠𝙾𝗩𝙸𝙴乂𝐆🄾 ───────────╮
│
│ 🔎 *Search Query:* \`${q}\`
│ 📊 *Total Found:* \`${data.count}\`
│
├───────────────────────────────────┤
│ ✨ *Please select your Want Site below:*
╰───────────────────────────────────╯
   *( Powered by 𝗡𝙰𝙳𝙴𝙴𝙽-𝗠𝙳 )*`;

    let finalResponse;

    // 4. Button / List Message එක යැවීම
    if (config.BUTTON === "true") {
      const listButtons = {
        title: "❯❯ Available Movie Sources ❮❮",
        sections: [{
          title: "Verified Results ✅",
          rows: data.available_sites.map(src => ({
            title: `${src.name} Results 🎬`,
            description: `Click to view movies from ${src.name}`,
            id: prefix + src.cmd + ' ' + q
          }))
        }]
      };

      finalResponse = await conn.sendMessage(from, {
        image: { url: 'https://nadeen-botzdatabse.vercel.app/MOVIExGO.png' },
        caption,
        footer: config.FOOTER,
        buttons: [{
          buttonId: "mv_select",
          buttonText: { displayText: "🎥 Select Source" },
          type: 4,
          nativeFlowInfo: {
            name: "single_select",
            paramsJson: JSON.stringify(listButtons)
          }
        }],
        headerType: 1
      }, { quoted: mek });

    } else {
      const buttons = data.available_sites.slice(0, 15).map(src => ({
        buttonId: prefix + src.cmd + ' ' + q,
        buttonText: { displayText: `${src.name}` },
        type: 1
      }));

      finalResponse = await conn.buttonMessage2(from, {
        image: { url: 'https://nadeen-botzdatabse.vercel.app/MOVIExGO.png' },
        caption,
        footer: config.FOOTER,
        buttons,
        headerType: 4
      }, mek);
    }

    // සාර්ථකව අවසන් වූ පසු ✔ React එක දැමීම
    if (finalResponse) {
      await conn.sendMessage(from, { react: { text: '✔', key: mek.key } });
    }

  } catch (e) {
    l(e);
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    reply('*❌ API Error or Connection Issue*');
  }
});



cmd({
  pattern: "alive",
  react: "🍿",
  alias: ["online", "test", "bot"],
  desc: "Check if bot is online.",
  category: "main",
  use: ".alive",
  filename: __filename
},
async (conn, mek, m, { from, pushname, prefix, isPre, senderNumber, reply, l }) => {
  try {
    // Detect hosting environment
    const hostnameLength = os.hostname().length;
    let hostname = "Unknown";
    switch (hostnameLength) {
      case 12: hostname = 'Replit'; break;
      case 36: hostname = 'Heroku'; break;
      case 8:  hostname = 'Koyeb'; break;
      default: hostname = os.hostname();
    }

    // RAM + Uptime + Participants
    const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const ramTotal = Math.round(os.totalmem() / 1024 / 1024);
    const ramUsage = `${ramUsed}MB / ${ramTotal}MB`;
    const rtime = await runtime(process.uptime());
    
    let totalUsers = "N/A";
    try {
        const metadata = await conn.groupMetadata(from);
        totalUsers = metadata.participants.length;
    } catch (e) {
        totalUsers = "Private Chat";
    }
	
const premInfo = await getPremiumInfo(senderNumber);
const todayDate = new Date().toLocaleDateString('en-CA');
    // Base buttons
    const baseButtons = [
      { buttonId: prefix + 'menu', buttonText: { displayText: 'COMMAND MENU' }, type: 1 },
      { buttonId: prefix + 'ping', buttonText: { displayText: 'NADEEN SPEED' }, type: 1 },
      { buttonId: prefix + 'system', buttonText: { displayText: 'SYSTEM INFO.' }, type: 1 }
    ];

    // List buttons for nativeFlow
    const listButtons = {
      title: "Command Menu",
      sections: [{
        title: "Main Commands",
        rows: [
          { title: "Command Menu", description: "Show command menu", id: prefix + 'menu' },
          { title: "Bot Speed", description: "Check bot speed", id: prefix + 'ping' }
        ]
      }]
    };
let premiumDisplay = "";
if (premInfo) {
    premiumDisplay = `*├ \`📅 Today\`* : ${todayDate}\n` +
					 `*├ \`⌛ Expiry\`* : ${premInfo.expiryDate}\n` +
                     `*├ \`⏳ Remaining\`* : ${premInfo.remainingDays} Days`;
} else if (isPre) {
    premiumDisplay = `*├ \`📅 Today\`* : ${todayDate}\n` +
                     `*├ \`⌛ Expiry\`* : *Unlimited 🔥*`;
} else {
    premiumDisplay = `*├ \`📅 Today\`* : ${todayDate}\n` +
                     `*├ \`⌛ Premium\`* : Free User`;
}
    // Default alive message
    if (config.ALIVE === "default") {
      const details = (await axios.get('https://nadeen-botzdatabse.vercel.app/data.json')).data;

      const defaultMessage = {
        image: { url: config.LOGO },
        caption: `🎬 *【 𝗠𝙾𝗩𝙸𝙴乂𝐆🄾 】* 🎬

*Hello ${pushname}* 👋🍿
NADEEN-MD is powered up and ready to serve!

*╭───────────────────────◆*
*│ \`🚀 Status\`      :* Online & Active
${premiumDisplay}
*│ \`⏱️ Uptime\`      :* ${rtime}
*│ \`🧠 Engine\`      :* MOVIExGO v1.0
*│ \`🕵️‍♂️ User\` :* ${pushname}
*│ \`👨🏻‍💻 Owner\` :* 94711451319
*│ \`👥 Total Users\` :* ${totalUsers}
*│ \`🎛️ Prefix\`      :* ${config.PREFIX}
*│ \`💾 Memory\`      :* ${ramUsage}
*│ \`🛠️ Devs\`        :* Nadeen Poorna
*╰───────────────────────◆*

*📢 𝗡𝗘𝗪𝗦 & 𝗨𝗣𝗗𝗔𝗧𝗘𝗦*
• *Telegram:* t.me/nadeenx_dev
• *Channel:* ${details.chlink}

*🎭 Experience the best cinematic automation!*`,
        footer: config.FOOTER,
        buttons: baseButtons,
        headerType: 4
      };

      return await conn.buttonMessage2(from, defaultMessage);
    }

    // Custom alive message
    const caption = config.ALIVE;

    if (config.BUTTON === 'true') {
      return await conn.sendMessage(from, {
        image: { url: config.LOGO },
        caption,
        footer: config.FOOTER,
        buttons: [{
          buttonId: "video_quality_list",
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
      const customMessage = {
        image: { url: config.LOGO },
        caption,
        footer: config.FOOTER,
        buttons: baseButtons,
        headerType: 4
      };
      return await conn.buttonMessage2(from, customMessage, mek);
    }
  } catch (error) {
    reply('*An error occurred while checking bot status.*');
    l(error);
  }
});

//...
cmd({
  pattern: "menu",
  react: "📁",
  alias: ["panel", "list", "commands"],
  desc: "Get bot's command list.",
  category: "main",
  use: '.menu',
  filename: __filename
}, 
async (conn, mek, m, { from, pushname, prefix,isPre , reply, l, senderNumber }) => {
  try {
    // Hosting platform detection
    let hostname;
    const hostLen = os.hostname().length;
    if (hostLen === 12) hostname = 'Replit';
    else if (hostLen === 36) hostname = 'Heroku';
    else if (hostLen === 8) hostname = 'Koyeb';
    else hostname = os.hostname();

    // RAM + Uptime + Participants
    const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const ramTotal = Math.round(os.totalmem() / 1024 / 1024);
    const ramUsage = `${ramUsed}MB / ${ramTotal}MB`;
    const rtime = await runtime(process.uptime());
	 

	  const premInfo = await getPremiumInfo(senderNumber);
const todayDate = new Date().toLocaleDateString('en-CA');

	  let premiumDisplay = "";
if (premInfo) {
    premiumDisplay = `*├ \`📅 Today\`* : ${todayDate}\n` +
					 `*├ \`⌛ Expiry\`* : ${premInfo.expiryDate}\n` +
                     `*├ \`⏳ Remaining\`* : ${premInfo.remainingDays} Days`;
} else if (isPre) {
    premiumDisplay = `*├ \`📅 Today\`* : ${todayDate}\n` +
                     `*├ \`⌛ Expiry\`* : *Unlimited 🔥*`;
} else {
    premiumDisplay = `*├ \`📅 Today\`* : ${todayDate}\n` +
                     `*├ \`⌛ Premium\`* : Free User`;
}
	  
    
    let totalUsers = "N/A";
    try {
        const metadata = await conn.groupMetadata(from);
        totalUsers = metadata.participants.length;
    } catch (e) {
        totalUsers = "Private Chat";
    }

    const menuText = `🎬 *【 𝙼𝙾𝚅𝙸𝙴𝚡𝙶𝙾 𝙼𝙴𝙽𝚄 𝙿𝙰𝙽𝙴𝙻 】* 🎬

*Hello ${pushname}* 👋🍿

*╭───────────────────────◆*
*│ \`🎞️ Status\`     :* Online & Rolling 🌟
${premiumDisplay}
*│ \`⏱️ Uptime\`      :* ${rtime}
*│ \`🖥️ Host System\` :* ${hostname}
*│ \`👥 Total Users\` :* ${totalUsers}
*│ \`🎛️ Prefix\`      :* ${config.PREFIX}
*│ \`👤 Active User\` :* ${pushname}
*│ \`💾 RAM Usage\`   :* ${ramUsage}
*│ \`🧬 Developer\`  :* Nadeen Poorna
*│ \`🎥 Edition\`     :* MOVIExGO 
*│ \⚡ Version\`     :* 5.0.0
*╰───────────────────────◆*

*🫟 Your all-in-one WhatsApp assistant — fast, reliable, and easy to use!*`;

    // Load image buffer
    let imageBuffer;
    try {
      const res = await axios.get(config.LOGO, { responseType: 'arraybuffer' });
      imageBuffer = Buffer.from(res.data, 'binary');
    } catch (err) {
      return reply("⚠️ Could not load menu image. Check your LOGO URL.");
    }

    if (config.BUTTON === 'true') {
      const listData = {
        title: "MOVIE-x-GO COMMANDS",
        sections: [{
          title: "Main Categories",
          rows: [
            { title: "🏠 MAIN COMMANDS", description: "All general bot commands", id: `${prefix}mainmenu` },
            { title: "🎬 MOVIE COMMANDS", description: "Search, info & download movies", id: `${prefix}moviemenu` },
            { title: "👥 GROUP COMMANDS", description: "Manage and interact with groups", id: `${prefix}groupmenu` }
          ]
        }]
      };

      return await conn.sendMessage(from, {
        image: imageBuffer,
        caption: menuText,
        footer: config.FOOTER,
        buttons: [{
          buttonId: "action",
          buttonText: { displayText: "🔽 Select Option" },
          type: 4,
          nativeFlowInfo: {
            name: "single_select",
            paramsJson: JSON.stringify(listData)
          }
        }],
        headerType: 1,
        viewOnce: true
      }, { quoted: mek });

    } else {
      const buttonMessage = {
        image: imageBuffer,
        caption: menuText,
        footer: config.FOOTER,
        buttons: [
        //    { buttonId: prefix + 'mainmenu', buttonText: { displayText: '🏠 MAIN MENU' }, type: 1 },
            { buttonId: prefix + 'moviemenu', buttonText: { displayText: '🎬 MOVIE MENU' }, type: 1 },
            { buttonId: prefix + 'groupmenu', buttonText: { displayText: '👥 GROUP MENU' }, type: 1 }
        ],
        headerType: 4
      };
      await conn.buttonMessage2(from, buttonMessage, mek);
    }
  } catch (e) {
    reply('*❌ Error occurred!*');
    l(e);
  }
});

cmd({
  pattern: "ping",
  alias: ["speed"],
  react: "📽️",
  desc: "Check bot's response speed.",
  category: "main",
  use: ".ping",
  filename: __filename
},
async (conn, mek, m, context) => {
  const { from, reply, l } = context;
const fkontak = {
    key: {
        remoteJid: "13135550002@s.whatsapp.net",
        participant: "0@s.whatsapp.net",
        fromMe: false,
        id: "Naze",
    },
    message: {
        contactMessage: {
            displayName: "NADEEN-MD",
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;Meta AI;;;\nFN:Meta AI\nitem1.TEL;waid=94715973437:94715973437\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
            sendEphemeral: false,
        },
    },
};
    try {
    const start = Date.now();

    // Send initial "please wait" message
    const sent = await conn.sendMessage(from, {
      text: `🔄 *Pinging... please wait*`
    }, { quoted: fkontak });

    const latency = Date.now() - start;

    // Edit same message with latency info
    await conn.sendMessage(from, {
      text: `*Pong ${latency} ms ⚡*`,
      edit: sent.key
    });

    // React to user's message
    await conn.sendMessage(from, {
      react: {
        text: '📍',
        key: mek.key
      }
    });

  } catch (error) {
    await reply('❌ *An error occurred while measuring ping.*');
    l(error);
  }
});
cmd({
  pattern: "restart",
  react: "🔄",
  desc: "Restart the bot process",
  use: ".restart",
  category: "main",
  filename: __filename
},
async (conn, mek, m, { reply, isOwner, isSachintha, isSavi, isSadas, isMani, isMe }) => {

  // ✅ Only allowed roles
  const allowed = (isOwner || isSachintha || isSavi || isSadas || isMani || isMe);

  // ❌ Not allowed -> message + react
  if (!allowed) {
    try { await m.react("🚫"); } catch (e) {}
    return await reply("🚫 *Owner only!*");
  }

  try {
    const { exec } = require("child_process");

    await reply(
      `♻️ *Bot is restarting...*\n` +
      `🕐 *Please wait a few seconds for services to resume.*`
    );

    setTimeout(() => {
      exec("pm2 restart all", async (error, stdout, stderr) => {
        if (error) {
          console.error(error);
          return await reply("❌ *An error occurred while restarting the bot.*");
        }
      });
    }, 3000);

  } catch (e) {
    console.error(e);
    return await reply("🚨 *Unexpected error occurred during restart.*");
  }
});

cmd({
  pattern: "update",
  react: "ℹ️",
  desc: "Update your bot to the latest version",
  use: ".update",
  category: "main",
  filename: __filename
},
async (conn, mek, m, { reply, isOwner, isSachintha, isSavi, isSadas, isMani, isMe }) => {
  if (!isOwner && !isSachintha && !isSavi && !isSadas && !isMani && !isMe) return;

  try {
    const { exec } = require("child_process");

    // Let the user know an update has started
    await reply(`🔄 *Bot Update in Progress...*  
📦 *Fetching latest code & restarting services...*`);

    // Wait before executing to ensure user sees message
    setTimeout(() => {
      exec('pm2 restart all', (error, stdout, stderr) => {
        if (error) {
          console.error(error);
          reply('❌ *Update failed during restart!*');
        }
      });
    }, 3000); // 3-second delay before restart

  } catch (e) {
    console.error(e);
    reply('🚨 *An unexpected error occurred during update.*');
  }
});
cmd({
    pattern: "owner",
    desc: "I'm the owner",
    react: "👩‍💻",
    use: '.owner',
    category: "main",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q, isGroup,
    sender, senderNumber, botNumber2, botNumber, pushname,
    isMe, isOwner, groupMetadata, groupName, participants,
    groupAdmins, isBotAdmins, isAdmins, reply
}) => {
    try {
        let vcard1 = 'BEGIN:VCARD\n' 
                   + 'VERSION:3.0\n' 
                   + 'FN: Themi Sadas\n' 
                   + 'ORG: System Developer;\n' 
                   + 'TEL;type=CELL;type=VOICE;waid=94724375368:+94724375368\n' 
                   + 'END:VCARD';

		let vcard3 = 'BEGIN:VCARD\n' 
                   + 'VERSION:3.0\n' 
                   + 'FN: Nadeen Poorna\n' 
                   + 'ORG: Funder & Developer;\n' 
                   + 'TEL;type=CELL;type=VOICE;waid=94711451319:+9471451319\n' 
                   + 'END:VCARD';
const fkontattk = {
    key: {
        remoteJid: "13135550002@s.whatsapp.net",
        participant: "0@s.whatsapp.net",
        fromMe: false,
        id: "Naze",
    },
    message: {
        contactMessage: {
            displayName: "©NADEENxDEV",
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;Meta AI;;;\nFN:Meta AI\nitem1.TEL;waid=94711451319:94711451319\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
            sendEphemeral: false,
        },
    },
};
        await conn.sendMessage(from, { 
            contacts: { 
                displayName: 'Bot Owners', 
                contacts: [
                    { vcard: vcard1 },
					{ vcard: vcard3 },
                ]
            } 
        }, { quoted: fkontattk });

    } catch (e) {
        console.error(e);
        reply(`Error: ${e}`);
    }
});

cmd({
  pattern: "mainmenu",
  react: "🗃",
  dontAddCommandList: true,
  filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
let pp =''  
	
for (let i=0;i<commands.length;i++) { 
if(commands[i].category === 'main'){
  if(!commands[i].dontAddCommandList){
pp +=  `*│🗃 Command:* ${commands[i].pattern}\n*│Use:* ${commands[i].use}\n\n`
}}};

let menuc = `*╭──────────●●►*\n${pp}*╰──────────●●►*\n\n`
let generatebutton = [{
    buttonId: `${prefix}sc`,
    buttonText: {
        displayText: 'GET BOT SCRIPT'
    },
    type: 1
  },{
    buttonId: `${prefix}ping`,
    buttonText: {
        displayText: 'GET BOT PING'
    },
    type: 1
  }]
let buttonMessaged = {
  image: { url: config.LOGO },
  caption: `${menuc}`,
  footer: config.FOOTER,
  headerType: 4,
  buttons: generatebutton
};
return await conn.buttonMessage(from, buttonMessaged, mek);
} catch (e) {
reply('*ERROR !!*')
l(e)
}
})
cmd({
  pattern: "groupmenu",
  react: "👤",
  dontAddCommandList: true,
  filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
let pp =''  
	
for (let i=0;i<commands.length;i++) { 
if(commands[i].category === 'group'){
  if(!commands[i].dontAddCommandList){
pp +=  `*│👤 Command:* ${commands[i].pattern}\n*│Use:* ${commands[i].use}\n\n`
}}};

let menuc = `*╭──────────●●►*\n${pp}*╰──────────●●►*\n\n`
let generatebutton = [{
    buttonId: `${prefix}sc`,
    buttonText: {
        displayText: 'GET BOT SCRIPT'
    },
    type: 1
  },{
    buttonId: `${prefix}ping`,
    buttonText: {
        displayText: 'GET BOT PING'
    },
    type: 1
  }]
let buttonMessaged = {
  image: { url: config.LOGO },
  caption: `${menuc}`,
  footer: config.FOOTER,
  headerType: 4,
  buttons: generatebutton
};
return await conn.buttonMessage(from, buttonMessaged, mek);
} catch (e) {
reply('*ERROR !!*')
l(e)
}
})
cmd({
  pattern: "moviemenu",
  react: "🎬",
  dontAddCommandList: true,
  filename: __filename
},
async(conn, mek, m, {from, prefix, pushname, reply, l}) => {
  try {
    // MOVIExGO Manual Menu
    let menuc = `🎬 *【 𝙼𝙾𝚅𝙸𝙴𝚡𝙶𝙾 𝙼𝙾𝚅𝙸𝙴 𝙼𝙴𝙽𝚄 】* 🎬

*Hello ${pushname}* 👋🍿

*╭───────────────────────◆*
*│ 🎞️ ${prefix}mv          :* All movie search
*│ 🎞️ ${prefix}cine        :* Cinesubz movie
*│ 🎞️ ${prefix}sinhalasub  :* Sinhalasublk movie
*│ 🎞️ ${prefix}yts         :* YTS movie
*│ 🎞️ ${prefix}moviego     :* Moviego movie
*│ 🎞️ ${prefix}thenkiri    :* Kdrama & more
*│ 🎞️ ${prefix}okjatt      :* Hindi dubbed
*│ 🎞️ ${prefix}anime       :* Anime movie/tv
*│ 🎞️ ${prefix}dinka       :* Sinhala cartoon/films
*│ 🎞️ ${prefix}pupilvideo  :* Sinhala cartoon/films
*│ 🎞️ ${prefix}ms          :* Sinhala cartoon/films
*│ 🎞️ ${prefix}zoom        :* Sinhala subtitles
*│ 🎞️ ${prefix}baiscopes   :* Baiscopes movie
*│ 🎞️ ${prefix}pirates     :* Piratelk movie
*│ 🎞️ ${prefix}cartoonlk   :* Sinhala cartoon
*│ 🎞️ ${prefix}sublk       :* Sublkmovie
*│ 🎞️ ${prefix}cineverse      :* Cineversemovie
*│ 🎞️ ${prefix}suzlk       :* Suzlkmovie
*│ 🎞️ ${prefix}download    :* Directt FIle download
*│ 🎞️ ${prefix}gdrive      :* Googledrive
*│ 🎞️ ${prefix}mega       :* Mega file download
*╰───────────────────────◆*

*🎭 Experience the best cinematic automation!*`;

    let generatebutton = [{
      buttonId: `${prefix}sc`,
      buttonText: { displayText: '📁 GET SCRIPT' },
      type: 1
    }, {
      buttonId: `${prefix}ping`,
      buttonText: { displayText: '⚡ BOT PING' },
      type: 1
    }];

    let buttonMessaged = {
      image: { url: config.LOGO },
      caption: menuc,
      footer: config.FOOTER,
      headerType: 4,
      buttons: generatebutton
    };

    return await conn.buttonMessage2(from, buttonMessaged, mek);
  } catch (e) {
    reply('*❌ Error occurred in Movie Menu!*');
    l(e);
  }
});

cmd({
    pattern: "forward",
    react: "⏩",
alias: ["f"],
     desc: "forwerd film and msg",
    use: ".f jid",
    category: "owner",
    filename: __filename
},
async(conn, mek, m,{from, l, prefix, quoted, body, isCmd, isSudo, isOwner, isMe, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isIsuru, isTharu,  isSupporters, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {

if ( !isMe && !isOwner && !isSudo ) return await reply('*📛OWNER COMMAND*')
if (!q || !m.quoted) {
return reply("*Please give me a Jid and Quote a Message to continue.*");
}
  // Split and trim JIDs
  let jidList = q.split(',').map(jid => jid.trim());
  if (jidList.length === 0) {
    return reply("*Provide at least one Valid Jid. ⁉️*");
  }
  // Prepare the message to forward
  let Opts = {
    key: mek.quoted?.["fakeObj"]?.["key"]
  };
  // Handle document message
  if (mek.quoted.documentWithCaptionMessage?.message?.documentMessage) {
    let docMessage = mek.quoted.documentWithCaptionMessage.message.documentMessage;
    const mimeTypes = require("mime-types");
    let ext = mimeTypes.extension(docMessage.mimetype) || "file";
    docMessage.fileName = docMessage.fileName || `file.${ext}`;
  }

  Opts.message = mek.quoted;
  let successfulJIDs = [];
  // Forward the message to each JID
  for (let i of jidList) {
try {
await conn.forwardMessage(i, Opts, false);
successfulJIDs.push(i);
} catch (error) {
console.log(e);
}
}
  // Response based on successful forwards
if (successfulJIDs.length > 0) {
return reply(`*Message Forwarded*\n\n` + successfulJIDs.join("\n"))
} else {
console.log(e)
}
});





cmd({
  pattern: "rename",
  alias: ["r"],
  desc: "Forward media/messages with optional rename and caption",
  use: ".r jid1,jid2 | filename (without ext) | new caption (quote a message)",
  category: "main",
  filename: __filename
},
async (conn, mek, m, {
  reply, isSudo, isOwner, isMe, q
}) => {
if ( !isMe && !isOwner && !isSudo ) return await reply('*📛OWNER COMMAND*')
  if (!q || !m.quoted) {
    return reply("*Please provide JIDs and quote a message to forward.*");
  }

  const mime = require("mime-types");

  // Split into jid list, optional filename, and optional caption
  const parts = q.split('|').map(part => part.trim());
  const jidPart = parts[0];
  const newFileName = parts[1]; // only name without extension
  const newCaption = parts[2];  // optional

  const jidList = jidPart.split(',').map(j => j.trim()).filter(j => j);
  if (jidList.length === 0) {
    return reply("*Provide at least one valid JID.*");
  }

  const quotedMsg = mek.quoted;
  let messageContent = quotedMsg?.message || quotedMsg;

  const opts = {
    key: quotedMsg?.fakeObj?.key,
    message: JSON.parse(JSON.stringify(messageContent)) // clone safely
  };

  // If it's a document, rename the file
  if (opts.message?.documentMessage) {
    const docMsg = opts.message.documentMessage;
    const ext = mime.extension(docMsg.mimetype) || "file"; // get correct extension
    if (newFileName) {
      docMsg.fileName = `${newFileName}.${ext}`; // filename + original mimetype ext
    } else {
      docMsg.fileName = `Forwarded_File_${Date.now()}.${ext}`; // default if no name given
    }
  }

  // If it's a media with caption, replace caption
  if (newCaption) {
    const typesWithCaption = ["imageMessage", "videoMessage", "documentMessage", "audioMessage"];
    for (const type of typesWithCaption) {
      if (opts.message[type]) {
        opts.message[type].caption = newCaption;
      }
    }
  }

  const successful = [];

  for (let jid of jidList) {
    try {
      await conn.forwardMessage(jid, opts, false);
      successful.push(jid);
    } catch (err) {
      console.log(`❌ Failed to forward to ${jid}:`, err);
    }
  }

  if (successful.length > 0) {
    return reply(`✅ *Message forwarded to:*\n${successful.join("\n")}`);
  } else {
    return reply("❌ *Failed to forward message to any JID.*");
  }
});


async function checkFileSize(url, maxMB = 150) {
  return new Promise((resolve, reject) => {
    let totalBytes = 0;
    https.get(url, res => {
      res.on('data', chunk => {
        totalBytes += chunk.length;
        const sizeMB = totalBytes / (1024 * 1024);
        if (sizeMB > maxMB) {
          res.destroy(); // abort download
          reject(new Error(`File exceeds ${maxMB} MB!`));
        }
      });
      res.on('end', () => resolve(totalBytes));
      res.on('error', err => reject(err));
    });
  });
}


cmd({
  pattern: "download",
  react: "⬇",
  alias: ["fetch","down","dlurl","dl"],
  desc: "Direct downloader from a link",
  category: "movie",
  use: '.directdl <Direct Link>',
  dontAddCommandList: false,
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
      return reply('❗ Please provide a direct download link.');

    const url = q.trim();
    const urlRegex = /^(https?:\/\/[^\s]+)/;

    if (!urlRegex.test(url)) {
      return reply('❗ The provided URL is invalid. Please check the link and try again.');
    }

    // Check file size before sending
    
    // React with download emoji
    await conn.sendMessage(from, { react: { text: '⬆', key: mek.key } });

    let mime = 'video/mp4'; // default to mp4
    let fileName = 'downloaded_video.mp4';

    try {
      const response = await axios.head(url);

      const detectedMime = response.headers['content-type'];
      if (detectedMime) mime = detectedMime;

      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        const fileMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileMatch && fileMatch[1]) {
          fileName = fileMatch[1].replace(/['"]/g, '');
        }
      } else {
        const parsedPath = new URL(url).pathname;
        const baseName = path.basename(parsedPath);
        if (baseName) fileName = baseName;
      }
    } catch (err) {
      // HEAD request failed — fallback
      const parsedPath = new URL(url).pathname;
      const baseName = path.basename(parsedPath).replace('CineSubz.co', 'Dinkamovieslk.app');
      if (baseName) fileName = baseName;
    }
async function resizeImage(buffer, width, height) {
  return await sharp(buffer)
    .resize(width, height)
    .toBuffer();
}
	  	  
		const botimgUrl = config.LOGO;
        const botimgResponse = await fetch(botimgUrl);
        const botimgBuffer = await botimgResponse.arrayBuffer();
        
        // Resize image to 200x200 before sending
        const resizedBotImg = await resizeImage(botimgBuffer, 200, 200);
    // Send the document
    await conn.sendMessage(from, {
      document: { url },
    //  caption: config.FOOTER,
      mimetype: mime,
		 caption: fileName.replace('CineSubz.co', 'Dinkamovieslk.app') + '\n\n' + config.FOOTER,
		jpegThumbnail: resizedBotImg,
      fileName
    });

    // Confirm success with reaction
    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

  } catch (e) {
    console.log(e);
    reply(`❗ Error occurred: ${e.message}`);
  }
});

const mime = require("mime-types");

cmd({
    pattern: "send",
    alias: ["forward2"],
    desc: "send msgs",
    category: "owner",
    use: '.send < Jid address >',
    filename: __filename
},

async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
try{ 
if ( !isMe && !isOwner && !isSudo ) return await reply('*📛OWNER COMMAND*')
if (!q || !m.quoted) {
return reply("*Please give me a Jid and Quote a Message to continue.*");
}

	
if (!q || !m.quoted) {
return await reply(`❌ *Please give me a jid and quote a message you want*\n\n*Use the ${envData.PREFIX}jid command to get the Jid*`)
}  

  let jidList = q.split(',').map(jid => jid.trim());

	

if(m.quoted && m.quoted.type === "stickerMessage"){
let image = await m.quoted.download()
            let sticker = new Sticker(image, {
                pack: "⦁ SAVIYA-MD ⦁",
                author: "⦁ SAVIYA-X-MD ⦁",
                type: StickerTypes.FULL, //q.includes("--default" || '-d') ? StickerTypes.DEFAULT : q.includes("--crop" || '-cr') ? StickerTypes.CROPPED : q.includes("--circle" || '-ci') ? StickerTypes.CIRCLE : q.includes("--round" || '-r') ? StickerTypes.ROUNDED : StickerTypes.FULL,
                categories: ["🤩", "🎉"],
                id: "12345",
                quality: 75,
                background: "transparent",
            });
            const buffer = await sticker.toBuffer();

const successful = [];

  for (let jid of jidList) {
    try {
        conn.sendMessage(jid, { sticker: buffer });
      successful.push(jid);
    } catch (err) {
      console.log(`❌ Failed to forward to ${jid}:`, err);
    }
  }
  

let ss = '`'
reply(`*This ${m.quoted.type} has been successfully sent to the jid address ${ss}${q}${ss}.*  ✅`)
m.react("✔️")  

}else if(m.quoted && m.quoted.type === "imageMessage"){
if(m.quoted.imageMessage && m.quoted.imageMessage.caption){
const cap = m.quoted.imageMessage.caption
let image = await m.quoted.download()
const successfull = [];

  for (let jid of jidList) {
    try {
        conn.sendMessage(jid, { image: image, caption: cap });
      successfull.push(jid);
    } catch (err) {
      console.log(`❌ Failed to forward to ${jid}:`, err);
    }
  }
  

   
let ss = '`'
reply(`*This ${ss}${m.quoted.type} has been successfully sent to the jid address   ✅`)
m.react("✔️")
	
}else{
let image = await m.quoted.download()
const successfulll = [];

  for (let jid of jidList) {
    try {
         conn.sendMessage(jid, { image: image });
      successfulll.push(jid);
    } catch (err) {
      console.log(`❌ Failed to forward to ${jid}:`, err);
    }
  }
  
 
let ss = '`'
reply(`*This ${ss}${m.quoted.type} has been successfully sent to the jid address   ✅`)
m.react("✔️")  
}	
	
}else if(m.quoted && m.quoted.type === "videoMessage"){
let fileLengthInBytes = m.quoted.videoMessage.fileLength
const fileLengthInMB = fileLengthInBytes / (1024 * 1024);
if(fileLengthInMB >= 50 ){
reply("*❌ Video files larger than 50 MB cannot be send.*")
}else{
let video = await m.quoted.download()
const jid = q || from

if(m.quoted.videoMessage.caption){
 
 conn.sendMessage(jid, { video: video, mimetype: 'video/mp4',caption: m.quoted.videoMessage.caption});
let ss = '`'
reply(`*This ${ss}${m.quoted.type}${ss} has been successfully sent to the jid address ${ss}${q}${ss}.*  ✅`)
m.react("✔️")
 
 }else{

  const jid = q || from
 conn.sendMessage(jid, { video: video, mimetype: 'video/mp4'});
  let ss = '`'
reply(`*This ${ss}${m.quoted.type}${ss} has been successfully sent to the jid address ${ss}${q}${ss}.*  ✅`)
m.react("✔️")
}

}	

}else if(m.quoted && m.quoted.type === "documentMessage" || m.quoted.type === "documentWithCaptionMessage"){	

const jid = q || from
if(m && m.quoted && m.quoted.documentMessage){
let fileLengthInBytes = m.quoted.documentMessage.fileLength	
const fileLengthInMB = fileLengthInBytes / (1024 * 1024);

if(fileLengthInMB >= 50 ){
reply("*❌ Document files larger than 50 MB cannot be send.*")
}else{
	
let mmt = m.quoted.documentMessage.mimetype 	
let fname = m.quoted.documentMessage.fileName
let audio = await m.quoted.download() 
 conn.sendMessage(jid, { document: audio, mimetype: mmt, fileName: fname });
 let ss = '`'
reply(`*This ${ss}${m.quoted.type}${ss} has been successfully sent to the jid address ${ss}${q}${ss}.*  ✅`)
m.react("✔️") 
}
 }else if(m.quoted.type === "documentWithCaptionMessage"){
let fileLengthInBytes = m.quoted.documentWithCaptionMessage.message.documentMessage.fileLength
const fileLengthInMB = fileLengthInBytes / (1024 * 1024);
if(fileLengthInMB >= 50 ){
reply("*❌ Document files larger than 50 MB cannot be send.*")
}else{
let audio = await m.quoted.download()
let Dmmt =m.quoted.documentWithCaptionMessage.message.documentMessage.mimetype

let Dfname = m.quoted.documentWithCaptionMessage.message.documentMessage.fileName

  const jid = q || from
let cp = m.quoted.documentWithCaptionMessage.message.documentMessage.caption

 conn.sendMessage(jid, { document: audio, mimetype: Dmmt,caption: cp, fileName: Dfname });
let ss = '`'
reply(`*This ${ss}${m.quoted.type}${ss} has been successfully sent to the jid address ${ss}${q}${ss}.*  ✅`)
m.react("✔️")

}

}
			
}else if(m.quoted && m.quoted.type === "audioMessage"){	
let fileLengthInBytes = m.quoted.audioMessage.fileLength
const fileLengthInMB = fileLengthInBytes / (1024 * 1024);
if(fileLengthInMB >= 50 ){
reply("*❌ Audio files larger than 50 MB cannot be send.*")
}else{
let audio = await m.quoted.download()
const jid = q || from
if(m.quoted.audioMessage.ptt === true){
 
 conn.sendMessage(jid, { audio: audio, mimetype: 'audio/mpeg', ptt: true, fileName: `${m.id}.mp3` });
 let ss = '`'
reply(`*This ${ss}${m.quoted.type}${ss} has been successfully sent to the jid address ${ss}${q}${ss}.*  ✅`)
m.react("✔️") 
 
 }else{
  const jid = q || from
 conn.sendMessage(jid, { audio: audio, mimetype: 'audio/mpeg', fileName: `${m.id}.mp3` });
let ss = '`'
reply(`*This ${ss}${m.quoted.type}${ss} has been successfully sent to the jid address ${ss}${q}${ss}.*  ✅`)
m.react("✔️")
}

}	
}else if(m.quoted && m.quoted.type === "viewOnceMessageV2Extension"){		
let met = m
const jet = {
    key: {
        remoteJid: mek.key.remoteJid,
        fromMe: false,
        id: met.key.id,
    },
    messageTimestamp: met.messageTimestamp,
    pushName: met.pushName,
    broadcast: met.broadcast,
    status: 2,
    message: {
        audioMessage: {
            url: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.url,
            mimetype: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.mimetype,
            fileSha256: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.fileSha256,
            fileLength: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.fleLength,
            seconds: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.seconds,
	    ptt: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.ptt,
            mediaKey: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.mediaKey,
            fileEncSha256: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.fileEncSha256,
            directPath: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.directPath, 
            mediaKeyTimestamp: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.mediaKeyTimestamp, 
	    waveform: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.waveform,
        },
    },
    id: met.id,
    chat: met.chat,
    fromMe: met.fromMe,
    isGroup: met.isGroup,
    sender: met.sender,
    type: 'audioMessage',
    msg: {
        url: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.url,
            mimetype: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.mimetype,
            fileSha256: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.fileSha256,
            fileLength: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.fleLength,
            seconds: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.seconds,
	    ptt: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.ptt,
            mediaKey: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.mediaKey,
            fileEncSha256: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.fileEncSha256,
            directPath: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.directPath, 
            mediaKeyTimestamp: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.mediaKeyTimestamp, 
	    waveform: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension.message.audioMessage.waveform,
    },
    
};

const mlvv = sms(conn, jet);
var nameJpg = getRandom('');
let buff = await mlvv.download(nameJpg);
let fileType = require('file-type');
let type = fileType.fromBuffer(buff);
await fs.promises.writeFile("./" + type.ext, buff);
await sleep(1000)
let caps = jet.message.audioMessage.caption || "⦁ ᴘʀᴀʙᴀᴛʜ-ᴍᴅ ⦁"


const jid = q || from
  conn.sendMessage(jid, { audio:  { url: "./" + type.ext }, mimetype: 'audio/mpeg', ptt: true, viewOnce:true, fileName: `${m.id}.mp3` });
  
let ss = '`'
reply(`*This ${ss}${m.quoted.type}${ss} has been successfully sent to the jid address ${ss}${q}${ss}.*  ✅`)
m.react("✔️")

}else if(m.quoted && m.quoted.viewOnceMessageV2 && m.quoted.viewOnceMessageV2.message.videoMessage){
let met = m

const jet = {
            key: {
              remoteJid: mek.key.remoteJid,
              fromMe: false,
              id: met.key.id,
            },
            messageTimestamp: met.messageTimestamp,
            pushName: met.pushName,
            broadcast: met.broadcast,
            status: 2,
            message: {
              videoMessage: {
                url: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.url,
                mimetype: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.mimetype,
                caption: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.caption,
                fileSha256: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.fileSha256,
                fileLength: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.fleLength,
                seconds: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.seconds,
                mediaKey: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.mediaKey,
                height: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.height,
                width: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.width,
                fileEncSha256: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.fileEncSha256,
                directPath: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.directPath,
                mediaKeyTimestamp: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.mediaKeyTimestamp,
                jpegThumbnail: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.jpegThumbnail,
              },
            },
            id: met.id,
            chat: met.chat,
            fromMe: met.fromMe,
            isGroup: met.isGroup,
            sender: met.sender,
            type: 'videoMessage',
            msg: {
              url: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.url,
                mimetype: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.mimetype,
                caption: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.caption,
                fileSha256: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.fileSha256,
                fileLength: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.fleLength,
                seconds: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.seconds,
                mediaKey: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.mediaKey,
                height: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.height,
                width: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.width,
                fileEncSha256: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.fileEncSha256,
                directPath: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.directPath,
                mediaKeyTimestamp: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.mediaKeyTimestamp,
                jpegThumbnail: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.jpegThumbnail,
            },
            body: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.videoMessage.caption,
          };

        const mlvv = sms(conn, jet);
        var nameJpg = getRandom('');
        let buff = await mlvv.download(nameJpg);
        let fileType = require('file-type');
        let type = fileType.fromBuffer(buff);
        await fs.promises.writeFile("./" + type.ext, buff);
	await sleep(1000)
	let caps = jet.message.videoMessage.caption || "⦁ ᴘʀᴀʙᴀᴛʜ-ᴍᴅ ⦁"
         
	const jid = q || from
  conn.sendMessage(jid, { video: { url: "./" + type.ext }, caption: caps, viewOnce:true });	
  let ss = '`'
reply(`*This ${ss}${m.quoted.type}${ss} has been successfully sent to the jid address ${ss}${q}${ss}.*  ✅`)
m.react("✔️")
}else if(m.quoted && m.quoted.viewOnceMessageV2 && m.quoted.viewOnceMessageV2.message.imageMessage){
let met = m
const jet = {
    key: {
        remoteJid: mek.key.remoteJid,
        fromMe: false,
        id: met.key.id,
    },
    messageTimestamp: met.messageTimestamp,
    pushName: met.pushName,
    broadcast: met.broadcast,
    status: 2,
    message: {
        imageMessage: {
            url: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.url,
            mimetype: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.mimetype,
            caption: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.caption,
            fileSha256: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.fileSha256,
            fileLength: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.fleLength,
            height: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.height,
            width: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.width,
            mediaKey: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.mediaKey,
            fileEncSha256: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.fileEncSha256,
            directPath: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.directPath,
            mediaKeyTimestamp: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.mediaKeyTimestamp,
            jpegThumbnail: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.jpegThumbnail,
        },
    },
    id: met.id,
    chat: met.chat,
    fromMe: met.fromMe,
    isGroup: met.isGroup,
    sender: met.sender,
    type: 'imageMessage',
    msg: {
        url: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.url,
        mimetype: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.mimetype,
        caption: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.caption,
        fileSha256: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.fileSha256,
        fileLength: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.fleLength,
        height: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.height,
        width: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.width,
        mediaKey: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.mediaKey,
        fileEncSha256: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.fileEncSha256,
        directPath: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.directPath,
        mediaKeyTimestamp: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.mediaKeyTimestamp,
        jpegThumbnail: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.jpegThumbnail,
    },
    body: mek.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message.imageMessage.caption,
};

const mlvv = sms(conn, jet);
var nameJpg = getRandom('');
let buff = await mlvv.download(nameJpg);
let fileType = require('file-type');
let type = fileType.fromBuffer(buff);
await fs.promises.writeFile("./" + type.ext, buff);
await sleep(1000)
let caps = jet.message.imageMessage.caption || "⦁ ᴘʀᴀʙᴀᴛʜ-ᴍᴅ ⦁"
 const jid = q || from

  conn.sendMessage(jid, { image: { url: "./" + type.ext }, caption: caps,viewOnce:true });
 let ss = '`'
reply(`*This ${ss}${m.quoted.type}${ss} has been successfully sent to the jid address ${ss}${q}${ss}.*  ✅`)
m.react("✔️") 
}else if(q || m.quoted && m.quoted.type === "conversation"){

const jid = q || from
conn.sendMessage(jid,{text: m.quoted.msg})
let ss = '`'
reply(`*This ${ss}${m.quoted.type}${ss} has been successfully sent to the jid address ${ss}${q}${ss}.*  ✅`)
m.react("✔️")
}else{
const mass= await conn.sendMessage(from, { text: `❌ *Please Give me message!*\n\n${envData.PREFIX}send <Jid>`}, { quoted: mek });
return await conn.sendMessage(from, { react: { text: '❓', key: mass.key } });
    
}

 } catch(e) {
console.log(e);
return reply('error!!')
 }
});

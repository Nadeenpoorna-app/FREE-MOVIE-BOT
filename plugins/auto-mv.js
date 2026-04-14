

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');
const config = require('../config');

let autoCheckerRunning = false;
const CACHE_FILE = path.join(__dirname, 'sub_auto_cache.json');
const STATE_FILE = path.join(__dirname, 'sub_auto_state.json');

// 🧠 Load cache safely
function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE));
  } catch {
    return { lastID: null };
  }
}

// 🧠 Save cache safely
function saveCache(data) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
}

// 🧠 Load ON/OFF state
function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE)).enabled;
  } catch {
    return false;
  }
}

// 🧠 Save ON/OFF state
function saveState(enabled) {
  fs.writeFileSync(STATE_FILE, JSON.stringify({ enabled }));
}

// ===================================================
// 🚀 MAIN AUTO DETECTION FUNCTION
// ===================================================
async function autoDetectMovies(conn) {
  if (autoCheckerRunning) return;
  autoCheckerRunning = true;

  const cache = loadCache();
  const lastID = cache.lastID;

  try {
    console.log('🔎 [AUTO DETECTOR] Checking for new SUB.LK movie...');

    const api = 'https://visper-md-ap-is.vercel.app/movie/sublk/SEARCH?q=2025';
    const { data } = await axios.get(api);

    const movies = data?.result || [];
    if (movies.length === 0) {
      console.log('⚠️ No movie results found.');
      autoCheckerRunning = false;
      return;
    }

    const latest = movies[0];
    const uniqueID = `${latest.title}-${latest.year}`;

    if (lastID !== uniqueID) {
      console.log(`🎥 New Movie Detected: ${latest.title}`);

      // Save new ID
      saveCache({ lastID: uniqueID });
const pako = `https://visper-md-ap-is.vercel.app/movie/sublk/infodl?q=${latest.link}`;
      const abhi = await axios.get(pako);
      const sahi = abhi.data?.result;
      // 🎬 Movie Info Caption
      const caption = `🎬 *NEW MOVIE RELEASED (SUB.LK)* 🎬
━━━━━━━━━━━━━━━━━━━
🍿 *Title:* ${latest.title}
📅 *Released:* ${sahi.date || 'N/A'}
🌎 *Country:* ${sahi.country || 'N/A'}
⭐ *Rating:* ${sahi.rating || 'N/A'}
🎿 *Uploded by :* ${config.UPLODER}
🔗 *Movie URL:* ${latest.link}
━━━━━━━━━━━━━━━━━━━
\`🎈JOIN US\` : ${config.LINK}

> ${config.NAME}`;
      console.log(`✅ Detais:`,caption);
        await conn.sendMessage(config.JID || conn.user.id, {
        image: { url: sahi.poster || config.LOGO },
        caption
      });

      // ===================================================
      // 🧠 GET MOVIE DETAILS
      // ===================================================
      const infoAPI = `https://visper-md-ap-is.vercel.app/movie/sublk/infodl?q=${latest.link}`;
      const infoRes = await axios.get(infoAPI);
      const result = infoRes.data?.result;
      if (!result) {
        console.log('❌ No result found from infodl API.');
        autoCheckerRunning = false;
        return;
      }

    
      // Filter pixeldrain link
      const pixeldrainDL = result.downloads?.find(dl =>
        dl.finalLink?.includes("pixeldrain.com/u/")
      );
      
      if (pixeldrainDL) {
        const fixedLink = pixeldrainDL.finalLink.replace("pixeldrain.com/u/", "pixeldrain.com/api/file/");
        console.log(`📦 Pixeldrain link found: ${fixedLink}`);

        await conn.sendMessage(config.JID || conn.user.id, {
          document: { url: fixedLink },
          mimetype: "video/mp4",
          fileName: `${config.DOC}${latest.title}.mp4`,
          caption: `🎬 *${latest.title}*\n\n${config.NAME}`
        });

        console.log(`✅ Sent Pixeldrain movie file: ${latest.title}`);
      } else {
        console.log('⚠️ No Pixeldrain link found — skipped download.');
      }

    } else {
      console.log('🟢 No new movie detected.');
    }

  } catch (err) {
    console.error('[AUTO DETECTOR ERROR]', err.message);
  } finally {
    autoCheckerRunning = false;
  }
}

// ===================================================
// ⚡ AUTO STARTUP (Restart Safe)
// ===================================================
async function startAutoChecker(conn) {
  if (loadState()) {
    console.log('⚡ Auto Movie Detector: ENABLED (Restart Safe)');
    await autoDetectMovies(conn);
    setInterval(() => autoDetectMovies(conn), 30 * 60 * 1000);
  } else {
    console.log('⛔ Auto Movie Detector: Disabled');
  }
}

// ===================================================
// 🎛️ COMMAND (.autocheck)
// ===================================================
cmd({
  pattern: "subcheck",
  react: "🎥",
  //category: "movie",
  desc: "Enable/Disable SUB.LK AI auto movie detector (Pixeldrain only)",
  use: ".autocheck on/off",
  filename: __filename
},
async (conn, mek, m, { q, reply }) => {
  if (!q) return reply('*Use:* `.autocheck on` or `.autocheck off`');

  if (q.toLowerCase() === 'on') {
    saveState(true);
    reply('✅ *SUB.LK Auto Movie Detector enabled!*\n(Checks every 30 minutes for new Pixeldrain movies)');
    await autoDetectMovies(conn);
    setInterval(() => autoDetectMovies(conn), 30 * 60 * 1000);
  } else if (q.toLowerCase() === 'off') {
    saveState(false);
    reply('🛑 *Auto Movie Detector disabled.*');
  } else {
    reply('⚙️ Invalid option — use `.autocheck on` or `.autocheck off`');
  }
});

// ===================================================
// 🔄 AUTO RESUME AFTER RESTART
// ===================================================
(async () => {
  const { conn } = global;
  if (conn) startAutoChecker(conn);
})();

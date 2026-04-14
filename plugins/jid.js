const { cmd } = require('../command');

cmd({
    pattern: "jid",
    react: "🔤",
    desc: "Get chat JID",
    category: "general",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {
    try {
        // මේකෙන් ඕනෑම තැනක JID එක පෙන්වයි
        return await reply(`${from}`);
    } catch (e) {
        console.log(e);
        reply("Error: " + e);
    }
});

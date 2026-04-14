const { addPremiumUser, getGithubFile } = require('../lib/github_db');
const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config'); // config එකෙන් owner තහවුරු කරගන්න

cmd({
    pattern: "addprem",
    react: "💸",
    category: "owner",
    desc: "Add premium user (Owner Only)",
    use: ".addprem 947xxx,30"
}, async (conn, mek, m, { args, isOwner, reply }) => {
    // Owner පරීක්ෂාව
    if (!isOwner) return reply("⚠️ *Access Denied:* This command is for the owner only.");

    try {
        if (!args[0]) return reply("Usage: .addprem 947xxx,30");
        const [num, days] = args[0].split(",");
        
        const result = await addPremiumUser(num, days);
        reply(`✅ *PREMIUM ADDED*\n\n👤 Number: ${num}\n📅 Expiry: ${result.dateString}\n💰 Price: Rs. ${result.price}\n💳 Total Income Updated!`);
    } catch (e) {
        reply("Error: " + e.message);
    }
});

cmd({
    pattern: "listprem",
    category: "owner",
    desc: "Check premium list and total income (Owner Only)"
}, async (conn, mek, m, { isOwner, reply }) => {
    // Owner පරීක්ෂාව
    if (!isOwner) return reply("⚠️ *Access Denied:* This command is for the owner only.");

    try {
        const dataFile = await getGithubFile('movie-plans', 'data.json');
        const activeUsers = dataFile.content.active;
        const totalIncome = dataFile.content.total_income || 0;
        
        if (activeUsers.length === 0) return reply("No active premium users found.");

        let listMsg = `📊 *PREMIUM STATISTICS*\n\n`;
        listMsg += `👥 Total Active: ${activeUsers.length}\n`;
        listMsg += `💰 Total Income: Rs. ${totalIncome}\n\n`;
        listMsg += `*ACTIVE USERS LIST:*\n`;

        activeUsers.forEach((user, index) => {
            listMsg += `\n${index + 1}. 📱 ${user.number}\n   📅 Expiry: ${user.date}\n   💵 Paid: Rs.${user.price || 0}\n`;
        });

        reply(listMsg);
    } catch (e) {
        reply("Error: " + e.message);
    }
});

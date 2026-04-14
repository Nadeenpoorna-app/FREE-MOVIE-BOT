const axios = require('axios');
const config = require('../config');

/**
 * GitHub එකෙන් File එක සහ SHA එක ලබා ගැනීම
 */
async function getGithubFile(repo, path) {
    const url = `https://api.github.com/repos/Nadeenpoorna-app/${repo}/contents/${path}`;
    const { data } = await axios.get(url, {
        headers: { Authorization: `token ${config.GITHUB_TOKEN}` }
    });
    return {
        content: JSON.parse(Buffer.from(data.content, 'base64').toString()),
        sha: data.sha
    };
}

/**
 * GitHub එකට අලුත් දත්ත Upload කිරීම
 */
async function updateGithubFile(repo, path, content, sha) {
    const url = `https://api.github.com/repos/Nadeenpoorna-app/${repo}/contents/${path}`;
    await axios.put(url, {
        message: "Premium Database Update",
        content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
        sha: sha
    }, {
        headers: { Authorization: `token ${config.GITHUB_TOKEN}` }
    });
}

/**
 * Premium එකතු කිරීමේ Logic එක
 */
async function addPremiumUser(number, days) {
    const numberOnly = number.replace(/[^0-9]/g, "");
    
    // 1. numbers.json පරීක්ෂා කර අංකය දැනටමත් තිබේදැයි බැලීම
    const premFile = await getGithubFile('nadeen-botzdatabse', 'prem/numbers.json');
    let currentNumbersString = premFile.content.numbers || "";
    let numbersArray = currentNumbersString.split(",").map(n => n.trim()).filter(n => n !== "");

    if (numbersArray.includes(numberOnly)) {
        return { 
            status: 'already_exists', 
            message: "⚠️ මේ අංකය දැනටමත් Premium ලැයිස්තුවේ තියෙනවා." 
        };
    }

    // මිල ගණන් සහ කාලය තීරණය කිරීම
    let price = (parseInt(days) === 15) ? 200 : (parseInt(days) === 30) ? 350 : (parseInt(days) === 45) ? 500 : (parseInt(days) === 90 ? 900 : 0);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days));
    const dateString = expiryDate.toISOString().split('T')[0];

    // 2. data.json (movie-plans) update කිරීම
    const dataFile = await getGithubFile('movie-plans', 'data.json');
    if (!dataFile.content.total_income) dataFile.content.total_income = 0;
    dataFile.content.total_income += price;
    
    if (!dataFile.content.active) dataFile.content.active = [];
    dataFile.content.active.push({ 
        number: numberOnly, 
        date: dateString,
        price: price,
        addedAt: new Date().toISOString().split('T')[0]
    });
    
    await updateGithubFile('movie-plans', 'data.json', dataFile.content, dataFile.sha);

    // 3. numbers.json update කිරීම
    numbersArray.push(numberOnly);
    premFile.content.numbers = numbersArray.join(',');
    
    await updateGithubFile('nadeen-botzdatabse', 'prem/numbers.json', premFile.content, premFile.sha);
    
    return { status: 'success', dateString, price };
}

/**
 * කාලය ඉකුත් වූ අය අයින් කිරීම සහ Admin ට දැනුම් දීම
 */
async function checkAndRemoveExpired(conn) {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
    
    const dataFile = await getGithubFile('movie-plans', 'data.json');
    let activeUsers = dataFile.content.active || [];
    let expiredUsers = dataFile.content.expired || [];
    
    // කාලය ඉකුත් වූ සහ නොවූ අය වෙන් කිරීම
    let stillActiveInPlans = activeUsers.filter(user => user.date > today);
    let justExpired = activeUsers.filter(user => user.date <= today);

    if (justExpired.length > 0) {
        const numbersToRemove = justExpired.map(u => u.number);

        // 1. Movie Plans GitHub Update
        dataFile.content.active = stillActiveInPlans;
        dataFile.content.expired = expiredUsers.concat(justExpired.map(u => ({ ...u, status: 'expired' })));
        await updateGithubFile('movie-plans', 'data.json', dataFile.content, dataFile.sha);

        // 2. Numbers Database GitHub Update (අදාළ අංක පමණක් ඉවත් කරයි)
        const premFile = await getGithubFile('nadeen-botzdatabse', 'prem/numbers.json');
        let currentNumbersString = premFile.content.numbers || "";
        let allNumbers = currentNumbersString.split(",").map(n => n.trim()).filter(n => n !== "");
        
        let updatedNumbers = allNumbers.filter(num => !numbersToRemove.includes(num));
        premFile.content.numbers = updatedNumbers.join(',');
        await updateGithubFile('nadeen-botzdatabse', 'prem/numbers.json', premFile.content, premFile.sha);

        // 3. --- Admin Notification Logic ---
        for (let user of justExpired) {
            try {
                let planDuration = "Custom Plan";
                if (user.price === 350) planDuration = "1 Month";
                else if (user.price === 850) planDuration = "3 Month";

                const payNumber = config.PAY.replace(/[^0-9]/g, "") + "@lid";
                
                const msg = `⚠️ *PREMIUM EXPIRED ALERT*\n\n` +
                            `👤 *User:* ${user.number}\n` +
                            `📦 *Plan:* ${planDuration}\n` +
                            `💰 *Price:* ${user.price} LKR\n` +
                            `📅 *Expired On:* ${user.date}\n\n` +
                            `*Status:* Successfully removed from database.`;

                await conn.sendMessage(payNumber, { text: msg });
            } catch (err) {
                console.error("Notification Error:", err);
            }
        }
        return true;
    }
    return false;
}

/**
 * Menu එකේ පෙන්වීමට User ගේ Premium විස්තර ලබා ගැනීම
 */
async function getPremiumInfo(number) {
    const numberOnly = number.replace(/[^0-9]/g, "");
    
    try {
        const dataFile = await getGithubFile('movie-plans', 'data.json');
        const activeUsers = dataFile.content.active || [];
        
        const user = activeUsers.find(u => u.number === numberOnly);

        if (!user) return null;

        const today = new Date();
        const expiry = new Date(user.date);
        
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        return {
            expiryDate: user.date,
            remainingDays: diffDays > 0 ? diffDays : 0
        };
    } catch (e) {
        return null;
    }
}

module.exports = { 
    addPremiumUser, 
    checkAndRemoveExpired, 
    getGithubFile,
    getPremiumInfo
};

const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });
function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

//gg
module.exports = {
SESSION_ID: 'zAETXbIY#uo4YymuSuz-CdFJkWvIoFTOIIt11r7i1QXkqKUehCQk',
ANTI_DELETE: process.env.ANTI_DELETE === undefined ? 'true' : process.env.ANTI_DELETE, 
MV_BLOCK: process.env. MV_BLOCK === undefined ? 'true' : process.env. MV_BLOCK,    
ANTI_LINK: process.env.ANTI_LINK === undefined ? 'true' : process.env.ANTI_LINK, 
SEEDR_MAIL: '',
    SEEDR_PASSWORD: '',
SUDO: '',//
DB_NAME: 'movie-xx-free',
LANG: 'SI',
OWNER_NUMBER: '94716769285',
GITHUB_TOKEN: process.env.GITHUB_TOKEN || "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",

};
//GITHUB_AUTH_TdOKEN: 'ouvnI0xSDsmfWA1filVxx.SZ0vJGYkjlC5VX54U0e10',


console.time('Program');

const fs = require('fs');
const CryptoJS = require('crypto-js');

var inputUuid = 'e7587bd1-bb94-4949-9a75-7e50e0079a97'.toUpperCase().replace(/\-/g, '');
var claimer = 'Neruthes';

var payload1 = `UUIDClaimProtocol:v1:${inputUuid}:${claimer}`;
var payload2 = '';

// var bestHashParamHex = '0000000000000';
var bestHashParamHex =    '0000000F7B135';
// var bestHash = (new Array(64)).fill('F').join('');
var originalBestHash = '00000007384C7FCD2D7FCCC7325E0DFCFCAE1808CD74E78B647A5DB9493A4471';
var bestHash = '00000007384C7FCD2D7FCCC7325E0DFCFCAE1808CD74E78B647A5DB9493A4471';

// The best is the hash which has the smallest number
// Hash function: SHA-256

var isThisHashBetterThan = function (comparingHash, baseHash) {
    if (parseInt(comparingHash, 16) <= parseInt(baseHash, 16)) {
        return true;
    } else {
        return false;
    };
};
var leftpad = function (str, len, pad) {
    if (str.length >= len) {
        return str;
    } else {
        return (new Array(len-str.length)).fill(pad).join('') + str;
    };
};
var getHash = function (i) {
    var paramHex = leftpad(i.toString(16).toUpperCase(), 13, '0');
    var payload2 = `${payload1}:${paramHex}`;
    var hash = CryptoJS.SHA256(payload2).toString(CryptoJS.enc.Hex).toUpperCase();
    return {
        param: paramHex,
        hash: hash
    };
};

const currentHash = {
    latest: null
};


var resumePointHex = fs.readFileSync('resumePoint.txt').toString().trim();
var resumePoint = parseInt(resumePointHex, 16);

console.log(`\nStarting from: ${resumePointHex}`);

for (var i = resumePoint; i < resumePoint + 2**18+1 && i < 2**40; i++) { // MAX 52 bits in JS to be safe
// for (var i = 0; i < 2**16; i++) { // MAX 52 bits in JS to be safe
    currentHash.latest = getHash(i);
    // process.stdout.write(`\rCurrent progress: [ ${currentHash.latest.param} ] ${currentHash.latest.hash}`);
    if (isThisHashBetterThan(currentHash.latest.hash, bestHash)) {
        // process.stdout.write(`\r`);
        console.log('\nFound a better hash.');
        console.log(`Previous hash: [ ${bestHashParamHex} ] ${bestHash}`);
        console.log(`Current hash:  [ ${currentHash.latest.param} ] ${currentHash.latest.hash}\n`);
        bestHash = currentHash.latest.hash;
        bestHashParamHex = currentHash.latest.param;
    };
};

fs.writeFileSync('resumePoint.txt', currentHash.latest.param);

if (bestHash === originalBestHash) {
    console.log('No better hash found.');
    console.log(`${originalBestHash}\n`);
    process.exit();
} else {
    console.log('\n\n\n');
    console.log(`[Success] Got the best hash for uuid "${inputUuid}" and claimer "${claimer}":`);
    console.log(`Input for SHA-256: "${payload1}:${bestHashParamHex}"`);
    console.log(`Best hash: ${bestHash}`);
}

console.timeEnd('Program');

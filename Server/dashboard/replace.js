const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.match(/\.(jsx?|tsx?)$/)) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('d:/Internship/Tanak-Prabha/Server/dashboard/src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace standard color scales (e.g. text-green-600 -> text-zinc-600)
    // Includes variants like hover:, focus:, etc. since we only match the prefix text- or bg-
    content = content.replace(/\b(bg|text|border|ring|shadow|fill|stroke|from|via|to|accent)-(green|emerald|blue|red|yellow|amber|purple|indigo|pink|teal|cyan|rose|fuchsia|violet|sky|orange)-([\d]{2,3})/g, '$1-zinc-$3');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});

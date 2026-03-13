const fs = require('fs');
const path = require('path');

const sessionFile = 'docs/logs/SESSION_LOG.md';
const summary = process.argv[2] || 'Automated session handoff summary';

if (!fs.existsSync(path.dirname(sessionFile))) {
    fs.mkdirSync(path.dirname(sessionFile), { recursive: true });
}

fs.appendFileSync(sessionFile, `\n## Session Handoff | ${new Date().toISOString()}\n${summary}\n`);
console.log('Session summary appended to ' + sessionFile);

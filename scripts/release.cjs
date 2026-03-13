const fs = require('fs');

function bump(type = 'patch') {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const parts = pkg.version.split('.').map(Number);
    
    if (type === 'major') parts[0]++;
    else if (type === 'minor') parts[1]++;
    else parts[2]++;
    
    pkg.version = parts.join('.');
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    console.log(`Version bumped to ${pkg.version}`);
}

bump(process.argv[2]);

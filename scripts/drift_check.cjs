const fs = require('fs');
if (!fs.existsSync('src')) process.exit(0);
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = `${dir}/${entry.name}`;
    return entry.isDirectory() ? walk(full) : [full];
  });

const files = walk('src')
  .filter(f => (f.endsWith('.ts') || f.endsWith('.tsx')) && !f.endsWith('supabase/types.ts'));
files.forEach(f => {
  const lines = fs.readFileSync(f, 'utf8').split('\n').length;
  if (lines > 500) {
    console.error('DRIFT VIOLATION: ' + f + ' exceeds 500 lines.');
    process.exit(1);
  }
});

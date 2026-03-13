const fs = require('fs');
if (!fs.existsSync('src')) process.exit(0);
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = `${dir}/${entry.name}`;
    return entry.isDirectory() ? walk(full) : [full];
  });

const files = walk('src').filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('SUPABASE_SERVICE_ROLE_KEY')) {
    console.error('SECURITY BREACH: Service Role Key found in ' + f);
    process.exit(1);
  }
});

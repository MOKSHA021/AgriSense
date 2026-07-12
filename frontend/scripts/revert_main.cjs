const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/POSHITH/GITHUB/New folder (4)/AgriSense/frontend/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('DashboardNavbar')) {
    let newContent = content.replace(/<main className="([^"]*)"/, (match, p1) => {
      let classes = p1.replace(/lg:pl-64/g, '').replace(/lg:pt-0/g, '').replace(/\s+/g, ' ').trim();
      return `<main className="${classes}"`;
    });
    fs.writeFileSync(filePath, newContent);
    console.log('Reverted main tag in', f);
  }
});

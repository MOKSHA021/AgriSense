const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/POSHITH/GITHUB/New folder (4)/AgriSense/frontend/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('DashboardNavbar')) {
    // Replace <main className="pt-24"> with <main className="pt-24 lg:pt-0 lg:pl-64">
    // Actually, maybe pt-24 is needed for mobile, but on desktop lg:pt-0 lg:pl-64 is good.
    // Wait, the sidebar will be fixed on the left. The top navbar on mobile is still fixed on top.
    let newContent = content.replace(/<main className="([^"]*)"/, (match, p1) => {
      // Remove any existing pl-64 or lg:pl-64 just in case
      let classes = p1.replace(/lg:pl-64/g, '').replace(/lg:pt-[0-9]+/g, '').replace(/\s+/g, ' ').trim();
      if (!classes.includes('lg:pl-64')) {
        classes += ' lg:pl-64';
      }
      return `<main className="${classes}"`;
    });
    
    // Also, if there are any specific styles that rely on the top navbar being there,
    // we need to make sure they are preserved.
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${f}`);
  }
});

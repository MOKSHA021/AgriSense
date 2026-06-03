const fs = require('fs');
const path = require('path');

const files = [
  'src/components/market/LivePrices.jsx',
  'src/components/market/MandiForm.jsx',
  'src/components/market/MandiCard.jsx',
  'src/components/market/PricePrediction.jsx'
];

files.forEach(file => {
  const filepath = path.join(__dirname, file);
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');

  // Convert dark mode classes to light mode classes
  content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-white');
  content = content.replace(/backdrop-blur-2xl/g, 'shadow-xl'); 
  content = content.replace(/border-white\/5/g, 'border-slate-200');
  content = content.replace(/border-white\/10/g, 'border-slate-200');
  content = content.replace(/border-white\/20/g, 'border-slate-200');
  content = content.replace(/text-white\/40/g, 'text-slate-500');
  content = content.replace(/text-white\/50/g, 'text-slate-500');
  content = content.replace(/text-white\/60/g, 'text-slate-500');
  content = content.replace(/text-white\/70/g, 'text-slate-600');
  content = content.replace(/text-white\/80/g, 'text-slate-700');
  content = content.replace(/bg-zinc-900/g, 'bg-white');
  
  // Specific tweaks
  // "text-white" -> "text-slate-800" EXCEPT inside buttons or gradients!
  // It's safer to just let the script do it for specific tags or manually fix it.
  
  fs.writeFileSync(filepath, content);
});
console.log('Done');

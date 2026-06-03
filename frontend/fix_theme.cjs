const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');

const files = [
  'src/components/market/LivePrices.jsx',
  'src/components/market/MandiForm.jsx',
  'src/components/market/MandiCard.jsx',
  'src/components/market/MandiMap.jsx',
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
  
  // Specific tweaks
  // Convert labels from white to slate
  content = content.replace(/text-white\/40/g, 'text-slate-500');
  content = content.replace(/text-white\/50/g, 'text-slate-500');
  content = content.replace(/text-white\/60/g, 'text-slate-500');
  content = content.replace(/text-white\/70/g, 'text-slate-600');
  content = content.replace(/text-white\/80/g, 'text-slate-700');
  content = content.replace(/bg-zinc-900/g, 'bg-white');

  // Fix text-white inside regular elements (not gradients or buttons if possible)
  // We'll replace text-white with text-slate-800 for now. Since buttons have `text-white` next to `bg-gradient`, let's not touch if it's there.
  // We can do a global replace for `text-white` to `text-slate-800` then revert inside buttons and badges.
  content = content.replace(/text-white/g, 'text-slate-800');

  // Revert buttons/badges
  content = content.replace(/text-slate-800(.*?)bg-gradient/g, 'text-white$1bg-gradient');
  content = content.replace(/bg-gradient(.*?)text-slate-800/g, 'bg-gradient$1text-white');
  content = content.replace(/bg-teal-500 text-slate-800/g, 'bg-teal-500 text-white');
  content = content.replace(/bg-white\/20 text-slate-800/g, 'bg-white/20 text-white');
  
  // Revert icon colors that became invisible (if they were text-white inside a colored div)
  content = content.replace(/text-slate-800([^>]*?)(lucide-react)/g, 'text-white$1$2'); // not perfect, just a heuristics
  
  fs.writeFileSync(filepath, content);
});
console.log('Done');

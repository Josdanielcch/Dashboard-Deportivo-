import fs from 'fs';
import path from 'path';

const images = [
  { url: 'https://6a19a64a0bc623d413af26c4.imgix.net/black-man-doing-sports-playing-basketball-sunrise-jumping-silhouette.jpg', name: 'basketball-silhouette.jpg' },
  { url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1800&auto=format&fit=crop', name: 'court-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=1200&auto=format&fit=crop', name: 'court-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1200&auto=format&fit=crop', name: 'court-3.jpg' },
  { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop', name: 'avatar-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop', name: 'avatar-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop', name: 'avatar-3.jpg' },
];

const dir = path.join(process.cwd(), 'public', 'images');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

async function downloadImages() {
  for (const img of images) {
    try {
      console.log(`Fetching ${img.name}...`);
      const res = await fetch(img.url);
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(path.join(dir, img.name), Buffer.from(buffer));
      console.log(`Saved ${img.name}`);
    } catch (e) {
      console.error(e);
    }
  }
}
downloadImages();

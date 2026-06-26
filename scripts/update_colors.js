const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../app');

const colorMapping = {
  // Primary (Soft Terracotta)
  '#1A237E': '#C97352',
  '#1565C0': '#C97352',
  '#0A192F': '#C97352',
  
  // Muted
  '#607D8B': '#7A746E',
  '#90A4AE': '#7A746E',
  '#546E7A': '#7A746E',
  '#B0BEC5': '#7A746E',
  '#78909C': '#7A746E',
  
  // Text
  '#263238': '#2D2A26',
  '#000': '#2D2A26',
  '#000000': '#2D2A26',
  '#333': '#2D2A26',
  '#333333': '#2D2A26',

  // Background
  '#F5F7FA': '#FCFAF7',
  '#FAFAFA': '#FCFAF7',
  '#F0F2F5': '#FCFAF7',
  '#F8F9FA': '#FCFAF7',
  '#ECEFF1': '#FCFAF7',
  
  // Border
  '#E0E0E0': '#ECE7E1',
  '#EEEEEE': '#ECE7E1',
  '#CFD8DC': '#ECE7E1',
  '#E8EAF6': '#ECE7E1',
};

function processDirectory(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let updated = false;

      // Replace colors based on mapping, ignoring case
      for (const [oldColor, newColor] of Object.entries(colorMapping)) {
        // Create regex to match the hex color string case-insensitively
        const regex = new RegExp(oldColor, 'gi');
        if (regex.test(content)) {
          content = content.replace(regex, newColor);
          updated = true;
        }
      }

      if (updated) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  });
}

processDirectory(directoryPath);
console.log('Color update complete.');

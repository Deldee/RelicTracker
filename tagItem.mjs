// tag_items.mjs — run with: node tag_items.mjs
import * as Expansions from './script/expansions.js';
import fs from 'fs';

const itemExpacMap = {};

Object.values(Expansions).forEach(expansion => {
    if (!expansion.stepCollection) return;

    expansion.stepCollection.forEach(step => {
        step.entries.forEach(({ item,ShopItem }) => {
            const name = item.name;
            if (itemExpacMap[name] && itemExpacMap[name] !== expansion.abbreviation) {
                itemExpacMap[name] = "multi";
            } else {
                itemExpacMap[name] = expansion.abbreviation;
            }
        });
    });
});

// Read items.js and inject expac field
let content = fs.readFileSync('./script/items.js', 'utf8');

Object.entries(itemExpacMap).forEach(([itemName, expac]) => {
    const constName = itemName.replace(/\s+/g, '_');
    content = content.replace(
        new RegExp(`(export const ${constName} = new (?:Item|ShopItem)\\(\\s*"[^"]*",\\s*"[^"]*")`),
        `$1,\n    "${expac}"`
    );
});

fs.writeFileSync('./script/items_tagged.js', content);
console.log(`Tagged ${Object.keys(itemExpacMap).length} items`);
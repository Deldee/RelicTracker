// tag_items.mjs — run with: node tag_items.mjs
import * as Steps from './script/steps.js';
import { Step } from './script/models.js';
import fs from 'fs';

const itemExpacMap = {};

// Go through every step and extract the expac from the step name
Object.entries(Steps).forEach(([stepName, step]) => {
    if (!(step instanceof Step)) return; // skip non-Step exports

    const abbreviation = stepName.slice(-3);

    step.entries.forEach(({ item }) => {
        const name = item.name;
        if (itemExpacMap[name] && itemExpacMap[name] !== abbreviation) {
            itemExpacMap[name] = "multi";
        } else {
            itemExpacMap[name] = abbreviation;
        }
    });
});

console.log("Item expac map:", itemExpacMap);

// Read items.js and inject expac field after the icon line
let content = fs.readFileSync('./script/items.js', 'utf8');

Object.entries(itemExpacMap).forEach(([itemName, expac]) => {
    const constName = itemName.replace(/\s+/g, '_');
    const pattern = new RegExp(
        `(export const ${constName} = new (?:Item|ShopItem)\\(\\s*"[^"]*",\\s*"[^"]*")`,
        'g'
    );
    content = content.replace(pattern, `$1,\n    "${expac}"`);
});

fs.writeFileSync('./script/items_tagged.js', content);
console.log(`Tagged ${Object.keys(itemExpacMap).length} items — output written to items_tagged.js`);
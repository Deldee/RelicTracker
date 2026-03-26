import * as Items from './items.js';
import * as Steps from "./steps.js"
import { Expansions } from './expansions.js';
import { CostSummary, ShopItem } from './models.js';


const totals = {};
const log = false

//Expose for debugging
window.Expansions = Expansions;
window.CostSummary = CostSummary;
window.Steps = Steps;
window.Items = Items;
window.getStepsCount = getStepsCount;
window.renderItemIcons = renderItemIcons;
window.calculateTotalCosts = calculateTotalCosts;
window.getAllTotals =  getAllTotals;
window.totals = totals;


//Take the Id of the expansion (1-6) and return an array of every steps of every row
function getStepsArray(expansion){
    let result = [];
    const table = document.getElementById("tracker");
    for(let row = 1; row < table.rows.length; row++){
        const select = table.rows[row].cells[expansion].getElementsByTagName("select")[0];
        if (select.classList.contains("disabled")) continue;
        result.push(select.selectedIndex);
    }
    return result;
}

function getStepsCount(expansion){
    let result= []
    const array = getStepsArray(expansion.numericID)
    for(var i = 0; i <= expansion.stepCollection.length; i++){
        result.push(array.filter(v => (v == i)).length)
    }
    
    return result;
}


// Get icon from an items and set it
function renderItemIcons(Items) {
    Object.values(Items).forEach(item => {
        const img = document.createElement("img");
        img.src = item.icon;
        img.alt = item.name;
        document.body.appendChild(img);
    });
}

//Cookies
function getSelectIndexes() {
    const selects = document.querySelectorAll("select");
    return Array.from(selects).map(select => select.selectedIndex);
}
function saveSelectsToCookie() {
    const indexes = getSelectIndexes();
    document.cookie = `relicTrack=${JSON.stringify(indexes)}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
}
function loadSelectsFromCookie() {
    const match = document.cookie.split("; ").find(row => row.startsWith("relicTrack="));
    if (!match) return null;
    return JSON.parse(match.split("=")[1]);
}
function restoreSelects() {
    const indexes = loadSelectsFromCookie();
    if (!indexes) return;

    const selects = document.querySelectorAll("select");
    selects.forEach((select, i) => {
        if (indexes[i] !== undefined) {
            select.selectedIndex = indexes[i];
        }
    });
}

// Save whenever any select changes
document.addEventListener("change", (e) => {
    if (e.target.tagName === "SELECT") {
        saveSelectsToCookie();

        const currentExpansion = Expansions.find(exp => e.target.classList.contains(exp.abbreviation));
        updateExpansionTotal(currentExpansion);
        updateAllTotals();
    }
});

//Totals
function calculateTotalCosts(currentExpansion) {
    const l = (...args) => log && console.log(...args);
    const lg = (label) => log && console.group(label);
    const lge = () => log && console.groupEnd();

    const stepsArray = getStepsCount(currentExpansion);
    const total = new CostSummary();
    let remainingRelics = currentExpansion.maximumRelics;

    lg(`calculateTotalCosts — ${currentExpansion.name}`);
    l("Steps array:", stepsArray);
    l("Starting relics:", remainingRelics);

    for (let i = stepsArray.length - 1; i > 0; i--) {
        remainingRelics -= stepsArray[i];
        lg(`Step [${i}]`);
        l("Raw value:        ", stepsArray[i]);
        l("Remaining relics: ", remainingRelics);

        if (remainingRelics <= 0) {
            l("→ No relics remaining, exiting loop");
            lge();
            break;
        }

        l("→ After subtracting step:", remainingRelics);
        total.add(currentExpansion.stepCollection[i - 1].getTotalCosts(remainingRelics));
        l("→ Current total:", total.getAll());
        lge();
    }

    l("Final total:", total.getAll());
    lge();

    return total;
}
function updateExpansionTotal(expansion) {
    totals[expansion.numericID] = calculateTotalCosts(expansion);
}
function updateAllTotals() {
    Expansions.forEach(expansion => updateExpansionTotal(expansion));
    renderTotals();
}
function getAllTotals() {
    const combined = new CostSummary();
    Object.values(totals).forEach(expansionTotal => {
        combined.add(expansionTotal);
    });
    return combined;
}


//UI
function renderTotals() {
    const data = getAllTotals().getAll();
    const container = document.getElementById("totals-table-container");
    container.innerHTML = "";

    // Group items by expac
    const groups = {};
    data.forEach(({ item, count }) => {
        const expac = item.expac ?? "unknown";
        if (!groups[expac]) groups[expac] = [];
        groups[expac].push({ item, count });
    });

    // Sort groups — multi first, then by expansion order
    const expansionOrder = Expansions.map(e => e.abbreviation);
    const sortedKeys = Object.keys(groups).sort((a, b) => {
        if (a === "multi") return -1;
        if (b === "multi") return 1;
        return expansionOrder.indexOf(a) - expansionOrder.indexOf(b);
    });

    sortedKeys.forEach(expac => {
        // Section wrapper
        const details = document.createElement("details");
        details.open = true;

        const summary = document.createElement("summary");
        summary.textContent = expac === "multi" ? "Shared (Multiple Expansions)" :
            Expansions.find(e => e.abbreviation === expac)?.name ?? expac;
        details.appendChild(summary);

        // Table for this section
        const table = document.createElement("table");
        table.classList.add("totals-table");

        const header = table.insertRow();
        ["Owned", "Required", "Material", "Cost", "Alternatives"].forEach(text => {
            const th = document.createElement("th");
            th.textContent = text;
            header.appendChild(th);
        });

        groups[expac].forEach(({ item, count }) => {
            const row = table.insertRow();

            // Column 1 — number input
            const inputCell = row.insertCell();
            const input = document.createElement("input");
            input.type = "number";
            input.min = 0;
            input.value = 0;
            input.classList.add("materialInput");
            input.dataset.itemName = item.name;
            inputCell.appendChild(input);

            // Column 2 — required count
            const countCell = row.insertCell();
            countCell.textContent = count;

            // Column 3 — icon + name
            const nameCell = row.insertCell();
            const img = document.createElement("img");
            img.src = item.icon;
            img.alt = item.name;
            img.width = 24;
            img.height = 24;
            const nameSpan = document.createElement("span");
            nameSpan.textContent = item.name;
            nameCell.appendChild(img);
            nameCell.appendChild(nameSpan);

            // Column 4 — main cost
            const costCell = row.insertCell();
            if (item instanceof ShopItem) {
                console.log(item)
                item.getMainCost().amounts.forEach(({ currency, value }) => {
                    const costRow = document.createElement("div");
                    costRow.style.display = "flex";
                    costRow.style.alignItems = "center";
                    costRow.style.gap = "4px";
                    const imgCost = document.createElement("img");
                    imgCost.src = currency.icon;
                    imgCost.alt = currency.name;
                    imgCost.width = 24;
                    imgCost.height = 24;
                    const costNameSpan = document.createElement("span");
                    costNameSpan.textContent = value + " " + currency.name;
                    costRow.appendChild(imgCost);
                    costRow.appendChild(costNameSpan);
                    costCell.appendChild(costRow);
                });
            }
            

            // Column 5 — alternative costs
            const altCell = row.insertCell();
            if (item instanceof ShopItem) {
                item.getAlternateCosts().forEach((source, index) => {
                    if (index > 0) {
                        const separator = document.createElement("hr");
                        separator.style.border = "none";
                        separator.style.borderTop = "1px solid var(--border)";
                        separator.style.margin = "4px 0";
                        altCell.appendChild(separator);
                    }
                    source.amounts.forEach(({ currency, value }) => {
                        const altRow = document.createElement("div");
                        altRow.style.display = "flex";
                        altRow.style.alignItems = "center";
                        altRow.style.gap = "4px";
                        const imgAlt = document.createElement("img");
                        imgAlt.src = currency.icon;
                        imgAlt.alt = currency.name;
                        imgAlt.width = 24;
                        imgAlt.height = 24;
                        const altNameSpan = document.createElement("span");
                        altNameSpan.textContent = value + " " + currency.name;
                        altRow.appendChild(imgAlt);
                        altRow.appendChild(altNameSpan);
                        altCell.appendChild(altRow);
                    });
                });
            }
        });

        details.appendChild(table);
        container.appendChild(details);
    });
}



// Restore on page load
restoreSelects();
updateAllTotals();
renderTotals();
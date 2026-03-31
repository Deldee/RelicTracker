import * as Items from './items.js';
import * as Steps from "./steps.js"
import { Expansions } from './expansions.js';
import { CostSummary} from './models.js';


const totals = {};
const log = false
let renderDebounceTimer = null;

//Expose for debugging
window.Expansions = Expansions;
window.CostSummary = CostSummary;
window.Steps = Steps;
window.Items = Items;
window.getStepsCount = getStepsCount;
window.renderItemIcons = renderItemIcons;
window.calculateTotalCosts = calculateTotalCosts;
window.getAllTotals = getAllTotals;
window.totals = totals;

function debouncedRender() {
    clearTimeout(renderDebounceTimer);
    renderDebounceTimer = setTimeout(() => renderTotals(), 300);
}

//Take the Id of the expansion (1-6) and return an array of every steps of every row
function getStepsArray(expansion) {
    let result = [];
    const table = document.getElementById("tracker");
    for (let row = 1; row < table.rows.length; row++) {
        const select = table.rows[row].cells[expansion].getElementsByTagName("select")[0];
        if (select.classList.contains("disabled")) continue;
        result.push(select.selectedIndex);
    }
    return result;
}

function getStepsCount(expansion) {
    let result = []
    const array = getStepsArray(expansion.numericID)
    for (var i = 0; i <= expansion.stepCollection.length; i++) {
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
function sanitizeInput(input) {
    const value = parseInt(input.value);
    if (isNaN(value) || value < 0) {
        input.value = 0;
    }
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
document.getElementById("totals-table-container").addEventListener("input", (e) => {
    if (e.target.classList.contains("materialInput")) {
        sanitizeInput(e.target);
        saveInputsToCookie();
        debouncedRender();
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
    const isShb = currentExpansion.abbreviation == "ShB"
    const isDT = currentExpansion.abbreviation == "DT"

    lg(`calculateTotalCosts — ${currentExpansion.name}`);
    l("Steps array:", stepsArray);
    l("Starting relics:", remainingRelics);

    for (let step = stepsArray.length - 1; step > 0; step--) {
        remainingRelics -= stepsArray[step];
        lg(`Step [${step}]`);
        l("Raw value:        ", stepsArray[step]);
        l("Remaining relics: ", remainingRelics);

        if (remainingRelics <= 0) {
            l("→ No relics remaining, exiting loop");
            lge();
            break;
        }
        //manually check one time steps
        if(remainingRelics == currentExpansion.maximumRelics){
            if(isDT && step == 3){
                total.add(Steps.ObscurumPreDT.getTotalCosts(1))
            } else if (isDT && step == 2){
                total.add(Steps.UmbraePreDT.getTotalCosts(1))
            } else if (isDT && step == 1){
                total.add(Steps.PenumbraePreDT.getTotalCosts(1))
            } else if (isShb && step == 6){
                total.add(Steps.oneTime2ShB.getTotalCosts(1))
            } else if (isShb && step == 5){
                total.add(Steps.oneTime1ShB.getTotalCosts(1))
            } 
        }

        l("→ After subtracting step:", remainingRelics);
        total.add(currentExpansion.stepCollection[step - 1].getTotalCosts(remainingRelics));
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
function getAdjustedCosts(item, missing) {
    if (missing === 0 || !(item.hasCost())) return null;

    const source = item.getMainSource();
    if (!source || !Array.isArray(source.amounts)) return null;

    return source.amounts.map(({ currency, value }) => ({
        currency,
        value: value * missing
    }));
}
//UI
// ── Helpers ─────────────────────────────────────────────────────────

function createItemIcon(item) {
    const img = document.createElement("img");
    img.src    = item.icon;
    img.alt    = item.name;
    img.width  = 24;
    img.height = 24;
    return img;
}

function createCostDiv(currency, value) {
    const div = document.createElement("div");
    div.style.display     = "flex";
    div.style.alignItems  = "center";
    div.style.gap         = "4px";
    div.appendChild(createItemIcon(currency));
    const span = document.createElement("span");
    span.textContent = value + " " + currency.name;
    div.appendChild(span);
    return div;
}

function createNumberInput(itemName) {
    const input = document.createElement("input");
    input.type  = "number";
    input.min   = 0;
    input.value = 0;
    input.classList.add("materialInput");
    input.dataset.itemName = itemName;
    return input;
}

// ── Grand totals section ─────────────────────────────────────────────

function buildGrandTotals(groups, inputState) {
    const grandTotals = {};
    Object.values(groups).forEach(group => {
        group.forEach(({ item, count }) => {
            if (!item.hasCost()) return;

            const owned   = parseInt(inputState[item.name] ?? 0);
            const missing = Math.max(0, count - owned);
            if (missing === 0) return;

            const source = item.getMainSource();
            if (!source || !Array.isArray(source.amounts)) return;

            source.amounts.forEach(({ currency, value }) => {
                const key = currency.name;
                if (!grandTotals[key]) grandTotals[key] = { currency, total: 0 };
                grandTotals[key].total += value * missing;
            });
        });
    });
    return grandTotals;
}

function renderTotalSection(grandTotals, inputState) {
    const totalDetails = document.createElement("details");
    totalDetails.open = true;
    totalDetails.dataset.expac = "total";

    const totalSummary = document.createElement("summary");
    totalSummary.textContent = "Total Currencies";
    totalDetails.appendChild(totalSummary);

    const table = document.createElement("table");
    table.classList.add("totals-table");

    const header = table.insertRow();
    ["Owned", "Required", "Currency"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        header.appendChild(th);
    });

    Object.values(grandTotals).reverse().forEach(({ currency, total }) => {
        const row = table.insertRow();
        const ownedCurrencyKey = `currency_${currency.name}`;
        const ownedCurrency    = parseInt(inputState[ownedCurrencyKey] ?? 0);
        const missingCurrency  = Math.max(0, total - ownedCurrency);
        const completed        = ownedCurrency >= total;

        if (completed) row.classList.add("completed");

        row.insertCell().appendChild(createNumberInput(ownedCurrencyKey));

        const totalCell = row.insertCell();
        totalCell.textContent = missingCurrency;

        const nameCell = row.insertCell();
        nameCell.appendChild(createItemIcon(currency));
        const nameSpan = document.createElement("span");
        nameSpan.textContent = currency.name;
        nameCell.appendChild(nameSpan);
    });

    totalDetails.appendChild(table);
    return totalDetails;
}

// ── Expansion section rows ───────────────────────────────────────────

function renderItemRow(item, count, inputState) {
    const row       = document.createElement("tr");
    const owned     = parseInt(inputState[item.name] ?? 0);
    const missing   = Math.max(0, count - owned);
    const completed = owned >= count;

    if (completed) row.classList.add("completed");

    // Column 1 — number input
    const inputCell = row.insertCell();
    inputCell.appendChild(createNumberInput(item.name));

    // Column 2 — required count
    const countCell = row.insertCell();
    countCell.textContent = count;

    // Column 3 — icon + name
    const nameCell = row.insertCell();
    nameCell.appendChild(createItemIcon(item));
    const nameSpan = document.createElement("span");
    nameSpan.textContent = item.name;
    nameCell.appendChild(nameSpan);

    // Column 4 — main cost
    const costCell = row.insertCell();
    if (item.hasCost()) {
        const adjusted = completed
            ? item.getMainSource().amounts.map(({ currency }) => ({ currency, value: 0 }))
            : getAdjustedCosts(item, missing);

        (adjusted ?? item.getMainSource().amounts).forEach(({ currency, value }) => {
            costCell.appendChild(createCostDiv(currency, value));
        });
    }

    // Column 5 — alternative costs
    const altCell = row.insertCell();
    if (item.hasCost()) {
        item.getAlternateSources().forEach((source, index) => {
            if (!source.hasCost()) return;

            if (index > 0) {
                const separator = document.createElement("hr");
                separator.style.cssText = "border:none; border-top:1px solid var(--border); margin:4px 0";
                altCell.appendChild(separator);
            }
            source.amounts.forEach(({ currency, value }) => {
                altCell.appendChild(createCostDiv(currency, completed ? 0 : value * missing));
            });
        });
    }

    return row;
}

function renderExpansionSection(expac, group, inputState) {
    const details = document.createElement("details");
    details.open = true;
    details.dataset.expac = expac;

    const summary = document.createElement("summary");
    summary.textContent = Expansions.find(e => e.abbreviation === expac)?.name ?? expac;
    details.appendChild(summary);

    const table = document.createElement("table");
    table.classList.add("totals-table");

    const header = table.insertRow();
    ["Owned", "Required", "Material", "Cost", "Alternatives"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        header.appendChild(th);
    });
    const tbody = table.getElementsByTagName("tbody");
    [...group].reverse().forEach(({ item, count }) => {
        tbody[0].appendChild(renderItemRow(item, count, inputState));
    });

    const allCompleted = group.every(({ item, count }) => {
        return parseInt(inputState[item.name] ?? 0) >= count;
    });

    if (allCompleted) details.classList.add("completed");

    details.appendChild(table);
    return details;
}

// ── Main render ──────────────────────────────────────────────────────

function renderTotals() {
    const detailsState = saveDetailsState();
    const inputState   = { ...saveInputState(), ...loadInputsFromCookie() };

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

    const expansionOrder = Expansions.map(e => e.abbreviation);
    const sortedKeys = Object.keys(groups).sort((a, b) => {
        if (a === "multi") return -1;
        if (b === "multi") return 1;
        return expansionOrder.indexOf(a) - expansionOrder.indexOf(b);
    });

    const grandTotals = buildGrandTotals(groups, inputState);
    container.appendChild(renderTotalSection(grandTotals, inputState));

    sortedKeys.forEach(expac => {
        container.appendChild(renderExpansionSection(expac, groups[expac], inputState));
    });

    restoreDetailsState(detailsState);
    restoreInputState(inputState);
}

function saveDetailsState() {
    const state = {};
    document.querySelectorAll("details").forEach(details => {
        state[details.dataset.expac] = details.open;
    });
    return state;
}

function restoreDetailsState(state) {
    document.querySelectorAll("details").forEach(details => {
        const expac = details.dataset.expac;
        if (expac in state) {
            details.open = state[expac];
        }
    });
}

function saveInputState() {
    const state = {};
    document.querySelectorAll("input.materialInput").forEach(input => {
        state[input.dataset.itemName] = input.value;
    });
    return state;
}

function restoreInputState(state) {
    document.querySelectorAll("input.materialInput").forEach(input => {
        const saved = state[input.dataset.itemName];
        if (saved !== undefined) input.value = saved;
    });
}

function saveInputsToCookie() {
    const state = saveInputState();
    document.cookie = `materialInputs=${JSON.stringify(state)}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
}

function loadInputsFromCookie() {
    const match = document.cookie.split("; ").find(row => row.startsWith("materialInputs="));
    if (!match) return {};
    try {
        return JSON.parse(match.split("=")[1]);
    } catch {
        return {};
    }
}



// Restore on page load
restoreSelects();
updateAllTotals();
renderTotals();
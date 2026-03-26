import * as Items from './items.js';
import * as Steps from "./steps.js"
import { Expansions } from './expansions.js';
import { CostSummary, ShopItem } from './models.js';


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
function getAdjustedCosts(item, missing) {
    if (missing === 0 || !(item instanceof ShopItem)) return null;

    const source = item.getMainCost();
    if (!source || !Array.isArray(source.amounts)) return null;

    return source.amounts.map(({ currency, value }) => ({
        currency,
        value: value * missing
    }));
}
//UI
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

    // ── Total section (top) ──────────────────────────────────────────
    const totalDetails = document.createElement("details");
    totalDetails.open = true;
    totalDetails.dataset.expac = "total";

    const totalSummary = document.createElement("summary");
    totalSummary.textContent = "Total Currencies";
    totalDetails.appendChild(totalSummary);

    const totalTable = document.createElement("table");
    totalTable.classList.add("totals-table");

    const totalHeader = totalTable.insertRow();
    ["Owned", "Required", "Currency"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        totalHeader.appendChild(th);
    });

    // Gather all currency totals across every group
    const grandTotals = {};
    Object.values(groups).forEach(group => {
        group.forEach(({ item, count }) => {
            if (!(item instanceof ShopItem)) return;

            const owned   = parseInt(inputState[item.name] ?? 0);
            const missing = Math.max(0, count - owned);
            if (missing === 0) return;

            const source = item.getMainCost();
            if (!source || !Array.isArray(source.amounts)) return;

            source.amounts.forEach(({ currency, value }) => {
                const key = currency.name;
                if (!grandTotals[key]) grandTotals[key] = { currency, total: 0 };
                grandTotals[key].total += value * missing;
            });
        });
    });

    Object.values(grandTotals).forEach(({ currency, total }) => {
        const row = totalTable.insertRow();

        const ownedCurrencyKey = `currency_${currency.name}`;
        const ownedCurrency    = parseInt(inputState[ownedCurrencyKey] ?? 0);
        const missingCurrency  = Math.max(0, total - ownedCurrency);
        const completed        = ownedCurrency >= total;

        if (completed) row.classList.add("completed");

        // Column 1 — number input
        const inputCell = row.insertCell();
        const input = document.createElement("input");
        input.type = "number";
        input.min = 0;
        input.value = 0;
        input.classList.add("materialInput");
        input.dataset.itemName = ownedCurrencyKey;
        inputCell.appendChild(input);

        // Column 2 — required count (minus owned)
        const totalCell = row.insertCell();
        totalCell.textContent = missingCurrency;

        // Column 3 — icon + name
        const nameCell = row.insertCell();
        const img = document.createElement("img");
        img.src = currency.icon;
        img.alt = currency.name;
        img.width = 24;
        img.height = 24;
        const nameSpan = document.createElement("span");
        nameSpan.textContent = currency.name;
        nameCell.appendChild(img);
        nameCell.appendChild(nameSpan);
    });

    totalDetails.appendChild(totalTable);
    container.appendChild(totalDetails);

    // ── Expansion sections ───────────────────────────────────────────
    sortedKeys.forEach(expac => {
        const details = document.createElement("details");
        details.open = true;
        details.dataset.expac = expac;

        const summary = document.createElement("summary");
        summary.textContent = expac === "multi"
            ? "Shared (Multiple Expansions)"
            : Expansions.find(e => e.abbreviation === expac)?.name ?? expac;
        details.appendChild(summary);

        const table = document.createElement("table");
        table.classList.add("totals-table");

        const header = table.insertRow();
        ["Owned", "Required", "Material", "Cost", "Alternatives"].forEach(text => {
            const th = document.createElement("th");
            th.textContent = text;
            header.appendChild(th);
        });

        groups[expac].reverse().forEach(({ item, count }) => {
            const row = table.insertRow();
            const owned     = parseInt(inputState[item.name] ?? 0);
            const missing   = Math.max(0, count - owned);
            const completed = owned >= count;

            if (completed) row.classList.add("completed");

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

            // Column 4 — main cost (adjusted for owned)
            const costCell = row.insertCell();
            if (item instanceof ShopItem) {
                const adjusted = completed
                    ? item.getMainCost().amounts.map(({ currency }) => ({ currency, value: 0 }))
                    : getAdjustedCosts(item, missing);

                (adjusted ?? item.getMainCost().amounts).forEach(({ currency, value }) => {
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
                        altNameSpan.textContent = (completed ? 0 : value * missing) + " " + currency.name;

                        altRow.appendChild(imgAlt);
                        altRow.appendChild(altNameSpan);
                        altCell.appendChild(altRow);
                    });
                });
            }
        });

        // Mark details as completed if every row in the group is completed
        const allCompleted = groups[expac].every(({ item, count }) => {
            const owned = parseInt(inputState[item.name] ?? 0);
            return owned >= count;
        });

        if (allCompleted) details.classList.add("completed");

        details.appendChild(table);
        container.appendChild(details);
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

function getMultiCurrencyTotals(groups, inputState) {
    const totals = {};

    Object.values(groups).forEach(group => {
        group.forEach(({ item, count }) => {
            if (!(item instanceof ShopItem)) return;

            const owned   = parseInt(inputState[item.name] ?? 0);
            const missing = Math.max(0, count - owned);
            if (missing === 0) return;

            const source = item.getMainCost();
            if (!source || !Array.isArray(source.amounts)) return;

            source.amounts.forEach(({ currency, value }) => {
                if (currency.expac !== "multi") return; // only multi-tagged currencies

                const key = currency.name;
                if (!totals[key]) totals[key] = { currency, total: 0 };
                totals[key].total += value * missing;
            });
        });
    });

    return Object.values(totals);
}


// Restore on page load
restoreSelects();
updateAllTotals();
renderTotals();
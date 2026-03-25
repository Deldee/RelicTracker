import * as Items from './items.js';
import * as Steps from "./steps.js"
window.Steps = Steps;
window.Items = Items;
window.getStepsCount = getStepsCount;
window.renderItemIcons = renderItemIcons;
window.renderCurrIcons = renderCurrIcons;

//Take the Id of the expansion (1-6) and return an array of every steps of every row
function getStepsArray(expansion){
    let result= [];
    const table = document.getElementById("tracker");
    for(let row = 1; row < table.rows.length; row++){
        //push the current select index into the array
        result.push(table.rows[row].cells[expansion].getElementsByTagName("select")[0].selectedIndex)
    }
    console.log("Raw array " + result)
    return result;
}

function getStepsCount(expansion){
    let result= []
    const array = getStepsArray(expansion)
    for(var i = 0; i < 20; i++){
        result.push(array.filter(v => (v == i)).length)
    }
    console.log("count of each steps : " + result)
    
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

function renderCurrIcons(Items) {
    Object.values(Currencies).forEach(item => {
        const img = document.createElement("img");
        img.src = item.icon;
        img.alt = item.name;
        document.body.appendChild(img);
    });
}
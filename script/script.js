import * as Items from './items.js';
import * as Currencies from './currencies.js';
window.Items = Items;
window.Currencies = Currencies;
window.getStepsCount = getStepsCount;

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
//document.getElementById("testimg").src = Items.Unidentifiable_Seeds.costs[0].currency.icon
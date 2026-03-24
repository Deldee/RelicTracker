//Take the Id of the expansion (1-6) and return an array of every steps of every row
function getStepsArray(expansion){
    result= [];
    table = document.getElementById("tracker");
    for(let row = 1; row < table.rows.length; row++){
        //push the current select index into the array
        result.push(table.rows[row].cells[expansion].getElementsByTagName("select")[0].selectedIndex)
    }
    console.log(result)
}


$outFolder = "G:\FFXIVmods\RelicTracker\resources\AntiRelics.txt"
$classArray = "PLD","WAR","DRG","MNK","NIN","BRD","BLM","SMN","WHM","SCH","DRK","MCH","AST","SAM","RDM","GNB","DNC","RPR","SGE","VPR","PCT"


foreach($class in $classArray){
 
$text = "+Name~`"Antiquated `" -Name~`"Replica`" +Rarity=`"3`" +ClassJobUse.Abbreviation=`"$class`""
$query = [System.Net.WebUtility]::UrlEncode($text)
$response = Invoke-RestMethod "https://v2.xivapi.com/api/search?query=$query&sheets=Item&fields=Name"
$content = $response | Select-Object results

    foreach ($result in $content.results){
        $name = ($result.fields.Name -split " ",2)[1]
        $response2 = Invoke-RestMethod "https://v2.xivapi.com/api/search?query=%2BName~`"$name`"%20-Name~`"Replica`"&sheets=Item&fields=Name" | Select-Object results
        foreach ($result in $response2.results){
            Write-Output $result.fields.Name | Out-File $outFolder -Append
        }
        Write-Output "--------" | Out-File $outFolder -Append
    }
    
}
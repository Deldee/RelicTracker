$outFolder = "G:\FFXIVmods\RelicTracker\resources\img\weaponIcon"
$text = '+Rarity="4" -Name~"Replica"' 
$query = [System.Net.WebUtility]::UrlEncode($text)
$cursor = "edf31e9b-63bb-43d5-b376-743b790f9501"
#Get all Atmas
$response = Invoke-RestMethod "https://v2.xivapi.com/api/search?query=$query&sheets=Item&fields=Name%2CIcon.path&cursor=$cursor"
$content = $response | Select-Object results


foreach ($result in $content.results){
$path = $result.fields.Icon.path
$name = $result.fields.Name -replace " ", "_" -replace ":",""
Invoke-WebRequest -Uri "https://v2.xivapi.com/api/asset?path=$path&format=png" -OutFile "$outFolder\$name.png"
}

Write-Output $response.next


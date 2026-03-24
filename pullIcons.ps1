$outFolder = "G:\FFXIVmods\RelicTracker\resources\img\itemIcon"
$text = '+Name~"Nodule"'
$query = [System.Net.WebUtility]::UrlEncode($text)
#Get all Atmas
$response = Invoke-RestMethod "https://v2.xivapi.com/api/search?query=$query&sheets=Item&fields=Name%2CIcon.path"
$content = $response | Select-Object results

foreach ($result in $content.results){
$path = $result.fields.Icon.path
$name = $result.fields.Name -replace " ", "_" -replace ":",""
Invoke-WebRequest -Uri "https://v2.xivapi.com/api/asset?path=$path&format=png" -OutFile "$outFolder\$name.png"
}


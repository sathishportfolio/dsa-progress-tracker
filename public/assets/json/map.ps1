# Define file paths
$problemsFilePath = ".\problems.json"
$videosFilePath = ".\videos.json"
$outputFilePath = ".\output.json"

# Read JSON files
$problemsJson = Get-Content -Path $problemsFilePath -Raw | ConvertFrom-Json
$videosJson = Get-Content -Path $videosFilePath -Raw | ConvertFrom-Json

# Create a hashtable for video links for easy lookup
$videoLinks = @{}
foreach ($video in $videosJson) {
    $slug = $video[0]
    $links = $video[1].videos
    $videoLinks[$slug] = $links
}

# Iterate through problems and update with video links
foreach ($problem in $problemsJson) {
    foreach ($subcategory in $problem.subcategories) {
        foreach ($problemItem in $subcategory.problems) {
            # Check if there's a matching video link
            if ($videoLinks.ContainsKey($problemItem.problem_slug)) {
                # Add videos_link if it doesn't exist
                if (-not $problemItem.PSObject.Properties["videos_link"]) {
                    $problemItem | Add-Member -MemberType NoteProperty -Name "videos_link" -Value @()
                }
                # Set the value of videos_link
                $problemItem.videos_link = $videoLinks[$problemItem.problem_slug]
            } else {
                # If no match found, initialize as an empty array if not already set
                if (-not $problemItem.PSObject.Properties["videos_link"]) {
                    $problemItem | Add-Member -MemberType NoteProperty -Name "videos_link" -Value @()
                }
            }
        }
    }
}

# Convert updated problems back to JSON and save to output file
$updatedJson = $problemsJson | ConvertTo-Json -Depth 10
Set-Content -Path $outputFilePath -Value $updatedJson

Write-Host "Updated problems.json and saved to output.json"
# Fix: langResponse.json is not a function

## Problem
The Netlify function was throwing errors: `Error fetching languages for [repo]: langResponse.json is not a function`

This error occurred in multiple repositories when trying to fetch language data.

## Root Cause
In `netlify/functions/get-repos.js`, the `fetchRepositoryDetails()` function was incorrectly calling `.json()` on an already-parsed response object.

The `GitHubClient.request()` method in `github-client.js` already calls `.json()` on the response and returns the parsed data. However, the code was trying to call `.json()` again on the returned object, which is not a function.

### Problematic Code (Before)
```javascript
// In fetchRepositoryDetails() function
try {
  const langResponse = await githubClient.fetchRepositoryLanguages(repoName);
  repo.languages = await langResponse.json();  // ❌ langResponse is already parsed!
} catch (langError) {
  console.error(`Error fetching languages for ${repoName}:`, langError.message);
  repo.languages = {};
}
```

### Similar Issue with README
The same problem existed with README fetching:
```javascript
try {
  const readmeResponse = await githubClient.fetchRepositoryReadme(repoName);
  repo.hasReadme = readmeResponse.ok;  // ❌ readmeResponse is not a Response object!
  
  if (readmeResponse.ok) {
    const readmeData = await readmeResponse.json();  // ❌ Can't call .ok or .json()
    // ...
  }
} catch (readmeError) {
  // ...
}
```

## Solution
Fixed both issues by removing the redundant `.json()` calls and adjusting the code to work with already-parsed data:

### Fixed Code (After)
```javascript
// Languages - now correctly handles parsed data
try {
  const langResponse = await githubClient.fetchRepositoryLanguages(repoName);
  repo.languages = langResponse;  // ✅ langResponse is already parsed
} catch (langError) {
  console.error(`Error fetching languages for ${repoName}:`, langError.message);
  repo.languages = {};
}

// README - now correctly handles parsed data
try {
  const readmeData = await githubClient.fetchRepositoryReadme(repoName);
  repo.hasReadme = true;  // ✅ If we got here, README exists
  
  let readmeContent;
  if (readmeData.encoding === 'base64') {
    readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf8');
  } else {
    readmeContent = readmeData.content;
  }
  repo.readmeContent = readmeContent;
} catch (readmeError) {
  console.error(`Error checking README for ${repoName}:`, readmeError.message);
  repo.hasReadme = false;
  repo.readmeContent = null;
}
```

Also fixed the same issue in `addScreenshotUrlsAndReadmeContent()` function.

## Files Modified
- `netlify/functions/get-repos.js`
  - Fixed `fetchRepositoryDetails()` function (languages and README handling)
  - Fixed `addScreenshotUrlsAndReadmeContent()` function (README handling)

## Testing
After the fix, the function now:
- ✅ Successfully fetches repository languages without errors
- ✅ Successfully fetches README data without errors
- ✅ Properly handles 404 errors for repositories without READMEs
- ✅ Returns status 200 with updated repository data

### Before Fix
```
Error fetching languages for pelican-simple-theme: langResponse.json is not a function
Error fetching languages for website-templates-jcteched: langResponse.json is not a function
Error fetching languages for video_slideshow_maker: langResponse.json is not a function
... (9 similar errors)
```

### After Fix
```
GitHub API request failed for /repos/omnisonic/work_log/readme: GitHub API error: 404 Not Found
Error checking README for work_log: GitHub API error: 404 Not Found
... (expected 404 errors for repos without READMEs)
Response with status 200 in 5169 ms.
```

## Key Insight
The `GitHubClient` class abstracts away the Response object handling by calling `.json()` internally in the `request()` method. All methods that use `request()` return already-parsed JSON data, not Response objects. This is the correct pattern and eliminates the need for callers to handle Response objects directly.

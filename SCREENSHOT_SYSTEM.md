# Screenshot System - Build-Time Matching

## Overview

The screenshot system has been refactored from **runtime (client-side)** to **build-time (server-side)** matching for better performance and reliability.

## Changes Made

### 1. New Server-Side Utility (`netlify/functions/screenshot-utils.js`)

Created a new utility module that handles screenshot matching at build time:

- **`findScreenshotForRepo(repoName)`** - Main matching function
- **`addScreenshotUrls(repositories)`** - Adds screenshot URLs to repository data
- **`getAllScreenshotFiles()`** - Lists all available screenshot files

### 2. Updated Netlify Function (`netlify/functions/get-repos.js`)

Modified the `get-repos` function to:
- Import the screenshot utility
- Call `addScreenshotUrls()` after fetching repository data
- Include `screenshotUrl` property in each repository object

### 3. Updated Frontend (`script.js`)

Simplified the frontend code:
- **Removed** `getScreenshotUrl()` function (no longer needed)
- **Removed** `fileExists()` function (no longer needed)
- **Removed** async/await from `createRepoCard()` and `renderRepositories()`
- **Added** direct use of `repo.screenshotUrl` from server response

### 4. Updated Documentation

- **`assets/screenshots/README.md`** - Detailed naming patterns and build-time explanation
- **`readme.md`** - Added screenshot feature to features list and development section
- **`SCREENSHOT_SYSTEM.md`** - This file

## How It Works

### Before (Runtime Matching)

```
Browser → Load page → Fetch repos → For each repo:
  → Try pattern 1 (HEAD request)
  → Try pattern 2 (HEAD request)
  → Try pattern 3 (HEAD request)
  → ... (multiple requests per repo)
```

**Problems:**
- Multiple HTTP requests per repository
- Slow page loads
- Inconsistent results
- Doesn't work well with static site generation

### After (Build-Time Matching)

```
Netlify Function → Fetch repos from GitHub → Scan screenshots folder:
  → Match "chords-scale-chart" → "Screenshot chords scale chart preview.JPG"
  → Add screenshotUrl to each repo
  → Return complete data
Browser → Load page → Display repos with pre-matched screenshots
```

**Benefits:**
- ✅ Zero client-side file checking
- ✅ Single HTTP request for all repos
- ✅ Consistent matching logic
- ✅ Works with static site generation
- ✅ Better caching (screenshot data cached with repo data)

## Supported Naming Patterns

### Strict Patterns (Checked First)
- `repo-name.png`, `.jpg`, `.jpeg`, `.webp`
- `repo-name-screenshot.png`
- `repo-name-preview.png`
- `repo-name-demo.png`
- `repo-name-img.png`

### Flexible Patterns (If No Strict Match)
- `Screenshot repo-name.png`
- `Screenshot repo-name preview.png`
- `repo-name screenshot.png`
- `repo-name preview.png`
- `repo-name demo.png`

### Partial Name Matching (Final Fallback)
- Handles spaces, hyphens, underscores
- Case-insensitive matching
- Supports common variations

## Example

### Repository: "chords-scale-chart"

**Works with:**
- `Screenshot chords scale chart preview.JPG` ✓ (your existing file)
- `chords-scale-chart.png`
- `chords-scale-chart-screenshot.png`
- `chords scale chart preview.png`

**Result:**
```json
{
  "name": "chords-scale-chart",
  "description": "Music theory app",
  "screenshotUrl": "assets/screenshots/Screenshot chords scale chart preview.JPG"
}
```

## Testing

### Test 1: Direct Matching
```bash
node -e "
const { findScreenshotForRepo } = require('./netlify/functions/screenshot-utils.js');
console.log(findScreenshotForRepo('chords-scale-chart'));
"
```
**Output:** `assets/screenshots/Screenshot chords scale chart preview.JPG`

### Test 2: Integration
```bash
node -e "
const { addScreenshotUrls } = require('./netlify/functions/screenshot-utils.js');
const repos = [{ name: 'chords-scale-chart' }];
console.log(addScreenshotUrls(repos));
"
```
**Output:** Repositories with `screenshotUrl` property

## Performance Comparison

| Metric | Before (Runtime) | After (Build-Time) |
|--------|------------------|-------------------|
| Client Requests | Multiple per repo | 0 |
| Page Load Time | Slower (file checks) | Faster (pre-matched) |
| Consistency | Variable | Consistent |
| Static Gen Support | Poor | Excellent |
| Caching | Inefficient | Efficient |

## Migration Guide

### For Existing Projects

1. **No changes needed** - The system is backward compatible
2. **Add screenshots** to `assets/screenshots/` folder
3. **Deploy** - Matching happens automatically

### For New Projects

1. Create `assets/screenshots/` folder
2. Add screenshots with flexible naming
3. Deploy to Netlify
4. Screenshots will be matched at build time

## Troubleshooting

### Screenshot Not Found

1. Check file exists in `assets/screenshots/`
2. Verify naming pattern matches repository name
3. Check case sensitivity (patterns are case-insensitive)
4. Clear Netlify cache and redeploy

### Multiple Screenshots Matched

The system uses priority order:
1. Strict patterns first
2. Flexible patterns second
3. Partial matching last

First match wins.

## Future Enhancements

- [ ] Support for multiple screenshots per repository
- [ ] Thumbnail generation/optimization
- [ ] Screenshot metadata (alt text, captions)
- [ ] Admin interface for managing screenshots
- [ ] Automated screenshot capture from live demos

## Files Modified

- `netlify/functions/screenshot-utils.js` (NEW)
- `netlify/functions/get-repos.js` (MODIFIED)
- `script.js` (MODIFIED - simplified)
- `assets/screenshots/README.md` (MODIFIED)
- `readme.md` (MODIFIED)

## Conclusion

The build-time screenshot matching system provides:
- ✅ Better performance
- ✅ More reliable matching
- ✅ Easier maintenance
- ✅ Better developer experience
- ✅ Production-ready solution

Your existing screenshot "Screenshot chords scale chart preview.JPG" will now be automatically matched to the "chords-scale-chart" repository at build time!
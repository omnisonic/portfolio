# Build Process Documentation

## Overview

This portfolio website uses a **Full Refresh on Deployment** strategy where all GitHub repository data is fetched and static files are generated during each Netlify deployment. This ensures data consistency and optimal performance.

## How It Works

### Build Process Flow

1. **Netlify triggers deployment**
2. **Build script runs**: `node build-data.js`
3. **GitHub API data fetched**: All repositories, topics, languages, READMEs
4. **Images downloaded**: Screenshots extracted from READMEs and downloaded locally
5. **Static JSON generated**: `public/data/repos.json` created
6. **Frontend uses static data**: `script.js` loads local files first

### Key Files

#### Build Script (`build-data.js`)
- **Purpose**: Fetches all GitHub data and generates static files
- **Output**: 
  - `public/data/repos.json` - Complete repository data
  - `public/images/repos/` - Downloaded screenshot images
- **Features**:
  - Automatic retry logic (3 attempts)
  - Rate limiting protection (batch processing)
  - Topic-based filtering
  - Screenshot extraction from READMEs
  - Language detection and statistics

#### Frontend (`script.js`)
- **Purpose**: Loads data with fallback mechanism
- **Logic**:
  1. Try to fetch `/data/repos.json` (static)
  2. If successful, use static data
  3. If failed, fall back to dynamic API function
  4. Render repositories

#### Netlify Configuration (`netlify.toml`)
```toml
[build]
  command = "node build-data.js"
  publish = "."
```

## Environment Variables

Required for build process:
- `GITHUB_USERNAME` - GitHub username to fetch repositories from
- `GITHUB_TOKEN` (optional) - GitHub personal access token for higher rate limits
- `EXCLUDE_TOPICS` (optional) - Comma-separated topics to exclude

## Build Script Features

### Data Fetching
- **Pagination**: Handles repositories across multiple pages
- **Filtering**: Removes forked repositories
- **Topics**: Fetches repository topics for filtering
- **Details**: Gets README and language data for each repo

### Image Processing
- **Extraction**: Parses README markdown for first image
- **Download**: Downloads images to local filesystem
- **Optimization**: Uses original image format
- **Fallback**: Handles missing/invalid images gracefully

### Error Handling
- **Retry Logic**: 3 attempts per API call with exponential backoff
- **Timeout Protection**: 30-second timeout per request
- **Batch Processing**: 5 repositories per batch to avoid rate limits
- **Graceful Degradation**: Continues even if some data fails

## Deployment Process

### Local Development
```bash
# Generate static data
npm run build

# Or directly
GITHUB_USERNAME=omnisonic node build-data.js
```

### Netlify Deployment
1. Push changes to GitHub
2. Netlify detects changes
3. Runs build command: `node build-data.js`
4. Build script fetches fresh data
5. Static files generated
6. Site deployed with updated data

### Manual Deployment
```bash
# 1. Generate static data
npm run build

# 2. Commit generated files (optional, not recommended)
git add public/data/ public/images/repos/
git commit -m "Update static data"

# 3. Deploy
git push origin main
```

## Benefits

### Consistency
- Data always matches current GitHub state
- No stale cache issues
- Predictable deployment behavior

### Performance
- Static files served from Netlify CDN
- No runtime API calls needed
- Fast page loads

### Reliability
- Works even if GitHub API is down
- No rate limiting on frontend
- Fallback available if needed

### Simplicity
- No complex caching logic
- No cache invalidation needed
- Clear separation of concerns

## Troubleshooting

### Build Fails
1. Check `GITHUB_USERNAME` environment variable
2. Verify GitHub API rate limits
3. Check network connectivity
4. Review build logs for specific errors

### Images Not Downloading
1. Verify README image URLs are valid
2. Check GitHub raw content access
3. Ensure sufficient disk space
4. Review download errors in logs

### Data Missing
1. Check if repositories exist
2. Verify topic filtering isn't too aggressive
3. Ensure build script completed successfully
4. Validate `repos.json` file structure

## Performance Considerations

### Build Time
- **Typical**: 60-90 seconds for ~50 repositories
- **Factors**: API rate limits, image sizes, network speed
- **Optimization**: Batch processing, parallel requests

### File Sizes
- **JSON Data**: ~30-50KB for 50 repositories
- **Images**: ~2-5MB total (varies by repository)
- **Total**: ~2-6MB per deployment

### Netlify Limits
- **Build Time**: 15 minutes max
- **Memory**: 1.5GB available
- **Disk**: 1GB temporary storage

## Future Enhancements

### Potential Improvements
1. **Incremental Updates**: Only update changed repositories
2. **Image Optimization**: Compress downloaded images
3. **CDN Caching**: Configure cache headers for static files
4. **Build Notifications**: Slack/Discord alerts on build status
5. **Multi-user Support**: Configurable GitHub usernames

### Alternative Strategies
- **Option 2**: Hybrid approach with change detection
- **Option 3**: Scheduled updates with webhooks
- **Option 4**: Client-side caching with service workers

## Summary

The Full Refresh on Deployment strategy provides a robust, simple solution that ensures data consistency while maintaining good performance. The build script handles all data fetching and file generation, while the frontend gracefully falls back to dynamic fetching if static data is unavailable.
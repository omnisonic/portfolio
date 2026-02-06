# API Caching System

This project includes a simple in-memory caching system for GitHub API calls during development.

## Features

- **Indefinite caching** by default (configurable)
- **Manual cache clearing** via API endpoints
- **Cache hit/miss logging** for debugging
- **Shared cache utilities** across all API functions

## Cache Duration

The cache duration is set to **indefinite (0 seconds)** by default. This means cached data will persist until manually cleared.

To change the cache duration, modify the cache initialization in your API functions:

```javascript
const cache = require('./cache-utils');
cache.setCacheDuration(300); // 5 minutes in seconds
```

## Cache Clear Endpoint

Both API functions support a cache clear endpoint. Simply add `?clear=true` to any API request:

### Clear all cached data:
```
GET /.netlify/functions/get-repos?clear=true
GET /.netlify/functions/get-readme?clear=true
```

### Response:
```json
{
  "message": "Cache cleared successfully",
  "clearedEntries": 3
}
```

## Cache Headers

API responses include cache status headers:

- `X-Cache: HIT` - Data was served from cache
- `X-Cache: MISS` - Data was fetched from API

## How It Works

1. **Cache Key Generation**: Each request creates a unique key based on function name and parameters
2. **Cache Check**: Before making API calls, the system checks if valid cached data exists
3. **Cache Storage**: Successful API responses are stored in memory
4. **Cache Retrieval**: Cached data is returned immediately if available

## Example Usage

### First Request (Cache Miss):
```
GET /.netlify/functions/get-repos
```
Response headers: `X-Cache: MISS`
Console log: `[CACHE] Stored: get-repos:{"username":"omnisonic"}`

### Second Request (Cache Hit):
```
GET /.netlify/functions/get-repos
```
Response headers: `X-Cache: HIT`
Console log: `[CACHE] Hit: get-repos:{"username":"omnisonic"}`

### Clear Cache:
```
GET /.netlify/functions/get-repos?clear=true
```
Console log: `[CACHE] Cleared all entries (1 items)`

## Development Benefits

- **Faster development**: No repeated API calls during development
- **Rate limit protection**: Reduces GitHub API calls
- **Offline capability**: Works with cached data when offline
- **Debug visibility**: Console logs show cache activity

## Production Considerations

For production deployment, you may want to:
- Set a reasonable cache duration (e.g., 5-15 minutes)
- Consider using Redis or similar for persistent caching
- Add cache invalidation based on webhook events
- Monitor cache hit rates

To disable caching entirely, remove the cache logic from the API functions or set a very short duration.
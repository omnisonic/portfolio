# Exclude Topics Feature Implementation

## Overview
This feature allows you to exclude repositories with specific GitHub topics from being displayed in your portfolio. This is useful for hiding draft repositories, work-in-progress projects, or any other repositories you don't want to showcase.

## How It Works

### 1. Environment Variable Configuration
Set the `EXCLUDE_TOPICS` environment variable with comma-separated topic names:

```bash
EXCLUDE_TOPICS=draft,wip,template
```

### 2. Implementation Details

#### Topics Fetching
- Each repository's topics are fetched using the GitHub API
- Topics are stored in the repository object as `repo.topics` array
- This happens after fork filtering but before other processing

#### Filtering Logic
- Both exclude topics and repository topics are converted to lowercase for case-insensitive comparison
- Repositories containing any excluded topic are filtered out
- Filtering happens server-side, so end users never see the excluded repositories

#### Cache Key Generation
- Cache keys include the sorted exclude topics to ensure different filters get different cache entries
- Example cache key: `get-repos:omnisonic:forks-false:perpage-100:topics-draft,wip`

### 3. Code Changes

#### Added Functions
```javascript
async function fetchRepositoryTopics(repositories, username, token) {
  // Fetches topics for each repository using GitHub API
  // Returns repositories with added topics array
}
```

#### Modified Filtering Logic
```javascript
// Get exclude topics from environment variable
const excludeTopicsEnv = process.env.EXCLUDE_TOPICS || '';
const excludeTopics = excludeTopicsEnv.split(',').map(t => t.trim().toLowerCase()).filter(t => t);

// Apply exclude topics filtering
if (excludeTopics.length > 0) {
  repositories = repositories.filter(repo => {
    const repoTopics = (repo.topics || []).map(t => t.toLowerCase());
    const hasExcludedTopic = excludeTopics.some(excluded => repoTopics.includes(excluded));
    return !hasExcludedTopic;
  });
}
```

## Usage Examples

### Example 1: Exclude Draft Repositories
```bash
# Environment variable
EXCLUDE_TOPICS=draft

# Result
# Repositories with "draft" topic are hidden
```

### Example 2: Multiple Topics
```bash
# Environment variable
EXCLUDE_TOPICS=draft,wip,template,learning

# Result
# Repositories with any of these topics are hidden
```

### Example 3: Case Insensitive
```bash
# Environment variable
EXCLUDE_TOPICS=DRAFT,WiP

# Result
# Works the same as "draft,wip" (case insensitive)
```

## Benefits

1. **Server-Side Filtering**: End users never see excluded repositories
2. **No UI Changes Required**: Filtering is transparent to the frontend
3. **Case Insensitive**: Works regardless of topic capitalization
4. **Cache Efficient**: Different filter combinations get separate cache entries
5. **Multiple Topics**: Can exclude multiple topics with comma separation

## Technical Notes

- Topics are fetched for each repository individually to avoid GitHub API rate limits
- Processing is batched (5 repositories at a time) with delays between batches
- The feature integrates seamlessly with existing caching and screenshot extraction
- No changes needed to frontend code - the filtered repositories are returned as if they never existed

## Environment Setup

Add to your Netlify environment variables:
```
EXCLUDE_TOPICS=draft,wip
```

Or for local development, add to `.env` file:
```
EXCLUDE_TOPICS=draft,wip
```

The feature is now active and will automatically filter repositories with the specified topics.
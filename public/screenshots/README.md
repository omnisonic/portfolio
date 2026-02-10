# Repository Screenshots

Add screenshots for your repository previews here. The system now supports **flexible naming patterns** to accommodate various file naming conventions.

## Supported Naming Patterns

### Strict Patterns (Recommended)
These are checked first for optimal performance:
- `repo-name.png` or `repo-name.jpg` or `repo-name.jpeg` or `repo-name.webp`
- `repo-name-screenshot.png`
- `repo-name-preview.png`
- `repo-name-demo.png`
- `repo-name-img.png`

### Flexible Patterns (New!)
If strict patterns don't match, the system will also try:
- `Screenshot repo-name.png` (with description)
- `Screenshot repo-name preview.png`
- `repo-name screenshot.png`
- `repo-name preview.png`
- `repo-name demo.png`

### Partial Name Matching
The system can also match partial repository names and handle:
- Spaces, hyphens, and underscores
- Case-insensitive matching
- Common variations and abbreviations

## Examples

### Repository: "chords-scale-chart"
**Works with:**
- `chords-scale-chart.png`
- `chords-scale-chart-screenshot.png`
- `Screenshot chords scale chart preview.JPG` ✓
- `chords scale chart preview.png`
- `chords-scale-preview.png`

### Repository: "my-app"
**Works with:**
- `my-app.png`
- `my-app-screenshot.png`
- `Screenshot my-app demo.png`
- `my app preview.png`

## Best Practices

1. **Use descriptive names** - You can include descriptions like "Screenshot chords scale chart preview.JPG"
2. **Keep it organized** - All screenshots go in this folder
3. **Use web formats** - PNG, JPG, JPEG, or WebP
4. **Optimal size** - 400-800px wide for best performance

## How It Works

### Build-Time Processing
The screenshot matching now happens **at build time** in the Netlify functions, not in the browser:

1. **Server-side matching**: When `get-repos` function runs, it scans the screenshots folder
2. **Pre-matched URLs**: Each repository gets a `screenshotUrl` property with the matched image
3. **No client-side requests**: The frontend receives ready-to-use screenshot URLs
4. **Better performance**: No runtime file system checks or multiple HTTP requests

### Matching Process
1. System first tries strict pattern matching
2. If no match, tries flexible patterns with common variations
3. Finally, attempts partial name matching
4. Falls back to `null` if nothing is found

### Benefits
- ✅ **Faster page loads** - No client-side file checking
- ✅ **Better caching** - Screenshot data is cached with repository data
- ✅ **Static generation friendly** - Works with build-time optimization
- ✅ **Reduced server load** - No repeated file existence checks
- ✅ **Reliable matching** - Consistent results across deployments

This ensures maximum compatibility while maintaining excellent performance.

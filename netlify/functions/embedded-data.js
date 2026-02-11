/**
 * Embedded Static Data for Netlify Functions
 * 
 * This file is auto-generated during the build process.
 * It contains the static repository data embedded directly in the function code,
 * eliminating the need for file system reads in the Netlify runtime environment.
 * 
 * Generated at: 2026-02-11T18:51:34.430Z
 */

const EMBEDDED_DATA = {
  "metadata": {
    "generatedAt": "2026-02-11T18:51:34.428Z",
    "username": "omnisonic",
    "userProfile": {
      "login": "omnisonic",
      "avatar_url": "https://avatars.githubusercontent.com/u/44691331?v=4",
      "html_url": "https://github.com/omnisonic",
      "name": "John",
      "bio": "Python and Web Developer, Tutor",
      "public_repos": 55,
      "followers": 4,
      "following": 12,
      "created_at": "2018-11-02T04:04:00Z"
    },
    "totalRepos": 41,
    "languageStats": {
      "JavaScript": 17,
      "CSS": 23,
      "HTML": 30,
      "Python": 20,
      "Shell": 2,
      "Procfile": 2,
      "Vim Script": 1,
      "Less": 1,
      "SCSS": 2,
      "PHP": 1,
      "Makefile": 6,
      "Hack": 1,
      "Ruby": 1
    },
    "excludeTopics": [
      "draft"
    ]
  },
  "repositories": [
    {
      "id": 1151734063,
      "name": "portfolio",
      "description": "A modern portfolio platform engineered with vanilla JavaScript and optimized CSS, featuring dynamic content integration via GitHub API, client-side caching for enhanced performance, and automated deployment through Netlify CI/CD - demonstrating expertise in front-end architecture and API integration.",
      "html_url": "https://github.com/omnisonic/portfolio",
      "homepage": null,
      "created_at": "2026-02-06T20:43:40Z",
      "updated_at": "2026-02-11T18:09:37Z",
      "pushed_at": "2026-02-11T18:08:58Z",
      "topics": [
        "feature"
      ],
      "languages": {
        "JavaScript": 99751,
        "CSS": 26639,
        "HTML": 3150
      },
      "hasReadme": true,
      "screenshotUrl": "/images/repos/portfolio.webp?v=1770835894427",
      "readmeContent": "# Portfolio Site with GitHub API\n\n![Photo](/images/repos/portfolio.webp)\n\n\nA modern portfolio website that dynamically displays GitHub repositories and projects using the GitHub API. This site showcases my development work and provides an interactive way to explore my projects.\n\n![Portfolio Screenshot](assets/screenshots/Screenshot%20Portfolio.JPG)\n\n\n## Table of Contents\n- [About the Project](#about-the-project)\n- [Getting Started](#getting-started)\n- [Prerequisites](#prerequisites)\n- [Installation](#installation)\n- [Configuration](#configuration)\n- [Project Structure](#project-structure)\n- [Technologies Used](#technologies-used)\n- [Features](#features)\n- [API Reference](#api-reference)\n- [Development](#development)\n- [Deployment](#deployment)\n- [License](#license)\n\n## About the Project\n\nThis portfolio website is designed to showcase my development projects and GitHub repositories in a clean, modern interface. The site dynamically fetches data from the GitHub API to display up-to-date information about my repositories, including names, descriptions, programming languages, and star counts.\n\n\nThe website is built with modern web technologies and follows responsive design principles to ensure optimal viewing experience across all devices, from desktop computers to mobile phones.\n\n## Getting Started\n\nTo run this project locally, follow these steps:\n\n1. Clone the repository\n2. Install dependencies\n3. Configure the GitHub API\n4. Start the development server\n\n## Prerequisites\n\nBefore you begin, ensure you have the following installed on your system:\n\n- **Node.js** (v14.0.0 or higher)\n- **npm** (v6.0.0 or higher)\n- **Git** (for cloning the repository)\n- **A GitHub account** (for API access)\n\n## Installation\n\n1. **Clone the repository:**\n   ```bash\n   git clone https://github.com/your-username/your-repository.git\n   cd your-repository\n   ```\n\n2. **Open the project:**\n   ```bash\n   open index.html\n   ```\n\n## Configuration\n\n### GitHub API Setup\n\n1. **Update GitHub username:**\n   Open `script.js` and replace `'username'` with your actual GitHub username:\n   ```javascript\n   const GITHUB_USERNAME = 'username'; // Replace with your GitHub username\n   const USE_PUBLIC_API = true; // Set to true to use public API (60 requests/hour)\n   ```\n\n2. **Netlify Functions:**\n   - For production deployment on Netlify, use serverless functions\n   - Create a Netlify function to handle GitHub API calls securely\n   - Add your GitHub token to Netlify environment variables\n   - No client-side token exposure\n\n3. **Local Development:**\n   - For local development, you can still use environment variables\n   - Add your GitHub token to your `.zshenv` file:\n     ```bash\n     export GITHUB_TOKEN=your_token_here\n     ```\n   - Reload your shell: `source ~/.zshenv`\n\n## Project Structure\n\n```\nportfolio-site/\n├── src/\n│   ├── components/     # React components\n│   ├── styles/        # CSS stylesheets\n│   ├── utils/         # Utility functions\n│   └── api/           # API integration code\n├── public/            # Static assets\n├── tests/             # Test files\n├── .env.example       # Environment variables template\n├── package.json       # Dependencies and scripts\n└── README.md          # This file\n```\n\n## Technologies Used\n\n- **HTML5**: Semantic markup for content structure\n- **CSS3**: Modern styling with Flexbox and Grid layouts\n- **JavaScript (ES6+)**: Modern JavaScript features for better code organization\n- **GitHub API**: RESTful API for fetching repository data\n- **Git**: Version control system\n\n## Features\n\n- **Dynamic Repository Display**: Automatically fetches and displays GitHub repositories\n- **Responsive Design**: Optimized for desktop, tablet, and mobile devices\n- **Modern UI**: Clean, minimalist design with smooth animations\n- **Search Functionality**: Filter repositories by name or description\n- **Language Detection**: Shows programming languages used in each repository\n- **Star Count Display**: Shows repository popularity with star counts\n- **Build-time Data with Runtime Updates**: Static data generated at build time, with runtime timestamp checking for efficient updates\n- **Repository Screenshots**: Automatic screenshot matching during runtime updates with flexible naming patterns\n- **SEO Optimized**: Semantic HTML and meta tags for better search engine visibility\n- **Fast Loading**: Optimized assets and lazy loading for better performance\n- **Build-time Processing**: Screenshot matching happens at deployment, not runtime\n\n## API Reference\n\n### GitHub API Endpoints Used\n\n- **GET** `/users/{username}/repos` - Fetch user repositories\n- **GET** `/repos/{owner}/{repo}` - Get repository details\n- **GET** `/repos/{owner}/{repo}/languages` - Get repository languages\n\n### Rate Limiting\n\n- **Unauthenticated requests**: 60 requests per hour\n- **Authenticated requests**: 5,000 requests per hour\n\n## Development\n\n- **Build-time Data Generation**: Static data is generated at build time using GitHub API\n- **Runtime Timestamp Checking**: On page reload, the application checks if any repositories have been updated by comparing timestamps\n- **Efficient Updates**: Only repositories that have changed since the last build are updated at runtime\n- **Repository Screenshots**: Screenshots are extracted from README content during runtime updates for optimal performance\n\n\n### Local Development\n\n1. **Open the project:**\n   ```bash\n   open index.html\n   ```\n\n2. **View your portfolio:**\n   The site will display your GitHub repositories using static data generated at build time. On page reload, the application checks for updates by comparing repository timestamps and updates only the repositories that have changed.\n\n\n### Netlify Development\n\n1. **Install Netlify CLI:**\n   ```bash\n   npm install -g netlify-cli\n   ```\n\n2. **Login to Netlify:**\n   ```bash\n   netlify login\n   ```\n\n3. **Link to Netlify site:**\n   ```bash\n   netlify link\n   ```\n\n4. **Start development server:**\n   ```bash\n   netlify dev\n   ```\n\n5. **View your portfolio:**\n   The site will automatically fetch and display your GitHub repositories using authenticated API (5,000 requests/hour)\n\n### Code Style\n\nThis project follows standard JavaScript conventions with ESLint and Prettier for code consistency.\n\n### Contributing\n\n1. Fork the repository\n2. Create a feature branch\n3. Make your changes\n4. Add tests if applicable\n5. Submit a pull request\n\n## Deployment\n\n### Netlify Deployment\n\n1. **Connect to Netlify:**\n   - Log in to Netlify\n   - Click \"New site from Git\"\n   - Select your repository\n\n2. **Configure Build Settings:**\n   - Build command: `npm run build`\n   - Publish directory: `build/`\n\n3. **Environment Variables:**\n   - Add GitHub token in Netlify UI\n   - Save and deploy\n\n4. **Custom Domain (Optional):**\n   - Add your custom domain\n   - Configure DNS settings\n\n## License\n\nThis project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.\n\n## Support\n\nFor support or questions about this project, please:\n\n- Open an issue in the repository\n- Contact me directly via email\n\n---\n\n**Last Updated:** February 2026",
      "homepageUrl": ""
    },
    {
      "id": 1128841765,
      "name": "portfolio-chatbot",
      "description": "A Python-powered chatbot framework demonstrating advanced natural language processing capabilities, featuring custom knowledge base integration, containerized development environment, and efficient data scraping functionality - showcasing expertise in AI development and scalable architecture design.",
      "html_url": "https://github.com/omnisonic/portfolio-chatbot",
      "homepage": "https://portfolio-rudy-chat.streamlit.app/",
      "created_at": "2026-01-06T08:22:47Z",
      "updated_at": "2026-02-08T19:02:37Z",
      "pushed_at": "2026-02-08T19:02:34Z",
      "topics": [],
      "languages": {
        "Python": 10807
      },
      "hasReadme": true,
      "screenshotUrl": "/images/repos/portfolio-chatbot.jpg?v=1770835894427",
      "readmeContent": "# Portfolio Chatbot - Standalone Streamlit App\n\n\nA standalone Streamlit chatbot that answers questions about a creative professional's portfolio using OpenAI API via OpenRouter.\n\n![Portfolio Screenshot](/images/repos/portfolio-chatbot.JPG)\n\n## Features\n\n- Chat interface with portfolio-specific Q&A\n- Custom assistant avatar display\n- Multiple LLM engine selection\n- Portfolio context integration\n- Image display support in responses\n\n## Setup\n\n### 1. Install Dependencies\n\n```bash\npip install -r requirements.txt\n```\n\n### 2. Configure Secrets\n\nCreate a `.streamlit/secrets.toml` file or configure these secrets in Streamlit Cloud:\n\n```toml\nOPENROUTER_API_KEY = \"your-openrouter-api-key-here\"\n# Optional:\nOPENROUTER_BASE_URL = \"https://openrouter.ai/api/v1\"\nMODEL_NAME = \"xiaomi/mimo-v2-flash:free\"\n```\n\n### 3. Run Locally\n\n```bash\nstreamlit run main.py\n```\n\n## Deployment to Streamlit Cloud\n\n1. **Push to GitHub**: Upload this entire folder to a GitHub repository\n2. **Connect to Streamlit Cloud**: \n   - Go to [share.streamlit.io](https://share.streamlit.io)\n   - Connect your GitHub account\n   - Select your repository and this folder\n3. **Configure Secrets**: Add the required secrets in the Streamlit Cloud dashboard\n4. **Deploy**: Click \"Deploy\" and wait for the app to build\n\n## File Structure\n\n```\nportfolio-chatbot/\n├── main.py                 # Main Streamlit application\n├── requirements.txt        # Python dependencies\n├── scraped_data.json       # Portfolio data\n├── images/\n│   └── rudy_avatar_sm.jpg  # Assistant avatar\n└── README.md              # This file\n```\n\n## Required Secrets\n\n- `OPENROUTER_API_KEY`: Your OpenRouter API key\n- `OPENROUTER_BASE_URL` (optional): API base URL (defaults to OpenRouter)\n- `MODEL_NAME` (optional): Model selection (defaults to xiaomi/mimo-v2-flash:free)\n\n## Usage\n\n1. Start a conversation by typing in the chat input\n2. Ask questions about the portfolio work\n3. The bot will respond using the portfolio context\n4. Images mentioned in responses will be displayed automatically\n\n## Notes\n\n- The app uses Streamlit's built-in chat interface for user messages\n- Assistant messages display with a custom avatar (300px width)\n- Portfolio data is loaded from `scraped_data.json`\n- The app supports multiple LLM engines via the sidebar selection\n",
      "homepageUrl": "https://portfolio-rudy-chat.streamlit.app/"
    },
    {
      "id": 1127546075,
      "name": "chords-and-scale-charts",
      "description": "An interactive web tool for visualizing guitar chords and scale patterns using JavaScript, featuring dynamic chord diagrams and scale charts to help musicians learn and reference musical patterns on the fretboard.",
      "html_url": "https://github.com/omnisonic/chords-and-scale-charts",
      "homepage": "https://omnisonic.github.io/chords-and-scale-charts/",
      "created_at": "2026-01-04T05:25:00Z",
      "updated_at": "2026-02-11T05:12:52Z",
      "pushed_at": "2026-02-11T05:12:49Z",
      "topics": [],
      "languages": {
        "JavaScript": 27110,
        "HTML": 10831,
        "CSS": 1112
      },
      "hasReadme": true,
      "screenshotUrl": "/images/repos/chords-and-scale-charts.webp?v=1770835894427",
      "readmeContent": "# Repository\n\n![Photo](/images/repos/chords-and-scale-charts.webp)\n\n\n![Photo](images/screenshot-2026-02-08-at-10.31.26am.jpg)\n\n\n",
      "homepageUrl": "https://omnisonic.github.io/chords-and-scale-charts/"
    },
    {
      "id": 1118485973,
      "name": "abcjs-key-signature-trainer",
      "description": "A sophisticated JavaScript-based music theory training application leveraging ABC.js, featuring modular architecture with state management patterns, custom music logic processing, and dynamic UI updates for interactive key signature practice, demonstrating expertise in front-end development and complex state handling.",
      "html_url": "https://github.com/omnisonic/abcjs-key-signature-trainer",
      "homepage": "https://solfege-trainer.johnclarkemusic.com/",
      "created_at": "2025-12-17T20:37:40Z",
      "updated_at": "2026-02-07T03:53:29Z",
      "pushed_at": "2026-02-05T07:16:21Z",
      "topics": [],
      "languages": {
        "JavaScript": 30362,
        "CSS": 12600,
        "HTML": 8060
      },
      "hasReadme": false,
      "screenshotUrl": null,
      "readmeContent": null,
      "homepageUrl": "https://solfege-trainer.johnclarkemusic.com/"
    },
    {
      "id": 1036998796,
      "name": "snake_game",
      "description": "A modern JavaScript implementation of the classic Snake game featuring responsive canvas-based rendering, collision detection algorithms, and dynamic scoring system - demonstrating DOM manipulation, event handling, and game loop architecture in vanilla JavaScript.",
      "html_url": "https://github.com/omnisonic/snake_game",
      "homepage": "https://omnisonic.github.io/snake_game/",
      "created_at": "2025-08-12T23:01:12Z",
      "updated_at": "2026-02-07T17:32:43Z",
      "pushed_at": "2025-08-12T23:08:06Z",
      "topics": [],
      "languages": {
        "JavaScript": 4217,
        "HTML": 401,
        "CSS": 199
      },
      "hasReadme": false,
      "screenshotUrl": null,
      "readmeContent": null,
      "homepageUrl": "https://omnisonic.github.io/snake_game/"
    },
    {
      "id": 1019030756,
      "name": "static-photomap",
      "description": "A full-stack JavaScript application that combines geolocation data extraction and interactive mapping to create a dynamic photo gallery, featuring automated image processing, AWS S3 integration, and Netlify deployment with custom authentication for secure photo viewing and location visualization.",
      "html_url": "https://github.com/omnisonic/static-photomap",
      "homepage": "https://photo-map.jctech.work/",
      "created_at": "2025-07-13T15:32:22Z",
      "updated_at": "2026-02-10T18:47:30Z",
      "pushed_at": "2026-02-10T18:47:26Z",
      "topics": [],
      "languages": {
        "JavaScript": 1026914,
        "Python": 8879,
        "CSS": 8808,
        "Shell": 7405,
        "HTML": 3184
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "# GPS Photo Map Viewer (Static Edition)\n\nCombining Leaflet.js mapping with your geo-tagged photos in a lightweight static web app. Deployable via Netlify or AWS S3.\n\n## Features\n\n- 🗺️ Interactive map with photo markers (Leaflet.js)\n- 📸 Photo gallery with EXIF GPS coordinate display\n- 📁 Album selection from dropdown\n- 📱 Responsive sidebar layout\n- 🔒 Optional password protection (Netlify only)\n- ⚡ Fast static deployment (no server required)\n- 🌐 Multiple deployment options (Netlify + AWS S3)\n## Albums Included\n\n- **test**: 1 photo with GPS data\n- **july_9_trail_run_unintas**: 33 photos with GPS data\n\n## How to Use\n\n1. Open `index.html` in a web browser\n2. Select an album from the dropdown menu\n3. View photos on the map by clicking the red camera markers\n4. Browse the photo gallery in the main area\n5. Click on any photo to view it in full size\n\n## Environment Variables Setup\n\nThis project uses different AWS credential variable names for local development versus Netlify deploys to work around Netlify's reserved variable limitations.\n\n### Local Development\n\nUse standard AWS variable names in your shell environment or project `.env` file:\n\n**Option 1: Using .zshenv (recommended for system-wide credentials)**\n```bash\n# Add to ~/.zshenv\nexport AWS_ACCESS_KEY_ID=your_aws_access_key_here\nexport AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here\nexport S3_REGION=your_aws_region\nexport S3_BUCKET=your_s3_bucket_name\n```\n\n**Option 2: Using project .env file**\n```bash\n# .env (at project root)\nAWS_ACCESS_KEY_ID=your_aws_access_key_here\nAWS_SECRET_ACCESS_KEY=your_aws_secret_key_here\nS3_REGION=your_aws_region\nS3_BUCKET=your_s3_bucket_name\n```\n\n### Netlify Deployment\n\nSince Netlify reserves standard AWS variable names, set custom variable names in the Netlify UI:\n\n1. Go to your Netlify site dashboard\n2. Navigate to Site settings > Environment variables\n3. Add these variables:\n   - `MY_AWS_ACCESS_KEY_ID` = your AWS access key\n   - `MY_AWS_SECRET_ACCESS_KEY` = your AWS secret key\n   - `MY_S3_REGION` = your_aws_region\n   - `MY_S3_BUCKET` = your_s3_bucket_name\n\nThe application code automatically detects the environment and uses the appropriate variable names:\n- Local: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`\n- Netlify: `MY_AWS_ACCESS_KEY_ID`, `MY_AWS_SECRET_ACCESS_KEY`\n\n### Alternative: Using Netlify CLI\n\nYou can also set environment variables using the Netlify CLI:\n\n```bash\n# Set variables for production\nnetlify env:set MY_AWS_ACCESS_KEY_ID your_access_key_here\nnetlify env:set MY_AWS_SECRET_ACCESS_KEY your_secret_key_here\n\n# Set variables for specific deploy contexts\nnetlify env:set MY_AWS_ACCESS_KEY_ID your_access_key_here --context production\nnetlify env:set MY_AWS_ACCESS_KEY_ID your_preview_key_here --context deploy-preview\n```\n\n## File Structure\n",
      "homepageUrl": "https://photo-map.jctech.work/"
    },
    {
      "id": 1009710140,
      "name": "flask_ai_cheatsheet",
      "description": null,
      "html_url": "https://github.com/omnisonic/flask_ai_cheatsheet",
      "homepage": "https://ai-cheatsheet.jctech.work/",
      "created_at": "2025-06-27T15:22:38Z",
      "updated_at": "2026-02-10T22:39:28Z",
      "pushed_at": "2025-06-28T02:02:22Z",
      "topics": [],
      "languages": {
        "CSS": 3474,
        "JavaScript": 2736,
        "Python": 2520,
        "HTML": 1273
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "# Flask AI Cheatsheet\n\nThis project is a Flask-based web application that replicates the core functionality of the original Django ai-cheatsheet project. It allows users to generate cheat sheets for various subjects using the OpenAI API via OpenRouter.\n\n## Requirements\n\n### Python Packages\n- flask\n- openai\n- python-dotenv\n\n### Environment Variables\n- `OPENROUTER_API_KEY`: Your OpenRouter API key for OpenAI access.\n\n### Project Structure\n- `app.py`: Main Flask application.\n- `templates/cheatsheet.html`: HTML template for the UI.\n- `static/cheatsheet_generator/js/script.js`: JavaScript for frontend interactivity.\n- `.env`: Environment variables (not committed to version control).\n- `requirements.txt`: Python dependencies.\n\n### Features\n- Web form to submit a subject for cheat sheet generation.\n- Calls OpenAI API via OpenRouter to generate cheat sheet content.\n- Returns results as JSON and displays them dynamically on the page.\n- Error handling for API and user input issues.\n\n### Deployment\n- Can be run locally with Flask's development server.\n- Ready for deployment with Gunicorn, Zappa, or any WSGI-compatible server.\n\n---\n\n**Next Steps:**\n1. Implement `app.py` with Flask routes and logic.\n2. Add template and static files.\n3. Set up `.env` and `requirements.txt`.\n",
      "homepageUrl": "https://ai-cheatsheet.jctech.work/"
    },
    {
      "id": 999969849,
      "name": "code-a-cake",
      "description": "An interactive JavaScript-based educational platform that teaches coding concepts through cake-building metaphors, featuring modular front-end architecture, responsive CSS design, and intuitive HTML templates to create an engaging learning experience for young coders and programming students.",
      "html_url": "https://github.com/omnisonic/code-a-cake",
      "homepage": "https://omnisonic.github.io/code-a-cake/",
      "created_at": "2025-06-11T04:34:32Z",
      "updated_at": "2026-02-07T03:54:06Z",
      "pushed_at": "2025-06-24T22:20:36Z",
      "topics": [],
      "languages": {
        "JavaScript": 16394,
        "CSS": 9183,
        "HTML": 4084
      },
      "hasReadme": false,
      "screenshotUrl": null,
      "readmeContent": null,
      "homepageUrl": "https://omnisonic.github.io/code-a-cake/"
    },
    {
      "id": 979588312,
      "name": "background-blur-maker",
      "description": "A dynamic image processing application built with vanilla JavaScript that implements real-time background blur effects, demonstrating expertise in DOM manipulation, CSS transformations, and advanced image processing techniques through custom blur algorithms and performance optimization.",
      "html_url": "https://github.com/omnisonic/background-blur-maker",
      "homepage": "https://omnisonic.github.io/background-blur-maker/",
      "created_at": "2025-05-07T18:44:41Z",
      "updated_at": "2026-02-07T16:52:12Z",
      "pushed_at": "2026-02-07T16:52:09Z",
      "topics": [],
      "languages": {
        "JavaScript": 7321,
        "CSS": 4256,
        "HTML": 2707
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "# Create great looking thumnail and production images with blur background almost instantly in the browser.\nInstructions:\n\nPress SPACE to toggle the menu\n\nTo load images:\n\nClick \"Choose Background Image\" to set the blurred background\n- Drag and drop your foreground image(s) onto the page\n- Use the sliders to adjust blur, opacity, and size to your desired effect\n\n- Use LEFT and RIGHT arrow keys to cycle through dropped images\n\n\nTake a screenshot:\n- Firefox: Right-click and select \"Take Screenshots\"\n- Mac: Press Command (⌘) + Shift + 4\n- Windows: Press Windows + Shift + S\n- Linux: Press PrtScn or use Screenshot tool\n\n",
      "homepageUrl": "https://omnisonic.github.io/background-blur-maker/"
    },
    {
      "id": 927887386,
      "name": "lyriset_static",
      "description": "A progressive web app built with vanilla JavaScript that enables musicians to manage and display lyrics and setlists, featuring offline capabilities, dynamic theme support, and a responsive UI optimized for real-time performance use, with seamless import/export functionality for songbook management.",
      "html_url": "https://github.com/omnisonic/lyriset_static",
      "homepage": "https://lyriset.com",
      "created_at": "2025-02-05T17:52:56Z",
      "updated_at": "2026-02-07T19:08:12Z",
      "pushed_at": "2026-01-10T19:41:40Z",
      "topics": [],
      "languages": {
        "JavaScript": 165192,
        "HTML": 41816,
        "CSS": 35986
      },
      "hasReadme": false,
      "screenshotUrl": null,
      "readmeContent": null,
      "homepageUrl": "https://lyriset.com"
    },
    {
      "id": 851341250,
      "name": "streamlit_remove_background",
      "description": "A user-friendly web application built with Streamlit that automatically removes backgrounds from images, demonstrating practical Python development skills and integration of modern image processing techniques to create an accessible tool for digital content creators.",
      "html_url": "https://github.com/omnisonic/streamlit_remove_background",
      "homepage": "https://remove-background-jctech.streamlit.app/",
      "created_at": "2024-09-02T23:12:52Z",
      "updated_at": "2026-02-07T19:10:14Z",
      "pushed_at": "2024-09-02T23:23:41Z",
      "topics": [],
      "languages": {
        "Python": 1653
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "# This is a simple back ground remover for my students.  This is useful for makeing sprites you might need when making computer games.\n1 - upload a n image perferaly with white background.\n2 - This app will remove the backgound and return an the image as a png file.\n",
      "homepageUrl": "https://remove-background-jctech.streamlit.app/"
    },
    {
      "id": 842203279,
      "name": "ram-shi",
      "description": "A responsive personal blog platform built with Python and modern CSS/HTML, featuring automated content migration through the Blogger API, static site generation with Pelican, and custom theme development demonstrating front-end expertise and API integration skills.",
      "html_url": "https://github.com/omnisonic/ram-shi",
      "homepage": "https://omnisonic.github.io/ram-shi/",
      "created_at": "2024-08-13T22:11:51Z",
      "updated_at": "2026-02-10T22:53:21Z",
      "pushed_at": "2024-08-16T18:54:33Z",
      "topics": [],
      "languages": {
        "CSS": 15887,
        "HTML": 14563,
        "Python": 2789
      },
      "hasReadme": false,
      "screenshotUrl": null,
      "readmeContent": null,
      "homepageUrl": "https://omnisonic.github.io/ram-shi/"
    },
    {
      "id": 800718612,
      "name": "rudy",
      "description": "Custom static portfolio website conversion project demonstrating expertise in HTML5/CSS3 optimization, responsive design implementation, and performance-focused architecture, transforming a WordPress site into a lightweight, fast-loading static website for improved hosting efficiency and security.",
      "html_url": "https://github.com/omnisonic/rudy",
      "homepage": "https://main.d2ii0lci9gh71j.amplifyapp.com/",
      "created_at": "2024-05-14T21:35:32Z",
      "updated_at": "2026-02-11T05:22:57Z",
      "pushed_at": "2026-02-11T05:22:54Z",
      "topics": [],
      "languages": {
        "HTML": 537260,
        "CSS": 103036
      },
      "hasReadme": true,
      "screenshotUrl": "/images/repos/rudy.webp?v=1770835894427",
      "readmeContent": "# Repository\n\n![Photo](/images/repos/rudy.webp)\n\n\n",
      "homepageUrl": "https://main.d2ii0lci9gh71j.amplifyapp.com/"
    },
    {
      "id": 799031955,
      "name": "free-llms-chat",
      "description": "A Python-based CLI application that orchestrates interactions with multiple Large Language Models (LLMs), providing a unified interface for seamless model switching and chat interactions while demonstrating API integration, async processing, and clean architecture design patterns.",
      "html_url": "https://github.com/omnisonic/free-llms-chat",
      "homepage": null,
      "created_at": "2024-05-11T02:15:31Z",
      "updated_at": "2026-02-07T03:31:32Z",
      "pushed_at": "2024-05-11T02:56:42Z",
      "topics": [],
      "languages": {
        "Python": 2441
      },
      "hasReadme": false,
      "screenshotUrl": null,
      "readmeContent": null,
      "homepageUrl": ""
    },
    {
      "id": 792939696,
      "name": "Feel-Cosmic",
      "description": "A full-stack emotion-driven image generation platform that leverages Python, JavaScript, and CSS to create AI-powered cosmic visualizations based on user emotions, featuring a responsive Flask backend, dynamic frontend interactions, and integration with advanced image generation APIs.",
      "html_url": "https://github.com/omnisonic/Feel-Cosmic",
      "homepage": null,
      "created_at": "2024-04-28T01:25:58Z",
      "updated_at": "2026-02-07T03:32:26Z",
      "pushed_at": "2024-04-29T00:20:08Z",
      "topics": [],
      "languages": {
        "CSS": 5219,
        "JavaScript": 4735,
        "Python": 3144,
        "HTML": 2178,
        "Procfile": 43
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "\n**Image Generation App**\n\n**Overview**\n\nThis repository contains a Flask-based web application that generates images based on user input and allows users to download the generated images. The app uses HTMX for client-side rendering and implements rate limiting to prevent excessive requests.\n\n**Files**\n\n* **app.py**: The Flask app file that handles image generation, rate limiting, and API routes.\n* **templates/index.html**: The HTML template for the app's user interface.\n* **static/script.js**: The JavaScript file that handles client-side logic, including image generation, download, and rate limiting.\n\n**Features**\n\n* **Image Generation**: Generates an image based on user input and displays it on the page.\n* **Image Download**: Allows users to download the generated image.\n* **Rate Limiting**: Implements a cooldown period to prevent excessive requests to the image generation API.\n* **Error Handling**: Displays error messages to the user when an error occurs, including rate limiting errors (429).\n\n**Technical Details**\n\n* **Flask**: The web framework used to build the app.\n* **HTMX**: Used for client-side rendering and event handling.\n* **JavaScript**: Used for client-side logic and event handling.\n\n**Getting Started**\n\n1. Clone the repository: `git clone https://github.com/[your-username]/image-generation-app.git`\n2. Install the dependencies: `pip install -r requirements.txt`\n3. Run the app: `python app.py`\n4. Open the app in your web browser: `http://localhost:5000`\n\n**License**\n\nThis project is licensed under the [insert license name].\nThis project is open source and licensed under the MIT License, which allows for free use, modification, and distribution. You can use, modify, and distribute this project without any restrictions.\n\n",
      "homepageUrl": ""
    },
    {
      "id": 754364728,
      "name": "dice_simulator",
      "description": "An interactive educational dice simulator built with HTML and CSS, featuring dynamic animations and sound effects - designed as a practical learning tool for web development students to understand event handling, DOM manipulation, and multimedia integration in frontend development.",
      "html_url": "https://github.com/omnisonic/dice_simulator",
      "homepage": "https://omnisonic.github.io/dice_simulator/",
      "created_at": "2024-02-07T22:37:50Z",
      "updated_at": "2026-02-07T03:39:18Z",
      "pushed_at": "2024-02-13T22:48:55Z",
      "topics": [],
      "languages": {
        "HTML": 4038
      },
      "hasReadme": false,
      "screenshotUrl": null,
      "readmeContent": null,
      "homepageUrl": "https://omnisonic.github.io/dice_simulator/"
    },
    {
      "id": 731785434,
      "name": "note_read_trainer",
      "description": "Interactive web-based music education tool developed using vanilla JavaScript and HTML5, featuring dynamic note recognition training for musicians. Implements custom music notation rendering and real-time user feedback to enhance sight-reading skills through gamified practice exercises.",
      "html_url": "https://github.com/omnisonic/note_read_trainer",
      "homepage": "https://omnisonic.github.io/note_read_trainer/",
      "created_at": "2023-12-14T21:54:12Z",
      "updated_at": "2026-02-07T03:40:04Z",
      "pushed_at": "2024-02-06T20:06:27Z",
      "topics": [],
      "languages": {
        "HTML": 17214
      },
      "hasReadme": false,
      "screenshotUrl": null,
      "readmeContent": null,
      "homepageUrl": "https://omnisonic.github.io/note_read_trainer/"
    },
    {
      "id": 730859248,
      "name": "dnd_webspeech",
      "description": "A collaborative student-teacher pair programming project that integrates the D&D 5e API with Web Speech API, demonstrating practical application of HTML, API integration, and voice recognition technology while showcasing effective mentorship and real-time development practices.",
      "html_url": "https://github.com/omnisonic/dnd_webspeech",
      "homepage": "https://omnisonic.github.io/dnd_webspeech/",
      "created_at": "2023-12-12T20:40:04Z",
      "updated_at": "2026-02-07T03:37:40Z",
      "pushed_at": "2024-04-03T01:21:22Z",
      "topics": [],
      "languages": {
        "HTML": 6829
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "# dnd_webspeech\nUse the open sourse Dungeons and Dragons  5e api with web speech api\nA fun project for coding students with interest in Dungeons and Dragons \n",
      "homepageUrl": "https://omnisonic.github.io/dnd_webspeech/"
    },
    {
      "id": 711672929,
      "name": "phaser_typer",
      "description": "A browser-based typing practice application built with JavaScript and HTML5, featuring dynamic exercise file loading capabilities and real-time performance tracking. Demonstrates expertise in front-end development, event handling, and file system integration for customizable learning experiences.",
      "html_url": "https://github.com/omnisonic/phaser_typer",
      "homepage": null,
      "created_at": "2023-10-30T00:30:02Z",
      "updated_at": "2026-02-07T03:41:37Z",
      "pushed_at": "2023-10-30T00:30:17Z",
      "topics": [],
      "languages": {
        "JavaScript": 4829,
        "HTML": 383
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "#Phaser Typer\n\nis a Javacript touch typing game / touch typing trainer\n\nlightwight runs in the browser.\n\nLoads itself (game.js) as the typing exersize.\n\nCursor progress only if you get the letter correct.\n",
      "homepageUrl": ""
    },
    {
      "id": 675112898,
      "name": "chat_photo_history",
      "description": "A full-stack Python application leveraging computer vision and metadata processing to create an intelligent photo management system, featuring IPTC metadata extraction, image analysis integration, and a responsive web interface built with Streamlit and Flask.",
      "html_url": "https://github.com/omnisonic/chat_photo_history",
      "homepage": "https://chat-photo-history.streamlit.app/",
      "created_at": "2023-08-05T20:27:06Z",
      "updated_at": "2026-02-07T03:56:47Z",
      "pushed_at": "2025-07-19T16:39:29Z",
      "topics": [],
      "languages": {
        "Python": 35952,
        "HTML": 4192,
        "CSS": 467
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "# 🎉 Open Files: A Streamlit Chatbot for Image Metadata Analysis 📸\n\n## 📝 Overview\n🌟 This project analyzes image metadata and provides a comprehensive description of the image content. The chatbot uses the Gemini Pro AI vision API to extract metadata from images and generate a detailed response. Two modes are available: image analysis and image metadata extraction. 🤖\n\n## 🎯 Features\n🔹 **Image Analysis**: Upload an image or provide a URL to analyze image metadata\n💡 **Comprehensive Description**: Get a detailed description of the image content, including scene understanding, object detection, image classification, image analysis, entity recognition, and contextual information\n💬 **Chatbot Interface**: Interact with the chatbot using natural language input\n📝 **Chat History**: View the chat history and previous responses\n- **Scene Understanding**: Identifying the context and setting of the image, such as indoor, outdoor, or specific locations.\n\n- **Image Classification**: Categorizing the image into predefined categories, such as landscape, portrait, or abstract.\n- **Image Analysis**: Analyzing the image's visual features, such as colors, textures, and shapes.\n- **Entity Recognition**: Identifying and extracting specific information from the image, such as names, dates, or locations.\n- **Contextual Information**: Providing additional information about the image, such as the photographer's intent or the image's historical significance.\n\nBy combining these features, our AI powered app aims provides a comprehensive and accurate description of the image content, making it easier to understand and analyze the image metadata.\n\n\n## 🔑 Requirements\n🔑 **OpenRouter API Key**: Set environment variable `OPENROUTER_API_KEY`\n💻 **Streamlit**: Install using `pip install streamlit`\n📈 **Exiftool**: Install using `sudo apt install libimage-exiftool-perl`\n\n## 💻 Usage\n1️⃣ Run the chatbot by executing `streamlit run streamlit.py`\n2️⃣ Upload an image or provide a URL to analyze image metadata\n3️⃣ Interact with the chatbot using natural language input\n4️⃣ View the chat history and previous responses\n\n## 🗃️ Components\n📂 **streamlit.py**: The main Streamlit app that handles user input and displays chat responses\n🔍 **vision_func.py**: A Python module that provides the AI vision functionality using OpenRouter's API\n\n## 📝 License\n🔓 This project is licensed under the MIT License. See `LICENSE` for details.\n\n## 🤝 Contributing\n🎉 Contributions are welcome! If you'd like to help improve the chatbot or add new features, please submit a pull request.\n\n## 👏 Acknowledgments\n🙏 **Google Gemini Pro API**: Special thanks to the Google Gemini Pro API for providing the image analysis functionality\n🙏 **OpenRouter**: [OpenRouter](https://www.openrouter.com/) for routing the API\n🙏 **Streamlit**: [Streamlit](https://streamlit.io/) for providing the chatbot framework\n🙏 **PyExifTool**: [PyExifTool](https://pypi.org/project/PyExifTool/) for providing a Python interface to Exiftool\n🙏 **Exiftool**: [Exiftool](https://exiftool.org/) for providing a comprehensive metadata extraction tool\n\n## Additional\nThe chatbot also extracts metadata from images using the [IPTC](https://iptc.org/standards/photo-metadata/) standards for image metadata. Examples of the metadata that can be extracted or written:\n\n*   **IPTC.Caption**: Extracting the image caption or description\n*   **IPTC.Keywords**: Extracting keywords or tags associated with the image\n*   **IPTC.Credit**: Extracting the credit or attribution information for the image creator\n*   **IPTC.Contact**: Extracting the contact information for the image creator or owner\n\nBy incorporating IPTC metadata, the chatbot provides a more comprehensive understanding of the image content, including its context, meaning, and usage.\n\n",
      "homepageUrl": "https://chat-photo-history.streamlit.app/"
    },
    {
      "id": 635895235,
      "name": "clock",
      "description": "A responsive digital clock implementation showcasing front-end development skills through pure HTML/CSS, demonstrating DOM manipulation and real-time updates while adhering to modern web development practices and clean code principles.",
      "html_url": "https://github.com/omnisonic/clock",
      "homepage": "https://omnisonic.github.io/clock/",
      "created_at": "2023-05-03T17:27:21Z",
      "updated_at": "2026-02-08T06:00:43Z",
      "pushed_at": "2023-05-03T17:27:38Z",
      "topics": [],
      "languages": {
        "HTML": 3005
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "# HTML Clock with CSS and JavaScript\n\n🕰️ This is a simple and responsive analog clock that you can easily add to your website. The clock was built with HTML, CSS, and JavaScript, and is perfect for adding a touch of class to your website.\n\n## Features\n\n- Responsive design: The clock adjusts to the size of the screen it is displayed on.\n- Smooth ticking: The second hand moves smoothly, just like a real clock.\n- Hour, minute, and second hands: All three hands move independently and accurately display the time.\n- Center circle: A small circle in the center of the clock adds a touch of elegance to the design.\n- Positioned numbers: The clock features numbers that are properly positioned around the edge of the clock.\n\n## How it Works\n\nThe clock uses JavaScript to retrieve the current time and then calculates the degree of rotation for each of the hands. The hands are positioned using CSS, with the seconds hand moving smoothly thanks to CSS transitions.\n\n## How ChatGPT Helped\n\nThis clock was created with the help of ChatGPT, a large language model trained by OpenAI. ChatGPT was used to answer questions and provide guidance throughout the development process.\n\n## How to Use\n\nTo use this clock, simply copy the code and paste it into your website's HTML file. Customize the clock's appearance by modifying the CSS as needed. The clock will automatically display the current time and will update every second.\n\n## Conclusion\n\n👍🏼 This HTML clock is a great way to add a touch of elegance to your website. It's easy to use, customizable, and accurate. So why not give it a try and see how it looks on your website?\n",
      "homepageUrl": "https://omnisonic.github.io/clock/"
    },
    {
      "id": 630138839,
      "name": "chatgpt-to-file",
      "description": "A Python-based automation tool that seamlessly integrates with OpenAI's ChatGPT API to capture and persist AI responses into structured files, demonstrating expertise in API integration, file I/O operations, and automated content management using modern Python programming practices.",
      "html_url": "https://github.com/omnisonic/chatgpt-to-file",
      "homepage": null,
      "created_at": "2023-04-19T18:46:14Z",
      "updated_at": "2026-02-07T03:44:06Z",
      "pushed_at": "2023-04-19T19:05:48Z",
      "topics": [],
      "languages": {
        "Python": 2058
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "# chatgpt-to-file\nPython Script to Save a ChatGPT respone to a file.\n",
      "homepageUrl": ""
    },
    {
      "id": 590651621,
      "name": "lonesoundranger",
      "description": "A custom-designed, responsive music artist website showcasing advanced CSS and HTML architecture, featuring dynamic content management with structured page hierarchies, integrated booking system, and optimized user engagement through mailing list integration and show date management.",
      "html_url": "https://github.com/omnisonic/lonesoundranger",
      "homepage": "https://main.dzphqj22r74e6.amplifyapp.com/",
      "created_at": "2023-01-18T22:17:47Z",
      "updated_at": "2026-02-10T23:02:19Z",
      "pushed_at": "2023-03-30T01:19:35Z",
      "topics": [],
      "languages": {
        "CSS": 596871,
        "HTML": 277022
      },
      "hasReadme": false,
      "screenshotUrl": null,
      "readmeContent": null,
      "homepageUrl": "https://main.dzphqj22r74e6.amplifyapp.com/"
    },
    {
      "id": 556504901,
      "name": "video_slideshow_maker",
      "description": "Automate creation of short slideshow videos with music",
      "html_url": "https://github.com/omnisonic/video_slideshow_maker",
      "homepage": null,
      "created_at": "2022-10-24T01:24:39Z",
      "updated_at": "2022-10-24T01:24:39Z",
      "pushed_at": "2022-10-24T01:25:22Z",
      "topics": [],
      "languages": {},
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "# Create a short video formatted for instagram and tik tok\n\n## ToDo\n\n\n### video content from archive of photos as one input\n\n- ken burns effect?\n- each video needs specified duration\n- crossfade or some other transition\n- photo chosen by some criteara like date taken\n- the number of photos proportional to the duration of video and slide show photo duration\n\n### audio content from archive of audios\n\n- audio track chosen at random then trimed to 30 seconds from a random startpoint\n\n-- startpoint randomly chosen but not to start after 30 seconds from the end of the track\n\n\n### Process the audio\n\n- fade and frade out each clip\n\n### process the photos\n\n- trim them to proper dimensions\n",
      "homepageUrl": ""
    },
    {
      "id": 548705243,
      "name": "vimrcgit",
      "description": "Vim notes and config",
      "html_url": "https://github.com/omnisonic/vimrcgit",
      "homepage": null,
      "created_at": "2022-10-10T03:49:39Z",
      "updated_at": "2022-10-13T04:44:36Z",
      "pushed_at": "2022-10-13T05:07:52Z",
      "topics": [],
      "languages": {
        "Vim Script": 2992
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "\n## This repo contains Notes and Settings for my VIM set up.\n\n> Vim is a powerful command line based code editor.\n\n> I use vim for coding and development.\n\n> The .vimrc configuration file has settings and plugins for customizing vim with the following features:\n\n1. Line numbering\n\n2. autocompletsion\n\n3. code folding\n\n4. file navigation in a sidebar\n\n5. syntax highlighting\n\n6. linting and formatting\n\n7. github copilot ai code completion\n",
      "homepageUrl": ""
    },
    {
      "id": 492679845,
      "name": "album_landing_page",
      "description": "A full-stack music album landing page generator utilizing Python automation scripts for AWS S3 integration, dynamic template rendering, and audio processing, featuring responsive HTML/CSS design and JavaScript interactivity for seamless music platform integration and content delivery.",
      "html_url": "https://github.com/omnisonic/album_landing_page",
      "homepage": "https://omnisonic.github.io/album_landing_page/",
      "created_at": "2022-05-16T04:13:18Z",
      "updated_at": "2026-02-10T23:04:48Z",
      "pushed_at": "2026-02-10T23:04:19Z",
      "topics": [],
      "languages": {
        "HTML": 107978,
        "JavaScript": 55512,
        "Python": 32756,
        "CSS": 19692
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "#Work in progress. Copy code at your own risk.  \n\nThis Project makes a one page website for promoting recorded album.  It includes a music player , and links to the major music outlets such as apple music and Spotify.\n\nThis project seeks to automate the process of adding track name , artwork and music , to the webpage.\n\nThis project uses webscraping tools to get the information such as track name, artist name, album artwork from the internet and then inject them in to a web page with minimal input from the developer.\n\nThis program only scrapes data from bandcamp.  The album must be on bancamp for this program to work.\n\nThe input is the url to the bandcamp album.\n\nThe webpage will also has links to the various major music sources.  Those links will have to be set manually in a configuration file.",
      "homepageUrl": "https://omnisonic.github.io/album_landing_page/"
    },
    {
      "id": 492014154,
      "name": "Python_Study",
      "description": "Notes on my python programing language study",
      "html_url": "https://github.com/omnisonic/Python_Study",
      "homepage": null,
      "created_at": "2022-05-13T19:14:18Z",
      "updated_at": "2022-05-13T19:16:21Z",
      "pushed_at": "2022-05-13T19:16:18Z",
      "topics": [],
      "languages": {
        "Python": 348
      },
      "hasReadme": false,
      "screenshotUrl": null,
      "readmeContent": null,
      "homepageUrl": ""
    },
    {
      "id": 490963221,
      "name": "website-templates-jcteched",
      "description": "These website templates have been jctech enhanced",
      "html_url": "https://github.com/omnisonic/website-templates-jcteched",
      "homepage": null,
      "created_at": "2022-05-11T05:01:39Z",
      "updated_at": "2022-05-11T06:09:42Z",
      "pushed_at": "2022-05-12T00:51:40Z",
      "topics": [],
      "languages": {
        "JavaScript": 12673594,
        "HTML": 6777352,
        "CSS": 4429145,
        "Less": 1389828,
        "SCSS": 1351341,
        "PHP": 84066,
        "Python": 6124,
        "Makefile": 2472,
        "Hack": 552
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "- This Repo is to aid in the rapid theme conversion and website building by jctech.\n\n- Pelican is installed in the rood directory.\n\n- the themes folder contain themes for conversion.\n\n- when you convert one please do a pull request to merge it to this repo.\n\n- specify your theme folder in the pelicanconf.py\n\n- use only one instance of pelican .\n\n- use pipenv install so that the dependencies and pelican 4.7.1 is installed as well as invoke markdown and livereload\n\n- I plan to do some python scripting to populate each fo the folders with the pelcan simple theme template files.\n\n\n\n-  please log here which theme you have started and finished converting\n\n- please also move the theme to the jcteched folder when converted\n\n- OUTPUT_PATH = '<the_theme_name_here>' in pelicanconf to match the theme name.  pelican will create a new folder for the output by that name.  I might want to put this output into the theme folder as well but I am not sure depend on if we can publish to amplify that way or not.\n\n\n\n",
      "homepageUrl": ""
    },
    {
      "id": 487429573,
      "name": "pelican-simple-theme",
      "description": "A starting point for Pelican theme development",
      "html_url": "https://github.com/omnisonic/pelican-simple-theme",
      "homepage": "",
      "created_at": "2022-05-01T02:46:05Z",
      "updated_at": "2022-05-01T03:01:18Z",
      "pushed_at": "2022-05-12T21:27:21Z",
      "topics": [],
      "languages": {
        "HTML": 19241
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "This is a starting point for creating custom themes for Pelican Static Webssite Generator.  This theme is based on the simple theme built into pelican.  To install this theme add this to you pelicanconf.py:\n\n```\nTHEME = \"<your_path_to_this_theme_on_your_machine>\"\n\n```\n\n- 2022-11-05  Edit: Removed all id and class attributes , changed footer tag to div.  This is to make it easier to convert web designs into custom themes.  I also moved the feeds section from base.html head into its own template called feeds.html.  if you want it include it in the base.html just use {% include feeds.html %}\n",
      "homepageUrl": ""
    },
    {
      "id": 487338986,
      "name": "jctech_cheatsheets",
      "description": "Cheetsheets Collection of Tech used by JCTECH",
      "html_url": "https://github.com/omnisonic/jctech_cheatsheets",
      "homepage": null,
      "created_at": "2022-04-30T17:24:42Z",
      "updated_at": "2022-04-30T17:24:42Z",
      "pushed_at": "2022-04-30T22:31:26Z",
      "topics": [],
      "languages": {},
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "This repo is a collection of cheatsheets created or extended by JCTECH.  \nInspired by https://github.com/rstacruz/cheatsheets/\n\n",
      "homepageUrl": ""
    },
    {
      "id": 487138440,
      "name": "massively_theme",
      "description": "premade theme adapted to pelican",
      "html_url": "https://github.com/omnisonic/massively_theme",
      "homepage": null,
      "created_at": "2022-04-29T23:46:10Z",
      "updated_at": "2022-05-06T22:08:54Z",
      "pushed_at": "2022-05-07T02:25:04Z",
      "topics": [],
      "languages": {
        "HTML": 273108,
        "CSS": 255220,
        "SCSS": 233971,
        "JavaScript": 53337,
        "Python": 5674,
        "Makefile": 2465
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "This project adapts a premade website template to a pelican theme.\n\n",
      "homepageUrl": ""
    },
    {
      "id": 472501659,
      "name": "work_log",
      "description": "Django application with user login, email notification, crud",
      "html_url": "https://github.com/omnisonic/work_log",
      "homepage": null,
      "created_at": "2022-03-21T20:29:06Z",
      "updated_at": "2022-03-21T20:29:40Z",
      "pushed_at": "2022-08-13T01:39:16Z",
      "topics": [],
      "languages": {
        "Python": 22337,
        "HTML": 17102,
        "CSS": 1407,
        "Procfile": 62
      },
      "hasReadme": false,
      "screenshotUrl": null,
      "readmeContent": null,
      "homepageUrl": ""
    },
    {
      "id": 463228191,
      "name": "youtube-api-to-blog-post",
      "description": "Python Script using youtube api data to create blog posts",
      "html_url": "https://github.com/omnisonic/youtube-api-to-blog-post",
      "homepage": null,
      "created_at": "2022-02-24T16:54:06Z",
      "updated_at": "2022-02-24T16:57:20Z",
      "pushed_at": "2022-02-24T16:57:17Z",
      "topics": [],
      "languages": {
        "Python": 3096
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "This is  Python script that access youtube api and creates a blog page for each video in the playlist.\nThe blog page is set up to be processed by the python static site generator called Pelican.",
      "homepageUrl": ""
    },
    {
      "id": 461612493,
      "name": "socratica-python",
      "description": "Fansite Built with Python Pelican and youtube API",
      "html_url": "https://github.com/omnisonic/socratica-python",
      "homepage": null,
      "created_at": "2022-02-20T20:47:51Z",
      "updated_at": "2022-02-20T20:50:04Z",
      "pushed_at": "2022-02-21T04:49:38Z",
      "topics": [],
      "languages": {
        "HTML": 349819,
        "Python": 5334,
        "Makefile": 2465
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "This is a fansite generated with the python static site generater called pelican.  The posts for this site were auto generated with python and the youtube api.\n",
      "homepageUrl": ""
    },
    {
      "id": 442907271,
      "name": "jctech-pelican",
      "description": "A professionally engineered static company portfolio website built using Python's Pelican framework, featuring custom HTML/CSS templates, automated build processes via Makefile, and content management through markdown files - demonstrating expertise in static site generation and web development optimization.",
      "html_url": "https://github.com/omnisonic/jctech-pelican",
      "homepage": null,
      "created_at": "2021-12-29T22:40:51Z",
      "updated_at": "2026-02-07T03:46:44Z",
      "pushed_at": "2023-01-24T05:10:44Z",
      "topics": [],
      "languages": {
        "HTML": 180514,
        "CSS": 11012,
        "Python": 5977,
        "JavaScript": 4056,
        "Makefile": 2729
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "# README\n## What the project does?\nA website to showcase JCTECH\n## Why the project is useful?\nIt is a portfolio website for JCTECH\n## How users can get started with the project?\nPlease send direct message on Github\n## Where users can get help with your project?\nPlease send direct message on Github\n## Who maintains and contributes to the project?\nJCTECH, Thomascytosis, and other interns.",
      "homepageUrl": ""
    },
    {
      "id": 425342024,
      "name": "sonic-pi",
      "description": "my Sonic Pi scripts and some instruments samples",
      "html_url": "https://github.com/omnisonic/sonic-pi",
      "homepage": "",
      "created_at": "2021-11-06T20:29:49Z",
      "updated_at": "2021-11-06T21:09:26Z",
      "pushed_at": "2021-11-06T20:48:28Z",
      "topics": [],
      "languages": {
        "HTML": 935699,
        "CSS": 36554,
        "Ruby": 14458,
        "JavaScript": 1154
      },
      "hasReadme": false,
      "screenshotUrl": null,
      "readmeContent": null,
      "homepageUrl": ""
    },
    {
      "id": 381811417,
      "name": "jcm_pelican",
      "description": "A custom-built static website generator implementing Pelican and Python, featuring responsive HTML/CSS architecture, automated build processes via Makefile integration, and SEO optimization strategies - showcasing expertise in static site generation, build automation, and web development best practices.",
      "html_url": "https://github.com/omnisonic/jcm_pelican",
      "homepage": "https://johnclarkemusic.com",
      "created_at": "2021-06-30T19:25:14Z",
      "updated_at": "2026-02-08T04:59:34Z",
      "pushed_at": "2025-11-06T15:59:18Z",
      "topics": [
        "pelican"
      ],
      "languages": {
        "HTML": 75985,
        "CSS": 14686,
        "Python": 7573,
        "Makefile": 2729,
        "Shell": 748
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "# jcm_pelican\n",
      "homepageUrl": "https://johnclarkemusic.com"
    },
    {
      "id": 322680587,
      "name": "vanomad",
      "description": "Photo blog built with a python static site generator.",
      "html_url": "https://github.com/omnisonic/vanomad",
      "homepage": "https://vanomad.com",
      "created_at": "2020-12-18T18:57:11Z",
      "updated_at": "2021-11-20T20:52:16Z",
      "pushed_at": "2022-10-11T04:37:06Z",
      "topics": [
        "python",
        "html",
        "css",
        "photography",
        "blog"
      ],
      "languages": {
        "Python": 15015,
        "HTML": 13439,
        "CSS": 5851,
        "Makefile": 2810
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "# vanomad\n\nA personal blog of my experience with nomadic living in a van\n",
      "homepageUrl": "https://vanomad.com"
    },
    {
      "id": 296956041,
      "name": "gtypist_create",
      "description": "Python script to create gtypist lessons from a source file",
      "html_url": "https://github.com/omnisonic/gtypist_create",
      "homepage": null,
      "created_at": "2020-09-19T21:41:09Z",
      "updated_at": "2025-08-20T20:00:24Z",
      "pushed_at": "2022-02-07T20:51:46Z",
      "topics": [],
      "languages": {
        "Python": 787
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "# gtypist_create\nThis is a pet project to automate the creation of gtypist lesson files using python.\n",
      "homepageUrl": ""
    },
    {
      "id": 270912394,
      "name": "raspberrypi_hq_av_live_streamer",
      "description": "Live stream in HD and High Quality Stereo Audio with Raspberry Pi",
      "html_url": "https://github.com/omnisonic/raspberrypi_hq_av_live_streamer",
      "homepage": null,
      "created_at": "2020-06-09T05:36:34Z",
      "updated_at": "2020-06-14T21:17:07Z",
      "pushed_at": "2020-06-14T21:17:05Z",
      "topics": [],
      "languages": {},
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "# raspberrypi_hq_av_live_streamer\nLive stream in HD and High Quality Stereo Audio with Raspberry Pi\n\nffmpeg and bash scipting in progress\n",
      "homepageUrl": ""
    },
    {
      "id": 264495457,
      "name": "currency_chart",
      "description": "Data Retrievel and Visualization from Public API",
      "html_url": "https://github.com/omnisonic/currency_chart",
      "homepage": "https://omnisonic.github.io/currency_chart/",
      "created_at": "2020-05-16T17:59:34Z",
      "updated_at": "2026-02-07T00:30:02Z",
      "pushed_at": "2020-09-17T04:04:54Z",
      "topics": [
        "api",
        "data-visualization",
        "frontend"
      ],
      "languages": {
        "HTML": 1207,
        "CSS": 1114,
        "JavaScript": 58
      },
      "hasReadme": true,
      "screenshotUrl": null,
      "readmeContent": "HTML bar Chart using JSON Data and css to build the chart.\nThe deployment is here: https://omnisonic.github.io/currency_chart/\n",
      "homepageUrl": "https://omnisonic.github.io/currency_chart/"
    }
  ]
};

module.exports = EMBEDDED_DATA;

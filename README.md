# Silid Qwicha - Student Portal Chrome Extension

A minimal, beautiful Chrome extension that serves as a student portal for quick access to classes and activities, with seamless redirection to the full LMS. 🎓

## Project Purpose

This is a **student portal extension** that provides:

-   Quick access to class cards and activities
-   Minimal, clean interface for easy navigation
-   Seamless redirection to the full Silid LMS
-   Beautiful, modern design with glass-morphism effects

## Features

-   🎓 **Student Portal**: Clean interface for class and activity management
-   📚 **Class Cards**: Minimal row-based layout showing class information
-   📝 **Activity Lists**: Quick access to quizzes, assignments, and lessons
-   🔗 **LMS Integration**: Direct redirection to full Silid LMS website
-   🍪 **Cookie Management**: Advanced cookie retrieval and authentication storage
-   🔐 **Persistent Auth**: Maintains login state across browser sessions
-   🎨 **Modern UI**: Glass-morphism design with smooth animations
-   ⚡ **Fast & Lightweight**: Built with React, TypeScript, and Vite
-   📱 **Responsive**: Works perfectly in Chrome sidebar

## Installation

### Development Setup

1. **Clone or download this project**
2. **Install dependencies:**

    ```bash
    bun install
    ```

3. **Build the extension:**

    ```bash
    bun run build
    ```

### Load into Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle switch in the top right)
3. Click **"Load unpacked"**
4. Select the `dist` folder from your project directory
5. The "Silid Qwicha" extension should now appear in your extensions list
6. **Pin the extension** to your toolbar for easy access

## Usage

1. **Open the Portal**: Click the "Silid Qwicha" extension icon in your Chrome toolbar
2. **Authentication**: Click the ⚙️ settings button to access cookie management
3. **Get Cookies**: Use "Get Cookies" button to retrieve authentication from Wela domains
4. **View Classes**: See all your classes in a clean, minimal list format
5. **Select Class**: Click any class to view its activities
6. **Access Activities**: Click any activity to redirect to the full LMS
7. **Navigate Back**: Use the back button to return to class list

### Authentication Flow

1. **Login**: Go to `https://staging-33.wela-v15.dev/login#login` and log in
2. **Get Cookies**: In the extension, click ⚙️ → "Get Cookies" to store authentication
3. **Persistent State**: Your login status persists across browser sessions
4. **Auto-Detection**: Extension automatically detects valid authentication cookies

## How It Works

### User Flow

1. **Class List** → Shows all available classes with activity counts
2. **Activity List** → Displays activities for selected class
3. **LMS Redirect** → Opens full Silid LMS website when activity is clicked

### Architecture

-   **Side Panel**: Main React app running in Chrome's sidebar
-   **Background Script**: Handles extension lifecycle and messaging
-   **Content Script**: Manages page interactions (currently minimal)
-   **Manifest V3**: Uses latest Chrome extension format

### File Structure

```
src/
├── App.tsx              # Main React component (student portal UI)
├── main.tsx             # React app entry point
├── background.ts        # Background service worker
├── content.ts           # Content script for page interaction
├── types/
│   └── chrome.d.ts      # Chrome extension type definitions
└── index.css            # Global styles

dist/                    # Built extension files
├── index.html           # Sidebar HTML
├── main.js              # React app bundle
├── background.js        # Background script
├── content.js           # Content script
└── manifest.json        # Extension manifest
```

## Development

### Available Scripts

-   `bun run dev` - Start development server
-   `bun run build` - Build the extension for production
-   `bun run lint` - Run ESLint

### Key Technologies

-   **React 19** - UI framework
-   **TypeScript** - Type safety
-   **Vite** - Build tool
-   **Tailwind CSS** - Styling
-   **Chrome Extension APIs** - Extension functionality

### Chrome Extension APIs Used

-   `chrome.sidePanel` - Sidebar functionality
-   `chrome.tabs` - Tab information and redirection
-   `chrome.runtime` - Extension messaging
-   `chrome.action` - Extension icon click handling
-   `chrome.cookies` - Cookie retrieval and management
-   `chrome.storage` - Persistent authentication state storage

## Customization

### Styling

The extension uses Tailwind CSS with a minimal, clean design. You can customize the appearance by modifying the classes in `src/App.tsx`.

### Data

Currently uses mock data for classes and activities. To integrate with real data:

1. Modify the `classCards` array in `src/App.tsx`
2. Update the `activities` object with real activity data
3. Connect to your LMS API for dynamic data

### Functionality

-   **Background Script**: Modify `src/background.ts` to change extension behavior
-   **Content Script**: Edit `src/content.ts` to change page interactions
-   **Portal UI**: Update `src/App.tsx` to modify the student portal interface

### Permissions

The extension requests these permissions:

-   `activeTab` - Access to current tab information
-   `scripting` - Inject content scripts
-   `sidePanel` - Open sidebar interface
-   `cookies` - Access to browser cookies for authentication
-   `storage` - Persistent storage for authentication state
-   `host_permissions` - Access to Wela domains for cookie retrieval

## Browser Compatibility

-   Chrome 114+ (for side panel support)
-   Other Chromium-based browsers (Edge, Brave, etc.)

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on the project repository.

---

**Happy Learning! 🎓** ✨

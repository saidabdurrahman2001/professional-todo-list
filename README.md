# Professional To-Do List Website

A modern, responsive to-do list application built with HTML, CSS (TailwindCSS), and vanilla JavaScript.

## Features

### ✨ Core Features
- **Add Tasks**: Quickly add new tasks with a clean interface
- **Complete Tasks**: Mark tasks as done with checkbox
- **Edit Tasks**: Edit existing tasks inline
- **Delete Tasks**: Remove tasks with confirmation
- **Filter Tasks**: View all, active, or completed tasks
- **Statistics**: Real-time task statistics dashboard
- **Data Persistence**: Tasks saved in localStorage

### 🎨 Design Features
- **Modern UI**: Clean, professional design with TailwindCSS
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Animations**: Smooth transitions and micro-interactions
- **Toast Notifications**: User-friendly feedback messages
- **Empty States**: Helpful messages when no tasks exist
- **Hover Effects**: Interactive elements with visual feedback

### 🔧 Technical Features
- **No Dependencies**: Pure vanilla JavaScript
- **Local Storage**: Tasks persist between sessions
- **Component-Based**: Organized, maintainable code structure
- **Accessibility**: Semantic HTML and keyboard navigation
- **Performance**: Optimized rendering and event handling

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Start managing your tasks!

### Local Development (Optional)
For development with live reload, you can use a simple local server:

```bash
# Using Python (if installed)
python -m http.server 8000

# Using Node.js (if installed)
npx serve .

# Using PHP (if installed)
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## Usage Guide

### Adding Tasks
1. Type your task in the input field
2. Press Enter or click the "Tambah" button
3. Your task will appear at the top of the list

### Managing Tasks
- **Complete**: Click the checkbox to mark as done
- **Edit**: Click the edit button (pencil icon)
- **Delete**: Click the delete button (trash icon)

### Filtering Tasks
- **Semua**: Show all tasks
- **Aktif**: Show only incomplete tasks
- **Selesai**: Show only completed tasks

### Statistics
The dashboard shows:
- Total number of tasks
- Number of completed tasks
- Number of active tasks

### Clearing Completed Tasks
Click "Hapus yang Selesai" to remove all completed tasks at once.

## File Structure

```
to-do-list/
├── index.html          # Main HTML file
├── script.js           # JavaScript functionality
├── README.md           # This documentation
└── assets/             # (if needed for future enhancements)
```

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Customization

### Colors
The application uses TailwindCSS color classes. You can modify the color scheme by changing:
- Primary colors: `indigo-600`, `indigo-700`
- Success colors: `green-600`, `green-50`
- Error colors: `red-600`, `red-50`
- Background: `blue-50`, `indigo-100`

### Animations
Custom animations are defined in the TailwindCSS config in `index.html`:
- `fade-in`: Smooth opacity transition
- `slide-down`: Vertical slide animation
- `bounce-in`: Scale and bounce effect

## Future Enhancements

Potential features for future versions:
- [ ] Task categories/tags
- [ ] Due dates and reminders
- [ ] Priority levels
- [ ] Drag and drop reordering
- [ ] Export/import functionality
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Cloud synchronization
- [ ] Team collaboration features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues or have suggestions, please:
1. Check this README for solutions
2. Test in different browsers
3. Clear browser cache and localStorage
4. Report issues with detailed information

---

Made with ❤️ for productivity and task management excellence.

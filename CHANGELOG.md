# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2024-01-09

### Added
- Added DialogStream logo (dialogstream-animation.svg) to Flow Editor interface
- Enhanced visual branding in the application header

## [1.1.0] - 2024-01-09

### Added
- Enhanced Flow Editor features:
  - Drag-and-drop reordering with grip handles
  - In-place step editing with save/cancel functionality
  - JSON import/export with error handling
  - Undo/redo functionality with history tracking
  - Search/filter for flows and steps
  - Visual flow diagram preview improvements

### Enhanced
- Step validation system:
  - Support for all step types (RTSP, FILE, SCHEDULE)
  - Real-time validation with clear error messages
  - Visual feedback for validation errors
  - Type-specific validation rules

- UI/UX Improvements:
  - Better spacing and layout optimization
  - More intuitive icons and interactions
  - Visual feedback for all operations
  - Scrollable modal for long flow lists

- Search Capabilities:
  - Real-time filtering as you type
  - Search across flow names and step content
  - Instant results updates

## [1.0.0] - 2024-11-02

### Added
- Initial release of the DialogStream GUI application
- Flow diagram preview functionality
- Flow editing capabilities with modal interface
- Flow editor components with validation
- UI component library including:
  - Custom Button component
  - Custom Input component
- Tailwind CSS integration for styling
- Vite-based build configuration
- React application foundation with:
  - Component-based architecture
  - CSS modules support
  - Global styles configuration

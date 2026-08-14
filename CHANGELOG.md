# Changelog

All notable changes to this project are documented here.

## [0.2.0] - 2026-08-14

### Added

- Collapsible multi-purpose right sidebar with search, files, session overview, browser, and terminal tabs.
- Native embedded browser that keeps navigation inside the macOS sidebar and supports address entry, back, forward, and reload.
- Workspace-aware persistent terminal with command history, clear, and restart controls.
- Safe installer for the bundled `dsh-right-sidebar` plugin and its local search index.

### Changed

- The right sidebar now follows the Harness details-panel width while it is dragged.
- The embedded browser continuously follows sidebar position and size changes.

### Fixed

- URLs entered in the sidebar now open on Return as well as with the open button.
- Sites that reject iframe embedding can now load in the native macOS browser surface.
- Sidebar resizing no longer reveals the underlying details panel or leaves browser content misaligned.

## [0.1.0] - 2026-08-13

- Initial open-source release of the lightweight DeepSeek Harness macOS wrapper.

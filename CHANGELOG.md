# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).


## [Unreleased]
(empty)


## [1.1.0] - 2020-07-23
### Added
- A new "placeholder" option to change the default "Search" word shown in the input search bar.


## [1.0.4] - 2020-07-07
### Changed
- Upgrade searchinghost version to `v1.4.0`.

### Fixed
- The iframe height was not correct since the last version, rollback to `100%` instead of `100vh`.


## [1.0.3] - 2020-07-03
### Changed
- Backpack theme: hide the posts found counter when the search bar is empty.

### Fixed
- Prevent background main page from "jumping" when disabling its scroll.

## [1.0.2] - 2020-06-25
### Fixed
- Only for iOS devices, fix scrolling/unresponsive screen when closing the search pop-up.


## [1.0.1] - 2020-06-18
### Changed
- Use the same underlying SearchinGhost posts indexation to easily switch between templates.

### Fixed
- The `searchinghostOptions` configuration field can now handle regexp values.


## [1.0.0] - 2020-06-17
🚀 The first official release!

# Projects Page Design

## Goal

Add a static `/projects` page to chuckd.dev that matches the blog listing's restrained visual language and gives visitors direct access to each project's official source, Homebrew formula, and package registry when one exists.

## Scope

The first version lists two projects:

1. **car-go-clean** — A Rust CLI and daemon that cleans build artifacts from Rust projects and tracks reclaimed disk space.
2. **lbranch** — A Git utility for listing recently checked-out branches and quickly switching between them.

The page does not add individual project detail pages, fetch data at runtime, or display version numbers. Project metadata is maintained in the site repository and rendered at build time.

## Page Design

`/projects` uses the same page shell as `/blog`:

- shared theme initialization
- shared breadcrumb header with `projects`
- `Projects` page heading
- compact monochrome list
- shared footer

Each project row presents:

- project name in the title font
- one-line description in the monospace font
- right-aligned, icon-only external links

Rows remain horizontal when space permits. On narrow screens, the icon links wrap below the text so descriptions never collide with the actions.

Brand icons use the official GitHub, Homebrew, and PyPI shapes supplied by `simple-icons`. SVGs are rendered inline during the Astro build, inherit the site's foreground color, and add no client-side JavaScript.

Every icon link opens in a new tab and includes:

- a destination-specific `aria-label` that includes the project name
- a matching native `title` tooltip
- `rel="noopener noreferrer"`
- a visible keyboard focus treatment

## Project Links

### car-go-clean

- GitHub: `https://github.com/dcchuck/car-go-clean`
- Homebrew: `https://github.com/dcchuck/homebrew-tap/blob/main/Formula/car-go-clean.rb`

`car-go-clean` has no package-registry link because it is not published on crates.io.

### lbranch

- GitHub: `https://github.com/dcchuck/lbranch`
- Homebrew: `https://github.com/dcchuck/homebrew-tap/blob/main/Formula/lbranch.rb`
- PyPI: `https://pypi.org/project/lbranch/`

## Architecture

### `src/data/projects.ts`

Exports typed project metadata. Each entry contains:

- `name`
- `description`
- ordered `links`

Each link contains a supported brand identifier and URL. Adding a future project requires one new data entry rather than duplicated page markup.

### `src/components/BrandIcon.astro`

Maps the supported brand identifier to its `simple-icons` SVG data and renders a consistent inline icon. Unsupported brands fail during development rather than silently rendering an empty action.

### `src/components/ProjectRow.astro`

Renders one typed project entry, including its text and accessible icon links. Layout and interaction styles remain encapsulated in the row component.

### `src/pages/projects.astro`

Imports the project data and maps it through `ProjectRow`. The page owns document metadata, the shared shell, heading, and list semantics.

### Navigation

Add `projects` to:

- the homepage navigation, between `blog` and `about`
- the shared footer navigation, between `blog` and `about`

The header menu remains focused on theme controls and does not duplicate site navigation.

## Verification

A Node built-in test will inspect the generated static HTML and verify:

- `/projects` is generated
- both project names and descriptions are present
- all five expected destination URLs are present
- every icon-only link has a project-specific accessible label
- `car-go-clean` has no registry action
- homepage and footer navigation link to `/projects`

The implementation follows a red-green cycle: add the output assertions, confirm they fail before `/projects` exists, implement the minimum page and components, then rerun the full build and tests.

Final visual verification covers:

- desktop dark theme
- desktop light theme
- narrow mobile layout
- keyboard focus visibility
- icon alignment and tooltips

The site will run locally in Astro dev mode for user review. Nothing will be pushed until the user has reviewed the local result and explicitly approves publishing.

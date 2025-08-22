# Mobile Map Viewer - Product Requirements Document

A mobile-optimized web application for displaying interactive maps from multiple tile sources with focus on German NRW regional data.

**Experience Qualities**:
1. **Intuitive** - Map controls and layer switching should feel natural and discoverable for mobile users
2. **Responsive** - Smooth map interactions with fast tile loading and seamless layer transitions
3. **Professional** - Clean, focused interface that prioritizes map content over UI chrome

**Complexity Level**: Light Application (multiple features with basic state)
- Core functionality centers around map display with layer switching, location services, and user preferences persistence

## Essential Features

### Interactive Map Display
- **Functionality**: Full-screen interactive map with pan, zoom, and touch gestures
- **Purpose**: Primary interface for geographic data visualization
- **Trigger**: App launch automatically displays map centered on user location or default view
- **Progression**: App loads → Location request → Map renders → User can pan/zoom/interact
- **Success criteria**: Map loads within 2 seconds, smooth 60fps interactions, accurate touch responses

### Multiple Tile Source Support
- **Functionality**: Switch between OpenStreetMap, aerial imagery, NRW Orthophoto, and NRW Liegenschaftskataster
- **Purpose**: Provides different perspectives and data layers for comprehensive geographic analysis
- **Trigger**: Layer switcher button in bottom-right corner
- **Progression**: Tap layer button → Layer menu opens → Select new layer → Map tiles update → Menu closes
- **Success criteria**: Layer switching completes within 1 second, no visual artifacts during transitions

### Location Services
- **Functionality**: Detect user location and center map accordingly
- **Purpose**: Immediate geographic context relevant to user's current position
- **Trigger**: Location button or app launch
- **Progression**: Tap location button → Permission request → GPS acquisition → Map centers on location
- **Success criteria**: Location acquired within 5 seconds, accuracy within 10 meters in urban areas

### Zoom Controls
- **Functionality**: Programmatic zoom in/out buttons plus gesture support
- **Purpose**: Precise zoom control especially for accessibility and desktop users
- **Trigger**: Plus/minus buttons or pinch gestures
- **Progression**: Tap zoom button → Map smoothly animates to new zoom level
- **Success criteria**: Zoom animations complete in 300ms, no lag during gesture recognition

## Edge Case Handling

- **Offline/Network Issues**: Display cached tiles when available, show connection status indicator
- **Location Permission Denied**: Gracefully fall back to default map center (Germany/NRW region)
- **Tile Loading Failures**: Show placeholder tiles with retry mechanism, fallback to alternative sources
- **Touch Conflicts**: Prevent accidental layer switches during map pan operations
- **Memory Management**: Limit cached tiles to prevent browser memory issues on older devices

## Design Direction

The design should feel professional and utilitarian like a surveying or GIS tool, emphasizing clarity and functionality over visual flourishes. Minimal interface allows maximum screen space for map content while maintaining easy access to essential controls.

## Color Selection

Complementary (opposite colors) - Using earth tones with digital blue accents to complement geographic content while ensuring UI elements remain visible against varied map backgrounds.

- **Primary Color**: Deep Forest Green `oklch(0.35 0.15 150)` - Professional, geographic, trustworthy
- **Secondary Colors**: Warm Stone `oklch(0.85 0.02 80)` for backgrounds, Charcoal `oklch(0.25 0.01 220)` for text
- **Accent Color**: Digital Blue `oklch(0.55 0.20 240)` - High visibility for interactive elements and location markers
- **Foreground/Background Pairings**:
  - Background (Warm Stone): Charcoal text `oklch(0.25 0.01 220)` - Ratio 12.8:1 ✓
  - Card (White): Charcoal text `oklch(0.25 0.01 220)` - Ratio 15.2:1 ✓
  - Primary (Forest Green): White text `oklch(0.98 0 0)` - Ratio 6.8:1 ✓
  - Accent (Digital Blue): White text `oklch(0.98 0 0)` - Ratio 4.9:1 ✓

## Font Selection

Typography should convey technical precision and clarity while remaining highly legible on mobile devices outdoors. Inter provides excellent screen readability and professional character.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold/24px/tight letter spacing
  - H2 (Layer Names): Inter Semibold/16px/normal spacing
  - Body (Labels): Inter Regular/14px/normal spacing
  - Small (Attribution): Inter Regular/12px/normal spacing

## Animations

Animations should feel responsive and functional, emphasizing state changes and spatial relationships rather than decorative effects. Motion should communicate the geographic nature of the interface.

- **Purposeful Meaning**: Zoom animations convey spatial scale changes, layer transitions show data source switching
- **Hierarchy of Movement**: Map interactions take priority, UI animations are subtle and fast

## Component Selection

- **Components**: 
  - Sheet for layer selection menu (slides up from bottom)
  - Button for zoom controls and location services
  - Badge for layer indicators and attribution
  - Skeleton for tile loading states
  - Alert for error messages and permissions

- **Customizations**: 
  - Custom map container component with touch gesture handling
  - Floating action buttons with drop shadows for map overlay
  - Custom tile layer management system

- **States**: 
  - Buttons: Default with subtle shadow, pressed with inset shadow, disabled with reduced opacity
  - Layer switcher: Collapsed (icon only) and expanded (full menu) states
  - Location button: Inactive, searching (animated), and active (pulsing) states

- **Icon Selection**: 
  - Phosphor Icons for consistent line style: MapPin, Layers, Plus, Minus, NavigationArrow
  - Custom icons for specific tile sources if needed

- **Spacing**: 
  - Consistent 16px base unit for mobile touch targets
  - 8px for tight spacing between related elements
  - 24px for separation between major UI sections

- **Mobile**: 
  - Full-screen map with minimal chrome
  - Bottom sheet for layer selection to avoid reaching across screen
  - Large 48px touch targets for all interactive elements
  - Gesture-first design with button fallbacks
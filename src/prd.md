# Mobile Map Viewer - Product Requirements Document

## Core Purpose & Success
- **Mission Statement**: A mobile-optimized web application for viewing interactive maps with specialized orchard data overlay from OpenStreetMap.
- **Success Indicators**: Users can smoothly navigate maps on mobile devices, switch between map layers, and discover orchards in their area with detailed information.
- **Experience Qualities**: Responsive, informative, and visually appealing.

## Project Classification & Approach
- **Complexity Level**: Light Application (multiple features with basic state)
- **Primary User Activity**: Interacting (exploring maps, discovering data)

## Thought Process for Feature Selection
- **Core Problem Analysis**: Need for mobile-friendly access to detailed geographic information, specifically orchard locations.
- **User Context**: Users exploring areas on mobile devices, looking for local agricultural features.
- **Critical Path**: Load map → Navigate to area of interest → View orchard data → Get detailed information
- **Key Moments**: Initial map load, smooth navigation, orchard discovery at appropriate zoom levels

## Essential Features

### Map Display and Navigation
- **Functionality**: Interactive map with multiple base layer options (OSM, satellite, terrain)
- **Purpose**: Primary interface for geographic exploration
- **Success Criteria**: Smooth panning/zooming, persistent map state, mobile-optimized controls

### Orchard Data Layer
- **Functionality**: Automatic display of orchards from OpenStreetMap data
- **Purpose**: Show agricultural features with detailed information
- **Success Criteria**: 
  - Orchards appear as bright orange polygons at zoom levels 12-16
  - Orchards appear as orange points at zoom levels >16
  - API calls throttled to maximum once every 3 seconds
  - Detailed popup information (name, crop type, operator, access)

### Layer Management
- **Functionality**: Quick switcher for map base layers and detailed layer selector
- **Purpose**: Allow users to choose optimal map visualization
- **Success Criteria**: Instant layer switching, clear visual indicators

### Location Services
- **Functionality**: GPS-based location finding and display
- **Purpose**: Help users orient themselves on the map
- **Success Criteria**: Accurate location detection, clear location marker

### Mobile-Optimized Controls
- **Functionality**: Touch-friendly zoom controls and interface elements
- **Purpose**: Ensure usability on mobile devices
- **Success Criteria**: All controls easily accessible with thumb navigation

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Professional, reliable, and nature-focused
- **Design Personality**: Clean, modern, slightly organic to reflect agricultural theme
- **Visual Metaphors**: Natural earth tones with vibrant orange for agricultural features
- **Simplicity Spectrum**: Minimal interface that lets the map content shine

### Color Strategy
- **Color Scheme Type**: Analogous with accent
- **Primary Color**: Warm green (oklch(0.35 0.15 150)) - representing nature and growth
- **Secondary Colors**: Soft cream (oklch(0.85 0.02 80)) for backgrounds
- **Accent Color**: Bright blue (oklch(0.55 0.20 240)) for interactive elements
- **Orchard Color**: Bright orange (#ff6b35) for orchard features
- **Color Psychology**: Earth tones convey trustworthiness and connection to agriculture

### Typography System
- **Font Pairing Strategy**: Inter for all text (consistent, readable sans-serif)
- **Typographic Hierarchy**: Clear size relationships for map labels, UI text, and popup content
- **Font Personality**: Modern, clean, highly legible
- **Readability Focus**: Optimized for mobile screens with sufficient contrast

### Visual Hierarchy & Layout
- **Attention Direction**: Map as primary focus, controls positioned for easy thumb access
- **White Space Philosophy**: Clean backgrounds that don't compete with map data
- **Grid System**: Positioned controls that maintain consistent spacing
- **Responsive Approach**: Mobile-first design with touch-optimized interactions

### Animations
- **Purposeful Meaning**: Subtle hover effects on controls, smooth transitions between map states
- **Hierarchy of Movement**: Orchard point markers scale slightly on hover for feedback
- **Contextual Appropriateness**: Minimal, functional animations that enhance usability

### UI Elements & Component Selection
- **Component Usage**: Shadcn components for consistent design system (Button, Badge, Sonner toasts)
- **Component Customization**: Map controls with glassmorphic backgrounds and subtle shadows
- **Component States**: Clear hover, active, and disabled states for all interactive elements
- **Icon Selection**: Phosphor icons for consistency with map interface
- **Mobile Adaptation**: Touch-friendly sizes and positioning for all controls

## Implementation Considerations
- **Performance**: Efficient API throttling and data caching for smooth mobile experience
- **Scalability**: Modular component structure allows for additional data layers
- **Offline Capability**: Map tiles cached by browser for basic offline functionality

## Recent Updates
- **Orchard Color**: Changed from green to bright orange (#ff6b35) for better visibility
- **Display Logic**: Orchards show as areas at zoom 12-16, points at zoom >16
- **API Throttling**: Implemented 3-second minimum between Overpass API calls
- **UI Simplification**: Removed toggle controls, orchards now always visible when zoomed in
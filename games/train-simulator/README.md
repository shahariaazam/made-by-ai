# Realistic Train Simulator 3D

A feature-rich 3D train simulator built with Three.js that provides a realistic train driving experience with modern graphics and physics.

## Features

- **Detailed 3D Train Model**: Locomotive and passenger cars with realistic details, windows, wheels, and connecting rods
- **Realistic Track System**: 3D rails with sleepers and ballast texture
- **Immersive Environment**: Procedurally generated terrain, trees, houses, and a station
- **Interactive Controls**: Control the train's speed with realistic acceleration and braking physics
- **Dynamic Weather System**: Cycle through clear, cloudy, rainy, foggy, and snowy conditions with visual effects
- **Day-Night Cycle**: Time progresses with realistic lighting changes
- **Signal System**: Working railroad signals that change states and affect train operation
- **Multiple Camera Views**: Switch between third-person chase view and first-person cab view
- **Sound Effects**: Engine sounds, horn, rail clatter, and weather-specific audio
- **Responsive UI**: Speed, throttle, brake indicators and touch-friendly controls

## Controls

- **Speed Up**: Up Arrow key or "Speed Up" button
- **Slow Down**: Down Arrow key or "Slow Down" button
- **Horn**: Spacebar or "Horn" button
- **Toggle View**: V key or "Cab View" button
- **Change Weather**: W key or "Change Weather" button

## Technical Architecture

The simulator is built with a modular architecture for maintainability and extensibility:

- `config.js` - Central configuration settings
- `main.js` - Entry point that initializes the game
- `game.js` - Main controller that integrates all modules
- `train.js` - Train creation and physics
- `track.js` - Track generation and rendering
- `terrain.js` - Terrain generation with height map
- `scenery.js` - Trees, houses and station creation
- `signals.js` - Railroad signal system
- `weather.js` - Weather effects and day/night cycle
- `audio.js` - Sound effect management

## Technology Stack

- **HTML5** - Structure and canvas container
- **CSS3** - UI styling and layout
- **JavaScript (ES6+)** - Game logic and module system
- **Three.js** - 3D rendering and scene management
- **Howler.js** - Audio management

## Development

The project uses ES6 modules to maintain a clean, modular codebase. To run the simulator locally:

1. Clone the repository
2. Open `index.html` in a modern browser (Chrome, Firefox, Edge, or Safari)
3. Alternatively, use a local development server like `http-server` or `live-server`

## Future Enhancements

- Multiple train types (steam, diesel, electric)
- Additional routes and track layouts
- Passenger loading/unloading gameplay
- More detailed station interactions
- Enhanced terrain with water features
- Performance optimizations for mobile devices

## License

This project is part of the made-by-ai repository and follows its licensing terms. 
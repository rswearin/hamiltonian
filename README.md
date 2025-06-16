# Hamiltonian Camera Simulation

A real-time physics simulation that converts video feed into dynamic Hamiltonian field visualizations using mathematical analysis of pixel data.

## Overview

This application transforms your camera feed into a live 3D visualization of Hamiltonian mechanics, where each pixel becomes a point in a dynamic energy field. The simulation performs real-time mathematical calculations on video frames to compute energy values and visualize them as an interactive 3D particle system.

## Mathematical Foundation

### Hamiltonian Calculation
The simulation calculates the Hamiltonian (total energy) for each pixel using classical mechanics principles:

**H = T + V**

Where:
- **H** = Total Hamiltonian (energy)
- **T** = Kinetic Energy 
- **V** = Potential Energy

### Frame-by-Frame Analysis

#### Potential Energy (V)
\`\`\`
V = (brightness / 255) × 10
\`\`\`
- Derived from pixel brightness values (0-255)
- Represents the "potential field" at each spatial point
- Brighter pixels = higher potential energy

#### Kinetic Energy (T)
\`\`\`
T = (|brightness_current - brightness_previous| / 255) × 10
\`\`\`
- Calculated from brightness changes between consecutive frames
- Represents motion and temporal dynamics
- Higher frame-to-frame changes = higher kinetic energy

### Visualization Mapping

Each pixel in the video feed (256×256 resolution) becomes a particle in 3D space:

- **X,Y Position**: Corresponds to pixel coordinates
- **Z Position**: Scaled by Hamiltonian value (H × 1.5)
- **Color**: HSL mapping where blue = low energy, red = high energy
- **Real-time Updates**: 60fps mathematical recalculation

## System Analytics

The simulation provides live analysis of the energy field:

### Energy Distribution
- **Low Energy**: H < 5 (stable regions)
- **Medium Energy**: 5 ≤ H < 12 (transitional zones)  
- **High Energy**: H ≥ 12 (dynamic regions)

### System States
- **System Stable**: Low average kinetic energy
- **High Motion Detected**: Average T > 0.8
- **High Energy Concentration**: Average V > 8

### Real-time Metrics
- Frame count and processing rate
- Average and maximum Hamiltonian values
- Peak energy coordinates
- Energy distribution percentages with visual bar charts

## Technical Implementation

- **Resolution**: 256×256 pixel grid (65,536 particles)
- **Processing**: Real-time frame differencing and brightness analysis
- **Rendering**: Three.js WebGL particle system
- **Performance**: Hardware-accelerated 3D graphics
- **Interaction**: Mouse controls for 3D rotation and exploration

## Physics Interpretation

This simulation demonstrates how visual information can be interpreted through the lens of Hamiltonian mechanics:

1. **Static scenes** show primarily potential energy (V) from lighting
2. **Moving objects** generate kinetic energy (T) from temporal changes
3. **Energy conservation** principles govern the overall system behavior
4. **Phase space** is represented through the 3D particle field

The result is a unique bridge between computer vision and classical physics, turning your camera into a real-time Hamiltonian field analyzer.

## Usage

1. Grant camera permissions when prompted
2. The simulation will automatically start processing your video feed
3. Use mouse to rotate and explore the 3D energy field
4. Monitor the analytics panel for system insights
5. Observe how movement and lighting changes affect the energy landscape

## Controls

- **Mouse Drag**: Rotate the 3D view
- **Real-time Analytics**: Bottom-left panel shows live system data
- **Automatic Processing**: No manual controls needed - responds to camera input

---

*This simulation represents a novel approach to visualizing Hamiltonian mechanics through real-time video analysis, demonstrating the mathematical beauty hidden in everyday visual scenes.*

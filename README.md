# 🐱 Hop Hop Puff - Puffy's Kitchen Adventure

A mobile-first HTML5 game built with Phaser.js where Puffy the cat climbs through kitchen platforms to reach beef jerky at the top!

## 🎮 Play the Game

**[Play Hop Hop Puff](https://wabbazzar.github.io/puffys-birthday/)**

## 🎯 Game Features

- **Mobile-First Design**: Optimized for touch controls with virtual D-pad
- **Cross-Platform**: Works on mobile and desktop with responsive scaling
- **Smooth Physics**: 60 FPS gameplay with Phaser.js arcade physics
- **Character Animation**: 4x4 sprite sheet with walking animations in all directions
- **Block-Based Levels**: Modular block system for building platforms and obstacles

## 🕹️ Controls

### Mobile
- **Virtual D-pad**: Touch the on-screen directional buttons
- **Jump**: Tap the up arrow to jump on platforms

### Desktop
- **WASD Keys**: Move Puffy around
- **W**: Jump up
- **A/D**: Move left/right
- **S**: Look down

## 🛠️ Technical Stack

- **Engine**: Phaser.js 3.70.0
- **Graphics**: HTML5 Canvas with pixel-perfect rendering
- **Physics**: Arcade Physics for collision detection
- **Responsive**: CSS media queries for mobile-first design
- **PWA Ready**: Progressive Web App features

## 🏗️ Development

### Local Development
```bash
# Clone the repository
git clone https://github.com/wabbazzar/puffys-birthday.git
cd puffys-birthday

# Start local server
make serve
# or
python3 -m http.server 8000

# Open browser to http://localhost:8000
```

### Project Structure
```
hop-hop-puff/
├── index.html              # Main game entry point
├── game/
│   ├── main.js            # Core game engine
│   └── sprites/
│       └── PuffySprite.js # Character sprite management
├── assets/
│   └── puffy_4_by_4.png   # Character sprite sheet
├── styles/
│   ├── mobile.css         # Mobile-first styling
│   └── desktop.css        # Desktop enhancements
└── docs/
    ├── spec.md            # Game specification
    └── todo.md            # Development roadmap
```

## 🎨 Character Sprite

Puffy uses a 4x4 sprite sheet (16 frames total):
- **Row 0**: Walking up/away (ladder climbing)
- **Row 1**: Walking left  
- **Row 2**: Walking down/toward
- **Row 3**: Walking right (horizontally flipped from left)

**Display Size**: 48x48 pixels  
**Collision Box**: 32x32 pixels (centered)

## 🧱 Block System

The game features a modular block system for building levels:
- **Block Size**: 24x24 pixels (half of Puffy's size)
- **Physics**: Solid collision detection
- **Stackable**: Puffy can jump on and stand on blocks
- **Customizable**: Programmable colors and positions

## 🏆 Game Objective

Help Puffy the cat climb through kitchen platforms to reach the beef jerky at the top while avoiding hazards!

- **Lives**: 3 lives system
- **Scoring**: Higher score for faster completion
- **Platforms**: 6 horizontal levels with ladders
- **Hazards**: Flying insects and rolling fruits (coming soon!)

## 📱 Mobile Optimization

- **Touch-First**: 44px+ touch targets for accessibility
- **Responsive Scaling**: Adapts to iPhone and Android screens
- **Performance**: Optimized for 60 FPS on mobile devices
- **PWA Features**: Install as a native-like app

## 🚀 Deployment

This game is automatically deployed to GitHub Pages when changes are pushed to the main branch.

**Live URL**: https://wabbazzar.github.io/puffys-birthday/

## 📄 License

This project is open source and available under the MIT License.

## 🎂 About Puffy's Birthday

This game was created as a birthday celebration project, combining classic Donkey Kong-style gameplay with modern web technologies and mobile-first design principles.

---

**Have fun playing! 🎮🐱** 
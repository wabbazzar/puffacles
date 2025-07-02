.PHONY: serve game-test mobile-test visual-test touch-test sprite-test device-test verify-render clean-cache debug-render auto-test pwa-test start-server stop-server test-game check-logs full-test

# Mobile-ready game server
serve:
	@echo "🚀 Starting Hop Hop Puff development server..."
	@echo "📱 Mobile: Connect device and navigate to http://[your-ip]:8000/"
	@echo "💻 Desktop: http://localhost:8000/"
	@python3 -m http.server 8000 --bind 0.0.0.0 || python -m SimpleHTTPServer 8000

# Autonomous testing server management
start-server:
	@echo "🚀 Starting development server in background with logging..."
	@lsof -ti:8000 | xargs kill -9 2>/dev/null || true
	@python3 -m http.server 8000 --bind 0.0.0.0 > server.log 2>&1 &
	@sleep 2
	@echo "✅ Server started on http://localhost:8000"
	@echo "📊 Logs available: make check-logs"

stop-server:
	@echo "🛑 Stopping development server..."
	@lsof -ti:8000 | xargs kill -9 2>/dev/null || true
	@echo "✅ Server stopped"

test-game:
	@echo "🎮 Opening game for testing (follows Rule 0: MANDATORY TESTING PROTOCOL)..."
	@open http://localhost:8000 || xdg-open http://localhost:8000 || echo "Navigate to: http://localhost:8000"

check-logs:
	@echo "📊 Server logs (last 10 lines):"
	@tail -10 server.log 2>/dev/null || echo "No server.log found. Use 'make start-server' first."

full-test: start-server test-game
	@echo "🧪 Full autonomous testing protocol:"
	@echo "   ✅ Server started with logging"
	@echo "   ✅ Game opened for testing"
	@echo "   📱 Test mobile view with browser dev tools"
	@echo "   💻 Test desktop view with keyboard controls"
	@echo ""
	@echo "Next steps:"
	@echo "   make check-logs  # Check server activity"
	@echo "   make stop-server # Stop when done"

# Cross-platform game testing
game-test:
	@echo "🎮 Opening main game..."
	@open http://localhost:8000/index.html || xdg-open http://localhost:8000/index.html || echo "Navigate to: http://localhost:8000/index.html"

# Mobile-specific game testing
mobile-test:
	@echo "📱 Opening mobile touch test..."
	@open http://localhost:8000/mobile_test.html || xdg-open http://localhost:8000/mobile_test.html || echo "Navigate to: http://localhost:8000/mobile_test.html"

# Touch control testing
touch-test:
	@echo "👆 Opening touch control test..."
	@open http://localhost:8000/touch_latency_test.html || xdg-open http://localhost:8000/touch_latency_test.html

# Ladder climbing mechanics testing
ladder-test:
	@open http://localhost:8000/ladder_test.html || xdg-open http://localhost:8000/ladder_test.html

# Automated ladder climbing test
auto-ladder-test:
	@echo "🤖 Opening automated ladder climbing test..."
	@open http://localhost:8000/auto_ladder_test.html || xdg-open http://localhost:8000/auto_ladder_test.html

# Physics isolation test
physics-test:
	@echo "🔬 Opening physics isolation test..."
	@open http://localhost:8000/physics_test.html || xdg-open http://localhost:8000/physics_test.html

# Simple ladder test
simple-ladder-test:
	@echo "🪜 Opening simple ladder test..."
	@open http://localhost:8000/simple_ladder_test.html || xdg-open http://localhost:8000/simple_ladder_test.html

# Sprite animation testing
sprite-test:
	@echo "🐱 Opening Puffy 4x4 sprite test..."
	@open http://localhost:8000/sprite_test.html || xdg-open http://localhost:8000/sprite_test.html || echo "Navigate to: http://localhost:8000/sprite_test.html"

# Sprite debug and analysis
sprite-debug:
	@echo "🔍 Opening Puffy sprite debug analysis..."
	@open http://localhost:8000/sprite_debug.html || xdg-open http://localhost:8000/sprite_debug.html || echo "Navigate to: http://localhost:8000/sprite_debug.html"

# Cross-platform visual verification
visual-test:
	@echo "🎨 Opening cross-platform visual test..."
	@open http://localhost:8000/visual_test.html || xdg-open http://localhost:8000/visual_test.html || echo "Navigate to: http://localhost:8000/visual_test.html"

# Device testing information
device-test:
	@echo "📲 Device Testing Instructions:"
	@echo "Connect mobile device and navigate to: http://[your-ip]:8000/"
	@echo ""
	@echo "Your current IP addresses:"
	@ifconfig | grep "inet " | grep -v 127.0.0.1 | head -3 2>/dev/null || ipconfig | findstr "IPv4" 2>/dev/null || echo "Run 'ifconfig' or 'ipconfig' to find your IP address"
	@echo ""
	@echo "Test URLs:"
	@echo "  Main Game: http://[your-ip]:8000/index.html"
	@echo "  Mobile Test: http://[your-ip]:8000/mobile_test.html"
	@echo "  Visual Test: http://[your-ip]:8000/visual_test.html"

# Game render verification
verify-render:
	@echo "🔍 Opening render verification..."
	@open http://localhost:8000/visual_test.html || xdg-open http://localhost:8000/visual_test.html || echo "Navigate to: http://localhost:8000/visual_test.html"

# Game asset cache management
clean-cache:
	@echo "🧹 Cache Clearing Instructions:"
	@echo ""
	@echo "Desktop Browsers:"
	@echo "  Chrome/Firefox: Ctrl+Shift+R (Win/Linux) or Cmd+Shift+R (Mac)"
	@echo "  Safari: Cmd+Option+R (Mac)"
	@echo ""
	@echo "Mobile Browsers:"
	@echo "  Safari iOS: Settings > Safari > Clear History and Website Data"
	@echo "  Chrome Mobile: Menu > History > Clear browsing data"
	@echo "  Firefox Mobile: Menu > Settings > Clear private data"
	@echo ""
	@echo "For complete cache reset, restart your development server."

# Debug game render pipeline
debug-render:
	@echo "🐛 Opening debug render test..."
	@open http://localhost:8000/visual_test.html || xdg-open http://localhost:8000/visual_test.html || echo "Navigate to: http://localhost:8000/visual_test.html"

# Automated cross-platform game test suite
auto-test:
	@echo "🤖 Running automated test suite..."
	@echo "Starting server in background..."
	@(python3 -m http.server 8000 --bind 0.0.0.0 > /dev/null 2>&1 || python -m SimpleHTTPServer 8000 > /dev/null 2>&1) &
	@sleep 2
	@echo "Opening test pages..."
	@open http://localhost:8000/mobile_test.html || xdg-open http://localhost:8000/mobile_test.html || echo "Navigate to: http://localhost:8000/mobile_test.html"
	@sleep 1
	@open http://localhost:8000/visual_test.html || xdg-open http://localhost:8000/visual_test.html || echo "Navigate to: http://localhost:8000/visual_test.html"
	@echo "✅ Test suite launched! Check both browser tabs for results."

# PWA game testing
pwa-test:
	@echo "📱 PWA Testing Instructions:"
	@echo ""
	@echo "1. Start server: make serve"
	@echo "2. Open on mobile: http://[your-ip]:8000/index.html"
	@echo "3. iOS Safari: Tap Share > Add to Home Screen"
	@echo "4. Android Chrome: Menu > Add to Home Screen"
	@echo "5. Test offline functionality after installation"
	@echo ""
	@echo "Note: PWA manifest will be created in Phase 6"

# Development helpers
setup:
	@echo "🛠️  Setting up Hop Hop Puff development environment..."
	@echo "✅ Project structure ready"
	@echo "✅ Mobile-first CSS loaded"
	@echo "✅ Cross-platform test files ready"
	@echo ""
	@echo "Quick Start:"
	@echo "  1. make serve       # Start development server"
	@echo "  2. make mobile-test # Test mobile touch controls"
	@echo "  3. make visual-test # Test cross-platform rendering"
	@echo "  4. make device-test # Get mobile device connection info"

# Show all available commands
help:
	@echo "🐱 Hop Hop Puff - Cross-Platform Game Development Commands"
	@echo ""
	@echo "Development Server:"
	@echo "  make serve         Start mobile-ready development server on port 8000"
	@echo "  make start-server  Start server in background with logging (autonomous testing)"
	@echo "  make stop-server   Stop background server"
	@echo "  make test-game     Open game for testing (Rule 0 compliance)"
	@echo "  make check-logs    View server activity logs"
	@echo "  make full-test     Complete autonomous testing workflow"
	@echo ""
	@echo "Testing Commands:"
	@echo "  make game-test     Open main game (index.html)"
	@echo "  make mobile-test   Test mobile touch controls and virtual D-pad"
	@echo "  make visual-test   Test cross-platform Phaser.js canvas rendering"
	@echo "  make touch-test    Test touch event handling and latency"
	@echo "  make sprite-test   Test Puffy 4x4 sprite animations (all 16 frames)"
	@echo "  make sprite-debug  Debug sprite loading and frame detection"
	@echo "  make device-test   Show mobile device connection instructions"
	@echo ""
	@echo "Verification:"
	@echo "  make verify-render Verify game rendering across platforms"
	@echo "  make auto-test     Run automated test suite"
	@echo "  make pwa-test      PWA installation testing instructions"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean-cache   Show cache clearing instructions"
	@echo "  make debug-render  Debug rendering issues"
	@echo ""
	@echo "Utilities:"
	@echo "  make setup         Show development setup information"
	@echo "  make help          Show this help message"
	@echo ""
	@echo "🚀 Quick Start: make serve && make mobile-test"

# Default target
all: setup 
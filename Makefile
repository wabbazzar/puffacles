.PHONY: serve start-server stop-server check-logs queen-test clean-cache device-test help

# Development server
serve:
	@echo "🚀 Starting Puffy Queen development server..."
	@echo "📱 Mobile: http://[your-ip]:8000/"
	@echo "💻 Desktop: http://localhost:8000/"
	@python3 -m http.server 8000 --bind 0.0.0.0 || python -m SimpleHTTPServer 8000

start-server:
	@echo "🚀 Starting server in background..."
	@lsof -ti:8000 | xargs kill -9 2>/dev/null || true
	@python3 -m http.server 8000 --bind 0.0.0.0 > server.log 2>&1 &
	@sleep 2
	@echo "✅ Server running on http://localhost:8000"

stop-server:
	@echo "🛑 Stopping server..."
	@lsof -ti:8000 | xargs kill -9 2>/dev/null || true
	@echo "✅ Server stopped"

check-logs:
	@tail -20 server.log 2>/dev/null || echo "No server.log found"

# Game testing
queen-test:
	@echo "👑 Opening Queen movement test..."
	@open http://localhost:8000/queen-test.html || xdg-open http://localhost:8000/queen-test.html || echo "Navigate to: http://localhost:8000/queen-test.html"

# Utilities
device-test:
	@echo "📲 Your IP addresses:"
	@ifconfig | grep "inet " | grep -v 127.0.0.1 | head -3 2>/dev/null || ip addr | grep "inet " | grep -v 127.0.0.1 | head -3 2>/dev/null || echo "Run 'ifconfig' to find IP"

clean-cache:
	@echo "🧹 Cache Clearing:"
	@echo "  Desktop: Ctrl+Shift+R (Win/Linux) or Cmd+Shift+R (Mac)"
	@echo "  Mobile: Clear browser data in settings"

help:
	@echo "👑 Puffy Queen - Development Commands"
	@echo ""
	@echo "Server:"
	@echo "  make serve        Start dev server (foreground)"
	@echo "  make start-server Start dev server (background)"
	@echo "  make stop-server  Stop background server"
	@echo "  make check-logs   View server logs"
	@echo ""
	@echo "Testing:"
	@echo "  make queen-test   Test queen movement"
	@echo "  make device-test  Show IP for mobile testing"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean-cache  Cache clearing instructions"
	@echo "  make help         Show this help"

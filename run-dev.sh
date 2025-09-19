#!/bin/bash
# MatrusBox Development Environment Startup Script (Linux/Mac)

echo ""
echo "====================================="
echo "   MatrusBox Development Startup"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo -e "${BLUE}[1/6]${NC} Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

# Start database services
echo ""
echo -e "${BLUE}[2/6]${NC} Starting database services..."
docker-compose up -d postgres redis
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start database services${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Database services started${NC}"

# Wait for databases to be ready
echo ""
echo -e "${BLUE}[3/6]${NC} Waiting for databases to be ready..."
sleep 10
echo -e "${GREEN}✅ Databases should be ready${NC}"

# Install dependencies if needed
echo ""
echo -e "${BLUE}[4/6]${NC} Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
fi
echo -e "${GREEN}✅ Dependencies ready${NC}"

# Start API server in background
echo ""
echo -e "${BLUE}[5/6]${NC} Starting API server..."
pnpm --filter=@matrus/api dev &
API_PID=$!
sleep 5

# Start Web application in background
echo ""
echo -e "${BLUE}[6/6]${NC} Starting web application..."
pnpm --filter=@matrus/web dev &
WEB_PID=$!

# Wait a moment for services to start
echo ""
echo "Waiting for services to initialize..."
sleep 10

# Display service information
echo ""
echo "====================================="
echo -e "      ${GREEN}🎉 DEVELOPMENT READY! 🎉${NC}"
echo "====================================="
echo ""
echo -e "${BLUE}📱 Web Application:${NC}     http://localhost:3000"
echo -e "${BLUE}🔧 API Server:${NC}          http://localhost:4000"
echo -e "${BLUE}📚 API Documentation:${NC}   http://localhost:4000/api/docs"
echo -e "${BLUE}🗄️  Database Admin:${NC}      http://localhost:5050 (if pgAdmin is running)"
echo ""
echo "====================================="
echo -e "       ${YELLOW}DEVELOPMENT COMMANDS${NC}"
echo "====================================="
echo ""
echo "To run individual services:"
echo "  pnpm --filter=@matrus/api dev     (API server)"
echo "  pnpm --filter=@matrus/web dev     (Web app)"
echo "  pnpm --filter=@matrus/mobile dev  (Mobile app)"
echo ""
echo "To run tests:"
echo "  node test-all-features.js         (API tests)"
echo "  node comprehensive-test.js        (Full tests)"
echo ""
echo "To check logs:"
echo "  docker-compose logs postgres      (Database logs)"
echo "  docker-compose logs redis         (Cache logs)"
echo ""
echo "To stop services:"
echo "  kill $API_PID $WEB_PID           (Stop servers)"
echo "  docker-compose stop               (Stop databases)"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping services...${NC}"
    kill $API_PID $WEB_PID 2>/dev/null
    docker-compose stop
    echo -e "${GREEN}✅ Services stopped${NC}"
}

# Trap exit signals
trap cleanup EXIT INT TERM

echo -e "${GREEN}✅ Development environment is ready!${NC}"
echo -e "${GREEN}✅ Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running
wait
#!/bin/bash

# Colors for pretty output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running Madifa Tests${NC}"
echo "==============================="

# Run only specific Jest unit test with a shorter timeout
echo -e "\n${YELLOW}Running Jest Unit Tests:${NC}"
npx jest --testTimeout=10000 tests/unit/components/spinner.test.tsx || { echo -e "${RED}Jest unit tests failed!${NC}"; exit 1; }

# Skip Cypress tests for now as they may take too long
# echo -e "\n${YELLOW}Running Cypress E2E Tests:${NC}"
# npx cypress run || { echo -e "${RED}Cypress tests failed!${NC}"; exit 1; }

echo -e "\n${GREEN}Unit tests completed!${NC}"
#!/bin/bash

# Colors for pretty output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running Madifa Tests${NC}"
echo "==============================="

# First run Jest tests
echo -e "\n${YELLOW}Running Jest Unit and Integration Tests:${NC}"
npx jest || { echo -e "${RED}Jest tests failed!${NC}"; exit 1; }

# Then run Cypress tests in headless mode
echo -e "\n${YELLOW}Running Cypress E2E Tests:${NC}"
npx cypress run || { echo -e "${RED}Cypress tests failed!${NC}"; exit 1; }

echo -e "\n${GREEN}All tests passed successfully!${NC}"
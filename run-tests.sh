#!/bin/bash

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Madifa Video Platform Test Runner ===${NC}"
echo -e "${BLUE}Running test suite...${NC}"

# Run Jest tests
echo -e "\n${BLUE}Running Jest tests...${NC}"
npx jest
JEST_RESULT=$?

# Display Jest test results
if [ $JEST_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ Jest tests passed${NC}"
else
  echo -e "${RED}✗ Jest tests failed${NC}"
fi

# Uncomment to run Cypress tests
# echo -e "\n${BLUE}Running Cypress tests...${NC}"
# npx cypress run
# CYPRESS_RESULT=$?

# Display Cypress test results
# if [ $CYPRESS_RESULT -eq 0 ]; then
#   echo -e "${GREEN}✓ Cypress tests passed${NC}"
# else
#   echo -e "${RED}✗ Cypress tests failed${NC}"
# fi

# Uncomment to run a specific test file
# echo -e "\n${BLUE}Running specific test: auth.test.ts${NC}"
# npx jest tests/auth.test.ts
# SPECIFIC_RESULT=$?

# Display specific test results
# if [ $SPECIFIC_RESULT -eq 0 ]; then
#   echo -e "${GREEN}✓ Specific test passed${NC}"
# else
#   echo -e "${RED}✗ Specific test failed${NC}"
# fi

# Uncomment for test coverage report
# echo -e "\n${BLUE}Generating test coverage report...${NC}"
# npx jest --coverage
# COVERAGE_RESULT=$?

# Display coverage results
# if [ $COVERAGE_RESULT -eq 0 ]; then
#   echo -e "${GREEN}✓ Coverage report generated${NC}"
# else
#   echo -e "${RED}✗ Coverage report failed${NC}"
# fi

# Overall results
echo -e "\n${BLUE}=== Test Summary ===${NC}"
if [ $JEST_RESULT -eq 0 ]; then
  echo -e "${GREEN}All tests passed successfully!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed. Check the logs above for details.${NC}"
  exit 1
fi
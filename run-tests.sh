#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}     MADIFA PLATFORM TEST RUNNER        ${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Date: $(date)"
echo -e "${BLUE}----------------------------------------${NC}"

# Function to run a test and check its result
run_test() {
  local test_name=$1
  local test_file=$2
  
  echo -e "\n${YELLOW}📋 Running $test_name...${NC}"
  npx tsx server/$test_file
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ $test_name Completed Successfully${NC}"
    return 0
  else
    echo -e "${RED}❌ $test_name Failed${NC}"
    return 1
  fi
}

# Check if a specific test was requested
if [ "$1" != "" ]; then
  case "$1" in
    "auth")
      run_test "Authentication Tests" "test-auth.ts"
      ;;
    "vimeo")
      run_test "Vimeo Sync Tests" "test-vimeo-sync.ts"
      ;;
    "categories")
      run_test "Category Management Tests" "test-categories.ts"
      ;;
    "all")
      run_test "All Tests" "testSuite.ts"
      ;;
    *)
      echo -e "${RED}Unknown test: $1${NC}"
      echo -e "Available tests: auth, vimeo, categories, all"
      exit 1
      ;;
  esac
  exit $?
fi

# Run all tests by default
echo -e "\n${YELLOW}Running complete test suite...${NC}"
npx tsx server/testSuite.ts

if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}✅ ALL TESTS COMPLETED SUCCESSFULLY${NC}"
else
  echo -e "\n${RED}❌ SOME TESTS FAILED${NC}"
  exit 1
fi

echo -e "${BLUE}----------------------------------------${NC}"
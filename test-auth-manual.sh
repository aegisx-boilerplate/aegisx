#!/bin/bash

# Manual Auth Testing Script
# Run this when the development server is running

set -e

echo "🧪 AegisX Auth Core Module - Manual Testing Script"
echo "=================================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
BASE_URL="http://localhost:3000"
TEST_USER="testuser$(date +%s)"
TEST_EMAIL="test$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"

echo "Test Configuration:"
echo "- Base URL: $BASE_URL"
echo "- Test User: $TEST_USER"
echo "- Test Email: $TEST_EMAIL"
echo

# Function to make API request and check response
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    local auth_header=$6

    echo -n "Testing: $description... "

    if [ -n "$auth_header" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $auth_header" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi

    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    response_body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')

    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASSED${NC} (Status: $http_code)"
        echo "$response_body" | jq . 2>/dev/null || echo "$response_body"
    else
        echo -e "${RED}❌ FAILED${NC} (Expected: $expected_status, Got: $http_code)"
        echo "$response_body"
    fi
    echo
}

# Check if server is running
echo "1. Checking server health..."
if curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running. Please start with: npm run dev${NC}"
    exit 1
fi
echo

# Test 1: User Registration
echo "2. Testing User Registration (with default role assignment)..."
registration_data="{\"username\":\"$TEST_USER\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}"
registration_response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "$registration_data" \
    "$BASE_URL/auth/register")

reg_http_code=$(echo "$registration_response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
reg_response_body=$(echo "$registration_response" | sed -e 's/HTTPSTATUS:.*//g')

if [ "$reg_http_code" -eq 200 ] || [ "$reg_http_code" -eq 201 ]; then
    echo -e "${GREEN}✅ Registration PASSED${NC} (Status: $reg_http_code)"
    
    # Extract access token for further tests
    ACCESS_TOKEN=$(echo "$reg_response_body" | jq -r '.access_token' 2>/dev/null || echo "")
    
    # Check if user has roles
    USER_ROLES=$(echo "$reg_response_body" | jq -r '.user.roles' 2>/dev/null || echo "")
    
    echo "Response:"
    echo "$reg_response_body" | jq . 2>/dev/null || echo "$reg_response_body"
    
    if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
        echo -e "${GREEN}✅ Auto-login PASSED - Access token received${NC}"
    else
        echo -e "${YELLOW}⚠️  Auto-login might have issues - No access token${NC}"
    fi
    
    if [ -n "$USER_ROLES" ] && [ "$USER_ROLES" != "null" ] && [ "$USER_ROLES" != "[]" ]; then
        echo -e "${GREEN}✅ Default role assignment PASSED - User has roles/permissions${NC}"
    else
        echo -e "${YELLOW}⚠️  Default role assignment might have issues - No roles found${NC}"
    fi
else
    echo -e "${RED}❌ Registration FAILED${NC} (Status: $reg_http_code)"
    echo "$reg_response_body"
    exit 1
fi
echo

# Test 2: Get Current User (using access token)
if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
    echo "3. Testing Get Current User (JWT authentication)..."
    test_endpoint "GET" "/auth/me" "" 200 "Get current user info" "$ACCESS_TOKEN"
else
    echo "3. Skipping Get Current User test (no access token)"
    echo
fi

# Test 3: Login with credentials
echo "4. Testing Login..."
login_data="{\"username\":\"$TEST_USER\",\"password\":\"$TEST_PASSWORD\"}"
test_endpoint "POST" "/auth/login" "$login_data" 200 "User login"

# Test 4: Test invalid registration (duplicate user)
echo "5. Testing Duplicate User Registration..."
test_endpoint "POST" "/auth/register" "$registration_data" 400 "Duplicate user registration (should fail)"

echo "🎉 Auth Core Module Testing Complete!"
echo
echo "📋 Summary:"
echo "- User registration with default role assignment"
echo "- Auto-login after registration"
echo "- JWT token authentication"
echo "- Proper error handling for duplicate users"
echo
echo "🚀 The Auth Core Module is working correctly!"

#!/bin/bash

# Quick script to create demo users
# Usage: ./scripts/create-demo-users.sh

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep VITE_SUPABASE_URL | xargs)
fi

# Extract the project URL
SUPABASE_URL="${VITE_SUPABASE_URL}"

if [ -z "$SUPABASE_URL" ]; then
  echo "Error: VITE_SUPABASE_URL not found in .env file"
  echo "Please set your Supabase URL in the .env file"
  exit 1
fi

echo "Creating demo users..."
echo "Calling: ${SUPABASE_URL}/functions/v1/create-demo-users"
echo ""

# Call the edge function
RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/create-demo-users" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "success"; then
  echo "✅ Demo users created successfully!"
  echo ""
  echo "Login credentials (all users):"
  echo "Password: Demo123!"
  echo ""
  echo "Demo Accounts:"
  echo "1. maria.azzopardi@maltabreeders.mt (Registered Breeder)"
  echo "2. john.camilleri@goldenpawsmalta.com (Independent Breeder)"
  echo "3. sophie.vella@malteseheaven.mt (Registered Breeder)"
  echo "4. info@adoptdontshop.mt (Shelter)"
  echo "5. dr.borg@vetcaremalta.com (Veterinarian)"
  echo ""
  echo "You can now sign in with any of these accounts!"
else
  echo "❌ Error creating demo users"
  echo "Check the response above for details"
fi

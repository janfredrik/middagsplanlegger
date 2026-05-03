#!/usr/bin/env bash
set -euo pipefail

PB_URL="${PB_URL:-http://10.0.0.100:3110}"

echo "=== Middagsplanlegger – PocketBase oppsett ==="
echo "Mål: $PB_URL"
echo ""

if ! command -v jq &>/dev/null; then
  echo "Feil: jq er påkrevd. Installer med: brew install jq"
  exit 1
fi

# --- Admin-oppretting / innlogging ---
read -rp "Admin e-post: " ADMIN_EMAIL
read -rsp "Admin passord (min 10 tegn): " ADMIN_PASSWORD
echo ""
read -rsp "Bekreft passord: " ADMIN_PASSWORD_CONFIRM
echo ""
echo ""

echo "Prøver å opprette admin-bruker (fungerer kun hvis ingen admin finnes)..."
curl -s -X POST "$PB_URL/api/collections/_superusers/records" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\",\"passwordConfirm\":\"$ADMIN_PASSWORD_CONFIRM\"}" \
  >/dev/null || true

echo "Logger inn..."
AUTH_RESPONSE=$(curl -s -X POST "$PB_URL/api/collections/_superusers/auth-with-password" \
  -H "Content-Type: application/json" \
  -d "{\"identity\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
  echo "Feil: Kunne ikke logge inn. Sjekk e-post og passord."
  echo "Svar fra server: $(echo "$AUTH_RESPONSE" | jq -r '.message // .')"
  exit 1
fi

echo "✓ Innlogget"
echo ""

# --- Hjelpefunksjon ---
create_collection() {
  local name=$1
  local payload=$2

  EXISTING=$(curl -s -H "Authorization: $TOKEN" "$PB_URL/api/collections/$name" | jq -r '.id // empty')
  if [ -n "$EXISTING" ]; then
    echo "  ~ $name (finnes allerede)"
    return 0
  fi

  RESPONSE=$(curl -s -X POST "$PB_URL/api/collections" \
    -H "Authorization: $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$payload")

  ID=$(echo "$RESPONSE" | jq -r '.id // empty')
  if [ -n "$ID" ]; then
    echo "  ✓ $name"
  else
    echo "  ✗ $name – $(echo "$RESPONSE" | jq -r '.message // .')"
    return 1
  fi
}

echo "Oppretter collections..."

# 1. family_members
create_collection "family_members" '{
  "name": "family_members",
  "type": "base",
  "fields": [
    {"name": "name",         "type": "text",  "required": true},
    {"name": "avatar_color", "type": "text",  "required": false},
    {"name": "email",        "type": "email", "required": false}
  ]
}'

FM_ID=$(curl -s -H "Authorization: $TOKEN" "$PB_URL/api/collections/family_members" | jq -r '.id')

# 2. shopping_categories
create_collection "shopping_categories" '{
  "name": "shopping_categories",
  "type": "base",
  "fields": [
    {"name": "name",       "type": "text",   "required": true},
    {"name": "emoji",      "type": "text",   "required": false},
    {"name": "sort_order", "type": "number", "required": false}
  ]
}'

SC_ID=$(curl -s -H "Authorization: $TOKEN" "$PB_URL/api/collections/shopping_categories" | jq -r '.id')

# 3. shopping_items
create_collection "shopping_items" "$(jq -n \
  --arg sc "$SC_ID" \
  --arg fm "$FM_ID" \
  '{
    "name": "shopping_items",
    "type": "base",
    "fields": [
      {"name": "name",     "type": "text", "required": true},
      {"name": "quantity", "type": "text", "required": false},
      {"name": "checked",  "type": "bool", "required": false},
      {"name": "category", "type": "relation", "required": false,
        "collectionId": $sc, "maxSelect": 1, "cascadeDelete": false},
      {"name": "added_by", "type": "relation", "required": false,
        "collectionId": $fm, "maxSelect": 1, "cascadeDelete": false},
      {"name": "tags", "type": "json", "required": false}
    ]
  }')"

# 4. meals
create_collection "meals" '{
  "name": "meals",
  "type": "base",
  "fields": [
    {"name": "name",        "type": "text", "required": true},
    {"name": "description", "type": "text", "required": false},
    {"name": "category",    "type": "text", "required": false}
  ]
}'

MEALS_ID=$(curl -s -H "Authorization: $TOKEN" "$PB_URL/api/collections/meals" | jq -r '.id')

# 5. meal_ingredients
create_collection "meal_ingredients" "$(jq -n \
  --arg meals "$MEALS_ID" \
  --arg sc "$SC_ID" \
  '{
    "name": "meal_ingredients",
    "type": "base",
    "fields": [
      {"name": "meal", "type": "relation", "required": true,
        "collectionId": $meals, "maxSelect": 1, "cascadeDelete": true},
      {"name": "name",     "type": "text", "required": true},
      {"name": "quantity", "type": "text", "required": false},
      {"name": "category", "type": "relation", "required": false,
        "collectionId": $sc, "maxSelect": 1, "cascadeDelete": false}
    ]
  }')"

# 6. meal_plan
create_collection "meal_plan" "$(jq -n \
  --arg meals "$MEALS_ID" \
  '{
    "name": "meal_plan",
    "type": "base",
    "fields": [
      {"name": "date", "type": "text",     "required": true},
      {"name": "meal", "type": "relation", "required": true,
        "collectionId": $meals, "maxSelect": 1, "cascadeDelete": false}
    ]
  }')"

echo ""

# --- Seed: shopping_categories ---
EXISTING_CATS=$(curl -s -H "Authorization: $TOKEN" \
  "$PB_URL/api/collections/shopping_categories/records?perPage=1" | jq -r '.totalItems')

if [ "$EXISTING_CATS" -eq 0 ]; then
  echo "Legger inn standard handleliste-kategorier..."
  seed_category() {
    curl -s -X POST "$PB_URL/api/collections/shopping_categories/records" \
      -H "Authorization: $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\":\"$1\",\"emoji\":\"$2\",\"sort_order\":$3}" >/dev/null
    echo "  ✓ $2 $1"
  }
  seed_category "Frukt og grønt"  "🥦" 1
  seed_category "Kjøtt og fisk"   "🥩" 2
  seed_category "Meieri"          "🥛" 3
  seed_category "Brød og bakst"   "🍞" 4
  seed_category "Tørrvarer"       "🥫" 5
  seed_category "Frysevarer"      "🧊" 6
  seed_category "Drikke"          "🥤" 7
  seed_category "Snacks"          "🍿" 8
  seed_category "Annet"           "🛒" 9
else
  echo "  ~ Kategorier finnes allerede, hopper over"
fi

echo ""
echo "=== Oppsett fullført! ==="
echo "Åpne $PB_URL/_/ for å administrere PocketBase."

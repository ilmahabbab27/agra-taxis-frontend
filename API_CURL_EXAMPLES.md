# Agra Taxis API - Curl Testing Guide

Copy-paste curl commands to test all API endpoints.

**API Base:** `https://agrataxis.com/api`

---

## 1. Get All Vehicles

```bash
curl -X GET "https://agrataxis.com/api/vehicles" \
  -H "Content-Type: application/json"
```

---

## 2. Get Vehicles by Passenger Count

```bash
curl -X GET "https://agrataxis.com/api/vehicles?passengers=5" \
  -H "Content-Type: application/json"
```

---

## 3. Location Autocomplete (Suggest)

```bash
curl -X POST "https://agrataxis.com/api/locations/suggest" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "kan",
    "limit": 5
  }'
```

**More Examples:**
```bash
# Colombo
curl -X POST "https://agrataxis.com/api/locations/suggest" \
  -H "Content-Type: application/json" \
  -d '{"query": "col", "limit": 5}'

# Galle
curl -X POST "https://agrataxis.com/api/locations/suggest" \
  -H "Content-Type: application/json" \
  -d '{"query": "gal", "limit": 5}'

# Negombo
curl -X POST "https://agrataxis.com/api/locations/suggest" \
  -H "Content-Type: application/json" \
  -d '{"query": "neg", "limit": 5}'
```

---

## 4. Validate Location

```bash
curl -X POST "https://agrataxis.com/api/bot/location" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "colombo",
    "type": "pickup"
  }'
```

**More Examples:**
```bash
# Validate Kandy
curl -X POST "https://agrataxis.com/api/bot/location" \
  -H "Content-Type: application/json" \
  -d '{"location": "kandy", "type": "destination"}'

# Validate with typo (should autocorrect)
curl -X POST "https://agrataxis.com/api/bot/location" \
  -H "Content-Type: application/json" \
  -d '{"location": "colmbo", "type": "pickup"}'

# Validate stop
curl -X POST "https://agrataxis.com/api/bot/location" \
  -H "Content-Type: application/json" \
  -d '{"location": "negombo", "type": "stop"}'
```

---

## 5. Calculate Distance

```bash
curl -X POST "https://agrataxis.com/api/locations/distance" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Colombo",
    "to": "Kandy"
  }'
```

**More Examples:**
```bash
# Colombo to Galle
curl -X POST "https://agrataxis.com/api/locations/distance" \
  -H "Content-Type: application/json" \
  -d '{"from": "Colombo", "to": "Galle"}'

# Kandy to Negombo
curl -X POST "https://agrataxis.com/api/locations/distance" \
  -H "Content-Type: application/json" \
  -d '{"from": "Kandy", "to": "Negombo"}'

# Colombo to Jaffna (long distance)
curl -X POST "https://agrataxis.com/api/locations/distance" \
  -H "Content-Type: application/json" \
  -d '{"from": "Colombo", "to": "Jaffna"}'
```

---

## 6. Calculate Fare - Passenger (One Way)

```bash
curl -X POST "https://agrataxis.com/api/bot/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Passenger",
    "pickup": "Colombo",
    "destination": "Kandy",
    "vehicle": "Toyota Hiace",
    "passengers": 5,
    "acOption": "AC",
    "days": 1,
    "tripType": "One Way"
  }'
```

---

## 7. Calculate Fare - Passenger (Round Trip)

```bash
curl -X POST "https://agrataxis.com/api/bot/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Passenger",
    "pickup": "Colombo",
    "destination": "Kandy",
    "vehicle": "Toyota Hiace",
    "passengers": 5,
    "acOption": "AC",
    "days": 1,
    "tripType": "Round Trip"
  }'
```

---

## 8. Calculate Fare - Passenger with Stops

```bash
curl -X POST "https://agrataxis.com/api/bot/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Passenger",
    "pickup": "Colombo",
    "destination": "Kandy",
    "stops": ["Negombo", "Kurunegala"],
    "vehicle": "Toyota Hiace",
    "passengers": 5,
    "acOption": "AC",
    "days": 1,
    "tripType": "One Way"
  }'
```

---

## 9. Calculate Fare - Non-AC

```bash
curl -X POST "https://agrataxis.com/api/bot/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Passenger",
    "pickup": "Colombo",
    "destination": "Kandy",
    "vehicle": "Toyota Hiace",
    "passengers": 5,
    "acOption": "Non-AC",
    "days": 1,
    "tripType": "One Way"
  }'
```

---

## 10. Calculate Fare - Lorry (7ft)

```bash
curl -X POST "https://agrataxis.com/api/bot/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Lorry",
    "pickup": "Colombo",
    "destination": "Kandy",
    "lorryType": "7ft",
    "days": 1,
    "tripType": "One Way"
  }'
```

---

## 11. Calculate Fare - Lorry (10.5ft)

```bash
curl -X POST "https://agrataxis.com/api/bot/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Lorry",
    "pickup": "Colombo",
    "destination": "Kandy",
    "lorryType": "10.5ft",
    "days": 1,
    "tripType": "One Way"
  }'
```

---

## 12. Calculate Fare - Multiple Passengers

```bash
curl -X POST "https://agrataxis.com/api/bot/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Passenger",
    "pickup": "Colombo",
    "destination": "Kandy",
    "vehicle": "Toyota Coaster",
    "passengers": 32,
    "acOption": "AC",
    "days": 1,
    "tripType": "One Way"
  }'
```

---

## Error Test Cases

### Empty Location
```bash
curl -X POST "https://agrataxis.com/api/bot/location" \
  -H "Content-Type: application/json" \
  -d '{"location": ""}'
```

Expected: `EMPTY_INPUT` error

### Invalid Location
```bash
curl -X POST "https://agrataxis.com/api/bot/location" \
  -H "Content-Type: application/json" \
  -d '{"location": "xyz123"}'
```

Expected: `LOCATION_NOT_FOUND` error with suggestions

### Missing Parameters
```bash
curl -X POST "https://agrataxis.com/api/bot/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Passenger",
    "pickup": "Colombo"
  }'
```

Expected: `MISSING_LOCATIONS` error

### Invalid Vehicle
```bash
curl -X POST "https://agrataxis.com/api/bot/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Passenger",
    "pickup": "Colombo",
    "destination": "Kandy",
    "vehicle": "NonExistentVehicle",
    "passengers": 5,
    "acOption": "AC",
    "tripType": "One Way"
  }'
```

Expected: `VEHICLE_NOT_FOUND` error

---

## Complete Workflow Test

```bash
# Step 1: Get vehicles for 5 passengers
echo "=== Step 1: Get Vehicles ==="
curl -X GET "https://agrataxis.com/api/vehicles?passengers=5" \
  -H "Content-Type: application/json"

echo -e "\n\n=== Step 2: Validate Pickup ==="
curl -X POST "https://agrataxis.com/api/bot/location" \
  -H "Content-Type: application/json" \
  -d '{"location": "colombo", "type": "pickup"}'

echo -e "\n\n=== Step 3: Validate Destination ==="
curl -X POST "https://agrataxis.com/api/bot/location" \
  -H "Content-Type: application/json" \
  -d '{"location": "kandy", "type": "destination"}'

echo -e "\n\n=== Step 4: Calculate Distance ==="
curl -X POST "https://agrataxis.com/api/locations/distance" \
  -H "Content-Type: application/json" \
  -d '{"from": "Colombo", "to": "Kandy"}'

echo -e "\n\n=== Step 5: Calculate Fare ==="
curl -X POST "https://agrataxis.com/api/bot/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "Passenger",
    "pickup": "Colombo",
    "destination": "Kandy",
    "vehicle": "Toyota Hiace",
    "passengers": 5,
    "acOption": "AC",
    "days": 1,
    "tripType": "One Way"
  }'
```

---

## Pretty Print JSON Response

Add `| jq` at the end to format JSON nicely:

```bash
curl -X GET "https://agrataxis.com/api/vehicles?passengers=5" \
  -H "Content-Type: application/json" | jq
```

Or use `python -m json.tool`:

```bash
curl -X GET "https://agrataxis.com/api/vehicles?passengers=5" \
  -H "Content-Type: application/json" | python -m json.tool
```

---

## Save Response to File

```bash
curl -X GET "https://agrataxis.com/api/vehicles?passengers=5" \
  -H "Content-Type: application/json" > vehicles_response.json
```

---

## Test with Headers

```bash
curl -X POST "https://agrataxis.com/api/bot/calculate" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "User-Agent: AgraTaxisBot/1.0" \
  -d '{
    "serviceType": "Passenger",
    "pickup": "Colombo",
    "destination": "Kandy",
    "vehicle": "Toyota Hiace",
    "passengers": 5,
    "acOption": "AC",
    "tripType": "One Way"
  }'
```

---

## Using Variables in Curl

```bash
#!/bin/bash

API="https://agrataxis.com/api"
PICKUP="Colombo"
DESTINATION="Kandy"
VEHICLE="Toyota Hiace"
PASSENGERS=5

curl -X POST "$API/bot/calculate" \
  -H "Content-Type: application/json" \
  -d "{
    \"serviceType\": \"Passenger\",
    \"pickup\": \"$PICKUP\",
    \"destination\": \"$DESTINATION\",
    \"vehicle\": \"$VEHICLE\",
    \"passengers\": $PASSENGERS,
    \"acOption\": \"AC\",
    \"tripType\": \"One Way\"
  }"
```

---

## Insomnia/Postman Import

Create new request in Insomnia/Postman:

**Method:** POST
**URL:** `https://agrataxis.com/api/bot/calculate`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "serviceType": "Passenger",
  "pickup": "Colombo",
  "destination": "Kandy",
  "vehicle": "Toyota Hiace",
  "passengers": 5,
  "acOption": "AC",
  "days": 1,
  "tripType": "One Way"
}
```

---

## Testing Tips

✅ **Always include Content-Type header** for POST requests
✅ **Use proper JSON formatting** in request body
✅ **Test error cases** first to understand error responses
✅ **Save successful responses** for reference
✅ **Use variables** for common values
✅ **Test all vehicle types** (AC/Non-AC/Lorry)
✅ **Test all trip types** (One Way/Round Trip)
✅ **Test with stops** to verify calculation
✅ **Test various locations** to check validation

---

## Quick Test Locations

```bash
# Major cities good for testing
COLOMBO="Colombo"
KANDY="Kandy"
GALLE="Galle"
NEGOMBO="Negombo"
KURUNEGALA="Kurunegala"
```

---

**Happy testing!** 🚕

For more info: [API_DOCUMENTATION_AGRATAXIS.md](API_DOCUMENTATION_AGRATAXIS.md)

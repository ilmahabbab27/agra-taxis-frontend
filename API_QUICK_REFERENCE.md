# Agra Taxis API - Quick Reference

Quick reference card for all API endpoints at **agrataxis.com**.

---

## All Endpoints at a Glance

```
https://agrataxis.com/api
├── GET    /vehicles
├── GET    /vehicles?passengers=5
├── POST   /locations/suggest
├── POST   /bot/location
├── POST   /locations/distance
└── POST   /bot/calculate
```

---

## 1️⃣ Get Vehicles

```bash
GET https://agrataxis.com/api/vehicles?passengers=5

Response: {
  "success": true,
  "data": [ { "name": "Toyota Hiace", "seats": 14, ... } ],
  "count": 5
}
```

---

## 2️⃣ Location Autocomplete

```bash
POST https://agrataxis.com/api/locations/suggest

{
  "query": "kan",
  "limit": 5
}

Response: {
  "success": true,
  "suggestions": [ { "location": "Kandy", "confidence": 0.95 } ]
}
```

---

## 3️⃣ Validate Location

```bash
POST https://agrataxis.com/api/bot/location

{
  "location": "colombo",
  "type": "pickup"
}

Response: {
  "success": true,
  "location": "Colombo",
  "coordinates": { "lat": 6.9271, "lng": 79.8612 },
  "isHillCountry": false,
  "confidence": 0.98
}
```

---

## 4️⃣ Calculate Distance

```bash
POST https://agrataxis.com/api/locations/distance

{
  "from": "Colombo",
  "to": "Kandy"
}

Response: {
  "success": true,
  "distance_km": 115,
  "is_hill_country_route": true,
  "estimated_travel_time_hours": 2.5
}
```

---

## 5️⃣ Calculate Fare

```bash
POST https://agrataxis.com/api/bot/calculate

{
  "serviceType": "Passenger",
  "pickup": "Colombo",
  "destination": "Kandy",
  "vehicle": "Toyota Hiace",
  "passengers": 5,
  "acOption": "AC",
  "days": 1,
  "tripType": "One Way",
  "stops": ["Negombo"],
  "date": "2026-06-15",
  "time": "10:00"
}

Response: {
  "success": true,
  "estimatedFare": 20700,
  "distance": 115,
  "breakdown": {
    "baseFare": 18000,
    "hillSurcharge": 2700,
    "total": 20700
  }
}
```

---

## Common Use Cases

### Quick Quote (No Auth Required)
```
1. POST /bot/location (validate pickup)
2. POST /bot/location (validate destination)
3. GET /vehicles?passengers=5 (get vehicles)
4. POST /bot/calculate (get estimate)

Time: ~500ms
Cost: Free
```

### With Stops
```
1. POST /bot/location (pickup)
2. POST /bot/location (destination)
3. POST /bot/location (stop 1)
4. POST /bot/location (stop 2)
5. GET /vehicles
6. POST /bot/calculate (with stops array)

Total Distance = sum of all legs
Fare = Total Distance × Rate
```

### Lorry Booking
```
{
  "serviceType": "Lorry",
  "pickup": "Colombo",
  "destination": "Kandy",
  "lorryType": "7ft",
  "tripType": "One Way"
}
```

---

## Pricing Quick Reference

| Service | Normal | Hill Country |
|---------|--------|--------------|
| AC/km | Rs. 180 | Rs. 220 |
| Non-AC/km | Rs. 150 | Rs. 180 |
| Lorry 7ft | Start 2,500 + 160/km | +10/km |
| Lorry 10.5ft | Start 6,000 + 230/km | +10/km |

---

## HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Valid request processed |
| 400 | Bad Request | Empty location field |
| 404 | Not Found | Location doesn't exist |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Database connection failed |

---

## Error Examples

### Location Not Found
```json
{
  "success": false,
  "error": "LOCATION_NOT_FOUND",
  "suggestions": [
    { "location": "Colombo", "confidence": 0.90 }
  ]
}
```

### Invalid Input
```json
{
  "success": false,
  "error": "EMPTY_INPUT",
  "message": "Location cannot be empty"
}
```

### Calculation Error
```json
{
  "success": false,
  "error": "INVALID_LOCATION",
  "message": "Invalid pickup or destination location"
}
```

---

## Supported Locations (15+)

- Colombo, Kandy, Galle, Negombo, Chilaw
- Kurunegala, Matara, Kalutara, Anuradhapura, Jaffna
- Batticaloa, Trincomalee, Nuwara Eliya, Ratnapura, Badulla

---

## API Usage Tips

✅ **Cache vehicle list** - changes less frequently
✅ **Debounce autocomplete** - call every 300ms on user input
✅ **Validate destination after selection** - not on every keystroke
✅ **Show real-time distance** - call distance immediately after destination
✅ **Calculate fare only once** - not after every field change

---

## JavaScript Snippet

```javascript
// Validate location and calculate fare
const response = await fetch('https://agrataxis.com/api/bot/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    serviceType: 'Passenger',
    pickup: 'Colombo',
    destination: 'Kandy',
    vehicle: 'Toyota Hiace',
    passengers: 5,
    acOption: 'AC',
    tripType: 'One Way'
  })
});

const { estimatedFare } = await response.json();
console.log(`Fare: Rs. ${estimatedFare}`);
```

---

## Python Snippet

```python
import requests

response = requests.post(
  'https://agrataxis.com/api/bot/calculate',
  json={
    'serviceType': 'Passenger',
    'pickup': 'Colombo',
    'destination': 'Kandy',
    'vehicle': 'Toyota Hiace',
    'passengers': 5,
    'acOption': 'AC',
    'tripType': 'One Way'
  }
)

estimate = response.json()
print(f"Fare: Rs. {estimate['estimatedFare']}")
```

---

## Contact

📞 **Phone:** +94 72 3003 000
💬 **WhatsApp:** https://wa.me/94723003000
📧 **Email:** info@agrataxis.com
🌐 **Website:** https://agrataxis.com

---

**For detailed API docs:** See [API_DOCUMENTATION_AGRATAXIS.md](API_DOCUMENTATION_AGRATAXIS.md)

**API Version:** 1.0
**Last Updated:** 2026-06-09

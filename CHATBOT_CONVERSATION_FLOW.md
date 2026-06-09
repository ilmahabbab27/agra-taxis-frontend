# Chatbot Conversation Flow Guide

Complete guide showing chatbot questions, user inputs, and when API calls are made.

---

## Conversation Structure

```
START
  ↓
Q1: Service Type (Passenger/Lorry)
  ↓ USER INPUT
  ↓
Q2: Pickup Location
  ↓ USER INPUT → API: https://agrataxis.com/backend/api/bot/location (validate)
  ↓
Q3: Destination Location
  ↓ USER INPUT → API: https://agrataxis.com/backend/api/bot/location (validate)
  ↓
Q4: Passengers (1-60) [if Passenger]
  ↓ USER INPUT
  ↓
Q5: Vehicle Selection
  ↓ [API: https://agrataxis.com/backend/api/vehicles called with passenger count]
  ↓ USER INPUT
  ↓
Q6: AC/Non-AC [if available]
  ↓ USER INPUT
  ↓
Q7: Trip Type (One Way/Round Trip)
  ↓ USER INPUT
  ↓
Q8: Add Stops? (Optional)
  ↓ USER INPUT → API: https://agrataxis.com/backend/api/bot/location (validate stops)
  ↓
CALCULATE FARE
  ↓ API: /api/bot/calculate (send all data)
  ↓ DISPLAY ESTIMATE
  ↓
Q9: Confirm & Book (WhatsApp/Phone)
```

---

## Detailed Question-by-Question

### Q1: Service Type
**Chatbot asks:**
```
👋 Welcome to Agra Taxis!

What service do you need?
1️⃣ Passenger (Cars, Minibus)
2️⃣ Lorry (Trucks, Transport)

Please reply: Passenger or Lorry
```

**User inputs:**
```
Passenger
```

**Bot response:**
```
✓ Great! Passenger service selected.

Now, where are you picking up from?
```

**Data stored:**
```
serviceType = "Passenger"
```

**API call:** None yet

---

### Q2: Pickup Location
**Chatbot asks:**
```
📍 Pickup Location

Where should we pick you up from?
(e.g., Colombo, Kandy, Galle, etc.)
```

**User inputs:**
```
colombo
```

**Bot shows suggestions (optional):**
```
Did you mean one of these?
1️⃣ Colombo
2️⃣ Colombo East
3️⃣ Colombo Fort

Please choose or type exact location...
```

**API CALL 1: https://agrataxis.com/backend/api/bot/location**
```
POST https://agrataxis.com/backend/api/bot/location
{
  "location": "colombo",
  "type": "pickup"
}
```

**API Response:**
```
{
  "success": true,
  "location": "Colombo",
  "coordinates": { "lat": 6.9271, "lng": 79.8612 },
  "district": "Western",
  "isHillCountry": false,
  "confidence": 0.98
}
```

**Bot displays:**
```
✓ Pickup: Colombo

Now, where are you going?
```

**Data stored:**
```
pickup = "Colombo"
pickupCoordinates = { lat: 6.9271, lng: 79.8612 }
pickupIsHillCountry = false
```

---

### Q3: Destination Location
**Chatbot asks:**
```
🏁 Destination

Where are you going?
(e.g., Kandy, Galle, Negombo, etc.)
```

**User inputs:**
```
kandy
```

**API CALL 2: https://agrataxis.com/backend/api/bot/location**
```
POST https://agrataxis.com/backend/api/bot/location
{
  "location": "kandy",
  "type": "destination"
}
```

**API Response:**
```
{
  "success": true,
  "location": "Kandy",
  "coordinates": { "lat": 6.9271, "lng": 80.7789 },
  "district": "Central",
  "isHillCountry": true,
  "confidence": 0.95
}
```

**Bot displays:**
```
✓ Destination: Kandy
📏 Distance: 115 km
⏱️ Travel Time: ~2.5 hours

Now, how many passengers?
```

**Data stored:**
```
destination = "Kandy"
destinationCoordinates = { lat: 6.9271, lng: 80.7789 }
destinationIsHillCountry = true
distance = 115
```

---

### Q4: Passenger Count [Passenger Service Only]
**Chatbot asks:**
```
👥 How many passengers?

Enter number: 1-60
```

**User inputs:**
```
5
```

**Bot response:**
```
✓ 5 passengers confirmed.

What vehicle would you like?

🚐 Toyota Hiace (14 seats) - AC/Non-AC available
🚗 Toyota Prius (5 seats) - AC only
[... more options ...]

Please choose vehicle name or number
```

**Data stored:**
```
passengers = 5
```

**API CALL 3: https://agrataxis.com/backend/api/vehicles?passengers=5**
```
GET https://agrataxis.com/backend/api/vehicles?passengers=5
```

**API Response:**
```
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Toyota Hiace",
      "seats": 14,
      "acPricePerKm": 180,
      "nonAcPricePerKm": 150,
      "acAvailable": true,
      "nonAcAvailable": true
    },
    { ... more vehicles ... }
  ],
  "count": 5,
  "filtered": true
}
```

---

### Q5: Vehicle Selection
**Chatbot asks:**
```
🚐 Select Vehicle

Choose from available vehicles:
1️⃣ Toyota Hiace (14 seats)
2️⃣ Toyota Coaster (32 seats)
3️⃣ Nissan Caravan (11 seats)

Please reply: Vehicle name or number
```

**User inputs:**
```
Toyota Hiace
```

**Bot response:**
```
✓ Vehicle: Toyota Hiace

This vehicle has AC and Non-AC options.
Which do you prefer?
```

**Data stored:**
```
vehicle = "Toyota Hiace"
vehicleSeats = 14
```

---

### Q6: AC/Non-AC Option [If Both Available]
**Chatbot asks:**
```
❄️ AC Option

Choose:
1️⃣ AC (Air Conditioned) - Rs. 180/km
2️⃣ Non-AC - Rs. 150/km

Please reply: AC or Non-AC
```

**User inputs:**
```
AC
```

**Bot response:**
```
✓ AC selected - Rs. 180/km

One Way or Round Trip?
```

**Data stored:**
```
acOption = "AC"
pricePerKm = 180
```

---

### Q7: Trip Type
**Chatbot asks:**
```
🔄 Trip Type

Choose:
1️⃣ One Way - Go from Colombo to Kandy
   💰 Fare: 115 km × Rs. 180 = Rs. 20,700

2️⃣ Round Trip - Return to Colombo after Kandy
   💰 Fare: 230 km × Rs. 180 = Rs. 41,400

Please reply: One Way or Round Trip
```

**User inputs:**
```
One Way
```

**Bot response:**
```
✓ One Way trip selected.

Do you want to add stops in between?
(Optional - e.g., stop at Negombo, Kurunegala)
```

**Data stored:**
```
tripType = "One Way"
```

---

### Q8: Add Stops (Optional)
**Chatbot asks:**
```
🛑 Intermediate Stops

Do you want to stop anywhere in between Colombo and Kandy?

Reply:
- "No" or skip to continue
- "Yes" to add stops
- Or list stops: "Negombo, Kurunegala"
```

**User inputs:**
```
Yes, Negombo
```

**Bot response:**
```
✓ Adding stop: Negombo

Any more stops? (max 5)
Reply: Stop name or "No" to continue
```

**User inputs:**
```
No
```

**API CALL 4: https://agrataxis.com/backend/api/bot/location (for each stop)**
```
POST https://agrataxis.com/backend/api/bot/location
{
  "location": "Negombo",
  "type": "stop"
}
```

**API Response:**
```
{
  "success": true,
  "location": "Negombo",
  "coordinates": { "lat": 7.2086, "lng": 79.8525 },
  "district": "Western",
  "isHillCountry": false
}
```

**Bot displays:**
```
✓ Route confirmed:
📍 Colombo → 🛑 Negombo → 🏁 Kandy

Calculating your estimate...
```

**Data stored:**
```
stops = ["Negombo"]
```

---

## CALCULATE FARE (API CALL 5)

**Bot performs calculation:**
```
POST /api/bot/calculate
{
  "serviceType": "Passenger",
  "pickup": "Colombo",
  "destination": "Kandy",
  "stops": ["Negombo"],
  "vehicle": "Toyota Hiace",
  "passengers": 5,
  "acOption": "AC",
  "days": 1,
  "tripType": "One Way"
}
```

**API Response:**
```
{
  "success": true,
  "serviceType": "Passenger",
  "estimatedFare": 20700,
  "distance": 115,
  "isHillCountry": true,
  "breakdown": {
    "baseFare": 18000,
    "hillSurcharge": 2700,
    "total": 20700
  },
  "pricePerKm": 180,
  "vehicle": "Toyota Hiace",
  "passengers": 5,
  "acOption": "AC",
  "tripType": "One Way"
}
```

**Bot displays:**
```
✅ YOUR ESTIMATE

🚐 Vehicle: Toyota Hiace (AC)
👥 Passengers: 5
📍 Pickup: Colombo
🛑 Stop: Negombo
🏁 Destination: Kandy
📏 Distance: 115 km
⏱️ Trip Type: One Way

💰 FARE BREAKDOWN
Base Fare: Rs. 18,000
Hill Country Surcharge: Rs. 2,700
─────────────────
TOTAL: Rs. 20,700

Ready to book?
```

---

### Q9: Confirm & Book
**Chatbot asks:**
```
📞 Book Your Ride

How would you like to proceed?

1️⃣ WhatsApp 
2️⃣ Call: +94 72 3003 000
3️⃣ Email: info@agrataxis.com

Reply: WhatsApp, Call, or Email
```

**User inputs:**
```
WhatsApp
```

**Bot sends:**
```
Great! Here's your booking details:

🚐 Toyota Hiace (AC) | 5 Passengers
📍 Colombo → Negombo → Kandy
💰 Rs. 20,700

👉 Click to WhatsApp: 
https://wa.me/94723003000?text=
I need a booking:
- Vehicle: Toyota Hiace (AC)
- Passengers: 5
- Pickup: Colombo
- Stops: Negombo
- Destination: Kandy
- Amount: Rs. 20,700
```

---

## Complete Conversation Example

```
🤖 Bot: 👋 Welcome to Agra Taxis!
        What service do you need?
        1️⃣ Passenger
        2️⃣ Lorry

👤 User: Passenger

🤖 Bot: ✓ Great! Passenger service selected.
        📍 Where should we pick you up from?

👤 User: colombo

🤖 Bot: ✓ Pickup: Colombo (Confirmed)
        🏁 Where are you going?

👤 User: kandy

🤖 Bot: ✓ Destination: Kandy
        📏 Distance: 115 km
        👥 How many passengers?

👤 User: 5

🤖 Bot: ✓ 5 passengers
        🚐 What vehicle?
        1️⃣ Toyota Hiace
        2️⃣ Toyota Coaster

👤 User: Toyota Hiace

🤖 Bot: ✓ Vehicle selected
        ❄️ AC or Non-AC?

👤 User: AC

🤖 Bot: ✓ AC selected
        🔄 One Way or Round Trip?

👤 User: One Way

🤖 Bot: ✓ One Way selected
        🛑 Add stops?

👤 User: No

🤖 Bot: Calculating estimate...
        
        ✅ YOUR ESTIMATE
        Vehicle: Toyota Hiace (AC)
        Passengers: 5
        Route: Colombo → Kandy (115 km)
        💰 TOTAL: Rs. 20,700
        
        📞 Book via WhatsApp?

👤 User: Yes

🤖 Bot: 👉 WhatsApp Link: [Click to book]
```

---

## Data Flow Summary

### Each User Input Triggers:

| User Input | Bot Action | API Call | Data Stored |
|-----------|-----------|----------|-------------|
| Service Type | Parse choice | None | serviceType |
| Pickup Location | Validate location | `https://agrataxis.com/backend/api/bot/location` | pickup, coordinates |
| Destination | Validate location | `https://agrataxis.com/backend/api/bot/location` | destination, coordinates |
| Passenger Count | Parse number | `https://agrataxis.com/backend/api/vehicles` | passengers |
| Vehicle | Get vehicle details | None (from Q4 response) | vehicle |
| AC/Non-AC | Get price | None | acOption, pricePerKm |
| Trip Type | Parse choice | None | tripType |
| Add Stops | Validate each stop | `https://agrataxis.com/backend/api/bot/location` x N | stops array |
| Ready | Calculate all | `/api/bot/calculate` | estimate |
| Confirm | Generate WhatsApp link | None | booking sent |

---

## Error Handling in Conversation

### Invalid Location
```
👤 User: xyz123

🤖 Bot: ❌ "xyz123" is not recognized.

Did you mean one of these?
1️⃣ Colombo
2️⃣ Galle
3️⃣ Kandy

Please choose or type full location name
```

### Invalid Passenger Count
```
👤 User: 100

🤖 Bot: ❌ Max 60 passengers allowed.

Please enter 1-60:
```

### Invalid Vehicle for Passenger Count
```
👤 User: 5 passengers
        But selected vehicle with 4 seats

🤖 Bot: ❌ Selected vehicle has only 4 seats.
        You need at least 5 seats.

Available vehicles for 5 passengers:
1️⃣ Toyota Hiace (14 seats)
2️⃣ Toyota Coaster (32 seats)
```

---

## Conversation Modes

### Mode 1: Quick Quote (Minimal)
```
Bot: Service? > User: Passenger
Bot: From? > User: Colombo
Bot: To? > User: Kandy
Bot: How many? > User: 5
Bot: Vehicle? > User: Hiace
Bot: AC? > User: AC
Bot: Trip? > User: One Way
Bot: [Calculate] Rs. 20,700
```
**API calls: 2 (validate pickup, destination) + 1 (calculate) = 3 total**

### Mode 2: Full Details
```
Same as above + Stops + Confirmation
**API calls: 2 (validate locations) + 1 (vehicles) + N (stops) + 1 (calculate) = 4+N total**
```

---

## API Call Timing

```
Q1 Service Type
  ↓ (No API)
Q2 Pickup Location
  ↓ API: https://agrataxis.com/backend/api/bot/location ✓ (validate)
Q3 Destination Location
  ↓ API: https://agrataxis.com/backend/api/bot/location ✓ (validate)
Q4 Passenger Count
  ↓ API: https://agrataxis.com/backend/api/vehicles ✓ (get filtered list)
Q5 Vehicle Selection
  ↓ (No API)
Q6 AC/Non-AC
  ↓ (No API)
Q7 Trip Type
  ↓ (No API)
Q8 Stops
  ↓ API: https://agrataxis.com/backend/api/bot/location ✓ (validate each stop)
Ready to Calculate
  ↓ API: /api/bot/calculate ✓ (final estimate)
Book
  ↓ (No API - WhatsApp link generated)
```

---

## Chat Response Templates

### Success Response
```
✓ [Field Name] confirmed

[Optional] Next question or information
```

### Error Response
```
❌ [Error message]

[Suggestions or retry instructions]
```

### Information Display
```
📍 [Icon] [Field]: [Value]

[Next question]
```

### Summary Display
```
✅ YOUR ESTIMATE

[List all details]

💰 TOTAL: [Amount]

[Call to action]
```

---

**Complete chatbot conversation flow guide!** ✓

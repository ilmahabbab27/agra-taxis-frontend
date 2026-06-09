# Agra Taxis API - Complete Index

Complete API documentation for **agrataxis.com** - all files and quick navigation.

---

## Quick Start

**Base URL:** `https://agrataxis.com/api`

**5 Endpoints:**
1. `GET /vehicles` - Get vehicle list
2. `POST /locations/suggest` - Location autocomplete
3. `POST /bot/location` - Validate location
4. `POST /locations/distance` - Calculate distance
5. `POST /bot/calculate` - Calculate fare

---

## Documentation Files

### 📖 Main Documentation
- **[API_DOCUMENTATION_AGRATAXIS.md](API_DOCUMENTATION_AGRATAXIS.md)** - Complete API reference
  - All endpoints with examples
  - Request/response formats
  - Error codes
  - Integration examples

### 🚀 Quick References
- **[API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)** - Quick reference card
  - All endpoints at a glance
  - Common use cases
  - Code snippets
  - Contact info

### 🧪 Testing
- **[API_CURL_EXAMPLES.md](API_CURL_EXAMPLES.md)** - Copy-paste curl commands
  - Testing each endpoint
  - Error scenarios
  - Complete workflow

---

## Chatbot Integration

### 📝 Conversation Flow
- **[CHATBOT_CONVERSATION_FLOW.md](CHATBOT_CONVERSATION_FLOW.md)** - Chatbot Q&A script
  - Exact questions chatbot asks
  - When API calls happen
  - User responses
  - Error handling

### 💻 API Requests
- **[CHATBOT_API_REQUESTS.md](CHATBOT_API_REQUESTS.md)** - Implementation guide
  - Request/response examples
  - JavaScript examples
  - Python examples
  - Complete chatbot class

---

## Backend Implementation

### 🔧 Controller Implementation
- **[ENDPOINTS_COMPLETE.php](ENDPOINTS_COMPLETE.php)** - Full Laravel controller
  - All 5 endpoints
  - Helper methods
  - Error handling

### 🛣️ Routes
- **[ROUTES_API.php](ROUTES_API.php)** - Route configuration
  - Route definitions
  - Copy to routes/api.php

### 📋 Services
- **[LocationPredictorService.php](LocationPredictorService.php)** - Location service
- **[FareEstimationService.php](FareEstimationService.php)** - Fare calculation service

---

## Booking Flow Documentation

### 📱 Smart Booking Flow
- **[SMART_BOOKING_FLOW.md](SMART_BOOKING_FLOW.md)** - Complete 9-step flow
  - Step-by-step implementation
  - TypeScript code
  - Real-time updates

### 📋 Booking Form
- **[BOOKING_FORM_CORRECT_FLOW.md](BOOKING_FORM_CORRECT_FLOW.md)** - Correct step ordering
- **[BOOKING_FORM_SAME_FLOW.md](BOOKING_FORM_SAME_FLOW.md)** - Same flow in form

### 🛑 Stops/Waypoints
- **[STOPS_GUIDE.md](STOPS_GUIDE.md)** - Intermediate stops implementation
  - Multiple stops
  - Distance calculation
  - Route visualization

### 🔄 Trip Types
- **[TRIP_TYPE_GUIDE.md](TRIP_TYPE_GUIDE.md)** - One Way vs Round Trip
  - Pricing differences
  - Implementation

---

## Data & Integration

### 📊 Data Import
- **[DATA_IMPORT_GUIDE.md](DATA_IMPORT_GUIDE.md)** - How to import JSON data
  - Database schema
  - Import script
  - Minimal data needed

### 📍 Location Data
- **[LOCATION_PREDICTOR_SERVICE.md](LOCATION_PREDICTOR_SERVICE.md)** - Location coordinates
- **[LOCATION_PREDICTOR_QUICK_START.md](LOCATION_PREDICTOR_QUICK_START.md)** - Quick start
- **[DISTANCE_REFERENCE.md](DISTANCE_REFERENCE.md)** - Distance calculations

### 💰 Fare Estimation
- **[FARE_ESTIMATION_SERVICE.php](FARE_ESTIMATION_SERVICE.php)** - Fare calculation
- **[fare-estimation.types.ts](fare-estimation.types.ts)** - TypeScript types

---

## Endpoint Details

### Endpoint 1: Get Vehicles
```
GET https://agrataxis.com/api/vehicles?passengers=5

Returns: List of vehicles filtered by passenger count
Used in: Booking step 4 (Vehicle Selection)
```

**File:** [API_DOCUMENTATION_AGRATAXIS.md - Section 1](API_DOCUMENTATION_AGRATAXIS.md#1-get-vehicles)

---

### Endpoint 2: Location Autocomplete
```
POST https://agrataxis.com/api/locations/suggest

Body: { "query": "kan", "limit": 5 }
Returns: Matching location suggestions
Used in: Booking steps 7-8 (Pickup/Drop)
```

**File:** [API_DOCUMENTATION_AGRATAXIS.md - Section 2](API_DOCUMENTATION_AGRATAXIS.md#2-post-location-autocomplete)

---

### Endpoint 3: Validate Location
```
POST https://agrataxis.com/api/bot/location

Body: { "location": "colombo", "type": "pickup" }
Returns: Validated location with coordinates
Used in: Booking steps 7-8, Chatbot Q2-Q8
```

**File:** [API_DOCUMENTATION_AGRATAXIS.md - Section 3](API_DOCUMENTATION_AGRATAXIS.md#3-post-validate-location)

---

### Endpoint 4: Calculate Distance
```
POST https://agrataxis.com/api/locations/distance

Body: { "from": "Colombo", "to": "Kandy" }
Returns: Distance in km, travel time, hill country info
Used in: Booking step 8 (real-time distance display)
```

**File:** [API_DOCUMENTATION_AGRATAXIS.md - Section 4](API_DOCUMENTATION_AGRATAXIS.md#4-post-calculate-distance)

---

### Endpoint 5: Calculate Fare
```
POST https://agrataxis.com/api/bot/calculate

Body: Full booking data (pickup, destination, vehicle, passengers, etc.)
Returns: Estimated fare with breakdown
Used in: Booking steps 11, Chatbot final calculation
```

**File:** [API_DOCUMENTATION_AGRATAXIS.md - Section 5](API_DOCUMENTATION_AGRATAXIS.md#5-post-calculate-fare-estimate)

---

## Implementation Guides

### For Frontend Developer
1. Read: [SMART_BOOKING_FLOW.md](SMART_BOOKING_FLOW.md)
2. Read: [API_DOCUMENTATION_AGRATAXIS.md](API_DOCUMENTATION_AGRATAXIS.md)
3. Reference: [ENDPOINTS_INTEGRATION_GUIDE.md](ENDPOINTS_INTEGRATION_GUIDE.md)
4. Test: [API_CURL_EXAMPLES.md](API_CURL_EXAMPLES.md)

### For Backend Developer
1. Copy: [ENDPOINTS_COMPLETE.php](ENDPOINTS_COMPLETE.php) → `app/Http/Controllers/Api/BookingApiController.php`
2. Copy: [ROUTES_API.php](ROUTES_API.php) → `routes/api.php`
3. Ensure: [LocationPredictorService.php](LocationPredictorService.php) exists
4. Ensure: [FareEstimationService.php](FareEstimationService.php) exists
5. Import: [DATA_IMPORT_GUIDE.md](DATA_IMPORT_GUIDE.md) - import JSON data

### For Chatbot Developer
1. Read: [CHATBOT_CONVERSATION_FLOW.md](CHATBOT_CONVERSATION_FLOW.md)
2. Read: [CHATBOT_API_REQUESTS.md](CHATBOT_API_REQUESTS.md)
3. Implement: API calls exactly as shown
4. Test: [API_CURL_EXAMPLES.md](API_CURL_EXAMPLES.md)

### For QA/Testing
1. Reference: [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)
2. Test with: [API_CURL_EXAMPLES.md](API_CURL_EXAMPLES.md)
3. Check: [ENDPOINTS_IMPLEMENTATION_CHECKLIST.md](ENDPOINTS_IMPLEMENTATION_CHECKLIST.md)

---

## API Flow Diagram

```
External Chatbot                  Booking Form
       ↓                               ↓
       │                               │
       ├──→ Q1: Service Type ←────────┤
       │                               │
       ├──→ Q2: Pickup Location ←─────┤
       │    ↓                          │
       │    [POST /api/bot/location]   │
       │    ↓                          │
       │    [Validate Location]        │
       │                               │
       ├──→ Q3: Destination ←──────────┤
       │    ↓                          │
       │    [POST /api/bot/location]   │
       │    ↓                          │
       │    [Validate Location]        │
       │    ↓                          │
       │    [POST /api/locations/distance]
       │    ↓                          │
       │    [Display Distance]         │
       │                               │
       ├──→ Q4: Passengers ←───────────┤
       │    ↓                          │
       │    [GET /api/vehicles?passengers=5]
       │    ↓                          │
       │    [Show Filtered Vehicles]   │
       │                               │
       ├──→ Q5-7: Details ←────────────┤
       │    ↓                          │
       │    [Collect All Data]         │
       │                               │
       ├──→ CALCULATE ←────────────────┤
       │    ↓                          │
       │    [POST /api/bot/calculate]  │
       │    ↓                          │
       │    [Get Fare Estimate]        │
       │                               │
       └──→ BOOK ←────────────────────┘
            WhatsApp / Phone / Email
```

---

## Testing Checklist

- [ ] Test all 5 endpoints
- [ ] Test error scenarios
- [ ] Test with different passengers (1, 5, 32, 60)
- [ ] Test both AC and Non-AC
- [ ] Test One Way and Round Trip
- [ ] Test with and without stops
- [ ] Test location typo correction
- [ ] Test hill country detection
- [ ] Test distance calculation
- [ ] Test fare calculation accuracy

See: [ENDPOINTS_IMPLEMENTATION_CHECKLIST.md](ENDPOINTS_IMPLEMENTATION_CHECKLIST.md)

---

## Common Issues & Solutions

### Location Not Found
**Problem:** User enters invalid location
**Solution:** Show suggestions from API response
**Docs:** [API_DOCUMENTATION_AGRATAXIS.md - Error Codes](API_DOCUMENTATION_AGRATAXIS.md#error-codes)

### No Vehicles Available
**Problem:** No vehicles for passenger count
**Solution:** Reduce passengers or use different service type
**Docs:** [ENDPOINTS_INTEGRATION_GUIDE.md - Error Handling](ENDPOINTS_INTEGRATION_GUIDE.md#error-handling)

### Incorrect Fare Calculation
**Problem:** Wrong amount displayed
**Solution:** Verify distance calculation and hill country flag
**Docs:** [DATA_IMPORT_GUIDE.md - Minimal Data](DATA_IMPORT_GUIDE.md#minimal-data-for-calculation)

### Typo Not Corrected
**Problem:** "colmbo" not auto-correcting to "Colombo"
**Solution:** Check LocationPredictorService fuzzy matching
**Docs:** [LOCATION_PREDICTOR_SERVICE.md](LOCATION_PREDICTOR_SERVICE.md)

---

## Support & Contact

**Company:** Agra Taxis
- **Website:** https://agrataxis.com
- **Phone:** +94 72 3003 000
- **WhatsApp:** https://wa.me/94723003000
- **Email:** info@agrataxis.com
- **API Email:** api@agrataxis.com

---

## File Organization

```
agra-connect/
├── 📖 Documentation
│   ├── API_DOCUMENTATION_AGRATAXIS.md (Main reference)
│   ├── API_QUICK_REFERENCE.md (Quick guide)
│   ├── API_CURL_EXAMPLES.md (Testing)
│   ├── API_INDEX.md (This file)
│   │
├── 🤖 Chatbot
│   ├── CHATBOT_CONVERSATION_FLOW.md (Q&A script)
│   ├── CHATBOT_API_REQUESTS.md (Implementation)
│   ├── CHATBOT_INTEGRATION_README.md
│   ├── CHATBOT_QUICK_START.md
│   │
├── 📱 Booking Form
│   ├── SMART_BOOKING_FLOW.md (Main flow)
│   ├── BOOKING_FORM_CORRECT_FLOW.md
│   ├── BOOKING_FORM_SAME_FLOW.md
│   ├── STOPS_GUIDE.md
│   ├── TRIP_TYPE_GUIDE.md
│   │
├── 🔧 Backend
│   ├── ENDPOINTS_COMPLETE.php (Controller)
│   ├── ROUTES_API.php (Routes)
│   ├── LocationPredictorService.php
│   ├── FareEstimationService.php
│   ├── BotEndpoints.php
│   │
├── 📊 Data & Integration
│   ├── DATA_IMPORT_GUIDE.md
│   ├── LOCATION_PREDICTOR_SERVICE.md
│   ├── LOCATION_PREDICTOR_QUICK_START.md
│   ├── DISTANCE_REFERENCE.md
│   ├── fare-estimation.types.ts
│   │
└── ✅ Checklists
    ├── ENDPOINTS_INTEGRATION_GUIDE.md
    └── ENDPOINTS_IMPLEMENTATION_CHECKLIST.md
```

---

## Quick Links by Role

**👨‍💼 Project Manager**
- [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)
- [API_DOCUMENTATION_AGRATAXIS.md](API_DOCUMENTATION_AGRATAXIS.md)

**👨‍💻 Frontend Developer**
- [SMART_BOOKING_FLOW.md](SMART_BOOKING_FLOW.md)
- [ENDPOINTS_INTEGRATION_GUIDE.md](ENDPOINTS_INTEGRATION_GUIDE.md)
- [API_CURL_EXAMPLES.md](API_CURL_EXAMPLES.md)

**🔧 Backend Developer**
- [ENDPOINTS_COMPLETE.php](ENDPOINTS_COMPLETE.php)
- [ENDPOINTS_IMPLEMENTATION_CHECKLIST.md](ENDPOINTS_IMPLEMENTATION_CHECKLIST.md)
- [DATA_IMPORT_GUIDE.md](DATA_IMPORT_GUIDE.md)

**🤖 Chatbot Developer**
- [CHATBOT_CONVERSATION_FLOW.md](CHATBOT_CONVERSATION_FLOW.md)
- [CHATBOT_API_REQUESTS.md](CHATBOT_API_REQUESTS.md)
- [API_CURL_EXAMPLES.md](API_CURL_EXAMPLES.md)

**🧪 QA/Tester**
- [API_CURL_EXAMPLES.md](API_CURL_EXAMPLES.md)
- [ENDPOINTS_IMPLEMENTATION_CHECKLIST.md](ENDPOINTS_IMPLEMENTATION_CHECKLIST.md)
- [API_DOCUMENTATION_AGRATAXIS.md](API_DOCUMENTATION_AGRATAXIS.md)

---

**API Version:** 1.0
**Base URL:** https://agrataxis.com/api
**Last Updated:** 2026-06-09
**Status:** ✅ Complete and Ready

All endpoints fully documented and ready for implementation! 🚀

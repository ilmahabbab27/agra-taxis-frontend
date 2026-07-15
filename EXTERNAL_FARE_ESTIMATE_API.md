# WhatsApp Fare Estimate Guide

This document is for people building an external WhatsApp assistant that talks to the Agra Taxis fare estimate API.

The assistant should:

1. collect answers step by step
2. map number replies to values
3. build a request to the fare endpoint
4. show the estimate back to the user
5. allow `0` main menu, `9` back, and `5` talk to agent on every step

## First Message

When the user sends the first message, reply with a welcome plus contact details and the website link before starting the flow.

Example:

```text
Welcome to Agra Taxis 👋

We help you with passenger vehicles, lorries, and quick fare estimates.

Agra Taxis වෙත සාදරයෙන් පිළිගනිමු 👋

අපි passenger vehicles, lorries, සහ ඉක්මන් fare estimates සඳහා ඔබට උදව් කරමු.

Contact us:
Phone: 072 300 3000
WhatsApp: 94702504044
Email: info@agrataxis.com
Website: https://agrataxis.com

අප අමතන්න:
Phone: 072 300 3000
WhatsApp: 94702504044
Email: info@agrataxis.com
Website: https://agrataxis.com

Reply 1 for fare estimate.
Reply 2 to talk to an agent.

ගාස්තු ඇස්තමේන්තුව සඳහා 1 යොදන්න.
නියෝජිතයෙකුට කතා කිරීමට 2 යොදන්න.
```

Keep this first message short and easy to scan on WhatsApp.

## Data Source

Use the exported JSON structure from admin export:

```json
{
  "company": {
    "name": "Agra Taxis",
    "phone": "+94723003000",
    "phoneDisplay": "072 300 3000",
    "whatsapp": "94723003000",
    "email": "info@agrataxis.com"
  },
  "passengerVehicles": [
    { "name": "Alto/flex", "passengerType": "Cars", "seats": 3 }
  ],
  "lorryTypes": [
    { "name": "Agra Lorries", "lorryTypes": ["7 FT", "20 FT"] }
  ]
}
```

Use:

- `passengerVehicles` to build passenger vehicle menus
- `passengerType` to filter passenger vehicles
- `seats` to filter by required seat count
- `lorryTypes[0].lorryTypes` to build lorry menus
- `company` for contact and agent handoff

## Base URL

```text
https://agrataxis.com/backend/api
```

## Endpoint

```text
GET  /external/fare-estimate
POST /external/fare-estimate
```

Use:

- `POST` for structured assistant payloads
- `GET` if you want a simple URL-based request

## Global Controls

Show these on every step:

- `0` Main menu / ප්‍රධාන මෙනුව
- `9` Back / ආපසු
- `5` Talk to agent / නියෝජිතයෙකුට කතා කරන්න

## Recommended Flow

### Start

`What do you need? / ඔබට අවශ්‍ය වන්නේ කුමක්ද?`

- `1` Fare estimate / ගමන් ගාස්තු ඇස්තමේන්තුව
- `2` Talk to agent / නියෝජිතයෙකුට කතා කරන්න
- `0` Main menu / ප්‍රධාන මෙනුව

### Service Type

`Service type / සේවා වර්ගය තෝරන්න`

- `1` Passenger vehicle / Passenger vehicle
- `2` Lorry / Lorry

---

## Passenger Vehicle Flow

### 1. Passenger Type

`Passenger type / Passenger වර්ගය තෝරන්න`

- `1` Cars / Cars
- `2` Vans / Vans
- `3` SUVs / SUVs
- `4` Mini Buses / Mini Buses
- `5` Buses / Buses
- `6` Luxury / Luxury

Filter the vehicle list using:

- selected passenger type
- selected seat range

### 2. Seats

`How many seats do you need? / අවශ්‍ය ආසන ගණන තෝරන්න`

- `1` 1 to 4 / 1 සිට 4 දක්වා
- `2` 5 to 7 / 5 සිට 7 දක්වා
- `3` 8 to 14 / 8 සිට 14 දක්වා
- `4` 15 to 28 / 15 සිට 28 දක්වා
- `5` 29 and above / 29 සහ ඉහළ

### 3. Vehicle

`Which vehicle do you want? / ඔබට අවශ්‍ය වාහනය තෝරන්න`

Show only vehicles that match the selected passenger type and seat range.

Example from export:

- Alto/flex
- Prius
- Wagon R
- KDH Highroof
- Mini Van

### 4. Pickup

`Where are you being picked up from? / ඔබව ගන්න ස්ථානය කොහෙද?`

Use free text or location share.

### 5. Drop

`Where are you going to? / ඔබ යන ස්ථානය කොහෙද?`

Use free text or location share.

### 6. Stops

`Any stop locations? / මැද නැවතුම් ස්ථාන තිබේද?`

- `1` Yes / ඔව්
- `2` No / නැහැ

If yes, collect stops one by one.

### 7. Days

`How many days is the trip? / ගමන දින ගණන කොපමණද?`

- `1` 1 day / 1 දිනය
- `2` 2 days / 2 දින
- `3` 3 days / 3 දින
- `4` 4 days / 4 දින
- `5` 5 days / 5 දින

### 8. Trip Type

`Trip type / ගමන වර්ගය තෝරන්න`

- `1` One-way / One-way
- `2` Round-trip / Round-trip

### 9. AC

`AC or Non-AC? / AC අවශ්‍යද, නැත්නම් Non-AC ද?`

- `1` AC / AC
- `2` Non-AC / Non-AC

### 10. Call the API

Send:

```json
{
  "type": "vehicle",
  "vehicle": "Non Ac layland",
  "days": 2,
  "trip": "round-trip",
  "ac": "non-ac",
  "pickup": "6.9344,79.8428",
  "drop": "7.2906,80.6337",
  "stops": ["Kurunegala"]
}
```

If your bot collected pickup and drop as text, send them directly. The backend will geocode them.

### Passenger Example Request

```js
const params = new URLSearchParams({
  type: "vehicle",
  vehicle: "Non Ac layland",
  days: "2",
  trip: "round-trip",
  ac: "non-ac",
  pickup: "Colombo Fort",
  drop: "Kandy",
});
params.append("stops[]", "Kurunegala");

const res = await fetch(`https://agrataxis.com/backend/api/external/fare-estimate?${params.toString()}`);
const data = await res.json();
```

---

## Lorry Flow

For lorry, do not ask AC in the flow.

### 1. Lorry Type

`Lorry type / Lorry වර්ගය තෝරන්න`

- `1` 7 FT / 7 FT
- `2` 20 FT / 20 FT
- `3` 8.5 FT / 8.5 FT
- `4` 10.5 FT / 10.5 FT
- `5` 12.5 FT / 12.5 FT
- `6` 14.5 FT / 14.5 FT
- `7` 16.5 FT / 16.5 FT
- `8` 18.5 FT / 18.5 FT

Use the `rate_type` value in the API payload.

### 2. Days

`How many days is the trip? / ගමන දින ගණන කොපමණද?`

- `1` 1 day / 1 දිනය
- `2` 2 days / 2 දින
- `3` 3 days / 3 දින
- `4` 4 days / 4 දින
- `5` 5 days / 5 දින

### 3. Trip Type

`Trip type / ගමන වර්ගය තෝරන්න`

- `1` One-way / One-way
- `2` Round-trip / Round-trip

### 4. Distance

`What is the distance in km? / කිලෝමීටර් ගණන කොපමණද?`

### 5. Waiting Hours

`How many waiting hours? / බලා සිටින පැය ගණන කොපමණද?`

### 6. Call the API

```json
{
  "type": "lorry",
  "lorry": "Agra Lorries",
  "rate_type": "7 FT",
  "days": 1,
  "trip": "one-way",
  "distance_km": 120,
  "waiting_hours": 2
}
```

`ac` is not required for lorry requests.

### Lorry Example Request

```js
const params = new URLSearchParams({
  type: "lorry",
  lorry: "Agra Lorries",
  rate_type: "7 FT",
  days: "1",
  trip: "one-way",
  distance_km: "120",
  waiting_hours: "2",
});

const res = await fetch(`https://agrataxis.com/backend/api/external/fare-estimate?${params.toString()}`);
const data = await res.json();
```

---

## Response Format

Success response:

```json
{
  "success": true,
  "message": "Estimated trip fare calculated successfully.",
  "data": {
    "title": "Estimated trip fare",
    "vehicle": "Non Ac layland",
    "distance_km": 229.3,
    "distance_source": "route",
    "amount": 122544,
    "extra_km_rate": 230,
    "extra_km_note": "Each extra kilometer will be charged at Rs. 230.",
    "currency": "LKR",
    "note": "This is an estimate only. Final pricing may change based on route conditions, stops, waiting time, the actual trip duration, and the final per-km billing after the included allowance."
  }
}
```

For lorries:

```json
{
  "success": true,
  "message": "Estimated trip fare calculated successfully.",
  "data": {
    "title": "Estimated trip fare",
    "vehicle": "Agra Lorries",
    "rate_type": "7 FT",
    "distance_km": 120,
    "distance_source": "manual",
    "amount": 45000,
    "currency": "LKR",
    "note": "This is an estimate only. Final pricing may change based on route conditions, stops, waiting time, and actual trip details."
  }
}
```

## Important Response Fields

- `data.amount` = final estimate, rounded to a whole number
- `data.distance_km` = total calculated distance
- `data.distance_source` = `route`, `straight`, or `manual`
- `data.extra_km_rate` = per-km rate
- `data.note` = user-facing disclaimer

## Error Handling

Common errors:

- `Vehicle not found.`
- `Lorry not found.`
- `Valid rate_type is required for lorry estimates.`
- `No rate table configured for lorry '...'.`
- `Could not find pickup location: "..." Please be more specific.`
- `Could not find drop location: "..." Please be more specific.`
- `Could not find stop location: "..." Please be more specific.`
- `Could not calculate driving distance for this route.`
- `AC or Non-AC is required for vehicle estimates.`

Example error response:

```json
{
  "success": false,
  "message": "Vehicle not found."
}
```

## Bot Logic Summary

### Passenger vehicle

1. service type
2. passenger type
3. seat count
4. vehicle
5. pickup
6. drop
7. stops
8. days
9. trip type
10. AC or Non-AC
11. estimate

### Lorry

1. service type
2. lorry type
3. days
4. trip type
5. distance in km or route info
6. waiting hours
7. estimate

## Contact Details

From export:

- Phone: `072 300 3000`
- WhatsApp: `94702504044`
- Email: `info@agrataxis.com`

Use these for support handoff or contact cards.

# Passenger Vehicle External Fare Estimate API

This file is for people building an external chatbot or tool that needs only the passenger vehicle fare endpoint.

## Endpoint

```text
https://agrataxis.com/backend/api/external/fare-estimate
```

The endpoint accepts both `POST` and `GET`.

## Request Rules

Use these fields:

- `type` must be `vehicle`
- `vehicle` is the vehicle name, for example `Non Ac layland`
- `days` is required
- `trip` is required, either `one-way` or `round-trip`
- `ac` is required, either `ac` or `non-ac`
- `pickup` and `drop` can be coordinates or place text
- `stops` is optional
- `distance_km` can be used instead of `pickup` and `drop`

## Distance Behavior

If `pickup` and `drop` are sent, the backend calculates route distance.

If only `distance_km` is sent, the backend uses that value directly.

The response includes:

- `distance_km`
- `distance_source`
- `pickup_map`
- `drop_map`
- `route_summary`
- `stops`
- `stop_maps`

## Sample POST Request

```js
fetch("https://agrataxis.com/backend/api/external/fare-estimate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "vehicle",
    vehicle: "Non Ac layland",
    days: 2,
    trip: "round-trip",
    ac: "non-ac",
    pickup: "6.922002,79.773803",
    drop: "7.2945434,80.5845816"
  }),
}).then((r) => r.json()).then(console.log);
```

## Sample GET Request

```text
https://agrataxis.com/backend/api/external/fare-estimate?type=vehicle&vehicle=Non%20Ac%20layland&days=2&trip=round-trip&ac=non-ac&pickup=6.922002,79.773803&drop=7.2945434,80.5845816
```

## Expected Success Response

```json
{
  "success": true,
  "message": "Estimated trip fare calculated successfully.",
  "data": {
    "title": "Estimated trip fare",
    "vehicle": "Non Ac layland",
    "category": "Buses",
    "seats": 49,
    "ac": false,
    "trip": "round-trip",
    "distance_km": 229.3,
    "distance_source": "route",
    "amount": 122544,
    "currency": "LKR",
    "note": "This is an estimate only. Final pricing may change based on route conditions, stops, waiting time, the actual trip duration, and the final per-km billing after the included allowance."
  }
}
```

## Useful Response Fields

- `data.amount` = final fare rounded to a whole number
- `data.distance_km` = calculated route distance
- `data.distance_source` = `route`, `straight`, or `manual`
- `data.price_per_km` = per-km rate
- `data.effective_price_per_km` = effective rate used for billing
- `data.included_km` = included kilometers
- `data.additional_km` = distance above the included limit
- `data.total_cost` = final backend total before rounding, when included in the payload
- `data.pickup_map` = Google Maps link for pickup
- `data.drop_map` = Google Maps link for drop
- `data.route_summary` = readable route text

## Common Errors

- `Vehicle not found.`
- `AC or Non-AC is required for vehicle estimates.`
- `Could not find pickup location: "..." Please be more specific.`
- `Could not find drop location: "..." Please be more specific.`
- `Could not find stop location: "..." Please be more specific.`
- `Could not calculate driving distance for this route.`

## Notes for Tool Builders

Use the vehicle name exactly as stored in the system.

Recommended passenger payload:

```json
{
  "type": "vehicle",
  "vehicle": "Non Ac layland",
  "days": 2,
  "trip": "round-trip",
  "ac": "non-ac",
  "pickup": "6.922002,79.773803",
  "drop": "7.2945434,80.5845816",
  "stops": ["Kurunegala"]
}
```

If you already know the trip distance, you can send:

```json
{
  "type": "vehicle",
  "vehicle": "Non Ac layland",
  "days": 2,
  "trip": "round-trip",
  "ac": "non-ac",
  "distance_km": 229.3
}
```

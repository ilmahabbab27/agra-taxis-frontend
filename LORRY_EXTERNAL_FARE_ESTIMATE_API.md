# Lorry External Fare Estimate API

This file is for people building an external chatbot or tool that needs only the lorry fare endpoint.

## Endpoint

```text
https://agrataxis.com/backend/api/external/fare-estimate
```

The endpoint accepts both `POST` and `GET`.

## Request Rules

Use these fields:

- `type` must be `lorry`
- `lorry` is the lorry name, for example `Agra Lorries`
- `rate_type` is the lorry type label, for example `8.5 FT`
- `days` is required
- `trip` is required, either `one-way` or `round-trip`
- `pickup` and `drop` can be coordinates or place text
- `distance_km` can be used instead of `pickup` and `drop`
- `waiting_hours` is optional

`ac` is not required for lorry requests.

## Waiting Hours

If you send `waiting_hours`, the backend compares it with the lorry rate table:

- `free_waiting_hours` = free allowance
- `waiting_charge_per_hour` = charge after the free allowance
- `chargeable_waiting_hours` = waiting hours above the free allowance

The current estimator returns waiting charge details for reference, but the waiting charge is not added to the final `amount`.

## Extra Kilometer Charge

The response includes:

- `extra_km_rate` = the rate used for extra kilometers
- `extra_km_note` = a short message showing that rate

For round-trip lorry pricing, the backend uses the lorry’s round-trip extra km logic.

## Sample POST Request

```js
fetch("https://agrataxis.com/backend/api/external/fare-estimate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "lorry",
    lorry: "Agra Lorries",
    rate_type: "8.5 FT",
    days: 2,
    trip: "round-trip",
    pickup: "6.922002,79.773803",
    drop: "7.2945434,80.5845816",
    waiting_hours: 3
  }),
}).then((r) => r.json()).then(console.log);
```

## Sample GET Request

```text
https://agrataxis.com/backend/api/external/fare-estimate?type=lorry&lorry=Agra%20Lorries&rate_type=8.5%20FT&days=2&trip=round-trip&pickup=6.922002,79.773803&drop=7.2945434,80.5845816&waiting_hours=3
```

## Expected Success Response

```json
{
  "success": true,
  "message": "Estimated trip fare calculated successfully.",
  "data": {
    "title": "Estimated trip fare",
    "vehicle": "Agra Lorries",
    "rate_type": "8.5 FT",
    "pickup": "Kandy, Sri Lanka",
    "pickup_map": "https://www.google.com/maps?q=6.922002,79.773803",
    "drop": "Colombo, Sri Lanka",
    "drop_map": "https://www.google.com/maps?q=7.2945434,80.5845816",
    "route_summary": "Kandy, Sri Lanka to Colombo, Sri Lanka",
    "stops": [],
    "stop_maps": [],
    "distance_km": 229.3,
    "distance_source": "route",
    "amount": 123456,
    "currency": "LKR",
    "note": "This is an estimate only. Final pricing may change based on route conditions, stops, waiting time, and actual trip details."
  }
}
```

## Useful Response Fields

- `data.amount` = final fare rounded to a whole number
- `data.distance_km` = calculated route distance
- `data.distance_source` = `route`, `straight`, or `manual`
- `data.extra_km_rate` = extra kilometer rate
- `data.extra_km_note` = user-facing extra kilometer message
- `data.pickup_map` = Google Maps link for pickup
- `data.drop_map` = Google Maps link for drop
- `data.route_summary` = readable route text

## Common Errors

- `Lorry not found. Send lorry_id, lorry name, or a valid rate_type.`
- `No rate table configured for lorry '...'.`
- `Valid rate_type is required for lorry estimates.`
- `Could not find pickup location: "..." Please be more specific.`
- `Could not find drop location: "..." Please be more specific.`
- `Could not calculate driving distance for this route.`

## Notes for Tool Builders

Use the lorry name and `rate_type` exactly as stored in the system.

Recommended lorry payload:

```json
{
  "type": "lorry",
  "lorry": "Agra Lorries",
  "rate_type": "8.5 FT",
  "days": 2,
  "trip": "round-trip",
  "pickup": "6.922002,79.773803",
  "drop": "7.2945434,80.5845816",
  "waiting_hours": 3
}
```

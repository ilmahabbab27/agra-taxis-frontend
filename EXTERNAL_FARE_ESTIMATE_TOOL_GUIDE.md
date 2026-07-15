# External Fare Estimate Tool Guide

This guide is for people building an external assistant or tool that talks to the Agra Taxis fare estimate API.

## Endpoint

```text
https://agrataxis.com/backend/api/external/fare-estimate
```

The endpoint accepts both `POST` and `GET`.

## General Rules

- Use `type=vehicle` for passenger vehicles
- Use `type=lorry` for lorries
- `pickup` and `drop` can be coordinates or text locations
- `distance_km` can be used instead of `pickup` and `drop`
- `stops` is optional
- `ac` is required only for passenger vehicles

## Passenger Vehicle Flow

### Required Fields

- `type`: `vehicle`
- `vehicle`: vehicle name, for example `Non Ac layland`
- `days`
- `trip`: `one-way` or `round-trip`
- `ac`: `ac` or `non-ac`

### Optional Fields

- `pickup`
- `drop`
- `stops`
- `distance_km`

### Sample POST Request

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
    drop: "7.2945434,80.5845816",
    stops: ["Kurunegala"]
  }),
}).then((r) => r.json()).then(console.log);
```

### Sample GET Request

```text
https://agrataxis.com/backend/api/external/fare-estimate?type=vehicle&vehicle=Non%20Ac%20layland&days=2&trip=round-trip&ac=non-ac&pickup=6.922002,79.773803&drop=7.2945434,80.5845816
```

### Expected Success Response

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
    "currency": "LKR",
    "note": "This is an estimate only. Final pricing may change based on route conditions, stops, waiting time, the actual trip duration, and the final per-km billing after the included allowance."
  }
}
```

## Lorry Flow

### Required Fields

- `type`: `lorry`
- `lorry`: lorry name, for example `Agra Lorries`
- `rate_type`: lorry type label, for example `8.5 FT`
- `days`
- `trip`: `one-way` or `round-trip`

### Optional Fields

- `pickup`
- `drop`
- `distance_km`
- `waiting_hours`

`ac` is not required for lorry requests.

### Waiting Hours

- `free_waiting_hours` comes from the lorry rate table
- If `waiting_hours` is above the free allowance, the extra time is charged using `waiting_charge_per_hour`
- The current estimator returns waiting charge details for reference, but the waiting charge is not added to the final `amount`

### Sample POST Request

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

### Sample GET Request

```text
https://agrataxis.com/backend/api/external/fare-estimate?type=lorry&lorry=Agra%20Lorries&rate_type=8.5%20FT&days=2&trip=round-trip&pickup=6.922002,79.773803&drop=7.2945434,80.5845816&waiting_hours=3
```

### Expected Success Response

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

### Passenger Vehicles

- `data.amount` = final fare rounded to a whole number
- `data.distance_km` = calculated route distance
- `data.distance_source` = `route`, `straight`, or `manual`
- `data.price_per_km` = per-km rate
- `data.effective_price_per_km` = effective rate used for billing
- `data.included_km` = included kilometers
- `data.additional_km` = distance above the included limit
- `data.pickup_map` = Google Maps link for pickup
- `data.drop_map` = Google Maps link for drop
- `data.route_summary` = readable route text

### Lorries

- `data.amount` = final fare rounded to a whole number
- `data.distance_km` = calculated route distance
- `data.distance_source` = `route`, `straight`, or `manual`
- `data.extra_km_rate` = extra kilometer rate
- `data.extra_km_note` = user-facing extra kilometer message
- `data.pickup_map` = Google Maps link for pickup
- `data.drop_map` = Google Maps link for drop
- `data.route_summary` = readable route text
- `data.waiting_hours` = requested waiting time, if returned
- `data.free_waiting_hours` = free waiting allowance from the rate table
- `data.chargeable_waiting_hours` = waiting time above the free allowance
- `data.waiting_charge` = calculated waiting charge before final pricing rules

## Common Errors

### Passenger Vehicles

- `Vehicle not found.`
- `AC or Non-AC is required for vehicle estimates.`
- `Could not find pickup location: "..." Please be more specific.`
- `Could not find drop location: "..." Please be more specific.`
- `Could not find stop location: "..." Please be more specific.`
- `Could not calculate driving distance for this route.`

### Lorries

- `Lorry not found. Send lorry_id, lorry name, or a valid rate_type.`
- `No rate table configured for lorry '...'.`
- `Valid rate_type is required for lorry estimates.`
- `Could not find pickup location: "..." Please be more specific.`
- `Could not find drop location: "..." Please be more specific.`
- `Could not calculate driving distance for this route.`

## Recommended Payloads

### Passenger Vehicle

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

### Lorry

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

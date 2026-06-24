# Agra Connect

## Console testing for fare estimation

In development, the fare estimation helper is exposed to the browser console as `window.fareEstimation`.

Start the app:

```bash
npm run dev
```

Open the browser, then open DevTools and run:

```js
window.fareEstimation.estimateFare({
  service_type: 'Passenger',
  vehicle_id: 1,
  trip: 'One Way',
  pickup_text: 'Colombo Fort, Sri Lanka',
  destination_text: 'Negombo, Sri Lanka',
  days: 1,
  pax: 3,
  ac: 'AC',
  date: null,
  time: null,
});
```

If you want to test direct coordinates instead of text addresses:

```js
window.fareEstimation.estimateFare({
  service_type: 'Passenger',
  vehicle_id: 1,
  trip: 'One Way',
  pickup_lat: 6.9271,
  pickup_lng: 79.8612,
  destination_lat: 7.2050,
  destination_lng: 79.9608,
  days: 1,
  pax: 3,
  ac: 'AC',
  date: null,
  time: null,
});
```

### Notes
- The backend must be running and reachable via `VITE_API_BASE_URL` or the default API base.
- If `date` and `time` are omitted or set to `null`, the estimate will treat pickup scheduling as unspecified.

<?php

// routes/api.php

use App\Http\Controllers\Api\BookingApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Smart Booking Flow - Complete API Routes
|--------------------------------------------------------------------------
|
| These routes support the progressive booking flow:
| 1. Get vehicles (filtered by passenger count)
| 2. Autocomplete locations
| 3. Validate locations
| 4. Calculate distance
| 5. Calculate fare estimate
|
*/

Route::group(['prefix' => 'api'], function () {

    // ========================
    // ENDPOINT 1: Get Vehicles
    // ========================
    // GET /api/vehicles
    // GET /api/vehicles?passengers=5
    Route::get('/vehicles', [BookingApiController::class, 'getVehicles']);

    // ============================
    // ENDPOINT 2: Location Routes
    // ============================
    Route::group(['prefix' => 'locations'], function () {

        // Location Autocomplete / Suggest
        // POST /api/locations/suggest
        // { "query": "kan", "limit": 5 }
        Route::post('/suggest', [BookingApiController::class, 'suggestLocations']);

        // Calculate Distance Between Locations
        // POST /api/locations/distance
        // { "from": "Colombo", "to": "Kandy" }
        Route::post('/distance', [BookingApiController::class, 'calculateDistance']);
    });

    // ============================
    // ENDPOINT 3: Bot/Booking Routes
    // ============================
    Route::group(['prefix' => 'bot'], function () {

        // Validate Location
        // POST /api/bot/location
        // { "location": "colombo", "type": "pickup" }
        Route::post('/location', [BookingApiController::class, 'validateLocation']);

        // Calculate Fare Estimate
        // POST /api/bot/calculate
        // { "serviceType": "Passenger", "pickup": "Colombo", "destination": "Kandy", ... }
        Route::post('/calculate', [BookingApiController::class, 'calculateFare']);
    });
});

?>

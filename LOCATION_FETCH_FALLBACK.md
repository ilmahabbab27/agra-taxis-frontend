# Location Fetch Fallback - What To Do When Location Cannot Be Fetched

Complete guide for handling location fetch failures and errors.

---

## Scenario 1: Location Not Found

### Problem
```
Customer enters: "xyz123"
API Response: { success: false, error: "LOCATION_NOT_FOUND" }
```

### Solution: Show Suggestions

```javascript
async function handleLocationInput(customerInput) {
  const result = await fetchLocation(customerInput);

  if (!result.success) {
    // Show top 3 suggestions
    const suggestions = result.suggestions.slice(0, 3);
    
    if (suggestions.length > 0) {
      bot.send(`🤔 I couldn't find "${customerInput}"`);
      bot.send('Did you mean one of these?');
      
      suggestions.forEach(location => {
        bot.addButton(
          `${location.name} (${location.district})`,
          () => selectLocation(location.name)
        );
      });
    } else {
      // Fallback: Show all major locations
      showMajorLocations();
    }
  }
}

function showMajorLocations() {
  const majorLocations = [
    'Colombo', 'Kandy', 'Galle', 'Matara',
    'Nuwara Eliya', 'Trincomalee', 'Jaffna',
    'Kurunegala', 'Negombo', 'Matale'
  ];

  bot.send('Here are some major cities:');
  majorLocations.forEach(location => {
    bot.addButton(location, () => selectLocation(location));
  });
}
```

---

## Scenario 2: Network Error

### Problem
```
API Call fails: Network timeout or server down
Error: "Failed to fetch"
```

### Solution: Retry & Fallback

```javascript
async function fetchLocationWithRetry(
  customerInput,
  maxRetries = 3,
  delayMs = 1000
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/locations/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: customerInput }),
        timeout: 5000 // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.log(`Attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // Exponential backoff
      } else {
        // All retries failed - use fallback
        return {
          success: false,
          error: 'NETWORK_ERROR',
          message: 'Unable to connect. Please try again.'
        };
      }
    }
  }
}

// Usage
const result = await fetchLocationWithRetry('colombo');

if (!result.success && result.error === 'NETWORK_ERROR') {
  bot.send('📡 Network error. Please check your connection and try again.');
  
  // Offer manual entry
  bot.send('Or select from our list:');
  showMajorLocations();
}
```

---

## Scenario 3: Ambiguous Location (Multiple Matches)

### Problem
```
Customer enters: "mata"
Could match: Matara or Matale
API Response: { error: "AMBIGUOUS_LOCATION", suggestions: [...] }
```

### Solution: Ask for Clarification

```javascript
async function handleAmbiguousLocation(result) {
  const { suggestions, message } = result;

  bot.send(message); // "Did you mean Matara or Matale?"
  
  suggestions.forEach(location => {
    const label = `${location.name}`;
    
    if (location.isHillCountry) {
      label += ' ⛰️ (Hill Country)';
    } else {
      label += ' 🌴 (Lowland)';
    }
    
    bot.addButton(label, () => {
      selectLocation(location.name);
    });
  });
}
```

---

## Scenario 4: Empty or Invalid Input

### Problem
```
Customer enters: "" or "   " (empty)
API Response: { success: false, error: "EMPTY_INPUT" }
```

### Solution: Prompt Again

```javascript
async function validateInput(customerInput) {
  const trimmed = customerInput.trim();

  if (!trimmed) {
    bot.send('Please enter a location name.');
    return null;
  }

  if (trimmed.length < 2) {
    bot.send('Location name is too short. Try again.');
    return null;
  }

  if (trimmed.length > 50) {
    bot.send('Location name is too long. Try again.');
    return null;
  }

  return trimmed;
}
```

---

## Scenario 5: API Server Down

### Problem
```
API not responding at all
Timeout after 5 seconds
```

### Solution: Cache & Fallback

```javascript
class LocationCache {
  constructor() {
    this.cache = new Map();
    this.allLocations = null;
  }

  set(key, value) {
    this.cache.set(key.toLowerCase(), value);
  }

  get(key) {
    return this.cache.get(key.toLowerCase());
  }

  setAllLocations(locations) {
    this.allLocations = locations;
  }

  getAllLocations() {
    return this.allLocations || this.getDefaultLocations();
  }

  getDefaultLocations() {
    return [
      { name: 'Colombo', district: 'Colombo', isHillCountry: false },
      { name: 'Kandy', district: 'Kandy', isHillCountry: true },
      { name: 'Galle', district: 'Galle', isHillCountry: false },
      { name: 'Matara', district: 'Matara', isHillCountry: false },
      { name: 'Nuwara Eliya', district: 'Nuwara Eliya', isHillCountry: true },
      { name: 'Trincomalee', district: 'Trincomalee', isHillCountry: false },
      { name: 'Jaffna', district: 'Jaffna', isHillCountry: false },
      { name: 'Kurunegala', district: 'Kurunegala', isHillCountry: false },
      { name: 'Negombo', district: 'Negombo', isHillCountry: false },
      { name: 'Matale', district: 'Matale', isHillCountry: true }
    ];
  }
}

// Usage
const locationCache = new LocationCache();

async function fetchLocationSafe(input) {
  try {
    // Try API first
    const result = await fetchLocationWithTimeout(input, 5000);
    
    if (result.success) {
      // Cache successful result
      locationCache.set(result.corrected, result.data);
      return result;
    }
  } catch (error) {
    console.error('API Error:', error);
  }

  // Try cache
  const cached = locationCache.get(input);
  if (cached) {
    bot.send('📦 Using cached data...');
    return { success: true, data: cached };
  }

  // Fallback to default locations
  bot.send('⚠️ Server unavailable. Here are our main destinations:');
  return {
    success: false,
    error: 'SERVER_DOWN',
    fallbackLocations: locationCache.getAllLocations()
  };
}
```

---

## Scenario 6: Timeout (Takes Too Long)

### Problem
```
API responding but very slowly (>10 seconds)
Customer gets frustrated
```

### Solution: Set Timeout & Show Loading

```javascript
async function fetchLocationWithTimeout(input, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    bot.send('🔍 Searching...');

    const response = await fetch('/api/locations/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: input }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Server error');
    }

    return await response.json();

  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      bot.send('⏱️ Search took too long. Try again or select from list below.');
      return {
        success: false,
        error: 'TIMEOUT',
        fallbackLocations: getDefaultLocations()
      };
    }

    throw error;
  }
}
```

---

## Complete Fallback Handler

```javascript
class LocationFallbackHandler {
  constructor() {
    this.cache = new Map();
  }

  async fetchLocation(input) {
    // Step 1: Validate input
    if (!input || !input.trim()) {
      return this.showInputError('Location cannot be empty');
    }

    // Step 2: Check cache
    const cached = this.cache.get(input.toLowerCase());
    if (cached) {
      return { success: true, data: cached, fromCache: true };
    }

    // Step 3: Try API with retry
    try {
      const result = await this.fetchWithRetry(input);
      
      if (result.success) {
        this.cache.set(input.toLowerCase(), result.data);
        return result;
      }

      // API returned error but with suggestions
      if (result.suggestions && result.suggestions.length > 0) {
        return this.handleSuggestions(result);
      }

      // No suggestions - show default locations
      return this.showDefaultLocations();

    } catch (error) {
      console.error('Fetch failed:', error);
      
      // Network/timeout error - use defaults
      return this.showDefaultLocations(input);
    }
  }

  async fetchWithRetry(input, maxRetries = 2) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.fetchFromAPI(input);
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }

  async fetchFromAPI(input) {
    const response = await fetch('/api/locations/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: input }),
      timeout: 5000
    });

    if (!response.ok) throw new Error('API Error');
    return await response.json();
  }

  handleSuggestions(result) {
    return {
      success: false,
      error: 'LOCATION_NOT_FOUND',
      message: result.message,
      suggestions: result.suggestions.slice(0, 5)
    };
  }

  showDefaultLocations(attemptedInput = '') {
    return {
      success: false,
      error: 'FALLBACK_MODE',
      message: attemptedInput 
        ? `Couldn't find "${attemptedInput}". Please select from below:`
        : 'Please select your location:',
      locations: [
        { name: 'Colombo', district: 'Western' },
        { name: 'Kandy', district: 'Central' },
        { name: 'Galle', district: 'Southern' },
        { name: 'Matara', district: 'Southern' },
        { name: 'Nuwara Eliya', district: 'Central' },
        { name: 'Trincomalee', district: 'Eastern' },
        { name: 'Jaffna', district: 'Northern' },
        { name: 'Kurunegala', district: 'North Western' },
        { name: 'Negombo', district: 'Western' },
        { name: 'Matale', district: 'Central' }
      ]
    };
  }

  showInputError(message) {
    return {
      success: false,
      error: 'INVALID_INPUT',
      message: message
    };
  }
}

// Usage
const fallbackHandler = new LocationFallbackHandler();

async function handleCustomerLocation(input) {
  const result = await fallbackHandler.fetchLocation(input);

  if (result.success) {
    bot.send(`✓ ${result.data.name}`);
    return result.data;
  }

  // Handle error with fallback
  bot.send(result.message);

  if (result.suggestions) {
    result.suggestions.forEach(loc => {
      bot.addButton(loc.name, () => selectLocation(loc.name));
    });
  } else if (result.locations) {
    result.locations.forEach(loc => {
      bot.addButton(`${loc.name} (${loc.district})`, () => selectLocation(loc.name));
    });
  }

  return null;
}
```

---

## Error Response Codes

| Code | Cause | Solution |
|------|-------|----------|
| `EMPTY_INPUT` | User didn't enter anything | Prompt again |
| `LOCATION_NOT_FOUND` | Location not in database | Show suggestions |
| `AMBIGUOUS_LOCATION` | Multiple matches | Ask which one |
| `NETWORK_ERROR` | Server unreachable | Retry or fallback to list |
| `TIMEOUT` | Takes too long (>5s) | Show default locations |
| `FALLBACK_MODE` | API down | Use cached or default data |

---

## Fallback Locations (Always Available)

```javascript
const FALLBACK_LOCATIONS = [
  'Colombo',      // Capital - Always safe
  'Kandy',        // Major city
  'Galle',        // Beach destination
  'Matara',       // Beach destination
  'Nuwara Eliya', // Mountain destination
  'Trincomalee',  // East coast
  'Jaffna',       // North
  'Kurunegala',   // Central
  'Negombo',      // North west
  'Matale'        // Central highlands
];
```

These 10 locations work even if:
- ✅ API is down
- ✅ Database is unavailable
- ✅ Network is slow
- ✅ Service crashes

---

## Testing Fallbacks

### Test Network Error
```javascript
// Simulate network error
async function testNetworkError() {
  const result = await fetchLocationSafe('colombo');
  
  // Should show cached data or default list
  console.assert(!result.success || result.fromCache);
}
```

### Test Timeout
```javascript
// Set very short timeout
async function testTimeout() {
  const result = await fetchLocationWithTimeout('colombo', 100); // 100ms timeout
  
  // Should trigger fallback
  console.assert(result.error === 'TIMEOUT');
}
```

### Test Default Display
```javascript
// Show default locations if fetch fails
async function testDefaultFallback() {
  const result = await fallbackHandler.fetchLocation('xyz');
  
  // Should have fallback locations
  console.assert(result.locations && result.locations.length > 0);
}
```

---

## Best Practices

✅ **Always have fallback** - Never show blank/error to customer
✅ **Cache results** - Reduces API calls
✅ **Retry on error** - Try 2-3 times with delays
✅ **Set timeout** - Don't wait forever
✅ **Show loading** - Tell customer what's happening
✅ **Offer alternatives** - Suggestions or default list
✅ **Log errors** - For debugging
✅ **Monitor API health** - Know when it's down

---

## Summary

When location fetch fails:

1. **First:** Try with suggestions
2. **Second:** Retry with delay
3. **Third:** Use cache
4. **Fourth:** Show default list
5. **Always:** Tell user what's happening

**Never silently fail - always give customer a path forward!** ✓


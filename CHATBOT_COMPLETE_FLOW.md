# Complete Chatbot Flow - How It Should Work

End-to-end guide for implementing the complete chatbot conversation flow.

---

## Architecture Overview

```
Customer
    ↓
Chatbot Interface (Frontend)
    ↓
3 API Endpoints
    ├─ POST /bot/location     (Location validation)
    ├─ POST /bot/calculate    (Fare calculation)
    └─ GET  /locations/fetch  (Location lookup)
    ↓
Services (Backend)
    ├─ LocationPredictorService
    ├─ FareEstimationService
    └─ Database (Vehicles, Lorries, Rates)
```

---

## Complete Chat Flow

```
START
  ↓
Bot: "Welcome to Agra Connect! 👋
      Are you looking for:
      1️⃣ Passenger Transport
      2️⃣ Cargo/Lorry Service"
  ↓
Customer: "1" (or "passenger")
  ↓
[PASSENGER FLOW]
  ├─ Get pickup location
  ├─ Get destination location
  ├─ Get passenger count
  ├─ Get AC preference
  ├─ Calculate fare
  └─ Show options (Book/Cancel)
  ↓
OR [LORRY FLOW]
  ├─ Get pickup location
  ├─ Get destination location
  ├─ Get lorry type
  ├─ Calculate fare
  └─ Show options (Book/Cancel)
  ↓
END
```

---

## Step-by-Step Conversation

### STEP 1: Welcome & Service Selection

```
Bot: "Welcome to Agra Connect! 👋
      What do you need?
      1️⃣ Transport Passengers
      2️⃣ Transport Cargo (Lorry)"

Customer: "1" or "passengers"

Bot: "Great! Let's book a ride. 🚗"
```

### STEP 2: Get Pickup Location

```
Bot: "Where are you traveling from?"

Customer: "colombo"

API Call: POST /bot/location
{
  "location": "colombo",
  "type": "pickup"
}

Response:
{
  "success": true,
  "location": "Colombo",
  "coordinates": { "lat": 6.9271, "lng": 80.7789 },
  "isHillCountry": false,
  "district": "Colombo"
}

Bot: "✓ Colombo (Western Province)"
```

### STEP 3: Get Destination

```
Bot: "Where are you going?"

Customer: "kan"

API Call: POST /locations/suggest
{
  "query": "kan",
  "limit": 5
}

Response:
{
  "success": true,
  "suggestions": [
    { "name": "Kandy", "isHillCountry": true, "match_score": 0.99 },
    { "name": "Kurunegala", "isHillCountry": false, "match_score": 0.75 }
  ]
}

Bot: "Did you mean:
      🏔️ Kandy (Hill Country)
      or
      Kurunegala"

Customer: "Kandy"

Bot: "✓ Kandy (Central Province - Hill Country)"
```

### STEP 4: Get Passenger Count

```
Bot: "How many passengers?"

Customer: "5"

Bot: "✓ 5 passengers"
```

### STEP 5: Get AC Preference

```
Bot: "AC or Non-AC?"

Customer: "AC"

Bot: "✓ AC"
```

### STEP 6: Calculate Fare

```
Bot: "📋 Calculating your fare..."

API Call: POST /bot/calculate
{
  "serviceType": "Passenger",
  "pickup": "Colombo",
  "destination": "Kandy",
  "vehicle": "Toyota Hiace",
  "passengers": 5,
  "acOption": "AC",
  "days": 1,
  "tripType": "One Way"
}

Response:
{
  "success": true,
  "estimatedFare": 18000,
  "distance": 115.5,
  "isHillCountry": true,
  "breakdown": {
    "package1": 18000,
    "package2": 20799,
    "recommended": 18000
  }
}

Bot: "💰 YOUR ESTIMATE

📍 Colombo → Kandy
📏 Distance: 115.5 km
👥 Passengers: 5
🌡️  AC
⛰️ Hill Country: +Rs. 10/km
🚗 Vehicle: Toyota Hiace
📅 1 Day

PACKAGE 1 (Recommended):
✓ Daily Rate: Rs. 18,000
  (Includes 150 km, then Rs. 190/km)

PACKAGE 2 (Distance-Based):
✗ Pure Distance: Rs. 20,799
  (115.5 km × Rs. 190/km)

Best Option: Package 1 saves Rs. 2,799! 💰"
```

### STEP 7: Booking Options

```
Bot: "What would you like to do?
      [BOOK NOW] [CANCEL]"

Customer: "BOOK NOW"

Bot: "📱 Opening WhatsApp...
      
      Your booking details are being sent to us.
      Our team will confirm shortly!
      
      ✓ Booking saved
      ✓ WhatsApp sent
      
      Thank you for choosing Agra Connect! 🙏"

END
```

---

## Lorry Flow (Alternative)

```
Bot: "Welcome to Agra Connect! 👋"

Customer: "2" or "lorry"

Bot: "📦 Perfect! Let's book a lorry.

Where are you picking up from?"

Customer: "colombo"
→ Validate location (pickup)

Bot: "✓ Colombo

Where are you dropping off?"

Customer: "matara"
→ Validate location (destination)

Bot: "✓ Matara (160 km away)

What size lorry?
7 FT (Standard)
10.5 FT (Large)
12.5 FT (Extra Large)"

Customer: "7 FT"

Bot: "📋 Calculating lorry fare..."

API Call: POST /bot/calculate
{
  "serviceType": "Lorry",
  "pickup": "Colombo",
  "destination": "Matara",
  "lorryType": "7ft",
  "tripType": "One Way",
  "days": 1
}

Response:
{
  "success": true,
  "estimatedFare": 7300,
  "distance": 160,
  "breakdown": {
    "startCharge": 2500,
    "extraKmCharge": 4800,
    "hillSurcharge": 0,
    "total": 7300
  }
}

Bot: "🚚 LORRY FARE ESTIMATE

📍 Colombo → Matara
📏 Distance: 160 km
🚚 Lorry: 7 FT
📦 Service: One Way

BREAKDOWN:
✓ Start Charge: Rs. 2,500
✓ Extra KM (30 km): Rs. 4,800
✓ Hill Surcharge: Rs. 0
━━━━━━━━━━━━━━━━━━━
TOTAL: Rs. 7,300

[BOOK NOW] [CANCEL]"

Customer: "BOOK NOW"

Bot: "✓ Booking confirmed!
      Sending to WhatsApp...
      Thank you! 🙏"
```

---

## Error Handling Examples

### Error: Location Not Found

```
Customer: "xyz123"

API Response: { success: false, suggestions: [...] }

Bot: "🤔 I couldn't find 'xyz123'

Did you mean one of these?
🔘 Colombo
🔘 Kandy
🔘 Galle
🔘 Or another city"

Customer: "Colombo"
→ Continue from Step 2
```

### Error: Network Timeout

```
Bot: "⏱️ Taking a while to connect...

Please select from our main cities:
🔘 Colombo
🔘 Kandy
🔘 Galle
🔘 Matara
🔘 Nuwara Eliya
🔘 Trincomalee
🔘 Jaffna"

Customer: "Colombo"
→ Use cached/default data
```

### Error: Ambiguous Location

```
Customer: "mata"

API Response: { error: "AMBIGUOUS_LOCATION" }

Bot: "Did you mean?
      🔘 Matara (Southern - Lowland)
      🔘 Matale (Central - Hill Country)"

Customer: "Matara"
→ Continue
```

---

## Complete JavaScript Implementation

```javascript
class ChatBot {
  constructor(apiBaseUrl = 'http://localhost:8000/api') {
    this.apiBase = apiBaseUrl;
    this.sessionData = {
      serviceType: null,
      pickup: null,
      destination: null,
      passengers: null,
      acOption: null,
      lorryType: null,
      tripType: 'One Way'
    };
  }

  // Step 1: Welcome
  async start() {
    this.showMessage('bot', `Welcome to Agra Connect! 👋
What do you need?
1️⃣ Transport Passengers
2️⃣ Transport Cargo (Lorry)`);
    
    this.addQuickReply('Passenger', () => this.selectService('Passenger'));
    this.addQuickReply('Lorry', () => this.selectService('Lorry'));
  }

  // Step 2: Select Service
  async selectService(service) {
    this.sessionData.serviceType = service;
    
    if (service === 'Passenger') {
      this.showMessage('bot', '🚗 Great! Where are you traveling from?');
      this.enableInput('pickup');
    } else {
      this.showMessage('bot', '🚚 Where are you picking up from?');
      this.enableInput('pickup');
    }
  }

  // Step 3: Get Pickup Location
  async handlePickupLocation(input) {
    const location = await this.validateLocation(input, 'pickup');
    
    if (!location.success) {
      this.handleLocationError(location, 'pickup');
      return;
    }

    this.sessionData.pickup = location.name;
    this.showMessage('bot', `✓ ${location.name}`);
    
    if (this.sessionData.serviceType === 'Passenger') {
      this.showMessage('bot', '📍 Where are you going?');
    } else {
      this.showMessage('bot', '📦 Where are you dropping off?');
    }
    
    this.enableInput('destination');
  }

  // Step 4: Get Destination Location
  async handleDestination(input) {
    const location = await this.validateLocation(input, 'destination');
    
    if (!location.success) {
      this.handleLocationError(location, 'destination');
      return;
    }

    this.sessionData.destination = location.name;
    this.showMessage('bot', `✓ ${location.name}`);
    
    if (this.sessionData.serviceType === 'Passenger') {
      this.showMessage('bot', '👥 How many passengers?');
      this.enableInput('passengers');
    } else {
      this.showMessage('bot', '🚚 What size lorry?\n7 FT\n10.5 FT\n12.5 FT');
      this.addQuickReply('7 FT', () => this.selectLorryType('7ft'));
      this.addQuickReply('10.5 FT', () => this.selectLorryType('10.5ft'));
      this.addQuickReply('12.5 FT', () => this.selectLorryType('12.5ft'));
    }
  }

  // Step 5: Get Passenger Count (Passenger only)
  async handlePassengers(input) {
    const count = parseInt(input);
    
    if (isNaN(count) || count < 1 || count > 60) {
      this.showMessage('bot', '❌ Please enter 1-60');
      return;
    }

    this.sessionData.passengers = count;
    this.showMessage('bot', `✓ ${count} passengers`);
    this.showMessage('bot', '🌡️ AC or Non-AC?');
    this.addQuickReply('AC', () => this.selectAC('AC'));
    this.addQuickReply('Non-AC', () => this.selectAC('Non AC'));
  }

  // Step 6: Get AC Option
  async selectAC(option) {
    this.sessionData.acOption = option;
    this.showMessage('bot', `✓ ${option}`);
    await this.calculatePassengerFare();
  }

  // Step 7: Select Lorry Type
  async selectLorryType(type) {
    this.sessionData.lorryType = type;
    this.showMessage('bot', `✓ ${type} Lorry selected`);
    await this.calculateLorryFare();
  }

  // Calculate Passenger Fare
  async calculatePassengerFare() {
    this.showMessage('bot', '📋 Calculating your fare...');

    try {
      const response = await fetch(`${this.apiBase}/bot/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: 'Passenger',
          pickup: this.sessionData.pickup,
          destination: this.sessionData.destination,
          vehicle: 'Toyota Hiace',
          passengers: this.sessionData.passengers,
          acOption: this.sessionData.acOption,
          days: 1,
          tripType: 'One Way'
        })
      });

      const result = await response.json();

      if (!result.success) {
        this.showMessage('bot', '❌ Could not calculate fare. Try again.');
        return;
      }

      this.showFareEstimate(result);
      this.showBookingOptions();

    } catch (error) {
      console.error('Calculation error:', error);
      this.showMessage('bot', '❌ Network error. Try again.');
    }
  }

  // Calculate Lorry Fare
  async calculateLorryFare() {
    this.showMessage('bot', '📋 Calculating lorry fare...');

    try {
      const response = await fetch(`${this.apiBase}/bot/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: 'Lorry',
          pickup: this.sessionData.pickup,
          destination: this.sessionData.destination,
          lorryType: this.sessionData.lorryType,
          tripType: 'One Way',
          days: 1
        })
      });

      const result = await response.json();

      if (!result.success) {
        this.showMessage('bot', '❌ Could not calculate fare. Try again.');
        return;
      }

      this.showFareEstimate(result);
      this.showBookingOptions();

    } catch (error) {
      console.error('Calculation error:', error);
      this.showMessage('bot', '❌ Network error. Try again.');
    }
  }

  // Show Fare Estimate
  showFareEstimate(data) {
    const msg = `
💰 YOUR ESTIMATE

📍 ${data.distance} km
${data.isHillCountry ? '⛰️ Hill Country (+Rs. 10/km)' : ''}

🚗 Rs. ${data.estimatedFare.toLocaleString()}

${data.breakdown.package1 ? `Package 1: Rs. ${data.breakdown.package1.toLocaleString()}` : ''}
${data.breakdown.package2 ? `Package 2: Rs. ${data.breakdown.package2.toLocaleString()}` : ''}
    `;

    this.showMessage('bot', msg);
  }

  // Show Booking Options
  showBookingOptions() {
    this.showMessage('bot', 'What would you like to do?');
    this.addQuickReply('✅ Book Now', () => this.confirmBooking());
    this.addQuickReply('❌ Cancel', () => this.cancel());
  }

  // Confirm Booking
  async confirmBooking() {
    this.showMessage('bot', '✅ Booking confirmed!\n📱 Sending to WhatsApp...\n\nThank you for choosing Agra Connect! 🙏');
    // Call backend to save booking and send WhatsApp
  }

  // Cancel
  cancel() {
    this.showMessage('bot', '❌ Booking cancelled.\n\nHave a great day! 👋');
    this.resetSession();
  }

  // Validate Location
  async validateLocation(input, type) {
    try {
      const response = await fetch(`${this.apiBase}/bot/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: input,
          type: type
        })
      });

      return await response.json();

    } catch (error) {
      console.error('Location validation error:', error);
      return { success: false, error: 'NETWORK_ERROR' };
    }
  }

  // Handle Location Error
  handleLocationError(result, type) {
    if (result.error === 'LOCATION_NOT_FOUND') {
      this.showMessage('bot', `🤔 I couldn't find "${result.location}"\n\nDid you mean:`);
      
      result.suggestions.forEach(suggestion => {
        this.addQuickReply(suggestion.name, () => {
          if (type === 'pickup') {
            this.handlePickupLocation(suggestion.name);
          } else {
            this.handleDestination(suggestion.name);
          }
        });
      });
    }
  }

  // UI Methods
  showMessage(sender, message) {
    // Show message in chat UI
    console.log(`${sender}: ${message}`);
  }

  addQuickReply(label, callback) {
    // Add quick reply button
    console.log(`Button: ${label}`);
  }

  enableInput(type) {
    // Enable text input for user
    console.log(`Waiting for: ${type}`);
  }

  resetSession() {
    this.sessionData = {
      serviceType: null,
      pickup: null,
      destination: null,
      passengers: null,
      acOption: null,
      lorryType: null,
      tripType: 'One Way'
    };
  }
}

// Usage
const chatbot = new ChatBot();
chatbot.start();
```

---

## HTML Integration Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Agra Connect Chatbot</title>
    <style>
        .chat-container {
            max-width: 500px;
            margin: 0 auto;
            border: 1px solid #ddd;
            border-radius: 10px;
            height: 600px;
            display: flex;
            flex-direction: column;
        }

        .messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #f5f5f5;
        }

        .message {
            margin-bottom: 10px;
            padding: 10px;
            border-radius: 5px;
        }

        .bot {
            background: #e3f2fd;
            text-align: left;
        }

        .user {
            background: #fff9c4;
            text-align: right;
        }

        .input-area {
            padding: 20px;
            border-top: 1px solid #ddd;
            display: flex;
            gap: 10px;
        }

        input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }

        button {
            padding: 10px 20px;
            background: #ff9800;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        .quick-replies {
            padding: 10px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .quick-reply {
            padding: 8px 15px;
            background: #ff9800;
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="messages" id="messages"></div>
        <div class="quick-replies" id="quickReplies"></div>
        <div class="input-area">
            <input type="text" id="userInput" placeholder="Type your message...">
            <button onclick="sendMessage()">Send</button>
        </div>
    </div>

    <script>
        const chatbot = new ChatBot();

        function sendMessage() {
            const input = document.getElementById('userInput');
            const message = input.value.trim();
            
            if (!message) return;

            // Show user message
            showMessage('user', message);
            input.value = '';

            // Process with chatbot
            chatbot.handleUserInput(message);
        }

        function showMessage(sender, text) {
            const messagesDiv = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}`;
            messageDiv.textContent = text;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        // Initialize
        chatbot.start();
    </script>
</body>
</html>
```

---

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/bot/location` | POST | Validate/fetch location |
| `/bot/calculate` | POST | Calculate fare |
| `/locations/fetch` | POST | Fetch location (alias) |
| `/locations/suggest` | POST | Autocomplete suggestions |
| `/locations/distance` | POST | Get distance between locations |
| `/locations/is-hill-country` | POST | Check if location is hill country |

---

## Key Points

✅ **Always validate locations** before calculating fare
✅ **Show loading message** while calculating
✅ **Handle errors gracefully** with suggestions
✅ **Cache results** to avoid repeated API calls
✅ **Show breakdown** so customer understands pricing
✅ **Offer alternatives** (Package 1 vs 2, different lorry sizes)
✅ **Confirm before booking** to prevent mistakes
✅ **Send to WhatsApp** for final confirmation

---

## Testing Checklist

- [ ] Start conversation
- [ ] Select passenger transport
- [ ] Enter typo location ("colmbo")
- [ ] Accept suggestion
- [ ] Enter destination
- [ ] Enter passenger count
- [ ] Select AC
- [ ] See fare estimate
- [ ] Click "Book Now"
- [ ] Verify WhatsApp message sent
- [ ] Repeat with Lorry service

**Complete, working chatbot!** ✓


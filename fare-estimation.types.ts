/**
 * Fare Estimation Type Definitions
 *
 * Use these types in your TypeScript chatbot to ensure type safety
 * and better IDE autocomplete support.
 */

// ============================================================================
// Common Types
// ============================================================================

export type TripType = "One Way" | "Round Trip";
export type ServiceType = "Passenger" | "Lorry";
export type AcOption = "AC" | "Non AC";
export type Currency = "LKR";

export interface RouteInfo {
  distanceKm: number;
  pickupHillCountry?: boolean;
  destinationHillCountry?: boolean;
  isHillCountry: boolean;
}

// ============================================================================
// Passenger Vehicle Types
// ============================================================================

export interface DayPrices {
  acNormal: number;
  acHill: number;
  nonAcNormal: number;
  nonAcHill: number;
}

export interface PackagePrices {
  [key: string]: DayPrices; // e.g., "day1", "day2", "day3"
}

export interface PerKmPrices {
  ac: {
    oneWay: {
      normal: number;
      hill: number;
    };
    roundTrip: {
      normal: number;
      hill: number;
    };
  };
  nonAc: {
    oneWay: {
      normal: number;
      hill: number;
    };
    roundTrip: {
      normal: number;
      hill: number;
    };
  };
}

export interface VehicleCatalogItem {
  id?: number;
  name: string;
  category: string;
  seats: number;
  img?: string;
  acPricePerKm: number;
  acHillPricePerKm: number;
  nonAcPricePerKm: number;
  nonAcHillPricePerKm: number;
  acAvailable: boolean;
  nonAcAvailable: boolean;
  package1Prices?: PackagePrices;
  perKmPrices?: PerKmPrices;
  vehicleCostPerDay?: number;
  driverChargePerDay?: number;
  fuelPricePerLiter?: number;
  normalKmPerLiter?: number;
  hillKmPerLiter?: number;
  includeOperatingCosts?: boolean;
  commissionRate?: number;
}

export interface PassengerTripDetails {
  tripType: TripType;
  days: number;
  passengers: number;
  acOption: AcOption;
}

export interface PassengerFareRequest {
  vehicle: VehicleCatalogItem;
  tripDetails: PassengerTripDetails;
  route: RouteInfo;
}

export interface PackageBreakdown {
  estimate: number;
  description: string;
  calculation: {
    dailyPackageCharge?: number;
    days?: number;
    packageBaseCharge?: number;
    additionalKm: number;
    additionalKmCharge: number;
    distanceKm?: number;
    ratePerKm?: number;
    total: number;
  };
}

export interface PassengerFareResponse {
  success: true;
  data: {
    estimatedFare: number;
    breakdown: {
      package1: PackageBreakdown;
      package2: PackageBreakdown;
    };
    packageRecommendation: "package1" | "package2";
    pricePerKm: number;
    hillCountrySurcharge: boolean;
    includedKm: number;
    totalDistance: number;
    billableKm: number;
    additionalKm: number;
    days: number;
    currency: Currency;
  };
  meta: {
    timestamp: string;
    estimationType: "passenger";
    vehicleName: string;
    tripType: TripType;
    acOption: AcOption;
  };
}

// ============================================================================
// Lorry Service Types
// ============================================================================

export interface LorryRateRow {
  type: string;
  hillExtraPerKm: number;
  start: number;
  extra: number;
  upDown: number;
  waiting?: number;
  waitingHour?: number;
  between100And130: number;
  maxUpDownKm: number;
  dropMinKm: number;
  dropMaxKm: number;
}

export interface LorryTripDetails {
  tripType: TripType;
  days: number;
}

export interface LorryFareRequest {
  lorryType?: string;
  lorryRates: LorryRateRow;
  tripDetails: LorryTripDetails;
  route: RouteInfo;
}

export type LorryPricingRule =
  | "standard_drop"
  | "extra_km_drop"
  | "between_100_130"
  | "round_trip_up_down"
  | "round_trip_extra"
  | "unknown";

export interface LorryBreakdown {
  startCharge: number;
  extraKm: number;
  extraKmCharge: number;
  hillSurcharge: number;
  total: number;
}

export interface LorryFareResponse {
  success: true;
  data: {
    estimatedFare: number;
    breakdown: LorryBreakdown;
    priceDetails: {
      lorryType: string;
      startCharge: number;
      extraKmRate: number;
      hillExtraPerKm: number;
      totalKm: number;
      hillSurchargeCalculation: string;
    };
    tripType: TripType;
    isRoundTrip: boolean;
    applicablePricingRule: LorryPricingRule;
    distanceKm: number;
    daysMultiplier: number;
    currency: Currency;
  };
  meta: {
    timestamp: string;
    estimationType: "lorry";
    lorrySize: string;
  };
}

// ============================================================================
// Error Responses
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ErrorResponse {
  success: false;
  error: ApiError;
}

export type FareEstimationResponse =
  | PassengerFareResponse
  | LorryFareResponse
  | ErrorResponse;

// ============================================================================
// Chatbot Helper Types
// ============================================================================

export interface ChatbotEstimationRequest {
  serviceType: ServiceType;
  vehicle?: VehicleCatalogItem;
  lorryRates?: LorryRateRow;
  tripType: TripType;
  distance: number;
  passengers?: number;
  acOption?: AcOption;
  days?: number;
  isHillCountry: boolean;
}

export interface ChatbotFareQuote {
  estimatedFare: number;
  currency: Currency;
  breakdown: string; // Human-readable breakdown
  details: Record<string, unknown>;
  recommendation: string;
}

export interface FormattedChatbotResponse {
  quote: ChatbotFareQuote;
  userMessage: string; // Formatted message to send to user
  raw: PassengerFareResponse | LorryFareResponse;
}

// ============================================================================
// API Client Interface
// ============================================================================

export interface FareEstimationClient {
  estimatePassengerFare(
    request: PassengerFareRequest
  ): Promise<PassengerFareResponse>;

  estimateLorryFare(request: LorryFareRequest): Promise<LorryFareResponse>;

  formatForChatbot(
    response: PassengerFareResponse | LorryFareResponse
  ): ChatbotFareQuote;
}

// ============================================================================
// Usage Example
// ============================================================================

/*
import type { PassengerFareRequest, PassengerFareResponse } from './fare-estimation.types';

async function getChatbotFareEstimate() {
  const request: PassengerFareRequest = {
    vehicle: {
      name: "Toyota Hiace",
      category: "Mini Buses",
      seats: 14,
      acPricePerKm: 180,
      acHillPricePerKm: 220,
      nonAcPricePerKm: 150,
      nonAcHillPricePerKm: 180,
      acAvailable: true,
      nonAcAvailable: true,
      package1Prices: {
        day1: {
          acNormal: 15000,
          acHill: 18000,
          nonAcNormal: 12000,
          nonAcHill: 14000,
        },
      },
    },
    tripDetails: {
      tripType: "One Way",
      days: 1,
      passengers: 8,
      acOption: "AC",
    },
    route: {
      distanceKm: 85.5,
      isHillCountry: true,
      pickupHillCountry: false,
      destinationHillCountry: true,
    },
  };

  try {
    const response: PassengerFareResponse = await fetch(
      "http://localhost:8000/api/estimate-passenger-fare",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      }
    ).then(r => r.json());

    if (response.success) {
      console.log(`Estimated fare: Rs. ${response.data.estimatedFare}`);
      console.log(`Package 1: Rs. ${response.data.breakdown.package1.estimate}`);
      console.log(`Package 2: Rs. ${response.data.breakdown.package2.estimate}`);
    }
  } catch (error) {
    console.error("Estimation failed:", error);
  }
}
*/

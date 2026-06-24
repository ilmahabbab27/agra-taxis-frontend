import type {
  FareEstimationResponse,
  LorryFareRequest,
  LorryFareResponse,
  PassengerFareRequest,
  PassengerFareResponse,
} from "@/fare-estimation.types";
import { API_BASE } from "./api";

const FARE_ESTIMATE_ENDPOINT = `${API_BASE}/fare-estimate`;

async function fetchFareEstimate(request: PassengerFareRequest | LorryFareRequest) {
  const response = await fetch(FARE_ESTIMATE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Fare estimate request failed (${response.status}): ${text || response.statusText}`,
    );
  }

  return (await response.json()) as FareEstimationResponse;
}

export async function estimatePassengerFare(
  request: PassengerFareRequest,
): Promise<PassengerFareResponse> {
  const result = await fetchFareEstimate(request);
  if (!result.success) {
    throw new Error(result.error?.message || "Passenger fare estimation failed");
  }
  return result as PassengerFareResponse;
}

export async function estimateLorryFare(
  request: LorryFareRequest,
): Promise<LorryFareResponse> {
  const result = await fetchFareEstimate(request);
  if (!result.success) {
    throw new Error(result.error?.message || "Lorry fare estimation failed");
  }
  return result as LorryFareResponse;
}

export async function estimateFare(
  request: PassengerFareRequest | LorryFareRequest,
): Promise<FareEstimationResponse> {
  return fetchFareEstimate(request);
}

export type {
  LorryFareRequest,
  PassengerFareRequest,
  FareEstimationResponse,
  PassengerFareResponse,
  LorryFareResponse,
};

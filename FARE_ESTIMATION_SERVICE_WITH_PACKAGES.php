<?php

namespace App\Services;

/**
 * Fare Estimation Service with Package Pricing
 *
 * Supports two pricing models:
 * - Package 1: Day-based pricing (includes 150 km per day)
 * - Package 2: Per-km pricing (simple distance × rate)
 */

class FareEstimationService
{
    const INCLUDED_KM_PER_DAY = 150;

    /**
     * Estimate Passenger Fare with Package Options
     *
     * Returns both Package 1 (day package) and Package 2 (per km) estimates
     */
    public function estimatePassengerFare($vehicle, $options, $distance)
    {
        $distanceKm = $distance['distanceKm'];
        $isHillCountry = $distance['isHillCountry'];
        $passengers = $options['passengers'];
        $acOption = $options['acOption'];
        $days = isset($options['days']) ? intval($options['days']) : 1;
        $tripType = $options['tripType'];

        // Adjust distance for round trip
        $effectiveDistance = $distanceKm;
        if ($tripType === 'Round Trip') {
            $effectiveDistance = $distanceKm * 2;
        }

        // Get price per km based on AC option and hill country
        $pricePerKm = $this->getPricePerKm(
            $vehicle,
            $acOption,
            $isHillCountry
        );

        // PACKAGE 1: Day-based pricing
        $package1 = $this->calculatePackage1(
            $vehicle,
            $acOption,
            $isHillCountry,
            $effectiveDistance,
            $days
        );

        // PACKAGE 2: Per-km pricing
        $package2 = $this->calculatePackage2(
            $pricePerKm,
            $effectiveDistance,
            $isHillCountry
        );

        // Return both options
        return [
            'success' => true,
            'data' => [
                'package1' => $package1,
                'package2' => $package2,
                'recommended' => $days == 1 ? 'package1' : 'package2',
                'selectedPackage' => $days == 1 ? $package1['total'] : $package2['total'],
                'pricePerKm' => $pricePerKm,
                'effectiveDistance' => $effectiveDistance,
                'days' => $days,
                'tripType' => $tripType,
                'vehicle' => $vehicle['name'],
                'passengers' => $passengers,
                'acOption' => $acOption,
                'isHillCountry' => $isHillCountry
            ]
        ];
    }

    /**
     * Calculate Package 1 (Day Package)
     *
     * Includes 150 km per day
     * Additional km charged at specified rate
     */
    private function calculatePackage1($vehicle, $acOption, $isHillCountry, $totalKm, $days)
    {
        // Get base package charge from vehicle.package1Prices
        $dayKey = "day" . max(1, floor($days));
        $packagePrices = isset($vehicle['package1Prices']) ? $vehicle['package1Prices'] : [];

        if (!isset($packagePrices[$dayKey])) {
            // Fallback if day key not found
            return $this->calculatePackage2(
                $this->getPricePerKm($vehicle, $acOption, $isHillCountry),
                $totalKm,
                $isHillCountry
            );
        }

        $dayPricing = $packagePrices[$dayKey];

        // Get base charge for this day/AC/hill combination
        $baseCharge = $this->getPackageChargeFromPricing(
            $dayPricing,
            $acOption,
            $isHillCountry
        );

        // Calculate included and additional km
        $includedKm = self::INCLUDED_KM_PER_DAY * $days;
        $additionalKm = max(0, $totalKm - $includedKm);

        // Get price per km for additional charges
        $pricePerKm = $this->getPricePerKm($vehicle, $acOption, $isHillCountry);
        $additionalCharges = $additionalKm * $pricePerKm;

        $totalFare = $baseCharge + $additionalCharges;

        return [
            'type' => 'package1',
            'name' => 'Day Package',
            'baseCharge' => $baseCharge,
            'includedKm' => $includedKm,
            'additionalKm' => $additionalKm,
            'additionalCharges' => $additionalCharges,
            'total' => $totalFare,
            'breakdown' => [
                'basePackageCharge' => $baseCharge,
                'includedKmPerDay' => self::INCLUDED_KM_PER_DAY,
                'includedKmTotal' => $includedKm,
                'additionalKm' => $additionalKm,
                'pricePerAdditionalKm' => $pricePerKm,
                'additionalCharges' => $additionalCharges,
                'total' => $totalFare
            ]
        ];
    }

    /**
     * Calculate Package 2 (Per-KM Pricing)
     *
     * Simple: Total Distance × Price Per KM
     * No included km, all distance charged
     */
    private function calculatePackage2($pricePerKm, $totalKm, $isHillCountry)
    {
        $totalFare = $totalKm * $pricePerKm;

        return [
            'type' => 'package2',
            'name' => 'Per KM',
            'pricePerKm' => $pricePerKm,
            'totalKm' => $totalKm,
            'total' => $totalFare,
            'breakdown' => [
                'distance' => $totalKm,
                'pricePerKm' => $pricePerKm,
                'isHillCountry' => $isHillCountry,
                'total' => $totalFare
            ]
        ];
    }

    /**
     * Get charge from package pricing data
     */
    private function getPackageChargeFromPricing($dayPricing, $acOption, $isHillCountry)
    {
        if ($acOption === 'Non-AC') {
            return $isHillCountry ? $dayPricing['nonAcHill'] : $dayPricing['nonAcNormal'];
        }
        return $isHillCountry ? $dayPricing['acHill'] : $dayPricing['acNormal'];
    }

    /**
     * Get price per km
     */
    private function getPricePerKm($vehicle, $acOption, $isHillCountry)
    {
        if ($acOption === 'Non-AC') {
            return $isHillCountry
                ? $vehicle['non_ac_hill_price_per_km'] ?? $vehicle['nonAcHillPricePerKm']
                : $vehicle['non_ac_price_per_km'] ?? $vehicle['nonAcPricePerKm'];
        }

        return $isHillCountry
            ? $vehicle['ac_hill_price_per_km'] ?? $vehicle['acHillPricePerKm']
            : $vehicle['ac_price_per_km'] ?? $vehicle['acPricePerKm'];
    }

    /**
     * Estimate Lorry Fare (simpler, no packages)
     */
    public function estimateLorryFare($lorryRates, $options, $distance)
    {
        $distanceKm = $distance['distanceKm'];
        $isHillCountry = $distance['is_hill_country_route'];
        $tripType = $options['tripType'];

        // Adjust for round trip
        $effectiveDistance = $distanceKm;
        if ($tripType === 'Round Trip') {
            $effectiveDistance = $distanceKm * 2;
        }

        // Base calculation
        $baseFare = $lorryRates['start'] ?? 2500;
        $extraCharge = ($effectiveDistance - ($lorryRates['dropMinKm'] ?? 100)) * ($lorryRates['extra'] ?? 160);

        // Hill country surcharge
        $hillCharge = 0;
        if ($isHillCountry) {
            $hillCharge = $effectiveDistance * ($lorryRates['hillExtraPerKm'] ?? 10);
        }

        $totalFare = $baseFare + max(0, $extraCharge) + $hillCharge;

        return [
            'success' => true,
            'data' => [
                'estimatedFare' => $totalFare,
                'distance' => $effectiveDistance,
                'isHillCountry' => $isHillCountry,
                'breakdown' => [
                    'baseFare' => $baseFare,
                    'extraCharge' => max(0, $extraCharge),
                    'hillCharge' => $hillCharge,
                    'total' => $totalFare
                ],
                'lorryType' => $lorryRates['type'],
                'tripType' => $tripType
            ]
        ];
    }
}

?>

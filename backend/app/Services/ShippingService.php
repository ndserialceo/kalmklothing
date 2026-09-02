<?php

namespace App\Services;

class ShippingService
{
    protected array $zones = [
        'Lagos' => 'lagos',
        'Ogun' => 'south_west',
        'Oyo' => 'south_west',
        'Osun' => 'south_west',
        'Ondo' => 'south_west',
        'Ekiti' => 'south_west',
        'Edo' => 'south_south',
        'Delta' => 'south_south',
        'Rivers' => 'south_south',
        'Akwa Ibom' => 'south_south',
        'Cross River' => 'south_south',
        'Bayelsa' => 'south_south',
        'Abia' => 'south_east',
        'Imo' => 'south_east',
        'Anambra' => 'south_east',
        'Enugu' => 'south_east',
        'Ebonyi' => 'south_east',
        'Benue' => 'north_central',
        'Kogi' => 'north_central',
        'Nasarawa' => 'north_central',
        'Plateau' => 'north_central',
        'FCT' => 'north_central',
        'Niger' => 'north_central',
        'Adamawa' => 'north_east',
        'Taraba' => 'north_east',
        'Borno' => 'north_east',
        'Yobe' => 'north_east',
        'Gombe' => 'north_east',
        'Bauchi' => 'north_east',
        'Sokoto' => 'north_west',
        'Zamfara' => 'north_west',
        'Kebbi' => 'north_west',
        'Katsina' => 'north_west',
        'Kano' => 'north_west',
        'Jigawa' => 'north_west',
        'Kaduna' => 'north_west',
    ];

    protected array $rates = [
        'lagos' => 1500,
        'south_west' => 2000,
        'south_south' => 2500,
        'south_east' => 2500,
        'north_central' => 3000,
        'north_east' => 3500,
        'north_west' => 3500,
    ];

    protected float $freeShippingThreshold = 100000;

    public function calculateShipping(string $state, float $cartTotal, float $weight = 0): float
    {
        if ($cartTotal >= $this->freeShippingThreshold) {
            return 0;
        }

        $zone = $this->zones[$state] ?? null;

        if (! $zone) {
            return $this->rates['north_central'];
        }

        return $this->rates[$zone];
    }

    public function getStates(): array
    {
        $grouped = [];

        foreach ($this->zones as $state => $zone) {
            $zoneLabel = ucwords(str_replace('_', ' ', $zone));
            $grouped[$zoneLabel][] = [
                'name' => $state,
                'shipping_fee' => $this->rates[$zone],
            ];
        }

        return $grouped;
    }

    public function getStatesWithFees(): array
    {
        $states = [];

        foreach ($this->zones as $state => $zone) {
            $states[$state] = [
                'zone' => $zone,
                'shipping_fee' => $this->rates[$zone],
            ];
        }

        return $states;
    }
}

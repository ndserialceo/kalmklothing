<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $settings = Setting::all()->groupBy('group')->map(function ($items) {
                return $items->pluck('value', 'key');
            });

            return response()->json(['data' => $settings]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch settings',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'settings' => ['required', 'array'],
                'settings.*.key' => ['required', 'string'],
                'settings.*.value' => ['required', 'string'],
            ]);

            foreach ($validated['settings'] as $setting) {
                Setting::set($setting['key'], $setting['value']);
            }

            return response()->json([
                'message' => 'Settings updated successfully',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update settings',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getGroup(string $group): JsonResponse
    {
        try {
            $settings = Setting::getGroup($group);

            return response()->json([
                'group' => $group,
                'data' => $settings,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch settings group',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

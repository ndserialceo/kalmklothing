<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StoreManagerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $allowedRoles = ['admin', 'super_admin', 'store_manager'];

        if (! $user || ! in_array($user->role, $allowedRoles)) {
            return response()->json([
                'message' => 'Unauthorized. Store manager access required.',
            ], 403);
        }

        return $next($request);
    }
}

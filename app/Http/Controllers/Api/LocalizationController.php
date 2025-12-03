<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Lang;
use Illuminate\Validation\Rule;

class LocalizationController extends Controller
{
    public function show(Request $request, string $locale)
    {
        $resolvedLocale = $this->matchSupported($locale);
        app()->setLocale($resolvedLocale);

        return response()->json($this->payload($resolvedLocale));
    }

    public function update(Request $request)
    {
        $supported = Config::get('app.supported_locales', []);
        $validated = $request->validate([
            'locale' => ['required', 'string', Rule::in($supported)],
        ]);

        $locale = $validated['locale'];
        $user = $request->user();

        if ($user) {
            $user->forceFill(['locale' => $locale])->save();
            $user->refresh();
        }

        app()->setLocale($locale);

        return response()
            ->json(array_merge($this->payload($locale), ['user' => $user]))
            ->withCookie(Cookie::forever('locale', $locale));
    }

    private function payload(string $locale): array
    {
        return [
            'locale' => $locale,
            'translations' => Lang::get('ui', [], $locale),
            'supported_locales' => Config::get('app.supported_locales', []),
        ];
    }

    private function matchSupported(string $value): string
    {
        $supported = Config::get('app.supported_locales', []);
        $normalized = strtolower(str_replace('_', '-', trim($value)));

        foreach ($supported as $candidate) {
            if ($normalized === $candidate || str_starts_with($normalized, $candidate . '-')) {
                return $candidate;
            }
        }

        return Config::get('app.locale');
    }
}

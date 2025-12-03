<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Config;

class SetLocaleFromRequest
{
    public function handle(Request $request, Closure $next)
    {
        $supported = Config::get('app.supported_locales', []);
        $locale = $this->resolveLocale($request, $supported);
        App::setLocale($locale);

        return $next($request);
    }

    private function resolveLocale(Request $request, array $supported): string
    {
        $default = Config::get('app.locale');
        $candidates = [
            optional($request->user())->locale,
            $request->cookie('locale'),
            $request->header('X-Locale'),
            $request->query('lang'),
            $request->getPreferredLanguage($supported),
        ];

        foreach ($candidates as $candidate) {
            $match = $this->matchSupported($candidate, $supported);
            if ($match) {
                return $match;
            }
        }

        return $default;
    }

    private function matchSupported(?string $value, array $supported): ?string
    {
        if (!$value) {
            return null;
        }

        $normalized = strtolower(str_replace('_', '-', trim($value)));

        foreach ($supported as $locale) {
            if ($normalized === $locale || str_starts_with($normalized, $locale . '-')) {
                return $locale;
            }
        }

        return null;
    }
}

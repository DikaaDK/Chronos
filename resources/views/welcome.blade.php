@php
    $currentLocale = app()->getLocale();
    $supportedLocales = config('app.supported_locales', []);
    $translations = \Illuminate\Support\Facades\Lang::get('ui', [], $currentLocale);
@endphp

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', $currentLocale) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chronos</title>
    @viteReactRefresh
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <script>
        window.__APP_LOCALE__ = @json($currentLocale);
        window.__APP_SUPPORTED_LOCALES__ = @json($supportedLocales);
        window.__APP_TRANSLATIONS__ = @json($translations);
    </script>
    @vite('resources/js/app.jsx')
</head>
<body class="antialiased">
    <div id="app"></div>
</body>
</html>

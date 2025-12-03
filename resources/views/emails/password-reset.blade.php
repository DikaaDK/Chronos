<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ __('Reset Password Chronos') }}</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f0fdf4; color: #0f172a; }
        .wrapper { width: 100%; padding: 32px 0; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 18px; padding: 32px; box-shadow: 0 15px 45px rgba(16, 185, 129, 0.15); }
        .badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #047857; background: #ecfdf5; padding: 6px 14px; border-radius: 999px; margin-bottom: 20px; border: 1px solid rgba(16, 185, 129, 0.35); }
        .btn { display: block; width: 100%; padding: 14px 20px; background: #059669; color: #fff; text-align: center; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 24px; }
        .note { font-size: 13px; color: #475569; margin-top: 18px; }
        .footer { font-size: 12px; color: #94a3b8; margin-top: 40px; text-align: center; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="container">
        <div class="badge">{{ __('Chronos Support') }}</div>
        <h1 style="margin:0 0 12px; font-size: 22px">{{ __('Halo, :name!', ['name' => $userName]) }}</h1>
        <p style="margin:0 0 16px; line-height: 1.6;">
            {{ __('Kami menerima permintaan untuk mengganti password akun Chronos kamu. Klik tombol di bawah ini untuk membuat password baru dalam 60 menit ke depan:') }}
        </p>
        <a class="btn" href="{{ $resetUrl }}">{{ __('Atur Ulang Password') }}</a>
        <p class="note">
            {{ __('Jika tombol tidak berfungsi, salin dan tempel tautan ini ke browser:') }}<br>
            <span style="word-break: break-all; color: #059669;">{{ $resetUrl }}</span>
        </p>
        <p class="note">
            {{ __('Jika kamu tidak merasa meminta reset password, abaikan email ini. Data akun kamu tetap aman.') }}
        </p>
        <p class="footer">&copy; {{ date('Y') }} {{ $appName }} · {{ __('Semua hak dilindungi') }}</p>
    </div>
</div>
</body>
</html>

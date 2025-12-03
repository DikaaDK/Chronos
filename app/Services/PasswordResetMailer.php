<?php

namespace App\Services;

use Illuminate\Support\Facades\View;
use PHPMailer\PHPMailer\Exception as PHPMailerException;
use PHPMailer\PHPMailer\PHPMailer;

class PasswordResetMailer
{
    /**
     * Send password reset link using PHPMailer.
     */
    public function send(string $recipientEmail, ?string $recipientName, string $resetUrl): void
    {
        $smtpConfig = config('mail.mailers.smtp');
        $mail = new PHPMailer(true);

        try {
            $mail->CharSet = 'UTF-8';
            $mail->isSMTP();
            $mail->Host = $smtpConfig['host'] ?? env('MAIL_HOST');
            $mail->SMTPAuth = true;
            $mail->Username = $smtpConfig['username'] ?? env('MAIL_USERNAME');
            $mail->Password = $smtpConfig['password'] ?? env('MAIL_PASSWORD');
            $encryption = $smtpConfig['encryption'] ?? env('MAIL_ENCRYPTION');
            if ($encryption === 'tls') {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            } elseif (in_array($encryption, ['ssl', 'smtps'], true)) {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            }
            $mail->Port = $smtpConfig['port'] ?? (int) env('MAIL_PORT', 587);

            $fromAddress = config('mail.from.address');
            $fromName = config('mail.from.name');
            $mail->setFrom($fromAddress, $fromName);
            $mail->addAddress($recipientEmail, $recipientName ?? null);

            $mail->isHTML(true);
            $mail->Subject = __('Reset Password :app', ['app' => config('app.name')]);

            $body = View::make('emails.password-reset', [
                'userName' => $recipientName ?: __('Explorer Chronos'),
                'resetUrl' => $resetUrl,
                'appName' => config('app.name'),
            ])->render();

            $mail->Body = $body;
            $mail->AltBody = __('Halo :name,\nGunakan tautan berikut untuk mengganti password akun :app:\n:url\n\nJika kamu tidak meminta reset password, abaikan email ini.', [
                'name' => $recipientName ?: __('Explorer Chronos'),
                'app' => config('app.name'),
                'url' => $resetUrl,
            ]);

            $mail->send();
        } catch (PHPMailerException $exception) {
            throw $exception;
        }
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PasswordResetMailer;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Throwable;

class AuthController extends Controller
{
    public function __construct(private PasswordResetMailer $passwordResetMailer)
    {
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $tokenPayload = $this->issueAccessToken($user, $request);

        return response()->json(['user' => $user, 'token' => $tokenPayload['token']], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $credentials = $request->only('email', 'password');

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();
        $tokenPayload = $this->issueAccessToken($user, $request);

        return response()->json(['user' => $user, 'token' => $tokenPayload['token']], 200);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Logged out']);
    }

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'redirect_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        $token = Str::random(64);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        $redirectBase = $request->input('redirect_url')
            ?: rtrim(config('app.frontend_url', config('app.url')), '/') . '/reset-password';

        $resetUrl = $redirectBase
            . '?token=' . urlencode($token)
            . '&email=' . urlencode($user->email);

        try {
            $this->passwordResetMailer->send($user->email, $user->name, $resetUrl);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => __('Gagal mengirim email reset password. Coba beberapa saat lagi.'),
            ], 500);
        }

        return response()->json([
            'message' => __('Kami telah mengirim tautan reset password ke email kamu.'),
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            return response()->json([
                'message' => __('Token reset password tidak valid atau sudah digunakan.'),
            ], 422);
        }

        $isExpired = Carbon::parse($record->created_at)
            ->addMinutes(config('auth.passwords.users.expire', 60))
            ->isPast();

        if ($isExpired || !Hash::check($request->token, $record->token)) {
            return response()->json([
                'message' => __('Token reset password tidak valid atau sudah kedaluwarsa.'),
            ], 422);
        }

        User::where('email', $request->email)
            ->update(['password' => Hash::make($request->password)]);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => __('Password kamu berhasil diperbarui. Silakan login dengan password baru.'),
        ]);
    }

        private function issueAccessToken(User $user, Request $request): array
        {
            $tokenResult = $user->createToken('chronos-web');
            $tokenModel = $tokenResult->accessToken;

            if ($tokenModel) {
                $tokenModel->forceFill([
                    'name' => $this->resolveTokenName($request),
                    'user_agent' => Str::limit($request->userAgent() ?? 'Unknown Client', 510, ''),
                    'ip_address' => $request->ip(),
                ])->save();
            }

            return [
                'token' => $tokenResult->plainTextToken,
                'token_id' => $tokenModel?->id,
            ];
        }

        private function resolveTokenName(Request $request): string
        {
            $platform = $request->header('X-Platform', 'Chronos Web');
            $agent = $request->userAgent();

            if (!$agent) {
                return $platform;
            }

            return sprintf('%s • %s', $platform, Str::limit($agent, 120, ''));
        }
}

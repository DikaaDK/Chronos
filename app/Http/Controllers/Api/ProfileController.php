<?php

namespace App\Http\Controllers\Api;

use App\Events\UserProfileUpdated;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
            'avatar' => ['sometimes', 'nullable', 'image', 'max:4096'],
        ]);

        $updateData = [];

        if (array_key_exists('name', $validated)) {
            $updateData['name'] = $validated['name'];
        }

        if (array_key_exists('email', $validated)) {
            $updateData['email'] = $validated['email'];
        }

        $hasAvatarFile = $request->hasFile('avatar');

        if (empty($updateData) && !$hasAvatarFile) {
            return response()->json([
                'message' => __('Tidak ada perubahan yang dikirim.'),
            ], 422);
        }

        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');

            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }

            $updateData['profile_photo_path'] = $avatarPath;
        }

        $user->fill($updateData);
        $user->save();

        $freshUser = $user->fresh();

        UserProfileUpdated::dispatch($freshUser);

        return response()->json([
            'message' => __('Profil berhasil diperbarui.'),
            'user' => $freshUser,
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => __('Password lama tidak sesuai.'),
                'errors' => ['current_password' => [__('Password lama tidak sesuai.')]],
            ], 422);
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
        ])->save();

        return response()->json([
            'message' => __('Password berhasil diperbarui.'),
        ]);
    }

    public function devices(Request $request)
    {
        $tokens = $request->user()
            ->tokens()
            ->orderByDesc('last_used_at')
            ->orderByDesc('created_at')
            ->limit(3)
            ->get();

        $devices = $tokens->map(function ($token) {
            return [
                'id' => $token->id,
                'name' => $token->name,
                'ip_address' => $token->ip_address,
                'user_agent' => $token->user_agent,
                'created_at' => optional($token->created_at)?->toIso8601String(),
                'last_used_at' => optional($token->last_used_at)?->toIso8601String(),
            ];
        });

        return response()->json([
            'devices' => $devices,
        ]);
    }
}

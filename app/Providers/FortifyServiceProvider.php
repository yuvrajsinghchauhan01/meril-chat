<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Laravel\Fortify\Contracts\LogoutResponse as LogoutResponseContract;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Custom login response for API
        $this->app->instance(LoginResponseContract::class, new class implements LoginResponseContract {
            public function toResponse($request)
            {
                // Check if request is for API
                if ($request->expectsJson() || $request->is('api/*')) {
                    $user = $request->user();
                    $token = $user->createToken('auth_token')->plainTextToken;
                    
                    return new JsonResponse([
                        'success' => true,
                        'message' => 'Login successful',
                        'user' => $user,
                        'token' => $token
                    ]);
                }
                
                // Default web response
                return redirect()->intended('/dashboard');
            }
        });

        // Custom register response for API
        $this->app->instance(RegisterResponseContract::class, new class implements RegisterResponseContract {
            public function toResponse($request)
            {
                // Check if request is for API
                if ($request->expectsJson() || $request->is('api/*')) {
                    $user = $request->user();
                    $token = $user->createToken('auth_token')->plainTextToken;
                    
                    return new JsonResponse([
                        'success' => true,
                        'message' => 'User registered successfully',
                        'user' => $user,
                        'token' => $token
                    ], 201);
                }
                
                // Default web response
                return redirect()->intended('/dashboard');
            }
        });

        // Custom logout response for API
        $this->app->instance(LogoutResponseContract::class, new class implements LogoutResponseContract {
            public function toResponse($request)
            {
                // Check if request is for API
                if ($request->expectsJson() || $request->is('api/*')) {
                    // Revoke the token that was used to authenticate the current request
                    if ($request->user() && $request->user()->currentAccessToken()) {
                        $request->user()->currentAccessToken()->delete();
                    }
                    
                    return new JsonResponse([
                        'success' => true,
                        'message' => 'Logged out successfully'
                    ]);
                }
                
                // Default web response
                return redirect('/');
            }
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register Fortify action classes
        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::updateUserProfileInformationUsing(UpdateUserProfileInformation::class);
        Fortify::updateUserPasswordsUsing(UpdateUserPassword::class);
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));
        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));

        // Rate limiting
        RateLimiter::for('login', function (Request $request) {
            $throttleKey = strtolower($request->input(Fortify::username()).'|'.$request->ip());
            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        // Custom authentication logic for API
        Fortify::authenticateUsing(function (Request $request) {
            $user = User::where('email', $request->email)->first();

            if ($user && Hash::check($request->password, $user->password)) {
                return $user;
            }
        });
    }
}

import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \Laravel\Fortify\Http\Controllers\PasswordResetLinkController::store
 * @see vendor/laravel/fortify/src/Http/Controllers/PasswordResetLinkController.php:35
 * @route '/api/forgot-password'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/forgot-password',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Fortify\Http\Controllers\PasswordResetLinkController::store
 * @see vendor/laravel/fortify/src/Http/Controllers/PasswordResetLinkController.php:35
 * @route '/api/forgot-password'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\PasswordResetLinkController::store
 * @see vendor/laravel/fortify/src/Http/Controllers/PasswordResetLinkController.php:35
 * @route '/api/forgot-password'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \Laravel\Fortify\Http\Controllers\PasswordResetLinkController::store
 * @see vendor/laravel/fortify/src/Http/Controllers/PasswordResetLinkController.php:35
 * @route '/api/forgot-password'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \Laravel\Fortify\Http\Controllers\PasswordResetLinkController::store
 * @see vendor/laravel/fortify/src/Http/Controllers/PasswordResetLinkController.php:35
 * @route '/api/forgot-password'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
const PasswordResetLinkController = { store }

export default PasswordResetLinkController
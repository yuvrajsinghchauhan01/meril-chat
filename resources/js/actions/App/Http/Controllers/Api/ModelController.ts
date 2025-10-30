import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ModelController::index
 * @see app/Http/Controllers/Api/ModelController.php:25
 * @route '/api/models'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/models',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ModelController::index
 * @see app/Http/Controllers/Api/ModelController.php:25
 * @route '/api/models'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ModelController::index
 * @see app/Http/Controllers/Api/ModelController.php:25
 * @route '/api/models'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ModelController::index
 * @see app/Http/Controllers/Api/ModelController.php:25
 * @route '/api/models'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ModelController::index
 * @see app/Http/Controllers/Api/ModelController.php:25
 * @route '/api/models'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ModelController::index
 * @see app/Http/Controllers/Api/ModelController.php:25
 * @route '/api/models'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ModelController::index
 * @see app/Http/Controllers/Api/ModelController.php:25
 * @route '/api/models'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\Api\ModelController::categories
 * @see app/Http/Controllers/Api/ModelController.php:92
 * @route '/api/models/categories'
 */
export const categories = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: categories.url(options),
    method: 'get',
})

categories.definition = {
    methods: ["get","head"],
    url: '/api/models/categories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ModelController::categories
 * @see app/Http/Controllers/Api/ModelController.php:92
 * @route '/api/models/categories'
 */
categories.url = (options?: RouteQueryOptions) => {
    return categories.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ModelController::categories
 * @see app/Http/Controllers/Api/ModelController.php:92
 * @route '/api/models/categories'
 */
categories.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: categories.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ModelController::categories
 * @see app/Http/Controllers/Api/ModelController.php:92
 * @route '/api/models/categories'
 */
categories.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: categories.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ModelController::categories
 * @see app/Http/Controllers/Api/ModelController.php:92
 * @route '/api/models/categories'
 */
    const categoriesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: categories.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ModelController::categories
 * @see app/Http/Controllers/Api/ModelController.php:92
 * @route '/api/models/categories'
 */
        categoriesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: categories.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ModelController::categories
 * @see app/Http/Controllers/Api/ModelController.php:92
 * @route '/api/models/categories'
 */
        categoriesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: categories.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    categories.form = categoriesForm
/**
* @see \App\Http\Controllers\Api\ModelController::test
 * @see app/Http/Controllers/Api/ModelController.php:135
 * @route '/api/models/test'
 */
export const test = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(options),
    method: 'post',
})

test.definition = {
    methods: ["post"],
    url: '/api/models/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ModelController::test
 * @see app/Http/Controllers/Api/ModelController.php:135
 * @route '/api/models/test'
 */
test.url = (options?: RouteQueryOptions) => {
    return test.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ModelController::test
 * @see app/Http/Controllers/Api/ModelController.php:135
 * @route '/api/models/test'
 */
test.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\ModelController::test
 * @see app/Http/Controllers/Api/ModelController.php:135
 * @route '/api/models/test'
 */
    const testForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: test.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\ModelController::test
 * @see app/Http/Controllers/Api/ModelController.php:135
 * @route '/api/models/test'
 */
        testForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: test.url(options),
            method: 'post',
        })
    
    test.form = testForm
/**
* @see \App\Http\Controllers\Api\ModelController::sync
 * @see app/Http/Controllers/Api/ModelController.php:272
 * @route '/api/models/sync'
 */
export const sync = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

sync.definition = {
    methods: ["post"],
    url: '/api/models/sync',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ModelController::sync
 * @see app/Http/Controllers/Api/ModelController.php:272
 * @route '/api/models/sync'
 */
sync.url = (options?: RouteQueryOptions) => {
    return sync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ModelController::sync
 * @see app/Http/Controllers/Api/ModelController.php:272
 * @route '/api/models/sync'
 */
sync.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\ModelController::sync
 * @see app/Http/Controllers/Api/ModelController.php:272
 * @route '/api/models/sync'
 */
    const syncForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: sync.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\ModelController::sync
 * @see app/Http/Controllers/Api/ModelController.php:272
 * @route '/api/models/sync'
 */
        syncForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: sync.url(options),
            method: 'post',
        })
    
    sync.form = syncForm
/**
* @see \App\Http\Controllers\Api\ModelController::pricing
 * @see app/Http/Controllers/Api/ModelController.php:182
 * @route '/api/models/{id}/pricing'
 */
export const pricing = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pricing.url(args, options),
    method: 'get',
})

pricing.definition = {
    methods: ["get","head"],
    url: '/api/models/{id}/pricing',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ModelController::pricing
 * @see app/Http/Controllers/Api/ModelController.php:182
 * @route '/api/models/{id}/pricing'
 */
pricing.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return pricing.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ModelController::pricing
 * @see app/Http/Controllers/Api/ModelController.php:182
 * @route '/api/models/{id}/pricing'
 */
pricing.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pricing.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ModelController::pricing
 * @see app/Http/Controllers/Api/ModelController.php:182
 * @route '/api/models/{id}/pricing'
 */
pricing.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pricing.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ModelController::pricing
 * @see app/Http/Controllers/Api/ModelController.php:182
 * @route '/api/models/{id}/pricing'
 */
    const pricingForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: pricing.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ModelController::pricing
 * @see app/Http/Controllers/Api/ModelController.php:182
 * @route '/api/models/{id}/pricing'
 */
        pricingForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pricing.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ModelController::pricing
 * @see app/Http/Controllers/Api/ModelController.php:182
 * @route '/api/models/{id}/pricing'
 */
        pricingForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pricing.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    pricing.form = pricingForm
const ModelController = { index, categories, test, sync, pricing }

export default ModelController
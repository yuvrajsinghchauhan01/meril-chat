import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\SearchController::search
 * @see app/Http/Controllers/Api/SearchController.php:18
 * @route '/api/search'
 */
export const search = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: search.url(options),
    method: 'post',
})

search.definition = {
    methods: ["post"],
    url: '/api/search',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SearchController::search
 * @see app/Http/Controllers/Api/SearchController.php:18
 * @route '/api/search'
 */
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SearchController::search
 * @see app/Http/Controllers/Api/SearchController.php:18
 * @route '/api/search'
 */
search.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: search.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\SearchController::search
 * @see app/Http/Controllers/Api/SearchController.php:18
 * @route '/api/search'
 */
    const searchForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: search.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\SearchController::search
 * @see app/Http/Controllers/Api/SearchController.php:18
 * @route '/api/search'
 */
        searchForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: search.url(options),
            method: 'post',
        })
    
    search.form = searchForm
/**
* @see \App\Http\Controllers\Api\SearchController::webSearch
 * @see app/Http/Controllers/Api/SearchController.php:101
 * @route '/api/search/web'
 */
export const webSearch = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: webSearch.url(options),
    method: 'post',
})

webSearch.definition = {
    methods: ["post"],
    url: '/api/search/web',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SearchController::webSearch
 * @see app/Http/Controllers/Api/SearchController.php:101
 * @route '/api/search/web'
 */
webSearch.url = (options?: RouteQueryOptions) => {
    return webSearch.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SearchController::webSearch
 * @see app/Http/Controllers/Api/SearchController.php:101
 * @route '/api/search/web'
 */
webSearch.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: webSearch.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\SearchController::webSearch
 * @see app/Http/Controllers/Api/SearchController.php:101
 * @route '/api/search/web'
 */
    const webSearchForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: webSearch.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\SearchController::webSearch
 * @see app/Http/Controllers/Api/SearchController.php:101
 * @route '/api/search/web'
 */
        webSearchForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: webSearch.url(options),
            method: 'post',
        })
    
    webSearch.form = webSearchForm
const SearchController = { search, webSearch }

export default SearchController
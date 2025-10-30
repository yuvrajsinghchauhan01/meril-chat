import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ChatController::chat
 * @see app/Http/Controllers/Api/ChatController.php:1003
 * @route '/api/chat'
 */
export const chat = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chat.url(options),
    method: 'post',
})

chat.definition = {
    methods: ["post"],
    url: '/api/chat',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ChatController::chat
 * @see app/Http/Controllers/Api/ChatController.php:1003
 * @route '/api/chat'
 */
chat.url = (options?: RouteQueryOptions) => {
    return chat.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::chat
 * @see app/Http/Controllers/Api/ChatController.php:1003
 * @route '/api/chat'
 */
chat.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chat.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\ChatController::chat
 * @see app/Http/Controllers/Api/ChatController.php:1003
 * @route '/api/chat'
 */
    const chatForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: chat.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\ChatController::chat
 * @see app/Http/Controllers/Api/ChatController.php:1003
 * @route '/api/chat'
 */
        chatForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: chat.url(options),
            method: 'post',
        })
    
    chat.form = chatForm
/**
* @see \App\Http\Controllers\Api\ChatController::stream
 * @see app/Http/Controllers/Api/ChatController.php:1123
 * @route '/api/chat/stream'
 */
export const stream = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stream.url(options),
    method: 'post',
})

stream.definition = {
    methods: ["post"],
    url: '/api/chat/stream',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ChatController::stream
 * @see app/Http/Controllers/Api/ChatController.php:1123
 * @route '/api/chat/stream'
 */
stream.url = (options?: RouteQueryOptions) => {
    return stream.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::stream
 * @see app/Http/Controllers/Api/ChatController.php:1123
 * @route '/api/chat/stream'
 */
stream.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stream.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\ChatController::stream
 * @see app/Http/Controllers/Api/ChatController.php:1123
 * @route '/api/chat/stream'
 */
    const streamForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: stream.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\ChatController::stream
 * @see app/Http/Controllers/Api/ChatController.php:1123
 * @route '/api/chat/stream'
 */
        streamForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: stream.url(options),
            method: 'post',
        })
    
    stream.form = streamForm
const ChatController = { chat, stream }

export default ChatController
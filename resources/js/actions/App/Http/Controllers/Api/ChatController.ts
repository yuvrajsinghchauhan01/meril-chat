import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
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

/**
* @see \App\Http\Controllers\Api\ChatController::conversations
* @see app/Http/Controllers/Api/ChatController.php:1303
* @route '/api/conversations'
*/
export const conversations = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversations.url(options),
    method: 'get',
})

conversations.definition = {
    methods: ["get","head"],
    url: '/api/conversations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ChatController::conversations
* @see app/Http/Controllers/Api/ChatController.php:1303
* @route '/api/conversations'
*/
conversations.url = (options?: RouteQueryOptions) => {
    return conversations.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::conversations
* @see app/Http/Controllers/Api/ChatController.php:1303
* @route '/api/conversations'
*/
conversations.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversations.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ChatController::conversations
* @see app/Http/Controllers/Api/ChatController.php:1303
* @route '/api/conversations'
*/
conversations.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: conversations.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ChatController::conversations
* @see app/Http/Controllers/Api/ChatController.php:1303
* @route '/api/conversations'
*/
const conversationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: conversations.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ChatController::conversations
* @see app/Http/Controllers/Api/ChatController.php:1303
* @route '/api/conversations'
*/
conversationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: conversations.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ChatController::conversations
* @see app/Http/Controllers/Api/ChatController.php:1303
* @route '/api/conversations'
*/
conversationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: conversations.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

conversations.form = conversationsForm

/**
* @see \App\Http\Controllers\Api\ChatController::show
* @see app/Http/Controllers/Api/ChatController.php:1333
* @route '/api/conversations/{id}'
*/
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/conversations/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ChatController::show
* @see app/Http/Controllers/Api/ChatController.php:1333
* @route '/api/conversations/{id}'
*/
show.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::show
* @see app/Http/Controllers/Api/ChatController.php:1333
* @route '/api/conversations/{id}'
*/
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ChatController::show
* @see app/Http/Controllers/Api/ChatController.php:1333
* @route '/api/conversations/{id}'
*/
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ChatController::show
* @see app/Http/Controllers/Api/ChatController.php:1333
* @route '/api/conversations/{id}'
*/
const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ChatController::show
* @see app/Http/Controllers/Api/ChatController.php:1333
* @route '/api/conversations/{id}'
*/
showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ChatController::show
* @see app/Http/Controllers/Api/ChatController.php:1333
* @route '/api/conversations/{id}'
*/
showForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\Api\ChatController::update
* @see app/Http/Controllers/Api/ChatController.php:1386
* @route '/api/conversations/{id}'
*/
export const update = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/conversations/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\ChatController::update
* @see app/Http/Controllers/Api/ChatController.php:1386
* @route '/api/conversations/{id}'
*/
update.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::update
* @see app/Http/Controllers/Api/ChatController.php:1386
* @route '/api/conversations/{id}'
*/
update.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\ChatController::update
* @see app/Http/Controllers/Api/ChatController.php:1386
* @route '/api/conversations/{id}'
*/
const updateForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ChatController::update
* @see app/Http/Controllers/Api/ChatController.php:1386
* @route '/api/conversations/{id}'
*/
updateForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Api\ChatController::destroy
* @see app/Http/Controllers/Api/ChatController.php:1359
* @route '/api/conversations/{id}'
*/
export const destroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/conversations/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\ChatController::destroy
* @see app/Http/Controllers/Api/ChatController.php:1359
* @route '/api/conversations/{id}'
*/
destroy.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::destroy
* @see app/Http/Controllers/Api/ChatController.php:1359
* @route '/api/conversations/{id}'
*/
destroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\ChatController::destroy
* @see app/Http/Controllers/Api/ChatController.php:1359
* @route '/api/conversations/{id}'
*/
const destroyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ChatController::destroy
* @see app/Http/Controllers/Api/ChatController.php:1359
* @route '/api/conversations/{id}'
*/
destroyForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\Api\ChatController::editMessage
* @see app/Http/Controllers/Api/ChatController.php:1426
* @route '/api/messages/{id}'
*/
export const editMessage = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: editMessage.url(args, options),
    method: 'put',
})

editMessage.definition = {
    methods: ["put"],
    url: '/api/messages/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\ChatController::editMessage
* @see app/Http/Controllers/Api/ChatController.php:1426
* @route '/api/messages/{id}'
*/
editMessage.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return editMessage.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::editMessage
* @see app/Http/Controllers/Api/ChatController.php:1426
* @route '/api/messages/{id}'
*/
editMessage.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: editMessage.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\ChatController::editMessage
* @see app/Http/Controllers/Api/ChatController.php:1426
* @route '/api/messages/{id}'
*/
const editMessageForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: editMessage.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ChatController::editMessage
* @see app/Http/Controllers/Api/ChatController.php:1426
* @route '/api/messages/{id}'
*/
editMessageForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: editMessage.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

editMessage.form = editMessageForm

/**
* @see \App\Http\Controllers\Api\ChatController::deleteMessage
* @see app/Http/Controllers/Api/ChatController.php:1477
* @route '/api/messages/{id}'
*/
export const deleteMessage = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMessage.url(args, options),
    method: 'delete',
})

deleteMessage.definition = {
    methods: ["delete"],
    url: '/api/messages/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\ChatController::deleteMessage
* @see app/Http/Controllers/Api/ChatController.php:1477
* @route '/api/messages/{id}'
*/
deleteMessage.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteMessage.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::deleteMessage
* @see app/Http/Controllers/Api/ChatController.php:1477
* @route '/api/messages/{id}'
*/
deleteMessage.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMessage.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\ChatController::deleteMessage
* @see app/Http/Controllers/Api/ChatController.php:1477
* @route '/api/messages/{id}'
*/
const deleteMessageForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteMessage.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ChatController::deleteMessage
* @see app/Http/Controllers/Api/ChatController.php:1477
* @route '/api/messages/{id}'
*/
deleteMessageForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteMessage.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

deleteMessage.form = deleteMessageForm

/**
* @see \App\Http\Controllers\Api\ChatController::regenerateMessage
* @see app/Http/Controllers/Api/ChatController.php:1516
* @route '/api/messages/{id}/regenerate'
*/
export const regenerateMessage = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateMessage.url(args, options),
    method: 'post',
})

regenerateMessage.definition = {
    methods: ["post"],
    url: '/api/messages/{id}/regenerate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ChatController::regenerateMessage
* @see app/Http/Controllers/Api/ChatController.php:1516
* @route '/api/messages/{id}/regenerate'
*/
regenerateMessage.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return regenerateMessage.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::regenerateMessage
* @see app/Http/Controllers/Api/ChatController.php:1516
* @route '/api/messages/{id}/regenerate'
*/
regenerateMessage.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateMessage.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ChatController::regenerateMessage
* @see app/Http/Controllers/Api/ChatController.php:1516
* @route '/api/messages/{id}/regenerate'
*/
const regenerateMessageForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerateMessage.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ChatController::regenerateMessage
* @see app/Http/Controllers/Api/ChatController.php:1516
* @route '/api/messages/{id}/regenerate'
*/
regenerateMessageForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerateMessage.url(args, options),
    method: 'post',
})

regenerateMessage.form = regenerateMessageForm

/**
* @see \App\Http\Controllers\Api\ChatController::editAndContinue
* @see app/Http/Controllers/Api/ChatController.php:1616
* @route '/api/messages/{id}/edit-and-continue'
*/
export const editAndContinue = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: editAndContinue.url(args, options),
    method: 'post',
})

editAndContinue.definition = {
    methods: ["post"],
    url: '/api/messages/{id}/edit-and-continue',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ChatController::editAndContinue
* @see app/Http/Controllers/Api/ChatController.php:1616
* @route '/api/messages/{id}/edit-and-continue'
*/
editAndContinue.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return editAndContinue.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::editAndContinue
* @see app/Http/Controllers/Api/ChatController.php:1616
* @route '/api/messages/{id}/edit-and-continue'
*/
editAndContinue.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: editAndContinue.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ChatController::editAndContinue
* @see app/Http/Controllers/Api/ChatController.php:1616
* @route '/api/messages/{id}/edit-and-continue'
*/
const editAndContinueForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: editAndContinue.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ChatController::editAndContinue
* @see app/Http/Controllers/Api/ChatController.php:1616
* @route '/api/messages/{id}/edit-and-continue'
*/
editAndContinueForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: editAndContinue.url(args, options),
    method: 'post',
})

editAndContinue.form = editAndContinueForm

const ChatController = { chat, stream, conversations, show, update, destroy, editMessage, deleteMessage, regenerateMessage, editAndContinue }

export default ChatController
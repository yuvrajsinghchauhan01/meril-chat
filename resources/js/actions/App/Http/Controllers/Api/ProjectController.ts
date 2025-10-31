import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ProjectController::index
* @see app/Http/Controllers/Api/ProjectController.php:17
* @route '/api/projects'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/projects',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ProjectController::index
* @see app/Http/Controllers/Api/ProjectController.php:17
* @route '/api/projects'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProjectController::index
* @see app/Http/Controllers/Api/ProjectController.php:17
* @route '/api/projects'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::index
* @see app/Http/Controllers/Api/ProjectController.php:17
* @route '/api/projects'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::index
* @see app/Http/Controllers/Api/ProjectController.php:17
* @route '/api/projects'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::index
* @see app/Http/Controllers/Api/ProjectController.php:17
* @route '/api/projects'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::index
* @see app/Http/Controllers/Api/ProjectController.php:17
* @route '/api/projects'
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
* @see \App\Http\Controllers\Api\ProjectController::store
* @see app/Http/Controllers/Api/ProjectController.php:48
* @route '/api/projects'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/projects',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ProjectController::store
* @see app/Http/Controllers/Api/ProjectController.php:48
* @route '/api/projects'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProjectController::store
* @see app/Http/Controllers/Api/ProjectController.php:48
* @route '/api/projects'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::store
* @see app/Http/Controllers/Api/ProjectController.php:48
* @route '/api/projects'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::store
* @see app/Http/Controllers/Api/ProjectController.php:48
* @route '/api/projects'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Api\ProjectController::show
* @see app/Http/Controllers/Api/ProjectController.php:84
* @route '/api/projects/{id}'
*/
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/projects/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ProjectController::show
* @see app/Http/Controllers/Api/ProjectController.php:84
* @route '/api/projects/{id}'
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
* @see \App\Http\Controllers\Api\ProjectController::show
* @see app/Http/Controllers/Api/ProjectController.php:84
* @route '/api/projects/{id}'
*/
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::show
* @see app/Http/Controllers/Api/ProjectController.php:84
* @route '/api/projects/{id}'
*/
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::show
* @see app/Http/Controllers/Api/ProjectController.php:84
* @route '/api/projects/{id}'
*/
const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::show
* @see app/Http/Controllers/Api/ProjectController.php:84
* @route '/api/projects/{id}'
*/
showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::show
* @see app/Http/Controllers/Api/ProjectController.php:84
* @route '/api/projects/{id}'
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
* @see \App\Http\Controllers\Api\ProjectController::update
* @see app/Http/Controllers/Api/ProjectController.php:117
* @route '/api/projects/{id}'
*/
export const update = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/projects/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\ProjectController::update
* @see app/Http/Controllers/Api/ProjectController.php:117
* @route '/api/projects/{id}'
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
* @see \App\Http\Controllers\Api\ProjectController::update
* @see app/Http/Controllers/Api/ProjectController.php:117
* @route '/api/projects/{id}'
*/
update.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::update
* @see app/Http/Controllers/Api/ProjectController.php:117
* @route '/api/projects/{id}'
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
* @see \App\Http\Controllers\Api\ProjectController::update
* @see app/Http/Controllers/Api/ProjectController.php:117
* @route '/api/projects/{id}'
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
* @see \App\Http\Controllers\Api\ProjectController::destroy
* @see app/Http/Controllers/Api/ProjectController.php:172
* @route '/api/projects/{id}'
*/
export const destroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/projects/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\ProjectController::destroy
* @see app/Http/Controllers/Api/ProjectController.php:172
* @route '/api/projects/{id}'
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
* @see \App\Http\Controllers\Api\ProjectController::destroy
* @see app/Http/Controllers/Api/ProjectController.php:172
* @route '/api/projects/{id}'
*/
destroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::destroy
* @see app/Http/Controllers/Api/ProjectController.php:172
* @route '/api/projects/{id}'
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
* @see \App\Http\Controllers\Api\ProjectController::destroy
* @see app/Http/Controllers/Api/ProjectController.php:172
* @route '/api/projects/{id}'
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
* @see \App\Http\Controllers\Api\ProjectController::conversations
* @see app/Http/Controllers/Api/ProjectController.php:355
* @route '/api/projects/{id}/conversations'
*/
export const conversations = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversations.url(args, options),
    method: 'get',
})

conversations.definition = {
    methods: ["get","head"],
    url: '/api/projects/{id}/conversations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ProjectController::conversations
* @see app/Http/Controllers/Api/ProjectController.php:355
* @route '/api/projects/{id}/conversations'
*/
conversations.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return conversations.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProjectController::conversations
* @see app/Http/Controllers/Api/ProjectController.php:355
* @route '/api/projects/{id}/conversations'
*/
conversations.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversations.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::conversations
* @see app/Http/Controllers/Api/ProjectController.php:355
* @route '/api/projects/{id}/conversations'
*/
conversations.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: conversations.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::conversations
* @see app/Http/Controllers/Api/ProjectController.php:355
* @route '/api/projects/{id}/conversations'
*/
const conversationsForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: conversations.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::conversations
* @see app/Http/Controllers/Api/ProjectController.php:355
* @route '/api/projects/{id}/conversations'
*/
conversationsForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: conversations.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::conversations
* @see app/Http/Controllers/Api/ProjectController.php:355
* @route '/api/projects/{id}/conversations'
*/
conversationsForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: conversations.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

conversations.form = conversationsForm

/**
* @see \App\Http\Controllers\Api\ProjectController::createConversation
* @see app/Http/Controllers/Api/ProjectController.php:208
* @route '/api/projects/{id}/conversations'
*/
export const createConversation = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createConversation.url(args, options),
    method: 'post',
})

createConversation.definition = {
    methods: ["post"],
    url: '/api/projects/{id}/conversations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ProjectController::createConversation
* @see app/Http/Controllers/Api/ProjectController.php:208
* @route '/api/projects/{id}/conversations'
*/
createConversation.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return createConversation.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProjectController::createConversation
* @see app/Http/Controllers/Api/ProjectController.php:208
* @route '/api/projects/{id}/conversations'
*/
createConversation.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createConversation.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::createConversation
* @see app/Http/Controllers/Api/ProjectController.php:208
* @route '/api/projects/{id}/conversations'
*/
const createConversationForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: createConversation.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::createConversation
* @see app/Http/Controllers/Api/ProjectController.php:208
* @route '/api/projects/{id}/conversations'
*/
createConversationForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: createConversation.url(args, options),
    method: 'post',
})

createConversation.form = createConversationForm

/**
* @see \App\Http\Controllers\Api\ProjectController::addConversations
* @see app/Http/Controllers/Api/ProjectController.php:261
* @route '/api/projects/{id}/conversations/add'
*/
export const addConversations = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addConversations.url(args, options),
    method: 'post',
})

addConversations.definition = {
    methods: ["post"],
    url: '/api/projects/{id}/conversations/add',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ProjectController::addConversations
* @see app/Http/Controllers/Api/ProjectController.php:261
* @route '/api/projects/{id}/conversations/add'
*/
addConversations.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return addConversations.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProjectController::addConversations
* @see app/Http/Controllers/Api/ProjectController.php:261
* @route '/api/projects/{id}/conversations/add'
*/
addConversations.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addConversations.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::addConversations
* @see app/Http/Controllers/Api/ProjectController.php:261
* @route '/api/projects/{id}/conversations/add'
*/
const addConversationsForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: addConversations.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::addConversations
* @see app/Http/Controllers/Api/ProjectController.php:261
* @route '/api/projects/{id}/conversations/add'
*/
addConversationsForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: addConversations.url(args, options),
    method: 'post',
})

addConversations.form = addConversationsForm

/**
* @see \App\Http\Controllers\Api\ProjectController::removeConversation
* @see app/Http/Controllers/Api/ProjectController.php:308
* @route '/api/projects/{projectId}/conversations/{conversationId}'
*/
export const removeConversation = (args: { projectId: string | number, conversationId: string | number } | [projectId: string | number, conversationId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeConversation.url(args, options),
    method: 'delete',
})

removeConversation.definition = {
    methods: ["delete"],
    url: '/api/projects/{projectId}/conversations/{conversationId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\ProjectController::removeConversation
* @see app/Http/Controllers/Api/ProjectController.php:308
* @route '/api/projects/{projectId}/conversations/{conversationId}'
*/
removeConversation.url = (args: { projectId: string | number, conversationId: string | number } | [projectId: string | number, conversationId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            projectId: args[0],
            conversationId: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        projectId: args.projectId,
        conversationId: args.conversationId,
    }

    return removeConversation.definition.url
            .replace('{projectId}', parsedArgs.projectId.toString())
            .replace('{conversationId}', parsedArgs.conversationId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProjectController::removeConversation
* @see app/Http/Controllers/Api/ProjectController.php:308
* @route '/api/projects/{projectId}/conversations/{conversationId}'
*/
removeConversation.delete = (args: { projectId: string | number, conversationId: string | number } | [projectId: string | number, conversationId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeConversation.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::removeConversation
* @see app/Http/Controllers/Api/ProjectController.php:308
* @route '/api/projects/{projectId}/conversations/{conversationId}'
*/
const removeConversationForm = (args: { projectId: string | number, conversationId: string | number } | [projectId: string | number, conversationId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: removeConversation.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::removeConversation
* @see app/Http/Controllers/Api/ProjectController.php:308
* @route '/api/projects/{projectId}/conversations/{conversationId}'
*/
removeConversationForm.delete = (args: { projectId: string | number, conversationId: string | number } | [projectId: string | number, conversationId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: removeConversation.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

removeConversation.form = removeConversationForm

/**
* @see \App\Http\Controllers\Api\ProjectController::toggleArchive
* @see app/Http/Controllers/Api/ProjectController.php:396
* @route '/api/projects/{id}/archive'
*/
export const toggleArchive = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleArchive.url(args, options),
    method: 'post',
})

toggleArchive.definition = {
    methods: ["post"],
    url: '/api/projects/{id}/archive',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ProjectController::toggleArchive
* @see app/Http/Controllers/Api/ProjectController.php:396
* @route '/api/projects/{id}/archive'
*/
toggleArchive.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return toggleArchive.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProjectController::toggleArchive
* @see app/Http/Controllers/Api/ProjectController.php:396
* @route '/api/projects/{id}/archive'
*/
toggleArchive.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleArchive.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::toggleArchive
* @see app/Http/Controllers/Api/ProjectController.php:396
* @route '/api/projects/{id}/archive'
*/
const toggleArchiveForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggleArchive.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ProjectController::toggleArchive
* @see app/Http/Controllers/Api/ProjectController.php:396
* @route '/api/projects/{id}/archive'
*/
toggleArchiveForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggleArchive.url(args, options),
    method: 'post',
})

toggleArchive.form = toggleArchiveForm

const ProjectController = { index, store, show, update, destroy, conversations, createConversation, addConversations, removeConversation, toggleArchive }

export default ProjectController
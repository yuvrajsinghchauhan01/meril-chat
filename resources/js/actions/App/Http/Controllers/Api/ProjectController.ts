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
 * @route '/api/projects/{project}'
 */
export const show = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ProjectController::show
 * @see app/Http/Controllers/Api/ProjectController.php:84
 * @route '/api/projects/{project}'
 */
show.url = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                }

    return show.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProjectController::show
 * @see app/Http/Controllers/Api/ProjectController.php:84
 * @route '/api/projects/{project}'
 */
show.get = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ProjectController::show
 * @see app/Http/Controllers/Api/ProjectController.php:84
 * @route '/api/projects/{project}'
 */
show.head = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ProjectController::show
 * @see app/Http/Controllers/Api/ProjectController.php:84
 * @route '/api/projects/{project}'
 */
    const showForm = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ProjectController::show
 * @see app/Http/Controllers/Api/ProjectController.php:84
 * @route '/api/projects/{project}'
 */
        showForm.get = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ProjectController::show
 * @see app/Http/Controllers/Api/ProjectController.php:84
 * @route '/api/projects/{project}'
 */
        showForm.head = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
 * @route '/api/projects/{project}'
 */
export const update = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/projects/{project}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\ProjectController::update
 * @see app/Http/Controllers/Api/ProjectController.php:117
 * @route '/api/projects/{project}'
 */
update.url = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                }

    return update.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProjectController::update
 * @see app/Http/Controllers/Api/ProjectController.php:117
 * @route '/api/projects/{project}'
 */
update.put = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\ProjectController::update
 * @see app/Http/Controllers/Api/ProjectController.php:117
 * @route '/api/projects/{project}'
 */
update.patch = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\ProjectController::update
 * @see app/Http/Controllers/Api/ProjectController.php:117
 * @route '/api/projects/{project}'
 */
    const updateForm = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @route '/api/projects/{project}'
 */
        updateForm.put = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @route '/api/projects/{project}'
 */
        updateForm.patch = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\Api\ProjectController::destroy
 * @see app/Http/Controllers/Api/ProjectController.php:172
 * @route '/api/projects/{project}'
 */
export const destroy = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/projects/{project}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\ProjectController::destroy
 * @see app/Http/Controllers/Api/ProjectController.php:172
 * @route '/api/projects/{project}'
 */
destroy.url = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                }

    return destroy.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProjectController::destroy
 * @see app/Http/Controllers/Api/ProjectController.php:172
 * @route '/api/projects/{project}'
 */
destroy.delete = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\ProjectController::destroy
 * @see app/Http/Controllers/Api/ProjectController.php:172
 * @route '/api/projects/{project}'
 */
    const destroyForm = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @route '/api/projects/{project}'
 */
        destroyForm.delete = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @route '/api/projects/{project}/conversations'
 */
export const conversations = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversations.url(args, options),
    method: 'get',
})

conversations.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/conversations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ProjectController::conversations
 * @see app/Http/Controllers/Api/ProjectController.php:355
 * @route '/api/projects/{project}/conversations'
 */
conversations.url = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                }

    return conversations.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProjectController::conversations
 * @see app/Http/Controllers/Api/ProjectController.php:355
 * @route '/api/projects/{project}/conversations'
 */
conversations.get = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversations.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ProjectController::conversations
 * @see app/Http/Controllers/Api/ProjectController.php:355
 * @route '/api/projects/{project}/conversations'
 */
conversations.head = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: conversations.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\ProjectController::conversations
 * @see app/Http/Controllers/Api/ProjectController.php:355
 * @route '/api/projects/{project}/conversations'
 */
    const conversationsForm = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: conversations.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\ProjectController::conversations
 * @see app/Http/Controllers/Api/ProjectController.php:355
 * @route '/api/projects/{project}/conversations'
 */
        conversationsForm.get = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: conversations.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\ProjectController::conversations
 * @see app/Http/Controllers/Api/ProjectController.php:355
 * @route '/api/projects/{project}/conversations'
 */
        conversationsForm.head = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
 * @route '/api/projects/{project}/conversations'
 */
export const createConversation = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createConversation.url(args, options),
    method: 'post',
})

createConversation.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/conversations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ProjectController::createConversation
 * @see app/Http/Controllers/Api/ProjectController.php:208
 * @route '/api/projects/{project}/conversations'
 */
createConversation.url = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                }

    return createConversation.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProjectController::createConversation
 * @see app/Http/Controllers/Api/ProjectController.php:208
 * @route '/api/projects/{project}/conversations'
 */
createConversation.post = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createConversation.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\ProjectController::createConversation
 * @see app/Http/Controllers/Api/ProjectController.php:208
 * @route '/api/projects/{project}/conversations'
 */
    const createConversationForm = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: createConversation.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\ProjectController::createConversation
 * @see app/Http/Controllers/Api/ProjectController.php:208
 * @route '/api/projects/{project}/conversations'
 */
        createConversationForm.post = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: createConversation.url(args, options),
            method: 'post',
        })
    
    createConversation.form = createConversationForm
/**
* @see \App\Http\Controllers\Api\ProjectController::addConversations
 * @see app/Http/Controllers/Api/ProjectController.php:261
 * @route '/api/projects/{project}/conversations/add'
 */
export const addConversations = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addConversations.url(args, options),
    method: 'post',
})

addConversations.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/conversations/add',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ProjectController::addConversations
 * @see app/Http/Controllers/Api/ProjectController.php:261
 * @route '/api/projects/{project}/conversations/add'
 */
addConversations.url = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                }

    return addConversations.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProjectController::addConversations
 * @see app/Http/Controllers/Api/ProjectController.php:261
 * @route '/api/projects/{project}/conversations/add'
 */
addConversations.post = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addConversations.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\ProjectController::addConversations
 * @see app/Http/Controllers/Api/ProjectController.php:261
 * @route '/api/projects/{project}/conversations/add'
 */
    const addConversationsForm = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: addConversations.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\ProjectController::addConversations
 * @see app/Http/Controllers/Api/ProjectController.php:261
 * @route '/api/projects/{project}/conversations/add'
 */
        addConversationsForm.post = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: addConversations.url(args, options),
            method: 'post',
        })
    
    addConversations.form = addConversationsForm
/**
* @see \App\Http\Controllers\Api\ProjectController::removeConversation
 * @see app/Http/Controllers/Api/ProjectController.php:308
 * @route '/api/projects/{project}/conversations/{conversation}'
 */
export const removeConversation = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeConversation.url(args, options),
    method: 'delete',
})

removeConversation.definition = {
    methods: ["delete"],
    url: '/api/projects/{project}/conversations/{conversation}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\ProjectController::removeConversation
 * @see app/Http/Controllers/Api/ProjectController.php:308
 * @route '/api/projects/{project}/conversations/{conversation}'
 */
removeConversation.url = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    conversation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                conversation: args.conversation,
                }

    return removeConversation.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProjectController::removeConversation
 * @see app/Http/Controllers/Api/ProjectController.php:308
 * @route '/api/projects/{project}/conversations/{conversation}'
 */
removeConversation.delete = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeConversation.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\ProjectController::removeConversation
 * @see app/Http/Controllers/Api/ProjectController.php:308
 * @route '/api/projects/{project}/conversations/{conversation}'
 */
    const removeConversationForm = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @route '/api/projects/{project}/conversations/{conversation}'
 */
        removeConversationForm.delete = (args: { project: string | number, conversation: string | number } | [project: string | number, conversation: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @route '/api/projects/{project}/archive'
 */
export const toggleArchive = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleArchive.url(args, options),
    method: 'post',
})

toggleArchive.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/archive',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ProjectController::toggleArchive
 * @see app/Http/Controllers/Api/ProjectController.php:396
 * @route '/api/projects/{project}/archive'
 */
toggleArchive.url = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                }

    return toggleArchive.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ProjectController::toggleArchive
 * @see app/Http/Controllers/Api/ProjectController.php:396
 * @route '/api/projects/{project}/archive'
 */
toggleArchive.post = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleArchive.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\ProjectController::toggleArchive
 * @see app/Http/Controllers/Api/ProjectController.php:396
 * @route '/api/projects/{project}/archive'
 */
    const toggleArchiveForm = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: toggleArchive.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\ProjectController::toggleArchive
 * @see app/Http/Controllers/Api/ProjectController.php:396
 * @route '/api/projects/{project}/archive'
 */
        toggleArchiveForm.post = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: toggleArchive.url(args, options),
            method: 'post',
        })
    
    toggleArchive.form = toggleArchiveForm
const ProjectController = { index, store, show, update, destroy, conversations, createConversation, addConversations, removeConversation, toggleArchive }

export default ProjectController
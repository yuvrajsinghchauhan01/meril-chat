import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\MessageController::index
 * @see app/Http/Controllers/Api/MessageController.php:24
 * @route '/api/messages'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\MessageController::index
 * @see app/Http/Controllers/Api/MessageController.php:24
 * @route '/api/messages'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MessageController::index
 * @see app/Http/Controllers/Api/MessageController.php:24
 * @route '/api/messages'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\MessageController::index
 * @see app/Http/Controllers/Api/MessageController.php:24
 * @route '/api/messages'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\MessageController::index
 * @see app/Http/Controllers/Api/MessageController.php:24
 * @route '/api/messages'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\MessageController::index
 * @see app/Http/Controllers/Api/MessageController.php:24
 * @route '/api/messages'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\MessageController::index
 * @see app/Http/Controllers/Api/MessageController.php:24
 * @route '/api/messages'
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
* @see \App\Http\Controllers\Api\MessageController::store
 * @see app/Http/Controllers/Api/MessageController.php:54
 * @route '/api/messages'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\MessageController::store
 * @see app/Http/Controllers/Api/MessageController.php:54
 * @route '/api/messages'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MessageController::store
 * @see app/Http/Controllers/Api/MessageController.php:54
 * @route '/api/messages'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\MessageController::store
 * @see app/Http/Controllers/Api/MessageController.php:54
 * @route '/api/messages'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\MessageController::store
 * @see app/Http/Controllers/Api/MessageController.php:54
 * @route '/api/messages'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\MessageController::show
 * @see app/Http/Controllers/Api/MessageController.php:98
 * @route '/api/messages/{message}'
 */
export const show = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/messages/{message}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\MessageController::show
 * @see app/Http/Controllers/Api/MessageController.php:98
 * @route '/api/messages/{message}'
 */
show.url = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { message: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    message: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        message: args.message,
                }

    return show.definition.url
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MessageController::show
 * @see app/Http/Controllers/Api/MessageController.php:98
 * @route '/api/messages/{message}'
 */
show.get = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\MessageController::show
 * @see app/Http/Controllers/Api/MessageController.php:98
 * @route '/api/messages/{message}'
 */
show.head = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\MessageController::show
 * @see app/Http/Controllers/Api/MessageController.php:98
 * @route '/api/messages/{message}'
 */
    const showForm = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\MessageController::show
 * @see app/Http/Controllers/Api/MessageController.php:98
 * @route '/api/messages/{message}'
 */
        showForm.get = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\MessageController::show
 * @see app/Http/Controllers/Api/MessageController.php:98
 * @route '/api/messages/{message}'
 */
        showForm.head = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Api\MessageController::update
 * @see app/Http/Controllers/Api/MessageController.php:122
 * @route '/api/messages/{message}'
 */
export const update = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/messages/{message}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\MessageController::update
 * @see app/Http/Controllers/Api/MessageController.php:122
 * @route '/api/messages/{message}'
 */
update.url = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { message: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    message: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        message: args.message,
                }

    return update.definition.url
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MessageController::update
 * @see app/Http/Controllers/Api/MessageController.php:122
 * @route '/api/messages/{message}'
 */
update.put = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\MessageController::update
 * @see app/Http/Controllers/Api/MessageController.php:122
 * @route '/api/messages/{message}'
 */
update.patch = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\MessageController::update
 * @see app/Http/Controllers/Api/MessageController.php:122
 * @route '/api/messages/{message}'
 */
    const updateForm = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\MessageController::update
 * @see app/Http/Controllers/Api/MessageController.php:122
 * @route '/api/messages/{message}'
 */
        updateForm.put = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\MessageController::update
 * @see app/Http/Controllers/Api/MessageController.php:122
 * @route '/api/messages/{message}'
 */
        updateForm.patch = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\MessageController::destroy
 * @see app/Http/Controllers/Api/MessageController.php:171
 * @route '/api/messages/{message}'
 */
export const destroy = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/messages/{message}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\MessageController::destroy
 * @see app/Http/Controllers/Api/MessageController.php:171
 * @route '/api/messages/{message}'
 */
destroy.url = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { message: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    message: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        message: args.message,
                }

    return destroy.definition.url
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MessageController::destroy
 * @see app/Http/Controllers/Api/MessageController.php:171
 * @route '/api/messages/{message}'
 */
destroy.delete = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\MessageController::destroy
 * @see app/Http/Controllers/Api/MessageController.php:171
 * @route '/api/messages/{message}'
 */
    const destroyForm = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\MessageController::destroy
 * @see app/Http/Controllers/Api/MessageController.php:171
 * @route '/api/messages/{message}'
 */
        destroyForm.delete = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\MessageController::regenerate
 * @see app/Http/Controllers/Api/MessageController.php:209
 * @route '/api/messages/{message}/regenerate'
 */
export const regenerate = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerate.url(args, options),
    method: 'post',
})

regenerate.definition = {
    methods: ["post"],
    url: '/api/messages/{message}/regenerate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\MessageController::regenerate
 * @see app/Http/Controllers/Api/MessageController.php:209
 * @route '/api/messages/{message}/regenerate'
 */
regenerate.url = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { message: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    message: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        message: args.message,
                }

    return regenerate.definition.url
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MessageController::regenerate
 * @see app/Http/Controllers/Api/MessageController.php:209
 * @route '/api/messages/{message}/regenerate'
 */
regenerate.post = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerate.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\MessageController::regenerate
 * @see app/Http/Controllers/Api/MessageController.php:209
 * @route '/api/messages/{message}/regenerate'
 */
    const regenerateForm = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: regenerate.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\MessageController::regenerate
 * @see app/Http/Controllers/Api/MessageController.php:209
 * @route '/api/messages/{message}/regenerate'
 */
        regenerateForm.post = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: regenerate.url(args, options),
            method: 'post',
        })
    
    regenerate.form = regenerateForm
/**
* @see \App\Http\Controllers\Api\MessageController::editAndContinue
 * @see app/Http/Controllers/Api/MessageController.php:308
 * @route '/api/messages/{message}/edit-and-continue'
 */
export const editAndContinue = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: editAndContinue.url(args, options),
    method: 'post',
})

editAndContinue.definition = {
    methods: ["post"],
    url: '/api/messages/{message}/edit-and-continue',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\MessageController::editAndContinue
 * @see app/Http/Controllers/Api/MessageController.php:308
 * @route '/api/messages/{message}/edit-and-continue'
 */
editAndContinue.url = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { message: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    message: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        message: args.message,
                }

    return editAndContinue.definition.url
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\MessageController::editAndContinue
 * @see app/Http/Controllers/Api/MessageController.php:308
 * @route '/api/messages/{message}/edit-and-continue'
 */
editAndContinue.post = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: editAndContinue.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\MessageController::editAndContinue
 * @see app/Http/Controllers/Api/MessageController.php:308
 * @route '/api/messages/{message}/edit-and-continue'
 */
    const editAndContinueForm = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: editAndContinue.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\MessageController::editAndContinue
 * @see app/Http/Controllers/Api/MessageController.php:308
 * @route '/api/messages/{message}/edit-and-continue'
 */
        editAndContinueForm.post = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: editAndContinue.url(args, options),
            method: 'post',
        })
    
    editAndContinue.form = editAndContinueForm
const MessageController = { index, store, show, update, destroy, regenerate, editAndContinue }

export default MessageController
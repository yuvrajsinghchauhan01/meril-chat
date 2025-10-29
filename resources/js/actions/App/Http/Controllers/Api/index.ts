import AuthApiController from './AuthApiController'
import ModelController from './ModelController'
import ChatController from './ChatController'
import ProjectController from './ProjectController'
import SearchController from './SearchController'

const Api = {
    AuthApiController: Object.assign(AuthApiController, AuthApiController),
    ModelController: Object.assign(ModelController, ModelController),
    ChatController: Object.assign(ChatController, ChatController),
    ProjectController: Object.assign(ProjectController, ProjectController),
    SearchController: Object.assign(SearchController, SearchController),
}

export default Api
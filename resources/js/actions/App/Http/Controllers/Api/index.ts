import AuthApiController from './AuthApiController'
import ModelController from './ModelController'
import ChatController from './ChatController'
import ConversationController from './ConversationController'
import MessageController from './MessageController'
import ProjectController from './ProjectController'
import SearchController from './SearchController'
const Api = {
    AuthApiController: Object.assign(AuthApiController, AuthApiController),
ModelController: Object.assign(ModelController, ModelController),
ChatController: Object.assign(ChatController, ChatController),
ConversationController: Object.assign(ConversationController, ConversationController),
MessageController: Object.assign(MessageController, MessageController),
ProjectController: Object.assign(ProjectController, ProjectController),
SearchController: Object.assign(SearchController, SearchController),
}

export default Api
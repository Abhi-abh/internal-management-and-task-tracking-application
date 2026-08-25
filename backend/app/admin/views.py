from sqladmin import ModelView
from app.models.user import User
from app.models.task import Task
from app.models.comment import Comment
from app.models.activity import TaskActivity

class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.name, User.email, User.role, User.is_active, User.created_at]
    column_searchable_list = [User.name, User.email]
    column_sortable_list = [User.id, User.created_at]
    icon = "fa-solid fa-users"
    name = "User"
    name_plural = "Users"
    category = "Accounts"

class TaskAdmin(ModelView, model=Task):
    column_list = [Task.id, Task.title, Task.status, Task.priority, Task.due_date, Task.created_at]
    column_searchable_list = [Task.title, Task.description]
    column_sortable_list = [Task.id, Task.status, Task.priority, Task.due_date, Task.created_at]
    icon = "fa-solid fa-list-check"
    name = "Task"
    name_plural = "Tasks"
    category = "Management"

class CommentAdmin(ModelView, model=Comment):
    column_list = [Comment.id, Comment.task_id, Comment.user_id, Comment.comment, Comment.created_at]
    column_searchable_list = [Comment.comment]
    column_sortable_list = [Comment.id, Comment.created_at]
    icon = "fa-solid fa-comments"
    name = "Comment"
    name_plural = "Comments"
    category = "Management"

class ActivityAdmin(ModelView, model=TaskActivity):
    column_list = [TaskActivity.id, TaskActivity.task_id, TaskActivity.user_id, TaskActivity.action, TaskActivity.created_at]
    column_searchable_list = [TaskActivity.action, TaskActivity.old_value, TaskActivity.new_value]
    column_sortable_list = [TaskActivity.id, TaskActivity.created_at]
    icon = "fa-solid fa-clock-rotate-left"
    name = "Activity"
    name_plural = "Activities"
    category = "System"

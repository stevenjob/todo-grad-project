var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title
    }));
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            listItem.setAttribute("isComplete","false");
            if(listitem.getAttribute)listItem
            var compButton = document.createElement("button");
            compButton.textContent = "Complete";
            compButton.onclick = completeListItem;
            var delButton = document.createElement("button");
            delButton.textContent = "Delete";
            delButton.setAttribute("itemId", todo.id);
            delButton.onclick = deleteListItem;
            listItem.textContent = todo.title;
            listItem.appendChild(delButton);
            todoList.appendChild(listItem);
        });
    });
}

function deleteListItem(event) {
    if (event && event.target) {
        var id = event.target.getAttribute("itemId");
        if (id) {
            var deleteRequest = new XMLHttpRequest();
            deleteRequest.open("DELETE", "/api/todo/" + id);
            deleteRequest.onload = function() {
                if (this.status !== 200) {
                    error.textContent = "Failed to delete item. Server returned " +
                    this.status + " - " + this.responseText;
                }
                reloadTodoList();
            };
            deleteRequest.send();
        }
    }
}

function completeListItem(event) {
    if (event && event.target) {
        var id = event.target.getAttribute("itemId");
        if (id) {
            var deleteRequest = new XMLHttpRequest();
            deleteRequest.open("DELETE", "/api/todo/" + id);
            deleteRequest.onload = function() {
                if (this.status !== 200) {
                    error.textContent = "Failed to delete item. Server returned " +
                        this.status + " - " + this.responseText;
                }
                reloadTodoList();
            };
            deleteRequest.send();
        }
    }
}
reloadTodoList();

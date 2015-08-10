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
        title: title,
        isComplete: "false"
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
            var compButton = document.createElement("button");
            compButton.textContent = "Complete";
            compButton.onclick = completeListItem;
            compButton.setAttribute("itemId", todo.id);
            var delButton = document.createElement("button");
            delButton.textContent = "Delete";
            delButton.className = "delete";
            if (todo.isComplete === "true") {

            }
            else {
                listItem.appendChild(compButton);
            }

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
            //updateListItem(id, text, isComplete);
        }
    }
}

function updateListItem(id, text, isComplete) {

    var updateRequest = new XMLHttpRequest();
    updateRequest.open("PUT", "/api/todo/" + id);
    updateRequest.onload = function() {
        if (this.status !== 200) {
            error.textContent = "Failed to update item. Server returned " +
                this.status + " - " + this.responseText;
        }
        reloadTodoList();
    };
    updateRequest.setRequestHeader("Content-type", "application/json");
    updateRequest.send(JSON.stringify({
        title: text,
        isComplete: isComplete
    }));
}
reloadTodoList();

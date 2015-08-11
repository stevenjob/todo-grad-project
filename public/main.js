var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var itemsLeftDiv = document.getElementById("count-label");
var filterVal = -1;
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
        isComplete: false
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
    if (document.getElementById("delete-completed")) {
        document.getElementById("top-div").removeChild(document.getElementById("delete-completed"));
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        var itemsLeft = 0;
        var completedItems = 0;
        todos.forEach(function(todo) {
            if (!todo.isComplete) {
                itemsLeft++;
            }
            if (filterVal === -1 || +todo.isComplete === filterVal) {
                var listItem = document.createElement("li");
                var compButton = document.createElement("button");
                compButton.textContent = "Complete";
                compButton.onclick = completeListItem;
                compButton.setAttribute("itemId", todo.id);
                var delButton = document.createElement("button");
                delButton.textContent = "Delete";
                delButton.className = "delete button";
                delButton.setAttribute("itemId", todo.id);
                delButton.onclick = deleteListItemEvent;
                var titleDiv = document.createElement("section");
                titleDiv.id = "title-div";
                titleDiv.textContent = todo.title;
                listItem.appendChild(titleDiv);
                if (todo.isComplete) {
                    listItem.className = "complete";
                    completedItems++;
                }
                else {
                    compButton.className = "set-comp-button button";

                }
                listItem.appendChild(compButton);
                listItem.appendChild(delButton);
                todoList.appendChild(listItem);
            }

        });
        if (completedItems > 0) {
            var topDiv = document.getElementById("top-div");
            var delCompButton = document.createElement("button");
            delCompButton.textContent = "Delete Completed";
            delCompButton.id = "delete-completed";
            delCompButton.className = "delete-completed button";
            delCompButton.onclick = deleteAllCompleted(todos);
            topDiv.appendChild(delCompButton);
        }
        var setAll = document.getElementById("set-all");
        setAll.onclick = changeFilter(-1);
        var setActive = document.getElementById("set-active");
        setActive.onclick = changeFilter(0);
        var setCompleted = document.getElementById("set-completed");
        setCompleted.onclick = changeFilter(1);
        itemsLeftDiv.textContent = itemsLeft + " items left to complete";
    });
}

function deleteAllCompleted(todos) {
    return function() {
        todos.forEach(function(todo) {
            if (todo.isComplete) {
                deleteListItem(todo.id);
            }
        });
        reloadTodoList();
    };
}

function changeFilter(filter) {
    return function() {
        filterVal = filter;
        reloadTodoList();
    };
}

function deleteListItemEvent(event) {
    if (event && event.target) {
        var id = event.target.getAttribute("itemId");
        if (id) {
            deleteListItem(id, reloadTodoList);
        }
    }
}

function deleteListItem(id, callback) {
    var deleteRequest = new XMLHttpRequest();
    deleteRequest.open("DELETE", "/api/todo/" + id);
    deleteRequest.onload = function() {
        if (this.status !== 200) {
            error.textContent = "Failed to delete item. Server returned " +
                this.status + " - " + this.responseText;
        }
        else {
            if (callback) {
                callback();
            }
        }
    };
    deleteRequest.send();
}

function completeListItem(event) {
    if (event && event.target) {
        var id = event.target.getAttribute("itemId");
        if (id) {
            updateListItem(id, true);
        }
    }
}

function updateListItem(id, isComplete, text) {

    var updateRequest = new XMLHttpRequest();
    updateRequest.open("PUT", "/api/todo/" + id);
    updateRequest.setRequestHeader("Content-type", "application/json");
    updateRequest.send(JSON.stringify({
        title: text,
        isComplete: isComplete
    }));
    updateRequest.onload = function() {
        if (this.status !== 200) {
            error.textContent = "Failed to update item. Server returned " +
                this.status + " - " + this.responseText;
        }
        else {
            reloadTodoList();
        }

    };
}

reloadTodoList();
setInterval(reloadTodoList, 10000);

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
    fetch("/api/todo", {
        method: "post",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            isComplete: false
        })
    }).then(function(response) {
        if (response.status === 201) {
            callback();
        }
        else {
            error.textContent = "Failed to create item. Server returned " + response.status + " - " +
                response.statusText;
        }
    });
}

function getTodoList(callback) {
    fetch("/api/todo").then(function(response) {
        if (response.status === 200) {
            response.json().then(function(data) {
                callback(data);
            });
        }
        else {
            error.textContent = "Failed to get list. Server returned " + response.status + " - " + response.statusText;
        }
    });
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    if (document.getElementById("del-comp-btn")) {
        document.getElementById("comp-but-div").removeChild(document.getElementById("del-comp-btn"));
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
                completedItems = makeTodoOnScreen(todo, completedItems);
            }
        });
        if (completedItems > 0) {
            var compButDiv = document.getElementById("comp-but-div");
            var delCompButton = document.createElement("button");
            delCompButton.textContent = "Delete Completed";
            delCompButton.className = "btn-warning del-comp-btn";
            delCompButton.id = "del-comp-btn";
            delCompButton.onclick = deleteAllCompleted(todos);
            compButDiv.appendChild(delCompButton);
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

function makeTodoOnScreen(todo, completedItems) {
    var compdItems = completedItems; //used for counting items left
    var listItem = document.createElement("li");
    var titleDiv = document.createElement("section");

    var liButtonDiv = document.createElement("section");
    var liCompButtonDiv = document.createElement("section");
    var liDeleteButtonDiv = document.createElement("section");

    var compButton = document.createElement("button");
    var delButton = document.createElement("button");

    titleDiv.id = "title-div";
    liCompButtonDiv.className = "li-div";
    liButtonDiv.className = "li-div-holder";
    liDeleteButtonDiv.className = "li-div";
    titleDiv.textContent = todo.title;

    compButton.textContent = "Complete";
    compButton.setAttribute("itemId", todo.id);

    delButton.textContent = "Delete";
    delButton.className = "delete-btn btn-warning";
    delButton.setAttribute("itemId", todo.id);
    delButton.onclick = deleteListItemEvent;

    if (todo.isComplete) {
        compButton.textContent = "Completed";
        titleDiv.className += "completed-txt";
        compButton.className = "btn-active btn-warning completed-btn";
        compButton.disabled = true;
        compdItems++;
    }
    else {
        compButton.onclick = completeListItem;
        compButton.disabled = false;
        compButton.className = "complete-btn btn-warning";
    }

    listItem.appendChild(titleDiv);
    liCompButtonDiv.appendChild(compButton);
    liDeleteButtonDiv.appendChild(delButton);
    liButtonDiv.appendChild(liCompButtonDiv);
    liButtonDiv.appendChild(liDeleteButtonDiv);
    listItem.appendChild(liButtonDiv);
    todoList.appendChild(listItem);
    return compdItems;
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
    fetch("/api/todo/" + id, {
        method: "delete",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    }).then(function(response) {
        if (response.status !== 200) {
            error.textContent = "Failed to delete item. Server returned " +
                this.status + " - " + this.responseText;
        }
        else {
            if (callback) {
                callback();
            }
        }
    });
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
    fetch("/api/todo/" + id, {
        method: "put",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: text,
            isComplete: isComplete
        })
    }).then(function(response) {
        if (response.status !== 200) {
            error.textContent = "Failed to update item. Server returned " +
                this.status + " - " + this.responseText;
        }
        else {
            reloadTodoList();
        }
    });
}

reloadTodoList();
//setInterval(reloadTodoList, 10000);

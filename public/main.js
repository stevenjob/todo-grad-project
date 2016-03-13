var todoList = document.getElementById("todo-list");
var loader = document.getElementById("loading");
var form = document.getElementById("todo-form");
var newTodoInput = document.getElementById("new-todo");
var error = document.getElementById("error");
var itemsLeftDiv = document.getElementById("count-label");
var filterVal = -1;

// document.getElementById("toggle-all").onclick = function(event) {
//     debugger;
// }

/**
* Runs on when user presses enter on add todo form
* @param event
*/
form.onsubmit = function(event) {
    var title = newTodoInput.value; //TODO whats in this object
    createTodo(title, reloadTodoList);
    //clears the input box
    newTodoInput.value = "";
    event.preventDefault();//TODO what does this do
};

/**
* send a post request to the server to create the todo item
* then invokes the callback function if successful
* @param title of todo item
* @param {Function} callback
*/
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

    //cleanup all the old todo items
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }

    //remove delete all button
    if (document.getElementById("del-comp-btn")) {
        document.getElementById("comp-but-div").removeChild(document.getElementById("del-comp-btn"));
    }

    //add loading text
    loader.style.display = "block";

    //get todo list from server
    getTodoList(formatList);
}

function formatList(todos) {

    //hide loading text
    loader.style.display = "none";

    //used to calc the items left to display to the user
    var itemsLeft = 0;
    var completedItems = 0;
    todos.forEach(function(todo) {

        //if not complete then items are left
        if (!todo.isComplete) {
            itemsLeft++;
        } else {
            completedItems++;
        }

        if (filterVal === -1 || +todo.isComplete === filterVal) {
            makeTodoOnScreen(todo);
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
    itemsLeftDiv.textContent = itemsLeft + " items left";
}

/**
* dynamicaly builds a html list item element and adds it to the list
* @param todo to make
*/
function makeTodoOnScreen(todo) {

    //make containers
    var listItem = document.createElement("li");
    var liDiv = document.createElement("div");

    //make is completed checkbox
    var liCheckboxLabel = document.createElement("label");
    liCheckboxLabel.className = "toggle";
    var liCheckboxInput = document.createElement("input");
    liCheckboxInput.type = "checkbox";
    liCheckboxInput.setAttribute("itemId", todo.id);
    // liCheckboxInput.id = todo.id;
    var liCheckboxSpan = document.createElement("span");
    var liCheckboxSpanIcon = document.createElement("i");
    liCheckboxSpanIcon.className = "fa fa-check";

    //make delete button
    var liDeleteSpan = document.createElement("span");
    liDeleteSpan.className = "delete-button";
    liDeleteSpan.onclick = deleteListItemEvent;
    liDeleteSpan.setAttribute("itemId", todo.id);
    var liDeleteSpanIcon = document.createElement("i");
    liDeleteSpanIcon.className = "fa fa-close";

    liDeleteSpanIcon.setAttribute("itemId", todo.id);
    // liDeleteSpanIcon.onclick = deleteListItemEvent;
    var liLabel = document.createElement("label");
    liLabel.className = "todo-label";
    liDiv.className = "li-div";

    // liCheckboxInput.onclick = completeListItemEvent;
    liLabel.textContent = todo.title;

    liCheckboxLabel.appendChild(liCheckboxInput);
    liCheckboxLabel.appendChild(liCheckboxSpan);
    liCheckboxSpan.appendChild(liCheckboxSpanIcon);

    liDeleteSpan.appendChild(liDeleteSpanIcon);

    liDiv.appendChild(liCheckboxLabel);
    liDiv.appendChild(liLabel);
    liDiv.appendChild(liDeleteSpan);

    listItem.appendChild(liDiv);
    todoList.appendChild(listItem);

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

function completeListItemEvent(event) {
    if (event && event.target) {
        var id = event.target.getAttribute("itemId");
        if (id) {
            updateListItem(id, event.target.checked);
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

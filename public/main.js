var todoList = document.getElementById("todo-list");
var form = document.getElementById("todo-form");
var newTodoInput = document.getElementById("new-todo");
var error = document.getElementById("error");
var itemsLeftDiv = document.getElementById("count-label");
var bottomButtonDiv = document.getElementById("bottom-buttons");
var toggleAllCheckbox = document.getElementById("toggle-all-checkbox");
var setAll = document.getElementById("set-all");
var setCompleted = document.getElementById("set-completed");
var setActive = document.getElementById("set-active");
var compButton = document.getElementById('clear-completed');
var filterVal = -1;

//global reference to the most recent list of todo items
var todosArray = [];
/**
* Runs on when user presses enter on add todo form
* @param event
*/
form.onsubmit = function(event) {
    var title = newTodoInput.value;
    if (title && title !== "") {
        createTodo(title, reloadTodoList);
    }
    //clears the input box
    newTodoInput.value = "";
    event.preventDefault();
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

    //hide bottom buttons
    bottomButtonDiv.style.display = "none";

    //get todo list from server
    getTodoList(formatList);
}

function formatList(todos) {
    todosArray = todos;
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
    bottomButtonDiv.style.display = "flex";

    setAll.onclick = changeFilter(-1);
    setActive.onclick = changeFilter(0);
    setCompleted.onclick = changeFilter(1);
    itemsLeftDiv.textContent = itemsLeft + " items left";

    toggleAllCheckbox.checked = true;
    compButton.style.display = "none";
    parseList(function (item) {
        if (item.children[0].children[0].checked === false) {
            toggleAllCheckbox.checked = false;
        } else {
            compButton.style.display = "block";
            compButton.onclick = deleteAllCompletedEvent;
        }
    })
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
    liCheckboxInput.setAttribute("item-id", todo.id);
    liCheckboxInput.checked = todo.isComplete;
    // liCheckboxInput.id = todo.id;
    var liCheckboxSpan = document.createElement("span");
    var liCheckboxSpanIcon = document.createElement("i");
    liCheckboxSpanIcon.className = "fa fa-check";

    //make delete button
    var liDeleteSpan = document.createElement("span");
    liDeleteSpan.className = "delete-button";
    liDeleteSpan.onclick = deleteListItemEvent;
    liDeleteSpan.setAttribute("item-id", todo.id);
    var liDeleteSpanIcon = document.createElement("i");
    liDeleteSpanIcon.className = "fa fa-close";

    liDeleteSpanIcon.setAttribute("item-id", todo.id);
    // liDeleteSpanIcon.onclick = deleteListItemEvent;
    var liLabel = document.createElement("label");
    liLabel.className = todo.isComplete ? "todo-label completed-label" : "todo-label";
    liDiv.className = "li-div";

    liCheckboxInput.onclick = completeListItemEvent;
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

function deleteAllCompletedEvent() {
    todosArray.forEach(function(todo) {
        if (todo.isComplete) {
            deleteListItem(todo.id);
        }
    });
    reloadTodoList();
}

function changeFilter(filter) {
    return function() {
        filterVal = filter;
        setAll.className = "button";
        setActive.className = "button";
        setCompleted.className = "button";
        if (filter === 1) {
            setCompleted.className += " selected-filter";
        } else if (filter === 0) {
            setActive.className += " selected-filter";
        } else {
            setAll.className += " selected-filter";
        }
        reloadTodoList();
    };
}

function deleteListItemEvent(event) {
    if (event && event.target) {
        var id = event.target.getAttribute("item-id");
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

    toggleAllCheckbox.checked = true;
    parseList(function (item) {
        if (item.children[0].children[0].checked === false) {
            toggleAllCheckbox.checked = false;
        }
    })

    if (event && event.target) {
        var id = event.target.getAttribute("item-id");
        if (id) {
            updateListItem(id, event.target.checked);
        }
    }
}

function updateListItem(id, isComplete, text, softReload) {
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
            if (!softReload) {
                reloadTodoList();
            }
        }
    });
}

toggleAllCheckbox.onclick = function(event) {
    if (event && event.target) {
        var isChecked = event.target.checked;
        parseList(function (item) {
            //get label then get input checkbox then get checked attribute
            if (item.children[0].children[0].checked !== isChecked) {
                item.children[1].className = isChecked ? "todo-label completed-label" : "todo-label";
                item.children[0].children[0].checked = isChecked;
                updateListItem(item.children[0].children[0].getAttribute("item-id"), isChecked, undefined, true);
            }
        })
        reloadTodoList();
    }
}

function parseList(callback) {
    var listItems = todoList.children;
    if (listItems && listItems.length) {
        for (var i = 0; i < listItems.length; i++) {
            //get div
            callback(listItems[i].children[0]);
        }
    }
}

reloadTodoList();
setInterval(reloadTodoList, 50000);

'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view1', {
        templateUrl: 'view1/view1.html',
        controller: 'TodoListCtrl'
    });
}])

.controller('TodoListCtrl',["$scope", "$http", function($scope, $http) {
        $scope.newTodoCreate = "";
        $scope.isLoading = false;
        $scope.todos = [];
        $scope.itemsLeft = 0;

        $scope.createTodo = function (){
            $http.post("/api/todo", {title: $scope.newTodoCreate, isComplete: false})
                .then(function(response) {
                    if (response.status === 201) {
                        $scope.newTodoCreate = "";
                        $scope.getTodoList();
                    }
                    else {
                        error.textContent = "Failed to create item. Server returned " + response.status + " - " +
                            response.statusText;
                    }
                });
        };


        $scope.getTodoList = function () {
            $scope.isLoading = true;
            $http.get("/api/todo").then(function(response) {
                if (response.status === 200) {
                    $scope.todos = response.data;
                    $scope.isLoading = false;
                    $scope.$calcItemNumbers();
                }
                else {
                    error.textContent = "Failed to get list. Server returned " + response.status + " - " + response.statusText;
                }
            });
        }

        $scope.$calcItemNumbers = function() {
            $scope.itemsLeft = $scope.todos.filter(function(todo) {
                return !todo.isComplete;
            }).length;
        };

        $scope.completeTodo = function (todo){
            updateTodo(todo.id, true, todo.text);
        }

        $scope.deleteTodo = function (todo){
            $http.delete("/api/todo/" + todo.id).then( function(response){
                if (response.status !== 200) {
                    error.textContent = "Failed to delete item. Server returned " +
                        response.status + " - " + response.statusText
                }
                else {
                    $scope.getTodoList();
                }
            });
        }

        function updateTodo (id, isComplete, text) {
            $http.put("/api/todo/" + id, {
                    title: text,
                    isComplete: isComplete
                }).then(function(response) {
                if (response.status !== 200) {
                    error.textContent = "Failed to update item. Server returned " +
                        response.status + " - " + response.statusText
                }
                else {
                    $scope.getTodoList();
                }
            });
        }

        $scope.getTodoList();
}]);


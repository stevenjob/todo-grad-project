var server = require("../server/server");
var request = require("request");
var assert = require("chai").assert;

var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;
var todoListUrl = baseUrl + "/api/todo";

describe("server", function() {
    var serverInstance;
    beforeEach(function() {
        serverInstance = server(testPort);
    });
    afterEach(function() {
        serverInstance.close();
    });
    describe("get list of todos", function() {
        it("responds with status code 200", function(done) {
            request(todoListUrl, function(error, response) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });
        it("responds with a body encoded as JSON in UTF-8", function(done) {
            request(todoListUrl, function(error, response) {
                assert.equal(response.headers["content-type"], "application/json; charset=utf-8");
                done();
            });
        });
        it("responds with a body that is a JSON empty array", function(done) {
            request(todoListUrl, function(error, response, body) {
                assert.equal(body, "[]");
                done();
            });
        });
    });
    describe("create a new todo", function() {
        it("responds with status code 201", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item"
                }
            }, function(error, response) {
                assert.equal(response.statusCode, 201);
                done();
            });
        });
        it("responds with the location of the newly added resource", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item"
                }
            }, function(error, response) {
                assert.equal(response.headers.location, "/api/todo/0");
                done();
            });
        });
        it("inserts the todo at the end of the list of todos", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item"
                }
            }, function() {
                request.get(todoListUrl, function(error, response, body) {
                    assert.deepEqual(JSON.parse(body), [{
                        title: "This is a TODO item",
                        id: "0"
                    }]);
                    done();
                });
            });
        });
    });
    describe("delete a todo", function() {
        it("responds with status code 404 if there is no such item", function(done) {
            request.del(todoListUrl + "/0", function(error, response) {
                assert.equal(response.statusCode, 404);
                done();
            });
        });
        it("responds with status code 200", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item"
                }
            }, function() {
                request.del(todoListUrl + "/0", function(error, response) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
        it("removes the item from the list of todos", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item"
                }
            }, function() {
                request.del(todoListUrl + "/0", function() {
                    request.get(todoListUrl, function(error, response, body) {
                        assert.deepEqual(JSON.parse(body), []);
                        done();
                    });
                });
            });
        });
    });
    describe("update a new todo", function() {
        beforeEach(function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item",
                    isComplete: false
                }
            }, function(error, response) {
                assert.equal(response.statusCode, 201);
                done();
            });
        });
        it("responds with status code 200 when update new item", function(done) {
            request.put({
                url: todoListUrl + "/" + 0,
                json: {
                    title: "This is a new item",
                    isComplete: true
                }
            }, function(error, response) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });
        it("responds with status code 200", function(done) {
            request.put({
                url: todoListUrl + "/" + 0,
                json: {
                    title: "This is a updated item",
                    isComplete: false
                }
            }, function(error, response, body) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });
        it("responds with status code 200", function(done) {
            request.put({
                url: todoListUrl + "/" + 0,
                json: {
                    title: "This is a updated item again"
                }
            }, function(error, response, body) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });
        it("responds with status code 404", function(done) {
            request.put({
                url: todoListUrl + "/" + 3,
                json: {
                    title: "This is a TODO item",
                    isComplete: true
                }
            }, function(error, response, body) {
                assert.equal(response.statusCode, 404);
                assert.equal(body, "Not Found");
                done();
            });
        });
        it("responds with status code 404", function(done) {
            request.put({
                url: todoListUrl + "/"
            }, function(error, response, body) {
                assert.equal(response.statusCode, 404);
                assert.equal(body, "Cannot PUT /api/todo/\n");
                done();
            });
        });
    });
});

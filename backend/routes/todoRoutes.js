const express = require("express");
const router = express.Router();
const controller = require("../controllers/todoController");

router.get("/todos", controller.getTodos);
router.post("/todos", controller.createTodo);
router.delete("/todos/:id", controller.deleteTodo);
router.post("/summarize", controller.summarizeAndSend);
router.put("/todos/:id", controller.updateTodo);


module.exports = router;

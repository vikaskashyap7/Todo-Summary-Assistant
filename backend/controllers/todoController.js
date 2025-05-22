const Todo = require("../models/Todo");
const axios = require("axios");
const { CohereClient } = require("cohere-ai");
require("dotenv").config();

// Initialize CohereClient (new method)
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

exports.getTodos = async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
};

exports.createTodo = async (req, res) => {
  const todo = new Todo({ text: req.body.text });
  await todo.save();
  res.json(todo);
};

exports.deleteTodo = async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
exports.updateTodo = async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      { text: req.body.text },
      { new: true }
    );
    res.json(updatedTodo);
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ message: "Failed to update todo." });
  }
};

exports.summarizeAndSend = async (req, res) => {
  try {
    const todos = await Todo.find();
    const todoTexts = todos.map(todo => `- ${todo.text}`).join("\n");

    console.log("Todo list:", todoTexts);

    const summary = await getLLMSummary(todoTexts);
    console.log("Summary:", summary);

    await sendToSlack(summary);
    console.log("Summary sent to Slack");

    res.json({ message: "Summary sent to Slack successfully!" });
  } catch (error) {
    console.error("Error in summarizeAndSend:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Message:", error.message);
    }
    res.status(500).json({ message: "Failed to send summary." });
  }
};


const getLLMSummary = async (text) => {
  const response = await cohere.generate({
    model: "command",
    prompt: `Summarize the following list of todos:\n\n${text}`,
    maxTokens: 100,
    temperature: 0.5,
  });

  const summary = response.generations[0].text.trim();
  return summary;
};

const sendToSlack = async (message) => {
  await axios.post(process.env.SLACK_WEBHOOK_URL, { text: message });
};

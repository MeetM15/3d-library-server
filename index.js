const express = require("express");
const Book = require("./book");
const db = require("./db");

const app = express();

app.get("/books", async (req, res, next) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${process.env.PORT || "3000"}`);
  });
});

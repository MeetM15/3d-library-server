const express = require("express");
const Book = require("./book");
const db = require("./db");
const cors = require("cors");
const app = express();
app.use(cors());
app.get("/books", async (req, res, next) => {
  try {
    const searchTerm = req.query.name;
    const books = await Book.find();
    const matchingBooks = searchTerm
      ? books.filter((book) =>
          book._doc.Name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : books;
    res.json(matchingBooks);
  } catch (err) {
    next(err);
  }
});
app.get("/categories", async (req, res, next) => {
  try {
    const categories = await Book.find({}, "Category");
    const uniqueCategories = [
      ...new Set(categories.map((item) => item._doc.Category)),
    ];
    res.json(uniqueCategories);
  } catch (err) {
    next(err);
  }
});

app.get("/books/:category", async (req, res) => {
  const { category } = req.params;

  try {
    const books = await Book.find({ Category: category });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

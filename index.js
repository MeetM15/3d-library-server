const express = require("express");
const Book = require("./book");
const db = require("./db");
const cors = require("cors");
const stripe = require("stripe")(
  "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"
);
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
app.get("/payment", async (req, res) => {
  const transformedItem = {
    price_data: {
      currency: "inr",
      product_data: {
        name: "Basic reading Plan",
      },
      unit_amount: 50000,
    },
    description:
      " This plan allows access to all the books in the 3D library for reading purposes",
    quantity: 1,
  };
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [transformedItem],
    mode: "payment",
    success_url: `https://virtual-library-fcf41.web.app/`,
    cancel_url: `https://virtual-library-fcf41.web.app/`,
    metadata: {},
  });

  res.json({ id: session.id });
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

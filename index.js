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
  const { customerId } = req.body;

  // Create a new customer
  const customer = await stripe.customers.create({
    id: customerId,
  });

  // Create a payment intent for the customer
  const paymentIntent = await stripe.paymentIntents.create({
    customer: customer.id,
    amount: 50000,
    currency: "inr",
    description: "Basic reading Plan",
    payment_method_types: ["card"],
  });

  // Generate a client secret for the payment intent
  const clientSecret = paymentIntent.client_secret;

  res.json({ clientSecret });
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

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
  const { customerId } = req.query;

  try {
    // Try to retrieve the customer with the given ID
    const customer = await stripe.customers.retrieve(customerId);

    // If the customer exists, create a payment session for the customer
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customer.id,
      line_items: [
        {
          price_data: {
            currency: "inr",
            unit_amount: 50000,
            product_data: {
              name: "Basic reading Plan",
              description:
                "Allows access to all the books in the 3D library for reading purposes.",
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://virtual-library-fcf41.web.app/",
      cancel_url: "https://virtual-library-fcf41.web.app/",
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    // If the customer does not exist, create a new customer and then create the payment session
    if (error.statusCode === 404) {
      const customer = await stripe.customers.create({
        id: customerId,
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer: customer.id,
        line_items: [
          {
            price_data: {
              currency: "inr",
              unit_amount: 50000,
              product_data: {
                name: "Basic reading Plan",
                description:
                  "Allows access to all the books in the 3D library for reading purposes.",
              },
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "https://virtual-library-fcf41.web.app/",
        cancel_url: "https://virtual-library-fcf41.web.app/",
      });

      res.json({ sessionId: session.id });
    } else {
      // If an unexpected error occurs, return a 500 error response
      res.status(500).send("Unexpected error occurred");
    }
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server started on port ${process.env.PORT || "5000"}`);
  });
});

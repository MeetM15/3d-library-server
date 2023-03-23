const express = require('express');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const app = express();

const url = 'mongodb://localhost:27017'; // replace with your MongoDB connection string
const dbName = 'books'; // replace with your MongoDB database name

MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
  if (err) {
    console.error(err);
    return;
  }
  
  const db = client.db(dbName);
  const booksCollection = db.collection('books'); // replace with your MongoDB collection name
  
  // API endpoint to retrieve all books
  app.get('/api/books', async (req, res) => {
    try {
      const books = await booksCollection.find().toArray();
      res.json(books);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
});

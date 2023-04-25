const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require("axios");
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password" });
  }

  // Check if the username already exists
  const userExists = users.find((user) => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Create a new user object and add to users array
  const newUser = { id: users.length + 1, username, password };
  users.push(newUser);

  return res
    .status(201)
    .json({ message: "User registered successfully", user: newUser });
});

public_users.get("/", async function (req, res) {
  try {
    const response = await axios.get("http://localhost:5000/");
    res.status(200).send(JSON.stringify(response.data, null, 2));
  } catch (error) {
    res.status(500).send("Unable to fetch book list");
  }
});

// Search book details based on ISBN using Promises
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  getBookByISBN(isbn)
    .then((book) => {
      if (book) {
        return res.status(200).json(book);
      } else {
        return res.status(404).json({ message: "Book not found" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ message: "Unable to fetch book details" });
    });
});

function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  });
}

// Search book details based on author using Promises
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  getBooksByAuthor(author)
    .then((booksByAuthor) => {
      if (booksByAuthor.length > 0) {
        return res.status(200).json({ books: booksByAuthor });
      } else {
        return res.status(404).json({ message: "No books found by author" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ message: "Unable to fetch book details" });
    });
});

function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    let booksByAuthor = [];
    for (let bookId in books) {
      if (books[bookId].author === author) {
        booksByAuthor.push({ id: bookId, title: books[bookId].title });
      }
    }
    resolve(booksByAuthor);
  });
}

// Search book details based on title using Promises
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  getBooksByTitle(title)
    .then((books) => {
      if (books.length > 0) {
        return res.status(200).json({ books: books });
      } else {
        return res.status(404).json({ message: "No books found by title" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ message: "Unable to fetch book details" });
    });
});

function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    let booksByTitle = [];

    for (let bookId in books) {
      if (books[bookId].title === title) {
        booksByTitle.push({ id: bookId, title: books[bookId].title });
      }
    }

    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject("No books found by title");
    }
  });
}

/// Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (isbn in books) {
    const reviews = books[isbn]["reviews"];
    return res.status(200).json(reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;

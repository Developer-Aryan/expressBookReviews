const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();
regd_users.use(express.json());

let users = [];

const isValid = (username) => {
  let validUsernames = users.map((user) => user.username);
  return validUsernames.includes(username);
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "secretkey");
    const username = decoded.username;
    let userIndex = users.findIndex((user) => user.username === username);
    let existingReviewIndex = users[userIndex].reviews.findIndex(
      (review) => review.isbn === isbn
    );
    if (existingReviewIndex >= 0) {
      // modify existing review
      users[userIndex].reviews[existingReviewIndex].review = review;
      res.json({ message: "Review modified successfully" });
    } else {
      // add new review
      let reviewObj = { isbn: isbn, review: review, username: username };
      users[userIndex].reviews.push(reviewObj);
      res.json({ message: "Review added successfully" });
    }
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

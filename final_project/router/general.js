const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE = "http://localhost:5000";

// Register
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });
  if (users.some(u => u.username === username)) return res.status(409).json({ message: "User already exists" });
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Raw data endpoint that Axios calls
public_users.get('/books-data', (req, res) => res.status(200).json(books));

// All books
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${BASE}/books-data`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// By ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE}/books-data`);
    const book = data[req.params.isbn];
    if (!book) return res.status(404).json({ message: "Book not found" });
    return res.status(200).json(book);
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving book" });
  }
});

// By author
public_users.get('/author/:author', async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE}/books-data`);
    const result = Object.values(data).filter(b => b.author.toLowerCase() === req.params.author.toLowerCase());
    if (result.length === 0) return res.status(404).json({ message: "No books found for that author" });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// By title
public_users.get('/title/:title', async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE}/books-data`);
    const result = Object.values(data).filter(b => b.title.toLowerCase() === req.params.title.toLowerCase());
    if (result.length === 0) return res.status(404).json({ message: "No books found with that title" });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Reviews for a book
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;

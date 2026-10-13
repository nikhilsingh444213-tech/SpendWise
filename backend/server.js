
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(cors());
app.use(express.json());
app.use(express.json({ limit: "10kb" }));

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SpendWise backend is running!",
  });
});

// Get all transactions
app.get("/api/transactions", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, amount, category, type,
             transaction_date, notes, created_at
      FROM transactions
      ORDER BY transaction_date DESC, id DESC
    `);

    res.json({
      success: true,
      transactions: result.rows,
    });
  } catch (error) {
    console.error("Fetch transactions failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not fetch transactions",
    });
  }
});

// Add a transaction
app.post("/api/transactions", async (req, res) => {
  const {
    title,
    amount,
    category,
    type,
    transaction_date,
    notes,
  } = req.body;

  const validTypes = ["income", "expense"];

  if (
    typeof title !== "string" ||
    !title.trim() ||
    title.trim().length > 100 ||
    typeof category !== "string" ||
    !category.trim() ||
    category.trim().length > 50 ||
    !validTypes.includes(type) ||
    amount === undefined ||
    amount === null ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) <= 0 ||
    Number(amount) > 9999999999.99 ||
    (notes != null && typeof notes !== "string") ||
    (notes != null && notes.length > 2000)
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid transaction details",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO transactions
        (title, amount, category, type, transaction_date, notes)
       VALUES ($1, $2, $3, $4, COALESCE($5::date, CURRENT_DATE), $6)
       RETURNING id, title, amount, category, type,
                 transaction_date, notes, created_at`,
      [
        title.trim(),
        Number(amount),
        category.trim(),
        type,
        transaction_date || null,
        notes?.trim() || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Transaction added successfully",
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error("Add transaction failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not add transaction",
    });
  }
});



app.put("/api/transactions/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, amount, category, type } = req.body;
    const numericAmount = Number(amount);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID.",
      });
    }

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 100 ||
      amount === "" ||
      amount === null ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      numericAmount > 9999999999.99 ||
      typeof category !== "string" ||
      !category.trim() ||
      !["income", "expense"].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid transaction details.",
      });
    }

    const result = await pool.query(
      `UPDATE transactions
       SET title = $1,
           amount = $2,
           category = $3,
           type = $4
       WHERE id = $5
       RETURNING id, title, amount, category, type, transaction_date`,
      [
        title.trim(),
        numericAmount,
        category.trim(),
        type,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction nahi mila.",
      });
    }

    return res.json({
      success: true,
      message: "Transaction updated successfully.",
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error("Update transaction failed:", error);

    return res.status(500).json({
      success: false,
      message: "Transaction update nahi ho saka.",
    });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID.",
      });
    }

    const result = await pool.query(
      `DELETE FROM transactions
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction nahi mila.",
      });
    }

    return res.json({
      success: true,
      message: "Transaction deleted successfully.",
    });
  } catch (error) {
    console.error("Delete transaction failed:", error);

    return res.status(500).json({
      success: false,
      message: "Transaction delete nahi ho saka.",
    });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`SpendWise backend running on http://localhost:${PORT}`);
});


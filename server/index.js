const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
var cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

let transactions = [];

async function initializeDatabase() {
  // try {
  //     const response = await axios.get(API_URL);
  //     const data = response.data;

  // Replace 'your_database_name' with your actual MongoDB database name
  mongoose.connect(
    "mongodb+srv://ajay01937:qwerty1234@cluster0.80uwiaj.mongodb.net/test",
    { useNewUrlParser: true, useUnifiedTopology: true },
  );

  // Define MongoDB schema and model
  const ProductSchema = new mongoose.Schema({
    // Define your schema fields based on the JSON structure
    id: Number,
    title: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    sold: Boolean,
    dateOfSale: Date,
  });

  const Product = mongoose.model("Product", ProductSchema);

  // API endpoint to initialize the database
  // app.get("/", async (req, res) => {
  try {
    // Fetch data from the third-party API
    const apiURL =
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json";
    const response = await axios.get(apiURL);
    const data = response.data;

    // Initialize database with seed data
    await Product.insertMany(data);
    transactions = data;
    console.log("Database initialized with seed data.");
  } catch (error) {
    console.error(error);
    // res.status(500).json({ error: "Internal Server Error" });
  }
  // });

  //       console.log('Database initialized with seed data.');
  //   } catch (error) {
  //       console.error("Error initializing database:", error.message);
  //   }
}

// Initialize the database on startup
initializeDatabase();

// Routes

// Helper function to filter transactions by month
function filterByMonth(transactions, month) {
  if (!month || isNaN(month) || month < 1 || month > 12) {
    // If month is not provided or is invalid, return all transactions
    return transactions;
  }

  return transactions.filter((transaction) => {
    const transactionMonth = new Date(transaction.dateOfSale).getUTCMonth() + 1;
    return transactionMonth === month;
  });
}

app.get("/transactions", (req, res) => {
  const { search = "", page = 1, perPage = 10, month } = req.query;

  // Fetch transactions from the database or API
  let filteredTransactions = [...transactions];

  // Filter by month if provided
  if (month) {
    filteredTransactions = filterByMonth(
      filteredTransactions,
      parseInt(month, 10),
    );
  }

  // Apply search criteria
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredTransactions = filteredTransactions.filter(
      (transaction) =>
        transaction.product.title.toLowerCase().includes(searchTerm) ||
        transaction.product.description.toLowerCase().includes(searchTerm) ||
        transaction.product.price.toString().includes(searchTerm),
    );
  }

  // Apply pagination
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + parseInt(perPage, 10);
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex,
  );

  res.json({
    message: "List of transactions",
    transactions: paginatedTransactions,
    total: filteredTransactions.length,
    pageIndex: parseInt(page, 10),
    month: month ? parseInt(month, 10) : null,
  });
});

// Assuming you have a global variable 'transactions' that holds your data.

// Helper function to calculate total sale amount, sold items, and not sold items
function calculateStatistics(transactions) {
  const totalSaleAmount = transactions.reduce(
    (total, transaction) => total + transaction.price,
    0,
  );
  const soldItems = transactions.filter(
    (transaction) => transaction.sold,
  ).length;
  const notSoldItems = transactions.length - soldItems;
  return { totalSaleAmount, soldItems, notSoldItems };
}

// Helper function to group transactions into price ranges and count items in each range
// Helper function to group transactions into price ranges and count items in each range
function groupByPriceRange(transactions) {
  const priceRanges = [
    { min: 0, max: 100 },
    { min: 101, max: 200 },
    { min: 201, max: 300 },
    { min: 301, max: 400 },
    { min: 401, max: 500 },
    { min: 501, max: 600 },
    { min: 601, max: 700 },
    { min: 701, max: 800 },
    { min: 801, max: 900 },
    { min: 901, max: "Above" },
  ];

  const groupedData = priceRanges.map((range) => {
    const { min, max } = range;
    const count = transactions.filter((transaction) => {
      // const { product } = transaction;
      return (
        // product && // Check if product exists
        transaction.price >= min &&
        transaction.price <= max
      );
    }).length;

    return {
      range: `${min}-${max}`,
      count:count,
    };
  });

  return groupedData;
}


// Helper function to group transactions by category and count items in each category
function groupByCategory(transactions) {
  const groupedData = {};

  transactions.forEach((transaction) => {
    const category = transaction.category;
    groupedData[category] = (groupedData[category] || 0) + 1;
  });

  return Object.entries(groupedData).map(([category, count]) => ({
    category,
    count,
  }));
}

// Routes

// API for statistics
app.get("/statistics", (req, res) => {
  const { month } = req.query;

  // Fetch transactions from the database or API
  let filteredTransactions = [...transactions];
  if (month) {
    filteredTransactions = filterByMonth(
      filteredTransactions,
      parseInt(month, 10),
    );
  }

  // Calculate statistics
  const statistics = calculateStatistics(filteredTransactions);

  res.json({ statistics });
  console.log(statistics);
});

// API for bar chart
app.get("/bar-chart", (req, res) => {
  const { month } = req.query;

  // Fetch transactions from the database or API
  let filteredTransactions = [...transactions];
  if (month) {
    filteredTransactions = filterByMonth(
      filteredTransactions,
      parseInt(month, 10),
    );
  }

  // Group transactions into price ranges
  const barChartData = groupByPriceRange(filteredTransactions);

  res.json({ barChartData });
});

// API for pie chart
app.get("/pie-chart", (req, res) => {
  const { month } = req.query;

  // Fetch transactions from the database or API
  let filteredTransactions = [...transactions];
  if (month) {
    filteredTransactions = filterByMonth(
      filteredTransactions,
      parseInt(month, 10),
    );
  }

  // Group transactions by category
  const pieChartData = groupByCategory(filteredTransactions);

  res.json({ pieChartData });
});

// API to fetch data from all APIs
app.get("/combined-data", async (req, res) => {
  try {
    const { month } = req.query;

    // Fetch transactions from the database or API
    let filteredTransactions = [...transactions];
    if (month) {
      filteredTransactions = filterByMonth(
        filteredTransactions,
        parseInt(month, 10),
      );
    }

    // Calculate statistics
    const statistics = calculateStatistics(filteredTransactions);

    // Group transactions into price ranges
    const barChartData = groupByPriceRange(filteredTransactions);

    // Group transactions by category
    const pieChartData = groupByCategory(filteredTransactions);

    res.json({ statistics, barChartData, pieChartData });
    console.log(statistics);
  } catch (error) {
    console.error("Error fetching combined data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

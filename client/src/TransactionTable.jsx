import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

const TransactionsTable = ({ onDataChange }) => {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("3"); // March is the default month
  const [currentPage, setCurrentPage] = useState(1);
  const [totalpages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchData();
  }, [selectedMonth, currentPage]);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/transactions",
        {
          params: {
            month: selectedMonth,
            page: currentPage,
          },
        },
      );
      setTransactions(response.data.transactions);
      setTotalPages(Math.ceil(response.data.total / 10));
    } catch (error) {
      console.error("Error fetching transactions:", error.message);
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    const newData = e.target.value;
    onDataChange(newData);
  };

  const handleNextPage = () => {
    if (currentPage + 1 <= totalpages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="container">
      <h1>Transactions Table</h1>
      <div>
        <label>Select Month: </label>
        <select value={selectedMonth} onChange={handleMonthChange}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <option key={month} value={month}>
              {new Date(2000, month - 1, 1).toLocaleString("en-US", {
                month: "long",
              })}
            </option>
          ))}
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Sold</th>
            <th>DateOfSale</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.id}</td>
              <td>{transaction.title.substring(0, 50)}...</td>
              <td>{transaction.description.substring(0, 50)}...</td>
              <td>{transaction.price}</td>
              <td>{transaction.category}</td>
              <td>{transaction.sold ? "Yes" : "No"}</td>
              <td>{transaction.dateOfSale}</td>
              <td>
                <img src={transaction.image} width="90px" alt="Transaction" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={handlePrevPage}>Previous</button>
        <button onClick={handleNextPage}>Next</button>
        <p>Items Per page: 10</p>
      </div>
    </div>
  );
};

export default TransactionsTable;

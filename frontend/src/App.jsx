import { useEffect, useState } from "react";

import "./App.css";







const monthlySpending = [

  { month: "May", value: 45 },

  { month: "Jun", value: 65 },

  { month: "Jul", value: 50 },

  { month: "Aug", value: 80 },

  { month: "Sep", value: 60 },

  { month: "Oct", value: 40 },

];



const money = (amount) =>

  new Intl.NumberFormat("en-IN", {

    style: "currency",

    currency: "INR",

    maximumFractionDigits: 0,

  }).format(amount);



  function formatTransaction(item) {

  const dateString = String(item.transaction_date).slice(0, 10);



  const date = new Date(`${dateString}T00:00:00`);



  return {

    id: item.id,

    title: item.title,

    amount: Number(item.amount),

    category: item.category,

    type: item.type,

    date: date.toLocaleDateString("en-IN", {

      month: "short",

      day: "2-digit",

      year: "numeric",

    }),

  };

}



function App() {

  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [apiError, setApiError] = useState("");

  const [formError, setFormError] = useState("");

  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");

  const [amount, setAmount] = useState("");

  const [category, setCategory] = useState("Food");

  const [type, setType] = useState("expense");

  const [activePage, setActivePage] = useState("Dashboard");





  useEffect(() => {

  async function loadTransactions() {

    try {

      setLoading(true);

      setApiError("");



      const response = await fetch(

        "http://localhost:5000/api/transactions"

      );



      const data = await response.json();



      if (!response.ok || !data.success) {

        throw new Error(

          data.message || "Transactions load nahi ho sake."

        );

      }



      setTransactions(data.transactions.map(formatTransaction));

    } catch (error) {

      setApiError(

        "Backend se connection nahi ho pa raha. Backend aur database check karo."

      );

      console.error("Load transactions failed:", error);

    } finally {

      setLoading(false);

    }

  }



  loadTransactions();

}, []);



  const income = transactions

    .filter((item) => item.type === "income")

    .reduce((sum, item) => sum + item.amount, 0);



  const expenses = transactions

    .filter((item) => item.type === "expense")

    .reduce((sum, item) => sum + item.amount, 0);



  const balance = income - expenses;



  async function addTransaction(event) {

  event.preventDefault();



  const numericAmount = Number(amount);



  if (

    !title.trim() ||

    title.trim().length > 100 ||

    !Number.isFinite(numericAmount) ||

    numericAmount <= 0 ||

    numericAmount > 9999999999.99

  ) {

    setFormError("Please valid title aur amount enter karo.");

    return;

  }



  try {

    setSaving(true);

    setFormError("");



    const response = await fetch(

      "http://localhost:5000/api/transactions",

      {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          title: title.trim(),

          amount: numericAmount,

          category: type === "income" ? "Income" : category,

          type,

        }),

      }

    );



    const data = await response.json();



    if (!response.ok || !data.success) {

      throw new Error(

        data.message || "Transaction save nahi hua."

      );

    }



    setTransactions((current) => [

      formatTransaction(data.transaction),

      ...current,

    ]);



    setTitle("");

    setAmount("");

    setCategory("Food");

    setType("expense");

    setShowForm(false);

    setFormError("");

  } catch (error) {

    setFormError(

      error.message || "Server se connection nahi ho pa raha."

    );

  } finally {

    setSaving(false);

  }

}



      return (

    <div className="app-shell">

      <aside className="sidebar">

        <a className="brand" href="#dashboard">

          <span className="brand-icon">₹</span>

          <span>Spend<span className="brand-accent">Wise</span></span>

        </a>



        <p className="nav-label">MENU</p>

        <nav className="navigation">

          {[

            ["▦", "Dashboard"],

            ["↔", "Transactions"],

            ["◷", "Budgets"],

            ["▥", "Reports"],

          ].map(([icon, label]) => (

            <button

              key={label}

              className={`nav-item ${activePage === label ? "active" : ""}`}

              onClick={() => setActivePage(label)}

            >

              <span className="nav-icon">{icon}</span>

              {label}

            </button>

          ))}

        </nav>



        <div className="sidebar-bottom">

          <div className="tip-card">

            <span className="tip-icon">✦</span>

            <h3>Smart spending</h3>

            <p>Track your expenses and build better money habits.</p>

          </div>

          <div className="profile">

            <div className="avatar">N</div>

            <div>

              <strong>My Account</strong>

              <p>Personal wallet</p>

            </div>

          </div>

        </div>

      </aside>



      <main className="main-content">

        <header className="topbar">

          <div>

            <p className="eyebrow">YOUR FINANCIAL SPACE</p>

            <h1>{activePage === "Dashboard" ? "Dashboard" : activePage}</h1>

          </div>

          <button className="primary-button" onClick={() => setShowForm(true)}>

            <span>＋</span> Add transaction

          </button>

        </header>



        {activePage === "Dashboard" ? (

          <>

            <section className="welcome-row">

              <div>

                <h2>Good day! 👋</h2>

                <p>Here is your financial overview.</p>

              </div>

              <span className="date-chip">October 2026</span>

            </section>



            <section className="stats-grid">

              <article className="stat-card balance-card">

                <div className="stat-top">

                  <span>Total balance</span>

                  <span className="stat-icon">₹</span>

                </div>

                <h2>{money(balance)}</h2>

                <p className="stat-note">Income minus expenses</p>

              </article>



              <article className="stat-card">

                <div className="stat-top">

                  <span>Total income</span>

                  <span className="stat-icon income-icon">↙</span>

                </div>

                <h2>{money(income)}</h2>

                <p className="stat-note positive">↗ Money received</p>

              </article>



              <article className="stat-card">

                <div className="stat-top">

                  <span>Total expenses</span>

                  <span className="stat-icon expense-icon">↗</span>

                </div>

                <h2>{money(expenses)}</h2>

                <p className="stat-note">↗ Money spent</p>

              </article>

            </section>



            <section className="content-grid">

              <article className="panel chart-panel">

                <div className="panel-heading">

                  <div>

                    <h3>Spending overview</h3>

                    <p>Your monthly spending at a glance</p>

                  </div>

                  <span className="small-chip">6 months</span>

                </div>



                <div className="chart-legend">

                  <span><i /> Spending (₹ thousands)</span>

                </div>



                <div className="bar-chart">

                  {[100, 75, 50, 25, 0].map((tick) => (

                    <div className="chart-line" key={tick}>

                      <span>{tick}</span>

                      <div />

                    </div>

                  ))}

                  <div className="bars">

                    {monthlySpending.map((item) => (

                      <div className="bar-column" key={item.month}>

                        <div className="bar-track">

                          <div

                            className={`bar ${item.month === "Oct" ? "bar-highlight" : ""}`}

                            style={{ height: `${item.value}%` }}

                            title={`₹${item.value},000`}

                          />

                        </div>

                        <span>{item.month}</span>

                      </div>

                    ))}

                  </div>

                </div>

                <p className="chart-footnote">

                  Sample chart data — connect real transactions for accurate reports.

                </p>

              </article>



              <article className="panel">

                <div className="panel-heading">

                  <div>

                    <h3>Expense breakdown</h3>

                    <p>Where your money goes</p>

                  </div>

                </div>



                {[

                  { name: "Food & groceries", amount: 1800, color: "#7867f5" },

                  { name: "Bills", amount: 1200, color: "#25b99a" },

                  { name: "Entertainment", amount: 650, color: "#f2a65a" },

                ].map((item) => (

                  <div className="category-row" key={item.name}>

                    <div className="category-top">

                      <span><i style={{ background: item.color }} />{item.name}</span>

                      <strong>{money(item.amount)}</strong>

                    </div>

                    <div className="progress-track">

                      <div

                        className="progress-fill"

                        style={{

                        width: `${(item.amount / 3650) * 100}%`,

                          background: item.color,

                        }}

                      />

                    </div>

                  </div>

                ))}

                <div className="category-total">

                  <span>Sample expenses</span>

                  <strong>{money(3650)}</strong>

                </div>

              </article>

            </section>



            <TransactionTable

              transactions={transactions}

              onViewAll={() => setActivePage("Transactions")}

            />

          </>

        ) : activePage === "Transactions" ? (

          <TransactionTable transactions={transactions} />

        ) : (

          <section className="panel coming-soon">

            <span className="coming-icon">✦</span>

            <h2>{activePage} coming soon</h2>

            <p>This section will be developed in the next steps.</p>

            <button className="primary-button" onClick={() => setActivePage("Dashboard")}>

              Back to dashboard

            </button>

          </section>

        )}

      </main>



      {showForm && (

        <div className="modal-backdrop" onClick={() => setShowForm(false)}>

          <section

            className="modal"

            role="dialog"

            aria-modal="true"

            aria-labelledby="form-title"

            onClick={(event) => event.stopPropagation()}

          >

            <div className="modal-heading">

              <div>

                <h2 id="form-title">Add transaction</h2>

                <p>Record your income or an expense.</p>

              </div>

              <button

                className="close-button"

                aria-label="Close"

                onClick={() => setShowForm(false)}

              >

                ×

              </button>

            </div>

            <form onSubmit={addTransaction}>

              {formError && (

                <p role="alert" className="form-error">

                    {formError}

                     </p>

              )}

              <label htmlFor="type">Transaction type</label>

              <select id="type" value={type} onChange={(e) => setType(e.target.value)}>

                <option value="expense">Expense</option>

                <option value="income">Income</option>

              </select>



              <label htmlFor="title">Description</label>

              <input

                id="title"

                value={title}

                onChange={(e) => setTitle(e.target.value)}

                placeholder="e.g. Lunch, Salary"

                maxLength={100}

                required

              />



              <label htmlFor="amount">Amount (₹)</label>

              <input

                id="amount"

                type="number"

                min="0.01"

                step="0.01"

                value={amount}

                onChange={(e) => setAmount(e.target.value)}

                placeholder="Enter amount"

                required

              />



              {type === "expense" && (

                <>

                  <label htmlFor="category">Category</label>

                  <select

                    id="category"

                    value={category}

                    onChange={(e) => setCategory(e.target.value)}

                  >

                    <option>Food</option>

                    <option>Transport</option>

                    <option>Bills</option>

                    <option>Shopping</option>

                    <option>Entertainment</option>

                    <option>Health</option>

                    <option>Education</option>

                    <option>Other</option>

                  </select>

                </>

              )}





                <button

                  className="primary-button submit-button"

                  type="submit"

                  disabled={saving}

                >

                  {saving ? "Saving..." : "Save transaction"}

                </button>



            </form>

          </section>

        </div>

      )}

    </div>

  );

}



function TransactionTable({ transactions, onViewAll }) {

  return (

    <section className="panel transactions-panel">

      <div className="panel-heading">

        <div>

          <h3>Recent transactions</h3>

          <p>Your latest income and expenses</p>

        </div>

        {onViewAll && (

          <button className="text-button" onClick={onViewAll}>

            View all →

          </button>

        )}

      </div>



      {transactions.length === 0 ? (

        <p className="empty-state">No transactions yet. Add your first transaction!</p>

      ) : (

        <div className="table-scroll">

          <table>

            <thead>

              <tr>

                <th>TRANSACTION</th>

                <th>CATEGORY</th>

                <th>DATE</th>

                <th className="amount-cell">AMOUNT</th>

              </tr>

            </thead>

            <tbody>

              {transactions.map((item) => (

                <tr key={item.id}>

                  <td>

                    <div className="transaction-name">

                      <span className={`transaction-icon ${item.type}`}>

                        {item.type === "income" ? "↓" : "↗"}

                      </span>

                      <strong>{item.title}</strong>

                    </div>

                  </td>

                  <td><span className="category-badge">{item.category}</span></td>

                  <td className="date-cell">{item.date}</td>

                  <td className={`amount-cell ${item.type}`}>

                    {item.type === "income" ? "+" : "−"}{money(item.amount)}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </section>

  );

}



export default App;

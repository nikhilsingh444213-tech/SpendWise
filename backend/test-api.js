
async function testAddTransaction() {
  try {
    const response = await fetch(
      "http://localhost:5000/api/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "College Canteen",
          amount: 120,
          category: "Food",
          type: "expense",
          notes: "API testing",
        }),
      }
    );

    const data = await response.json();

    console.log("HTTP Status:", response.status);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Request failed:", error.message);
  }
}

testAddTransaction();

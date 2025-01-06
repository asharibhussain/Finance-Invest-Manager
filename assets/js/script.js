function updateTotal(category) {
  const table = document
    .getElementById(`${category}Table`)
    .querySelector("tbody");
  let total = 0;
  table.querySelectorAll("tr").forEach((row) => {
    total += parseFloat(row.cells[1].textContent.replace("$", ""));
  });
  document.getElementById(`${category}Total`).textContent = `$${total.toFixed(
    2
  )}`;
}

function getCurrentDate() {
  return new Date().toISOString().split("T")[0];
}

function addNewAmount(category) {
  const newAmount = prompt(`Enter a new amount for ${category}:`);
  if (newAmount && !isNaN(newAmount)) {
    const table = document
      .getElementById(`${category}Table`)
      .querySelector("tbody");
    const newRow = document.createElement("tr");
    const currentDate = getCurrentDate();
    newRow.innerHTML = `
      <td>${table.rows.length + 1}</td>
      <td>$${parseFloat(newAmount).toFixed(2)}</td>
      <td>${currentDate}</td>
      <td><input type="radio" name="${category}Select" value="${
      table.rows.length + 1
    }"></td>
    `;
    table.appendChild(newRow);
    saveAmountInCookies(category, newAmount, currentDate);
    updateTotal(category);
  } else {
    alert("Invalid amount! Please enter a valid number.");
  }
}

function deleteSelectedAmount(category) {
  const selectedRow = document.querySelector(
    `input[name="${category}Select"]:checked`
  );
  if (selectedRow) {
    const row = selectedRow.closest("tr");
    const rowIndex = Array.from(row.parentNode.children).indexOf(row);
    row.remove();
    updateTotal(category);
    removeAmountFromCookies(category, rowIndex);
    reindexTableRows(category);
  } else {
    alert("Please select an amount to delete!");
  }
}

function reindexTableRows(category) {
  const table = document
    .getElementById(`${category}Table`)
    .querySelector("tbody");
  table
    .querySelectorAll("tr")
    .forEach((row, index) => (row.cells[0].textContent = index + 1));
  const updatedData = Array.from(table.querySelectorAll("tr")).map((row) => ({
    amount: parseFloat(row.cells[1].textContent.replace("$", "")),
    date: row.cells[2].textContent,
  }));
  setCookie(`${category}Data`, JSON.stringify(updatedData));
}

function editSelectedAmount(category) {
  const selectedRow = document.querySelector(
    `input[name="${category}Select"]:checked`
  );
  if (selectedRow) {
    const row = selectedRow.closest("tr");
    const rowIndex = Array.from(row.parentNode.children).indexOf(row);
    const currentAmount = row.cells[1].textContent;
    const currentDate = row.cells[2].textContent;
    const newAmount = prompt(
      `Edit the amount (Current: ${currentAmount} on ${currentDate}):`,
      currentAmount.replace("$", "")
    );
    const newDate = prompt(
      `Edit the date (Current: ${currentDate}):`,
      currentDate
    );
    if (newAmount && !isNaN(newAmount) && newDate) {
      row.cells[1].textContent = `$${parseFloat(newAmount).toFixed(1)}`;
      row.cells[2].textContent = newDate;
      updateTotal(category);
      updateAmountInCookies(category, rowIndex, newAmount, newDate);
    } else {
      alert("Invalid input! Please enter valid values.");
    }
  } else {
    alert("Please select an amount to edit!");
  }
}

function initializeFromCookies(category) {
  const data = getCookie(`${category}Data`);
  if (data) {
    const parsedData = JSON.parse(data);
    const table = document
      .getElementById(`${category}Table`)
      .querySelector("tbody");
    parsedData.forEach((entry, index) => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${index + 1}</td>
        <td>$${entry.amount.toFixed(2)}</td>
        <td>${entry.date}</td>
        <td><input type="radio" name="${category}Select" value="${
        index + 1
      }"></td>
      `;
      table.appendChild(newRow);
    });
    updateTotal(category);
  }
}

window.onload = () => {
  ["Income", "Expense", "Savings"].forEach((category) =>
    initializeFromCookies(category)
  );
};

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

function setCookie(name, value) {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  document.cookie = `${name}=${value};path=/;expires=${date.toUTCString()}`;
}

function saveAmountInCookies(category, amount, date) {
  const existingData = JSON.parse(getCookie(`${category}Data`) || "[]");
  existingData.push({ amount: parseFloat(amount), date });
  setCookie(`${category}Data`, JSON.stringify(existingData));
}

function removeAmountFromCookies(category, rowIndex) {
  const existingData = JSON.parse(getCookie(`${category}Data`) || "[]");
  existingData.splice(rowIndex, 1);
  setCookie(`${category}Data`, JSON.stringify(existingData));
}

function updateAmountInCookies(category, rowIndex, newAmount, newDate) {
  const existingData = JSON.parse(getCookie(`${category}Data`) || "[]");
  existingData[rowIndex] = { amount: parseFloat(newAmount), date: newDate };
  setCookie(`${category}Data`, JSON.stringify(existingData));
}

class Transaction {
  constructor(id, amount, date, category, subCategory, description) {
    this.id = id;
    this.amount = amount;
    this.date = date;
    this.category = category;
    this.subCategory = subCategory;
    this.description = description;
  }
}

class Storage {
  static get() {
    return JSON.parse(localStorage.getItem("transactions")) || [];
  }

  static save(data) {
    localStorage.setItem("transactions", JSON.stringify(data));
  }
}

class App {
  constructor() {
    this.transactions = Storage.get();
    this.editId = null;
  }

  add(tx) {
    this.transactions.push(tx);
    Storage.save(this.transactions);
  }

  update(updated) {
    this.transactions = this.transactions.map(t =>
      t.id === updated.id ? updated : t
    );
    Storage.save(this.transactions);
  }

  delete(id) {
    this.transactions = this.transactions.filter(t => t.id !== id);
    Storage.save(this.transactions);
  }

  summary() {
    let income = 0, expense = 0;

    this.transactions.forEach(t => {
      if (t.category === "Income") income += +t.amount;
      else expense += +t.amount;
    });

    return {
      income,
      expense,
      balance: income - expense
    };
  }
}

const app = new App();

const modal = document.getElementById("modal");
const form = document.getElementById("transactionForm");
const subCat = document.getElementById("subCategory");

const categories = {
  Income: ["Salary", "Bonus", "Allowance"],
  Expense: ["Food", "Rent", "Shopping"]
};

// Open modal
document.getElementById("addBtn").onclick = () => {
  modal.style.display = "block";
  form.reset();
  document.getElementById("date").valueAsDate = new Date();
};

// Close modal
document.getElementById("closeModal").onclick = () => {
  modal.style.display = "none";
};

// Category change
document.querySelectorAll("input[name='category']").forEach(r => {
  r.onchange = () => {
    subCat.innerHTML = "<option value=''>Select</option>";
    categories[r.value].forEach(c => {
      subCat.innerHTML += `<option>${c}</option>`;
    });
  };
});

// Submit form
form.onsubmit = (e) => {
  e.preventDefault();

  const amount = document.getElementById("amount").value;
  const date = document.getElementById("date").value;
  const category = document.querySelector("input[name='category']:checked")?.value;
  const subCategory = subCat.value;
  const description = document.getElementById("description").value;

  if (!amount || amount <= 0) return alert("Invalid amount");
  if (new Date(date) > new Date()) return alert("Future date not allowed");
  if (!category) return alert("Select category");
  if (!subCategory) return alert("Select subcategory");

  const tx = new Transaction(
    app.editId || Date.now(),
    amount,
    date,
    category,
    subCategory,
    description
  );

  if (app.editId) app.update(tx);
  else app.add(tx);

  modal.style.display = "none";
  app.editId = null;

  render();
};

// Render UI
function render() {
  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  app.transactions.forEach(t => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.category}</td>
      <td>${t.subCategory}</td>
      <td>${t.description}</td>
      <td>${t.amount}</td>
      <td>
        <button onclick="edit(${t.id})">Edit</button>
        <button onclick="del(${t.id})">Delete</button>
      </td>
    `;

    list.appendChild(row);
  });

  const s = app.summary();
  document.getElementById("income").textContent = s.income;
  document.getElementById("expense").textContent = s.expense;
  document.getElementById("balance").textContent = s.balance;
}

// Delete
window.del = (id) => {
  if (confirm("Delete this transaction?")) {
    app.delete(id);
    render();
  }
};

// Edit
window.edit = (id) => {
  const t = app.transactions.find(x => x.id === id);

  modal.style.display = "block";

  document.getElementById("amount").value = t.amount;
  document.getElementById("date").value = t.date;
  document.querySelector(`input[value='${t.category}']`).checked = true;

  subCat.innerHTML = "";
  categories[t.category].forEach(c => {
    subCat.innerHTML += `<option ${c === t.subCategory ? "selected" : ""}>${c}</option>`;
  });

  document.getElementById("description").value = t.description;

  app.editId = id;
};

render();
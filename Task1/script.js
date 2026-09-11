let tasks = [];
let editId = null;

const form = document.getElementById("taskForm");
const taskName = document.getElementById("taskName");
const subject = document.getElementById("subject");
const priority = document.getElementById("priority");
const dueDate = document.getElementById("dueDate");

const taskList = document.getElementById("taskList");
const search = document.getElementById("search");
const filter = document.getElementById("filter");
const priorityFilter = document.getElementById("priorityFilter");
const sort = document.getElementById("sort");
const error = document.getElementById("error");

let saved = localStorage.getItem("tasks");

if (saved) {
    tasks = JSON.parse(saved);
}

let today = new Date();

document.getElementById("date").textContent =
    "Date: " + today.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric"
    });

form.addEventListener("submit", function(e) {

    e.preventDefault();

    if (
        taskName.value.trim() === "" ||
        subject.value === "" ||
        priority.value === "" ||
        dueDate.value === ""
    ) {
        error.textContent = "Please fill all fields.";
        return;
    }

    error.textContent = "";

    if (editId === null) {

        tasks.push({
            id: Date.now(),
            name: taskName.value,
            subject: subject.value,
            priority: priority.value,
            dueDate: dueDate.value,
            completed: false
        });

    } else {

        let task = tasks.find(t => t.id === editId);

        task.name = taskName.value;
        task.subject = subject.value;
        task.priority = priority.value;
        task.dueDate = dueDate.value;

        editId = null;

        document.getElementById("formTitle").textContent = "Add Task";
        document.getElementById("submitBtn").textContent = "Add Task";
    }

    save();
    form.reset();
    displayTasks();
});

function displayTasks() {

    taskList.innerHTML = "";

    let result = tasks.filter(function(task) {

        let text = task.name.toLowerCase() + " " +
                   task.subject.toLowerCase();

        let searchMatch =
            text.includes(search.value.toLowerCase());

        let statusMatch =
            filter.value === "all" ||
            (filter.value === "completed" && task.completed) ||
            (filter.value === "pending" && !task.completed);

        let priorityMatch =
            priorityFilter.value === "all" ||
            task.priority === priorityFilter.value;

        return searchMatch && statusMatch && priorityMatch;
    });
    if (sort.value === "name")
        result.sort((a, b) => a.name.localeCompare(b.name));

    if (sort.value === "date")
        result.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    if (sort.value === "priority") {

        let order = {
            High: 1,
            Medium: 2,
            Low: 3
        };

        result.sort((a, b) =>
            order[a.priority] - order[b.priority]
        );
    }

    result.forEach(function(task) {

        let div = document.createElement("div");

        div.className =
            task.completed ? "task completed" : "task";

        div.innerHTML = `
            <h3>${task.name}</h3>
            <p>Subject: ${task.subject}</p>
            <p>Priority: ${task.priority}</p>
            <p>Due Date: ${task.dueDate}</p>

            <button class="complete-btn"
                onclick="completeTask(${task.id})">
                ${task.completed ? "Undo" : "Complete"}
            </button>

            <button class="edit-btn"
                onclick="editTask(${task.id})">
                Edit
            </button>

            <button class="delete-btn"
                onclick="deleteTask(${task.id})">
                Delete
            </button>
        `;

        taskList.appendChild(div);
    });

    document.getElementById("empty").style.display =
        result.length === 0 ? "block" : "none";

    updateStats();
}

function completeTask(id) {

    let task = tasks.find(t => t.id === id);

    task.completed = !task.completed;

    save();
    displayTasks();
}

function deleteTask(id) {

    tasks = tasks.filter(task => task.id !== id);

    save();
    displayTasks();
}

function editTask(id) {

    let task = tasks.find(t => t.id === id);

    taskName.value = task.name;
    subject.value = task.subject;
    priority.value = task.priority;
    dueDate.value = task.dueDate;

    editId = id;

    document.getElementById("formTitle").textContent = "Edit Task";
    document.getElementById("submitBtn").textContent = "Update Task";

    window.scrollTo(0, 0);
}

function updateStats() {

    let total = tasks.length;
    let completed = tasks.filter(t => t.completed).length;
    let pending = total - completed;

    let percentage =
        total === 0 ? 0 : Math.round(completed / total * 100);

    document.getElementById("total").textContent = total;
    document.getElementById("completed").textContent = completed;
    document.getElementById("pending").textContent = pending;
    document.getElementById("percentage").textContent =
        percentage + "%";

    document.getElementById("progressBar").style.width =
        percentage + "%";
}

search.addEventListener("input", displayTasks);
filter.addEventListener("change", displayTasks);
priorityFilter.addEventListener("change", displayTasks);
sort.addEventListener("change", displayTasks);

function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

const themeBtn = document.getElementById("themeBtn");
themeBtn.addEventListener("click", function() {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        themeBtn.textContent = "Dark Mode ☀️";
        localStorage.setItem("theme", "dark");
    } else {
        themeBtn.textContent = "Light Mode 🌙";
        localStorage.setItem("theme", "light");
    }
});
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "Theme ☀️";
}
displayTasks();
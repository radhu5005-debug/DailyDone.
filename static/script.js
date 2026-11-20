const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const reminderInput = document.getElementById("taskReminder");

const notificationButton = document.getElementById("enableNotifications");

// Show task on website
function displayTask(taskData) {

    const listItem = document.createElement("li");
    listItem.textContent = taskData.task;

    taskList.appendChild(listItem);

    // Schedule reminder
    if (taskData.reminder && Notification.permission === "granted") {

        const delay = new Date(taskData.reminder).getTime() - Date.now();

        if (delay > 0) {
            setTimeout(function() {
                new Notification("DailyDone Reminder", {
                    body: taskData.task
                });
            }, delay);
        }
    }
}

// Load saved tasks from database
async function loadTasks() {

    const response = await fetch("/get_tasks");
    const tasks = await response.json();

    taskList.innerHTML = "";

    tasks.forEach(function(task) {
        displayTask(task);
    });
}

// Add and save task
addButton.addEventListener("click", async function() {

    const task = taskInput.value.trim();
    const reminderTime = reminderInput.value;

    if (task === "") {
        alert("Please enter a task!");
        return;
    }

    if (reminderTime !== "" && new Date(reminderTime) <= new Date()) {
        alert("Please select a future reminder time!");
        return;
    }

    try {

        const response = await fetch("/add_task", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                task: task,
                reminder: reminderTime
            })
        });

        if (!response.ok) {
            throw new Error("Could not save task");
        }

        const savedTask = await response.json();

        displayTask(savedTask);

        taskInput.value = "";
        reminderInput.value = "";

    } catch (error) {
        alert("Task could not be saved. Please try again.");
        console.error(error);
    }

});

// Enable notifications
notificationButton.addEventListener("click", function() {

    if (!("Notification" in window)) {
        alert("Your browser does not support notifications.");
        return;
    }

    Notification.requestPermission().then(function(permission) {

        if (permission === "granted") {
            alert("Notifications enabled successfully!");
        } else {
            alert("Please allow notifications.");
        }

    });

});

// Load saved tasks when website opens
loadTasks();

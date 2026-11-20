from flask import Flask, render_template,request,jsonify
import sqlite3

app = Flask(__name__)
def create_table():
    conn = sqlite3.connect("tasks.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task TEXT NOT NULL,
            reminder TEXT,
            completed INTEGER DEFAULT 0
        )
    """)

    conn.commit()
    conn.close()
create_table()
@app.route("/")
def home():
     return render_template("index.html")
@app.route("/add_task", methods=["POST"])
def add_task():

    data = request.get_json()

    task = data.get("task", "").strip()
    reminder = data.get("reminder", "")

    if not task:
        return jsonify({"error": "Task is required"}), 400

    conn = sqlite3.connect("tasks.db")
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO tasks (task, reminder) VALUES (?, ?)",
        (task, reminder)
    )

    conn.commit()
    task_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "id": task_id,
        "task": task,
        "reminder": reminder
    })
@app.route("/get_tasks", methods=["GET"])
def get_tasks():

    conn = sqlite3.connect("tasks.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM tasks")
    tasks = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return jsonify(tasks)
if  __name__ == "__main__":
     app.run(debug=True)
     
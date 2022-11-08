const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const port = process.env.PORT || 1338;
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log("Server is running on port " + port + "...");
});

require("date-format-lite");

// get the client
const mysql = require("mysql2/promise");

async function serverConfig() {
  const db = mysql.createPool({
    host: process.env.HOST,
    user: process.env.MYSQL_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  });

  app.get("/data", async (req, res) => {
    try {
      const results = await Promise.all([
        db.query("SELECT * FROM gantt_tasks ORDER BY sortorder ASC"),
        db.query("SELECT * FROM gantt_links"),
      ]);
      const tasks = results[0][0],
        links = results[1][0];

      for (let i = 0; i < tasks.length; i++) {
        tasks[i].start_date = tasks[i].start_date.format(
          "YYYY-MM-DD hh:mm:ss"
        );
        tasks[i].open = true;
      }

      res.send({
        data: tasks,
        collections: { links: links },
      });
    } catch (error) {
      sendResponse(res, "error", null, error);
    }
  });

  // add a new task
  app.post("/data/task", async (req, res) => {
    const task = getTask(req.body);
    try {
      // find task with highest sortorders
      const result = await db.query(
        "SELECT MAX(sortorder) AS maxOrder FROM gantt_tasks"
      );
      // assign max sort order to new task
      const orderIndex = (result[0][0].maxOrder || 0) + 1;
      try {
        await db.query(
          "INSERT INTO gantt_tasks(text, start_date, duration," +
            "progress, parent, sortorder) VALUES (?,?,?,?,?,?)",
          [
            task.text,
            task.start_date,
            task.duration,
            task.progress,
            task.parent,
            orderIndex,
          ]
        );
        sendResponse(res, "inserted", result.insertId);
      } catch (error) {
        sendResponse(res, "error", null, error);
      }
    } catch (error) {
      sendResponse(res, "error", null, error);
    }
  });

  // update a task
  app.put("/data/task/:id", async (req, res) => {
    const sid = req.params.id,
      target = req.body.target,
      task = getTask(req.body);
    try {
      await Promise.all([
        db.query(
          "UPDATE gantt_tasks SET text = ?, start_date = ?," +
            "duration = ?, progress = ?, parent = ? WHERE id = ?",
          [
            task.text,
            task.start_date,
            task.duration,
            task.progress,
            task.parent,
            sid,
          ]
        ),
        updateOrder(sid, target),
      ]);
      sendResponse(res, "updated");
    } catch (error) {
      sendResponse(res, "error", null, error);
    }
  });

  async function updateOrder(taskId, target) {
    let nextTask = false;
    let targetOrder;

    if (target.startsWith("next:")) {
      target = target.substring("next:".length);
      nextTask = true;
    }

    try {
      const result = await db.query(
        "SELECT * FROM gantt_tasks WHERE id = ?",
        [target]
      );
      if (!result[0][0]) return;
      targetOrder = result[0][0].sortorder;
      if (nextTask) targetOrder++;
      try {
        await db.query(
          "UPDATE gantt_tasks SET sortorder" +
            " = sortorder + 1 WHERE sortorder >= ?",
          [targetOrder]
        );
        return db.query(
          "UPDATE gantt_tasks SET sortorder = ? WHERE id = ?",
          [targetOrder, taskId]
        );
      } catch (error) {}
    } catch (error) {}
  }

  // delete a task
  app.delete("/data/task/:id", async (req, res) => {
    const sid = req.params.id;
    try {
      await db.query("DELETE FROM gantt_tasks WHERE id = ?", [sid]);
      sendResponse(res, "deleted");
    } catch (error) {
      sendResponse(res, "error", null, error);
    }
  });

  // add a link
  app.post("/data/link", async (req, res) => {
    const link = getLink(req.body);
    try {
      await db.query(
        "INSERT INTO gantt_links(source, target, type) VALUES (?,?,?)",
        [link.source, link.target, link.type]
      );
      sendResponse(res, "linked", result.insertId);
    } catch (error) {
      sendResponse(res, "error", null, error);
    }
  });

  // delete a link
  app.delete("/data/link/:id", async (req, res) => {
    const sid = req.params.id;
    try {
      await db.query("DELETE FROM gantt_links WHERE id = ?", [sid]);
      sendResponse(res, "deleted");
    } catch (error) {
      sendResponse(res, "error", null, error);
    }
  });

  function getTask(data) {
    return {
      text: data.text,
      start_date: data.start_date.date("YYYY-MM-DD"),
      duration: data.duration,
      progress: data.progress || 0,
      parent: data.parent,
    };
  }

  function getLink(data) {
    return {
      source: data.source,
      target: data.target,
      type: data.type,
    };
  }

  function sendResponse(res, action, requestId, error) {
    if (action == "error") console.log(error);

    const result = {
      success: action === "error" ? false : true,
    };
    if (requestId) result.requestId = requestId;

    res.send(result);
    return;
  }
}

serverConfig();

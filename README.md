# Setup guide

Install the dependencies by running the following command:

```
npm install
```

In the server.js file, the Express server uses the MySQL2 library to connect to MySQL and run queries.

The serverСonfig function runs when the server is started. It connects to the MySQL database. It also has some helper functions that are used for CRUD operations.
The index.html file in the public folder contains the HTML, CSS, and JavaScript for our DHTMLX Gantt chart. We load the DHTMLX Gantt chart JavaScript and CSS from a CDN and initialize the Gantt chart with the init method.

Run the local dev server using npm start. You’ll see a basic empty Gantt chart.

## Create a .env
Now create a .env file in the root folder and add the following lines for connecting to the MySQL database that we’ll create:

HOST=localhost
PORT=1338
MYSQL_USER=root
PASSWORD=password
DATABASE=dhtmlx

Don’t forget to add the root password for your MySQL server.


## Setup MySQL

Setting up a MySQL database locally

Now let’s set up a MySQL database locally.

We’ll install MySQL Server and MySQL Workbench. MySQL Workbench is a MySQL GUI that we’ll use to create a database with tables for the Gantt data and to run queries. Download MySQL Server and MySQL Workbench from the MySQL community downloads page. If you’re using Windows, you can use the MySQL Installer to download the MySQL products. Use the default configurations when configuring MySQL Server and Workbench. Make sure that you configure the MySQL Server to start at system startup for convenience.

Open the MySQL Workbench desktop application. Open the local instance of the MySQL Server that you configured.

### MySQL Workbench home page

We’ll write our MySQL queries in the query tab and execute the queries by pressing the yellow lightning bolt button.

Creating a MySQL database for the DHTMLX data: Adding tables and adding example data

Let’s run some MySQL queries in MySQL Workbench to create, use, and populate a database for our DHTMLX Gantt. Execute the following query to create a database called dhtmlx:

```sql
CREATE DATABASE dhtmlx;
```

Run the following query so that we set our newly created database for use:

```sql
USE dhtmlx;
```

Let’s create the two tables that we’ll need for our DHTMLX Gantt chart data: gantt_tasks and gantt_links:

```sql
CREATE TABLE `gantt_tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `text` varchar(255) NOT NULL,
  `start_date` datetime NOT NULL,
  `duration` int(11) NOT NULL,
  `progress` float NOT NULL,
  `parent` int(11) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `gantt_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `source` int(11) NOT NULL,
  `target` int(11) NOT NULL,
  `type` varchar(1) NOT NULL,
  PRIMARY KEY (`id`)
);
```

Now add some example tasks data to the gantt_tasks table:

```sql
INSERT INTO `gantt_tasks` VALUES ('1', 'Project #1', '2022-11-01 00:00:00',
  '5', '0.8', '0');
INSERT INTO `gantt_tasks` VALUES ('2', 'Task #1', '2022-11-06 00:00:00',
  '4', '0.5', '1');
INSERT INTO `gantt_tasks` VALUES ('3', 'Task #2', '2022-11-05 00:00:00',
  '6', '0.7', '1');
INSERT INTO `gantt_tasks` VALUES ('4', 'Task #3', '2022-11-07 00:00:00',
  '2', '0', '1');
INSERT INTO `gantt_tasks` VALUES ('5', 'Task #1.1', '2022-01-05 00:00:00',
  '5', '0.34', '2');
INSERT INTO `gantt_tasks` VALUES ('6', 'Task #1.2', '2022-11-11 13:22:17',
  '4', '0.5', '2');
INSERT INTO `gantt_tasks` VALUES ('7', 'Task #2.1', '2022-11-07 00:00:00',
  '5', '0.2', '3');
INSERT INTO `gantt_tasks` VALUES ('8', 'Task #2.2', '2022-11-06 00:00:00',
  '4', '0.9', '3');
```
You’ll be able to view the example tasks data by running the following query:
```sql
SELECT * FROM gantt_tasks;
```
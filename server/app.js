const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const cors = require('cors');
const pgSession = require('connect-pg-simple')(session);
const router = express.Router();

const app = express();
const port = 3000;

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'taskmanager',
  password: '123Walter123',
  port: 5432,
});

app.use(bodyParser.json());
app.use(cors({
  origin: 'https://localhost', // Allow requests only from http://localhost
  credentials: true, // Allow credentials
}));
app.use(session({
  store: new pgSession({
      pool: pool,
      tableName: 'sessions'
  }),
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
      secure: false, // Set to true in production for HTTPS
      maxAge: 3600000, // 1 hour (adjust as needed)
  }
}));
app.use(router);


pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Error connecting to PostgreSQL database', err));

// User registration endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert the user into the database
  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if(userCheck.rows.length>0)
    {
       return res.status(400).json({ message: 'Username is taken'});
    }
    const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *', [username, hashedPassword]);
    res.json({ message: 'User registered successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'An error occurred while registering the user' });
  }
});

// User login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Retrieve the user from the database based on the username
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Set user ID in the session
    req.session.user = {
      id: user.user_id, // Assuming the user ID is stored in the 'id' field in the database
      username: user.username
    };
    res.json({ message: 'Login successful', user: user });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'An error occurred while logging in' });
  }
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logout successful' });
});

// Add task endpoint
app.post('/add-task', async (req, res) => {
  const { task_name, task_date } = req.body; // Extract task_name and task_date from the request body
  const user_id = req.session.user.id; // Assuming you have user authentication and user_id is stored in the session
  try {
    // Insert the task into the database
    const result = await pool.query('INSERT INTO tasks (task_name, user_id, task_date, completed) VALUES ($1, $2, $3, $4) RETURNING *', [task_name, user_id, task_date, false]);
    res.json({ message: 'Task added successfully', task: result.rows[0] });
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ message: 'An error occurred while adding the task' });
  }
});

app.delete('/remove-task/:taskId', async (req, res) => {
  const taskId = req.params.taskId; // Extract taskId from the request parameters
  try {
    // Delete the task from the database
    const result = await pool.query('DELETE FROM tasks WHERE task_id = $1', [taskId]);

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Task not found' });
    } else {
      res.json({ message: 'Task removed successfully' });
    }
  } catch (error) {
    console.error('Error removing task:', error);
    res.status(500).json({ message: 'An error occurred while removing the task' });
  }
});

// Retrieve all tasks for a specific user endpoint
app.get('/all-tasks', async (req, res) => {
  try {
  if(!req.session.user)
  {
    res.status(401).json('Anothorized Access');
  }
  else
  {
    const userId = req.session.user.id; // Assuming the user ID is stored in the session
  
    // Retrieve all tasks associated with the specific user from the database
    const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1', [userId]);

    // Transform the data before sending it in the response
    const tasks = result.rows.map(task => {
      return {
        description: task.task_name, // Rename task_name to taskDescription
        dueDate: task.task_date,         // Keep task_date as dueDate
        id : task.task_id,
        completed : task.completed,
      };
    });

    // Send the transformed data as a response
    res.json(tasks);
  }
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({ message: 'An error occurred while fetching user tasks' });
  }
});

app.put('/update-task/:id', async (req, res) => {
  try {
    if (!req.session.user) {
      res.status(401).json('Unauthorized Access');
    } else {
      const userId = req.session.user.id; 
      const taskId = req.params.id; 
      const { completed }  = req.body; 

      const result = await pool.query(
        `UPDATE tasks SET  
          completed = $1
        WHERE 
          task_id = $2 AND user_id = $3
        RETURNING *`,
        [ completed, taskId, userId]
      );

      if (result.rowCount === 0) {
        res.status(404).json({ message: 'Task not found or unauthorized' });
      } else {
        const updatedTask = result.rows[0];
        const task = {
          description: updatedTask.task_name,
          dueDate: updatedTask.task_date,  
          id: updatedTask.task_id,
          completed: updatedTask.completed,
        };
        res.json(task);
      }
    }
  }
   catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({ message: 'An error occurred while fetching user tasks' });
  }
});

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(3000, () => {
  console.log('Server running on https://localhost:3000');
});
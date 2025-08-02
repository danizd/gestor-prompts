import { Router } from 'express';
import { db } from '../database/database.js';

const router = Router();

// Validation middleware
const validateTasks = (req, res, next) => {
  const { tasks } = req.body;
  
  if (!Array.isArray(tasks)) {
    return res.status(400).json({
      error: 'Invalid data format',
      message: 'Tasks must be an array'
    });
  }
  
  // Validate each task
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (!task.tarea || typeof task.tarea !== 'string') {
      return res.status(400).json({
        error: 'Invalid task data',
        message: `Task at index ${i} must have a valid 'tarea' field`
      });
    }
  }
  
  next();
};

const validateSingleTask = (req, res, next) => {
  const { tarea } = req.body;

  if (!tarea || typeof tarea !== 'string') {
    return res.status(400).json({
      error: 'Invalid data',
      message: 'A valid "tarea" field is required.'
    });
  }

  next();
};

// Get all tasks
router.get('/', async (req, res, next) => {
  try {
    const tasks = await db.all('SELECT * FROM tareas ORDER BY id ASC');
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Save/Update all tasks (replace all existing tasks)
router.put('/', validateTasks, async (req, res, next) => {
  try {
    const { tasks } = req.body;
    
    // Start a transaction
    await db.run('BEGIN TRANSACTION');
    
    try {
      // Clear existing tasks
      await db.run('DELETE FROM tareas');
      
      // Insert new tasks
      const insertPromises = tasks.map((task, index) => {
        return db.run(
          'INSERT INTO tareas (tarea, recurso) VALUES (?, ?)',
          [task.tarea || '', task.recurso || '']
        );
      });
      
      await Promise.all(insertPromises);
      
      // Commit the transaction
      await db.run('COMMIT');
      
      // Fetch the updated tasks
      const updatedTasks = await db.all('SELECT * FROM tareas ORDER BY id ASC');
      
      res.json({
        message: 'Tasks saved successfully',
        tasks: updatedTasks
      });
      
    } catch (error) {
      // Rollback on error
      await db.run('ROLLBACK');
      throw error; // Re-throw to be caught by the outer catch block
    }
    
  } catch (error) {
    next(error);
  }
});

// Get a single task by ID
router.get('/:id', async (req, res, next) => {
  try {
    const task = await db.get('SELECT * FROM tareas WHERE id = ?', [req.params.id]);
    
    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found',
        message: 'The requested task does not exist'
      });
    }
    
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// --- Destructive Endpoint Disabled for Safety ---
// The following endpoint is capable of deleting all records from a table.
// It has been commented out to prevent accidental data loss.
// To re-enable, ensure proper authentication and authorization checks are implemented.
/*
router.delete('/clear', async (req, res, next) => {
    try {
        await db.run('DELETE FROM tareas');
        res.json({ message: 'Todas las tareas han sido eliminadas', count: 0 });
    } catch (error) {
        next(error);
    }
});
*/

// Delete a task
router.delete('/:id', async (req, res, next) => {
  try {
    // Check if task exists
    const existingTask = await db.get('SELECT id FROM tareas WHERE id = ?', [req.params.id]);
    if (!existingTask) {
      return res.status(404).json({ 
        error: 'Task not found',
        message: 'The requested task does not exist'
      });
    }
    
    await db.run('DELETE FROM tareas WHERE id = ?', [req.params.id]);
    
    res.status(204).send();
    
  } catch (error) {
    next(error);
  }
});

// Update a single task
router.put('/:id', validateSingleTask, async (req, res, next) => {
  try {
    const { tarea, recurso } = req.body;
    
    // Check if task exists
    const existingTask = await db.get('SELECT id FROM tareas WHERE id = ?', [req.params.id]);
    if (!existingTask) {
      return res.status(404).json({ 
        error: 'Task not found',
        message: 'The requested task does not exist'
      });
    }
    
    await db.run(
      'UPDATE tareas SET tarea = ?, recurso = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?',
      [tarea, recurso || '', req.params.id]
    );
    
    const updatedTask = await db.get('SELECT * FROM tareas WHERE id = ?', [req.params.id]);
    res.json(updatedTask);
    
  } catch (error) {
    next(error);
  }
});

export default router;

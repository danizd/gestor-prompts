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

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await db.all('SELECT * FROM tareas ORDER BY id ASC');
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch tasks'
    });
  }
});

// Save/Update all tasks (replace all existing tasks)
router.post('/', validateTasks, async (req, res) => {
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
      throw error;
    }
    
  } catch (error) {
    console.error('Error saving tasks:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to save tasks'
    });
  }
});

// Get a single task by ID
router.get('/:id', async (req, res) => {
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
    console.error('Error fetching task:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch task'
    });
  }
});

// Delete all tareas (clear database)
router.delete('/clear', async (req, res) => {
    try {
        await db.run('DELETE FROM tareas');
        res.json({ message: 'Todas las tareas han sido eliminadas', count: 0 });
    } catch (error) {
        console.error('Error clearing tareas:', error);
        res.status(500).json({ error: 'Error al eliminar todas las tareas' });
    }
});

// Delete a task
router.delete('/:id', async (req, res) => {
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
    
    res.json({ 
      message: 'Task deleted successfully',
      id: req.params.id
    });
    
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete task'
    });
  }
});

// Update a single task
router.put('/:id', async (req, res) => {
  try {
    const { tarea, recurso } = req.body;
    
    if (!tarea || typeof tarea !== 'string') {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'Task must have a valid "tarea" field'
      });
    }
    
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
    console.error('Error updating task:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update task'
    });
  }
});

export default router;

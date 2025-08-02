import { Router } from 'express';
import { db } from '../database/database.js';

const router = Router();

// Validation middleware
const validatePrompt = (req, res, next) => {
  const { titulo, texto, categoria } = req.body;
  
  if (!titulo || !texto) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: 'Both "titulo" and "texto" are required fields.'
    });
  }
  
  if (typeof titulo !== 'string' || typeof texto !== 'string' || 
      (categoria && typeof categoria !== 'string')) {
    return res.status(400).json({
      error: 'Invalid data types',
      details: 'All fields must be strings.'
    });
  }
  
  next();
};

// Get all prompts
router.get('/', async (req, res, next) => {
  try {
    const prompts = await db.all('SELECT * FROM prompts ORDER BY creado_en DESC');
    res.json(prompts);
  } catch (error) {
    next(error);
  }
});

// Get a single prompt by ID
router.get('/:id', async (req, res, next) => {
  try {
    const prompt = await db.get('SELECT * FROM prompts WHERE id = ?', [req.params.id]);
    
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    res.json(prompt);
  } catch (error) {
    next(error);
  }
});

// Create a new prompt
router.post('/', validatePrompt, async (req, res, next) => {
  try {
    const { titulo, texto, categoria } = req.body;
    
    const result = await db.run(
      'INSERT INTO prompts (titulo, texto, categoria) VALUES (?, ?, ?)',
      [titulo, texto, categoria || null]
    );
    
    if (!result || typeof result.lastID !== 'number') {
      throw new Error('Failed to create the prompt or retrieve the new ID.');
    }
    
    const newPrompt = await db.get('SELECT * FROM prompts WHERE id = ?', [result.lastID]);
    
    if (!newPrompt) {
      throw new Error('Failed to fetch the newly created prompt.');
    }
    
    res.status(201).json(newPrompt);
  } catch (error) {
    next(error);
  }
});

// Update an existing prompt
router.put('/:id', validatePrompt, async (req, res, next) => {
  try {
    const { titulo, texto, categoria } = req.body;
    const { id } = req.params;
    
    const result = await db.run(
      'UPDATE prompts SET titulo = ?, texto = ?, categoria = ? WHERE id = ?',
      [titulo, texto, categoria || null, id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    const updatedPrompt = await db.get('SELECT * FROM prompts WHERE id = ?', [id]);
    res.json(updatedPrompt);
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
    await db.run('DELETE FROM prompts');
    res.json({ message: 'Todos los prompts han sido eliminados', count: 0 });
  } catch (error) {
    next(error);
  }
});
*/

// Delete a prompt
router.delete('/:id', async (req, res, next) => {
  try {
    // Check if prompt exists
    const existingPrompt = await db.get('SELECT id FROM prompts WHERE id = ?', [req.params.id]);
    if (!existingPrompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    await db.run('DELETE FROM prompts WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

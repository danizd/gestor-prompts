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
    
    // Insert the new prompt and get the result
    const result = await db.run(
      'INSERT INTO prompts (titulo, texto, categoria) VALUES (?, ?, ?)',
      [titulo, texto, categoria || null]
    );
    
    // Check if we have a lastID from the result
    let insertId;
    if (result && result.lastID) {
      insertId = result.lastID;
    } else {
      // Fallback: get the last inserted row ID
      const lastIdResult = await db.get('SELECT last_insert_rowid() as lastID');
      insertId = lastIdResult ? lastIdResult.lastID : null;
    }
    
    if (!insertId) {
      throw new Error('Failed to retrieve the ID of the inserted prompt');
    }
    
    // Fetch the complete new prompt
    const newPrompt = await db.get('SELECT * FROM prompts WHERE id = ?', [insertId]);
    
    if (!newPrompt) {
      throw new Error('Failed to fetch the newly created prompt');
    }
    
    res.status(201).json(newPrompt);
  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Update an existing prompt
router.put('/:id', validatePrompt, async (req, res, next) => {
  try {
    const { titulo, texto, categoria } = req.body;
    
    // Check if prompt exists
    const existingPrompt = await db.get('SELECT id FROM prompts WHERE id = ?', [req.params.id]);
    if (!existingPrompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    await db.run(
      'UPDATE prompts SET titulo = ?, texto = ?, categoria = ? WHERE id = ?',
      [titulo, texto, categoria || null, req.params.id]
    );
    
    const updatedPrompt = await db.get('SELECT * FROM prompts WHERE id = ?', [req.params.id]);
    res.json(updatedPrompt);
  } catch (error) {
    next(error);
  }
});

// Delete all prompts (clear database)
router.delete('/clear', async (req, res) => {
  try {
    await db.run('DELETE FROM prompts');
    res.json({ message: 'Todos los prompts han sido eliminados', count: 0 });
  } catch (error) {
    console.error('Error clearing prompts:', error);
    res.status(500).json({ error: 'Error al eliminar todos los prompts' });
  }
});

let totalPrompts = 0;
router.get('/', async (req, res) => {
  try {
    const prompts = await db.all('SELECT * FROM prompts ORDER BY creado_en DESC');
    totalPrompts = prompts.length;
    res.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Error al obtener los prompts' });
  }
});


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

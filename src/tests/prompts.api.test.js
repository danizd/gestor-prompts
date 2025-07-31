import { test } from 'node:test';
import assert from 'node:assert';
import { db } from '../database/database.js';
import app from '../server.js';
import supertest from 'supertest';

const request = supertest(app);

// Test data
const testPrompt = {
  titulo: 'Test Prompt',
  texto: 'This is a test prompt',
  categoria: 'test'
};

let createdPromptId;

test.beforeEach(async () => {
  // Clear the database before each test
  await db.run('DELETE FROM prompts');
});

test.after(async () => {
  // Close the database connection after all tests
  await db.close();
});

test('GET /api/prompts - should return empty array when no prompts', async (t) => {
  const response = await request.get('/api/prompts');
  
  assert.strictEqual(response.status, 200);
  assert(Array.isArray(response.body));
  assert.strictEqual(response.body.length, 0);
});

test('POST /api/prompts - should create a new prompt', async (t) => {
  const response = await request
    .post('/api/prompts')
    .send(testPrompt);
  
  assert.strictEqual(response.status, 201);
  assert.strictEqual(response.body.titulo, testPrompt.titulo);
  assert.strictEqual(response.body.texto, testPrompt.texto);
  assert.strictEqual(response.body.categoria, testPrompt.categoria);
  assert(response.body.id);
  
  // Save the created prompt ID for subsequent tests
  createdPromptId = response.body.id;
});

test('POST /api/prompts - should return 400 for invalid data', async (t) => {
  const response = await request
    .post('/api/prompts')
    .send({}); // Missing required fields
  
  assert.strictEqual(response.status, 400);
  assert.strictEqual(response.body.error, 'Missing required fields');
});

test('GET /api/prompts/:id - should retrieve a specific prompt', async (t) => {
  // First create a prompt
  const createResponse = await request
    .post('/api/prompts')
    .send(testPrompt);
  
  const promptId = createResponse.body.id;
  
  // Then retrieve it
  const response = await request.get(`/api/prompts/${promptId}`);
  
  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body.id, promptId);
  assert.strictEqual(response.body.titulo, testPrompt.titulo);
});

test('GET /api/prompts/:id - should return 404 for non-existent prompt', async (t) => {
  const response = await request.get('/api/prompts/999999');
  assert.strictEqual(response.status, 404);
});

test('PUT /api/prompts/:id - should update an existing prompt', async (t) => {
  // First create a prompt
  const createResponse = await request
    .post('/api/prompts')
    .send(testPrompt);
  
  const promptId = createResponse.body.id;
  
  // Then update it
  const updatedData = {
    titulo: 'Updated Title',
    texto: 'Updated content',
    categoria: 'updated'
  };
  
  const response = await request
    .put(`/api/prompts/${promptId}`)
    .send(updatedData);
  
  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body.titulo, updatedData.titulo);
  assert.strictEqual(response.body.texto, updatedData.texto);
  assert.strictEqual(response.body.categoria, updatedData.categoria);
});

test('DELETE /api/prompts/:id - should delete a prompt', async (t) => {
  // First create a prompt
  const createResponse = await request
    .post('/api/prompts')
    .send(testPrompt);
  
  const promptId = createResponse.body.id;
  
  // Then delete it
  const deleteResponse = await request.delete(`/api/prompts/${promptId}`);
  assert.strictEqual(deleteResponse.status, 204);
  
  // Verify it's gone
  const getResponse = await request.get(`/api/prompts/${promptId}`);
  assert.strictEqual(getResponse.status, 404);
});

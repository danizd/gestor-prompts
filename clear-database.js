import { db } from './src/database/database.js';

async function clearDatabase() {
    try {
        console.log('🗑️  Iniciando limpieza de la base de datos...');
        
        // Clear prompts table
        const promptsResult = await db.run('DELETE FROM prompts');
        console.log(`✅ Eliminados ${promptsResult.changes || 0} prompts`);
        
        // Clear tareas table
        const tareasResult = await db.run('DELETE FROM tareas');
        console.log(`✅ Eliminadas ${tareasResult.changes || 0} tareas`);
        
        // Reset auto-increment counters
        await db.run('DELETE FROM sqlite_sequence WHERE name IN ("prompts", "tareas")');
        console.log('✅ Contadores de ID reiniciados');
        
        console.log('🎉 Base de datos limpiada exitosamente!');
        
    } catch (error) {
        console.error('❌ Error al limpiar la base de datos:', error);
        process.exit(1);
    }
}

// Run the script
clearDatabase();

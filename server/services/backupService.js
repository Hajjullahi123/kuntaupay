const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, '../prisma/dev.db');
const BACKUP_DIR = path.join(__dirname, '../backups');

const createBackup = async (label = 'auto') => {
    try {
        const isPostgreSQL = process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith('postgres://') || process.env.DATABASE_URL.startsWith('postgresql://'));
        if (isPostgreSQL) {
            console.log('[BACKUP] PostgreSQL is active. Direct file backup is managed by the database provider (e.g. Render).');
            return { success: true, name: 'externally_managed' };
        }

        if (!fs.existsSync(BACKUP_DIR)) {
            await fsPromises.mkdir(BACKUP_DIR, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `backup_${label}_${timestamp}.db`;
        const backupPath = path.join(BACKUP_DIR, backupName);

        // Async copy to prevent event loop blocking
        await fsPromises.copyFile(DB_PATH, backupPath);
        console.log(`[BACKUP] Snapshot created: ${backupName}`);
        
        // Clean up redundant backups (keep last 30)
        const files = await fsPromises.readdir(BACKUP_DIR);
        const backups = await Promise.all(
            files.filter(f => f.endsWith('.db'))
            .map(async f => ({ 
                name: f, 
                time: (await fsPromises.stat(path.join(BACKUP_DIR, f))).mtime 
            }))
        );
        
        backups.sort((a, b) => b.time - a.time);

        if (backups.length > 30) {
            for (const b of backups.slice(30)) {
                await fsPromises.unlink(path.join(BACKUP_DIR, b.name));
                console.log(`[BACKUP] Retiring legacy snapshot: ${b.name}`);
            }
        }

        return { success: true, name: backupName };
    } catch (error) {
        console.error('[BACKUP ERROR]', error);
        return { success: false, error: error.message };
    }
};

const listBackups = () => {
    const isPostgreSQL = process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith('postgres://') || process.env.DATABASE_URL.startsWith('postgresql://'));
    if (isPostgreSQL) return [];

    if (!fs.existsSync(BACKUP_DIR)) return [];
    return fs.readdirSync(BACKUP_DIR)
        .filter(f => f.endsWith('.db'))
        .map(f => ({
            name: f,
            size: fs.statSync(path.join(BACKUP_DIR, f)).size,
            createdAt: fs.statSync(path.join(BACKUP_DIR, f)).mtime
        }))
        .sort((a, b) => b.createdAt - a.createdAt);
};

const restoreBackup = async (backupName) => {
    try {
        const isPostgreSQL = process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith('postgres://') || process.env.DATABASE_URL.startsWith('postgresql://'));
        if (isPostgreSQL) {
            return { success: false, error: 'Database restore is not supported directly for PostgreSQL. Backups must be restored via the database provider (e.g. Render).' };
        }

        const backupPath = path.join(BACKUP_DIR, backupName);
        if (!fs.existsSync(backupPath)) throw new Error('Backup file not found');

        // Snapshot current state before restore
        await createBackup('pre_restore');

        await fsPromises.copyFile(backupPath, DB_PATH);
        console.log(`[BACKUP] System restored to: ${backupName}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = { createBackup, listBackups, restoreBackup };

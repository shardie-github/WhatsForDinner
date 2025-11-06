#!/usr/bin/env node

/**
 * Backup Script
 * Automated backup system for database, files, and code
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BackupManager {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.backupDir = path.join(this.workspaceRoot, 'backups');
    this.config = this.loadConfig();
  }

  async runBackup(type = 'all') {
        
    try {
      await this.ensureBackupDirectory();
      
      switch (type) {
        case 'database':
          await this.backupDatabase();
          break;
        case 'files':
          await this.backupFiles();
          break;
        case 'code':
          await this.backupCode();
          break;
        case 'all':
          await this.backupDatabase();
          await this.backupFiles();
          await this.backupCode();
          break;
        default:
          throw new Error(`Unknown backup type: ${type}`);
      }
      
      await this.cleanupOldBackups();
          } catch (error) {
      console.error('❌ Backup failed:', error.message);
      process.exit(1);
    }
  }

  async backupDatabase() {
        
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `database-${timestamp}.sql`);
    
    try {
      // Create database backup
      const command = `pg_dump $DATABASE_URL > ${backupFile}`;
      execSync(command, { stdio: 'inherit' });
      
      // Compress if enabled
      if (this.config.database.compression) {
        execSync(`gzip ${backupFile}`);
              } else {
              }
    } catch (error) {
      console.error('   Database backup failed:', error.message);
      throw error;
    }
  }

  async backupFiles() {
        
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `files-${timestamp}.tar.gz`);
    
    try {
      // Create files backup
      const command = `tar -czf ${backupFile} -C ${this.workspaceRoot} uploads/ public/ config/`;
      execSync(command, { stdio: 'inherit' });
      
          } catch (error) {
      console.error('   Files backup failed:', error.message);
      throw error;
    }
  }

  async backupCode() {
        
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `code-${timestamp}.tar.gz`);
    
    try {
      // Create code backup (excluding node_modules, .git, etc.)
      const command = `tar -czf ${backupFile} -C ${this.workspaceRoot} --exclude=node_modules --exclude=.git --exclude=dist --exclude=build src/ packages/ apps/ scripts/`;
      execSync(command, { stdio: 'inherit' });
      
          } catch (error) {
      console.error('   Code backup failed:', error.message);
      throw error;
    }
  }

  async cleanupOldBackups() {
        
    const retentionDays = Math.max(
      this.config.database.retention,
      this.config.files.retention,
      this.config.code.retention
    );
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    const files = fs.readdirSync(this.backupDir);
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(this.backupDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }
    
      }

  async ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  loadConfig() {
    const configPath = path.join(this.workspaceRoot, 'config', 'backup.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    return {
      database: { compression: true, retention: 30 },
      files: { compression: true, retention: 7 },
      code: { compression: false, retention: 90 }
    };
  }
}

// Run backup
if (require.main === module) {
  const backupManager = new BackupManager();
  const type = process.argv[2] || 'all';
  backupManager.runBackup(type).catch(console.error);
}

module.exports = BackupManager;

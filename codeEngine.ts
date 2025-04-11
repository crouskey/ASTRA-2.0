// server/services/codeEngine.ts
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { logCodeChange, logEvent } from '../utils/supabase';
import { generateCodeSuggestion } from './openai';

// Promisify exec
const execAsync = promisify(exec);

// Temporary directory for code snapshots
const SNAPSHOTS_DIR = path.join(process.cwd(), 'storage', 'code_snapshots');

// Make sure the snapshots directory exists
if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

/**
 * Generate a code improvement suggestion
 */
export const suggestCodeImprovement = async (
  filePath: string,
  instruction: string,
  userId: string
): Promise<{
  originalCode: string;
  improvedCode: string;
  reasoning: string;
  diffText: string;
}> => {
  try {
    // Validate that the file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
    
    // Read the file content
    const originalCode = fs.readFileSync(filePath, 'utf-8');
    
    // Generate a code improvement suggestion
    const { newCode, reasoning } = await generateCodeSuggestion(
      filePath,
      originalCode,
      instruction
    );
    
    // Generate a diff
    const diffText = await generateDiff(originalCode, newCode);
    
    // Log the code change as 'proposed'
    await logCodeChange(
      filePath,
      diffText,
      reasoning,
      'proposed'
    );
    
    // Log the event
    await logEvent(
      'code_improvement',
      `Generated code improvement suggestion for ${path.basename(filePath)}`,
      undefined,
      'code_change',
      ['ai-generated', 'code-suggestion']
    );
    
    return {
      originalCode,
      improvedCode: newCode,
      reasoning,
      diffText,
    };
  } catch (error) {
    console.error('Error suggesting code improvement:', error);
    throw error;
  }
};

/**
 * Apply a code improvement
 */
export const applyCodeImprovement = async (
  filePath: string,
  newCode: string,
  reasoning: string,
  userId: string
): Promise<{
  success: boolean;
  message: string;
  backupPath?: string;
}> => {
  try {
    // Validate that the file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
    
    // Create a backup of the file
    const backupId = uuidv4();
    const fileName = path.basename(filePath);
    const backupPath = path.join(SNAPSHOTS_DIR, `${fileName}.${backupId}.bak`);
    
    // Read the original code
    const originalCode = fs.readFileSync(filePath, 'utf-8');
    
    // Create the backup
    fs.writeFileSync(backupPath, originalCode);
    
    // Generate a diff for logging
    const diffText = await generateDiff(originalCode, newCode);
    
    try {
      // Write the new code to the file
      fs.writeFileSync(filePath, newCode);
      
      // Test the changes
      const testResult = await testCodeChanges(filePath);
      
      if (testResult.success) {
        // If successful, log the code change as 'applied'
        await logCodeChange(
          filePath,
          diffText,
          reasoning,
          'applied'
        );
        
        // Log the event
        await logEvent(
          'code_improvement',
          `Applied code improvement to ${path.basename(filePath)}: ${testResult.message}`,
          undefined,
          'code_change',
          ['applied', 'successful']
        );
        
        // Commit the changes to Git if needed
        await commitChangesToGit(filePath, reasoning);
        
        return {
          success: true,
          message: `Code improvement applied successfully: ${testResult.message}`,
          backupPath,
        };
      } else {
        // If the test fails, revert the changes
        fs.writeFileSync(filePath, originalCode);
        
        // Log the code change as 'reverted'
        await logCodeChange(
          filePath,
          diffText,
          `${reasoning}\n\nReverted due to test failure: ${testResult.message}`,
          'reverted'
        );
        
        // Log the event
        await logEvent(
          'code_improvement',
          `Reverted code improvement to ${path.basename(filePath)} due to test failure: ${testResult.message}`,
          undefined,
          'code_change',
          ['reverted', 'test-failure']
        );
        
        return {
          success: false,
          message: `Code improvement failed testing and was reverted: ${testResult.message}`,
          backupPath,
        };
      }
    } catch (error) {
      // If there's an error during the process, revert the changes
      if (fs.existsSync(backupPath)) {
        const backupContent = fs.readFileSync(backupPath, 'utf-8');
        fs.writeFileSync(filePath, backupContent);
      }
      
      // Log the code change as 'reverted'
      await logCodeChange(
        filePath,
        diffText,
        `${reasoning}\n\nReverted due to error: ${error.message}`,
        'reverted'
      );
      
      // Log the event
      await logEvent(
        'code_improvement',
        `Error applying code improvement to ${path.basename(filePath)}: ${error.message}`,
        undefined,
        'code_change',
        ['error', 'reverted']
      );
      
      throw error;
    }
  } catch (error) {
    console.error('Error applying code improvement:', error);
    throw error;
  }
};

/**
 * Reject a code improvement without applying it
 */
export const rejectCodeImprovement = async (
  filePath: string,
  diffText: string,
  reasoning: string,
  userId: string,
  rejectionReason: string
): Promise<void> => {
  try {
    // Log the code change as 'rejected'
    await logCodeChange(
      filePath,
      diffText,
      `${reasoning}\n\nRejected by user: ${rejectionReason}`,
      'rejected'
    );
    
    // Log the event
    await logEvent(
      'code_improvement',
      `User rejected code improvement for ${path.basename(filePath)}: ${rejectionReason}`,
      undefined,
      'code_change',
      ['rejected', 'user-decision']
    );
  } catch (error) {
    console.error('Error rejecting code improvement:', error);
    throw error;
  }
};

/**
 * Roll back to a previous code snapshot
 */
export const rollbackCodeChange = async (
  filePath: string,
  backupPath: string,
  userId: string,
  reason: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // Validate that the files exist
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file does not exist: ${backupPath}`);
    }
    
    // Read the current code and backup
    const currentCode = fs.readFileSync(filePath, 'utf-8');
    const backupCode = fs.readFileSync(backupPath, 'utf-8');
    
    // Generate a diff (showing what will be undone)
    const diffText = await generateDiff(currentCode, backupCode);
    
    // Write the backup to the original file
    fs.writeFileSync(filePath, backupCode);
    
    // Log the rollback
    await logCodeChange(
      filePath,
      diffText,
      `Manual rollback: ${reason}`,
      'reverted'
    );
    
    // Log the event
    await logEvent(
      'code_improvement',
      `Rolled back code changes for ${path.basename(filePath)}: ${reason}`,
      undefined,
      'code_change',
      ['rollback', 'user-initiated']
    );
    
    return {
      success: true,
      message: `Successfully rolled back changes to ${path.basename(filePath)}`,
    };
  } catch (error) {
    console.error('Error rolling back code change:', error);
    throw error;
  }
};

/**
 * Test code changes to ensure they don't break anything
 * This is a simple implementation and would be more complex in a real system
 */
const testCodeChanges = async (
  filePath: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    
    // Different test strategies based on file type
    switch (ext) {
      case '.js':
      case '.ts':
        // For JavaScript/TypeScript files, try to import or run them
        const result = await execAsync(`node --check ${filePath}`);
        return {
          success: true,
          message: 'Code syntax check passed',
        };
        
      case '.json':
        // For JSON files, validate the JSON syntax
        const content = fs.readFileSync(filePath, 'utf-8');
        JSON.parse(content); // Will throw if invalid
        return {
          success: true,
          message: 'Valid JSON format',
        };
        
      default:
        // For other file types, just check if the file exists
        return {
          success: true,
          message: 'File exists and is readable',
        };
    }
  } catch (error) {
    return {
      success: false,
      message: `Test failed: ${error.message}`,
    };
  }
};

/**
 * Generate a diff between two code strings
 */
const generateDiff = async (
  oldCode: string,
  newCode: string
): Promise<string> => {
  try {
    // Create temporary files
    const tempDir = path.join(SNAPSHOTS_DIR, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const oldFilePath = path.join(tempDir, `old_${uuidv4()}.txt`);
    const newFilePath = path.join(tempDir, `new_${uuidv4()}.txt`);
    
    // Write the code to the temp files
    fs.writeFileSync(oldFilePath, oldCode);
    fs.writeFileSync(newFilePath, newCode);
    
    // Generate diff using the diff command
    try {
      const { stdout } = await execAsync(`diff -u ${oldFilePath} ${newFilePath}`);
      
      // Clean up temporary files
      fs.unlinkSync(oldFilePath);
      fs.unlinkSync(newFilePath);
      
      return stdout;
    } catch (error) {
      // diff returns a non-zero exit code if files are different, which causes exec to throw
      // We actually want the output in this case
      
      // Clean up temporary files
      fs.unlinkSync(oldFilePath);
      fs.unlinkSync(newFilePath);
      
      if (error.stdout) {
        return error.stdout;
      } else {
        return `Unable to generate diff: ${error.message}`;
      }
    }
  } catch (error) {
    console.error('Error generating diff:', error);
    return `Error generating diff: ${error.message}`;
  }
};

/**
 * Commit changes to Git
 */
const commitChangesToGit = async (
  filePath: string,
  message: string
): Promise<void> => {
  try {
    // Check if this is a Git repository
    try {
      await execAsync('git status');
    } catch (error) {
      console.log('Not a Git repository, skipping commit');
      return;
    }
    
    // Add the file
    await execAsync(`git add ${filePath}`);
    
    // Create a commit message
    const commitMessage = `[Astra] ${message}`;
    
    // Commit the changes
    await execAsync(`git commit -m "${commitMessage}"`);
    
    console.log(`Changes committed to Git: ${path.basename(filePath)}`);
  } catch (error) {
    console.error('Error committing to Git:', error);
    // Don't throw, as this is not critical
  }
};

export default {
  suggestCodeImprovement,
  applyCodeImprovement,
  rejectCodeImprovement,
  rollbackCodeChange,
};

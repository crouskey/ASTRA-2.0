// pages/api/code/improve.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getCurrentUserId } from '../../../server/utils/supabase';
import { 
  suggestCodeImprovement, 
  applyCodeImprovement, 
  rejectCodeImprovement,
  rollbackCodeChange
} from '../../../server/services/codeEngine';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get the user ID from the session
    const userId = await getCurrentUserId();

    // Handle different types of requests
    switch (req.method) {
      case 'POST':
        // Generate a code improvement suggestion
        return handleSuggestImprovement(req, res, userId);
      
      case 'PUT':
        // Apply a code improvement
        return handleApplyImprovement(req, res, userId);
      
      case 'DELETE':
        // Reject a code improvement or rollback a change
        return handleRejectOrRollback(req, res, userId);
      
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in code engine API:', error);
    return res.status(500).json({ error: 'Failed to process code engine request' });
  }
}

/**
 * Handle POST request to suggest a code improvement
 */
async function handleSuggestImprovement(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  // Extract parameters from request body
  const { filePath, instruction } = req.body;

  // Validate parameters
  if (!filePath || !instruction) {
    return res.status(400).json({ error: 'File path and instruction are required' });
  }

  try {
    // Generate a code improvement suggestion
    const result = await suggestCodeImprovement(filePath, instruction, userId);

    // Return the result
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error suggesting code improvement:', error);
    return res.status(500).json({ error: 'Failed to suggest code improvement' });
  }
}

/**
 * Handle PUT request to apply a code improvement
 */
async function handleApplyImprovement(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  // Extract parameters from request body
  const { filePath, newCode, reasoning } = req.body;

  // Validate parameters
  if (!filePath || !newCode || !reasoning) {
    return res.status(400).json({ error: 'File path, new code, and reasoning are required' });
  }

  try {
    // Apply the code improvement
    const result = await applyCodeImprovement(filePath, newCode, reasoning, userId);

    // Return the result
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error applying code improvement:', error);
    return res.status(500).json({ error: 'Failed to apply code improvement' });
  }
}

/**
 * Handle DELETE request to reject a code improvement or rollback a change
 */
async function handleRejectOrRollback(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  // Determine the action based on query parameters
  const { action } = req.query;

  if (action === 'reject') {
    // Extract parameters for rejection
    const { filePath, diffText, reasoning, rejectionReason } = req.body;

    // Validate parameters
    if (!filePath || !diffText || !reasoning || !rejectionReason) {
      return res.status(400).json({ error: 'File path, diff text, reasoning, and rejection reason are required' });
    }

    try {
      // Reject the code improvement
      await rejectCodeImprovement(filePath, diffText, reasoning, userId, rejectionReason);

      // Return success
      return res.status(200).json({ success: true, message: 'Code improvement rejected' });
    } catch (error) {
      console.error('Error rejecting code improvement:', error);
      return res.status(500).json({ error: 'Failed to reject code improvement' });
    }
  } else if (action === 'rollback') {
    // Extract parameters for rollback
    const { filePath, backupPath, reason } = req.body;

    // Validate parameters
    if (!filePath || !backupPath || !reason) {
      return res.status(400).json({ error: 'File path, backup path, and reason are required' });
    }

    try {
      // Rollback the code change
      const result = await rollbackCodeChange(filePath, backupPath, userId, reason);

      // Return the result
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error rolling back code change:', error);
      return res.status(500).json({ error: 'Failed to roll back code change' });
    }
  } else {
    return res.status(400).json({ error: 'Invalid action specified' });
  }
}

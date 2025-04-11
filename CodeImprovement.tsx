// client/components/CodeImprovement.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CodeImprovementProps {
  filePath: string;
  originalCode: string;
  improvedCode: string;
  reasoning: string;
  diffText: string;
  onApply: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
}

const CodeImprovement: React.FC<CodeImprovementProps> = ({
  filePath,
  originalCode,
  improvedCode,
  reasoning,
  diffText,
  onApply,
  onReject,
}) => {
  const [viewMode, setViewMode] = useState<'diff' | 'side-by-side'>('diff');
  const [isApplying, setIsApplying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  // Parse the diff text to highlight changes
  const parsedDiff = React.useMemo(() => {
    try {
      const lines = diffText.split('\n');
      return lines.map((line, index) => {
        if (line.startsWith('+') && !line.startsWith('+++')) {
          return { type: 'addition', content: line.substring(1), line: index };
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          return { type: 'removal', content: line.substring(1), line: index };
        } else if (line.startsWith('@@')) {
          return { type: 'info', content: line, line: index };
        } else {
          return { type: 'normal', content: line, line: index };
        }
      });
    } catch (error) {
      console.error('Error parsing diff:', error);
      return [{ type: 'normal', content: diffText, line: 0 }];
    }
  }, [diffText]);

  // Handle apply button click
  const handleApply = async () => {
    try {
      setIsApplying(true);
      await onApply();
    } catch (error) {
      console.error('Error applying code improvement:', error);
    } finally {
      setIsApplying(false);
    }
  };

  // Handle reject button click
  const handleReject = async () => {
    if (!showRejectionInput) {
      setShowRejectionInput(true);
      return;
    }

    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setIsRejecting(true);
      await onReject(rejectionReason);
    } catch (error) {
      console.error('Error rejecting code improvement:', error);
    } finally {
      setIsRejecting(false);
      setShowRejectionInput(false);
    }
  };

  // Render diff view
  const renderDiffView = () => (
    <div className="bg-gray-800 text-white rounded-lg p-4 overflow-auto">
      <pre className="text-sm font-mono">
        {parsedDiff.map((line) => (
          <div
            key={line.line}
            className={`${
              line.type === 'addition'
                ? 'bg-green-800 bg-opacity-40'
                : line.type === 'removal'
                ? 'bg-red-800 bg-opacity-40'
                : line.type === 'info'
                ? 'bg-blue-800 bg-opacity-40'
                : ''
            }`}
          >
            {line.content}
          </div>
        ))}
      </pre>
    </div>
  );

  // Render side-by-side view
  const renderSideBySideView = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">Original Code</div>
        <div className="bg-gray-800 text-white rounded-lg p-4 h-96 overflow-auto">
          <pre className="text-sm font-mono">{originalCode}</pre>
        </div>
      </div>
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">Improved Code</div>
        <div className="bg-gray-800 text-white rounded-lg p-4 h-96 overflow-auto">
          <pre className="text-sm font-mono">{improvedCode}</pre>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Code Improvement Suggestion
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Astra has suggested an improvement for{' '}
          <span className="font-mono text-gray-700">{filePath}</span>
        </p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <div className="text-sm font-medium text-gray-700">Changes</div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setViewMode('diff')}
              className={`px-3 py-1 text-xs rounded-md ${
                viewMode === 'diff'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Diff
            </button>
            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1 text-xs rounded-md ${
                viewMode === 'side-by-side'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Side by Side
            </button>
          </div>
        </div>

        {viewMode === 'diff' ? renderDiffView() : renderSideBySideView()}
      </div>

      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-2">Reasoning</div>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-sm text-yellow-800">{reasoning}</p>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        {showRejectionInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <label
              htmlFor="rejection-reason"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reason for rejection
            </label>
            <textarea
              id="rejection-reason"
              rows={3}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please explain why you're rejecting this improvement..."
            ></textarea>
          </motion.div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleReject}
            disabled={isApplying || isRejecting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isRejecting ? (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : null}
            {showRejectionInput ? 'Confirm Rejection' : 'Reject'}
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isApplying || isRejecting || showRejectionInput}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isApplying ? (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : null}
            Apply Improvement
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeImprovement;

import React, { useState } from 'react';

interface ActionButtonsProps {
  onAction: (action: string) => void;
  disabledActions?: string[];
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAction,
  disabledActions = []
}) => {
  const [hintVisible, setHintVisible] = useState(false);
  
  const handleAction = (action: string) => {
    onAction(action);
  };
  
  const toggleHint = () => {
    setHintVisible(!hintVisible);
  };
  
  return (
    <div className="w-full max-w-4xl mt-4 flex justify-between items-start p-2 bg-gray-200 dark:bg-gray-700 rounded-lg shadow">
      <div className="space-x-2">
        <button
          className={`px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 ${
            disabledActions.includes('chow') ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={() => handleAction('chow')}
          disabled={disabledActions.includes('chow')}
        >
          Chow
        </button>
        <button
          className={`px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 ${
            disabledActions.includes('pung') ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={() => handleAction('pung')}
          disabled={disabledActions.includes('pung')}
        >
          Pung
        </button>
        <button
          className={`px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 ${
            disabledActions.includes('kong') ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={() => handleAction('kong')}
          disabled={disabledActions.includes('kong')}
        >
          Kong
        </button>
        <button
          className={`px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 ${
            disabledActions.includes('mahjong') ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={() => handleAction('mahjong')}
          disabled={disabledActions.includes('mahjong')}
        >
          Mahjong
        </button>
        <button
          className={`px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 ${
            disabledActions.includes('discard') ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={() => handleAction('discard')}
          disabled={disabledActions.includes('discard')}
        >
          Discard
        </button>
        <button
          className="px-3 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-600"
          onClick={toggleHint}
        >
          Hint?
        </button>
      </div>
      <div
        id="hint-area"
        className="text-sm text-right text-gray-700 dark:text-gray-200 w-1/3"
      >
        {hintVisible ? (
          <span className="hint-ok font-semibold">
            Hint: Select a tile to discard.
          </span>
        ) : (
          'Select a tile to discard.'
        )}
      </div>
    </div>
  );
};

export default ActionButtons;

import { useState } from 'react';
import { Upload, Search, X } from 'lucide-react';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import Alert from '../common/Alert.jsx';
import ProgressBar from '../common/ProgressBar.jsx';
import { searchUsers } from '../../api/users.js';
import { useFileTransfer } from '../../hooks/useFileTransfer.js';
import { validateFileSize } from '../../utils/fileHelpers.js';
import { MAX_FILE_SIZE, formatFileSize, EXPIRATION_OPTIONS } from '../../utils/constants.js';

const SendFile = ({ onSuccess }) => {
  const { sendFile, sending, progress } = useFileTransfer();
  
  const [file, setFile] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState('');
  const [expiresIn, setExpiresIn] = useState(7);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      try {
        validateFileSize(selectedFile);
        setFile(selectedFile);
        setError('');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      try {
        validateFileSize(droppedFile);
        setFile(droppedFile);
        setError('');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  //handle select file button click
  const handleSelectFileClick = () => {
    document.getElementById('file-input').click();
  };

  // Search users
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data } = await searchUsers(query);
      setSearchResults(data.users);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  // Select recipient
  const handleSelectRecipient = (user) => {
    setRecipient(user);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Send file
  const handleSend = async () => {
    if (!file || !recipient) {
      setError('Please select a file and recipient');
      return;
    }

    setError('');

    try {
      await sendFile(file, recipient._id, {
        message,
        expiresIn,
      });

      // Reset form
      setFile(null);
      setRecipient(null);
      setMessage('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getProgressStep = () => {
    if (!progress) return '';
    
    const steps = {
      'fetching-key': 'Fetching recipient\'s public key...',
      'reading-file': 'Reading file...',
      'encrypting': 'Encrypting file...',
      'initiating': 'Initiating transfer...',
      'uploading': 'Uploading encrypted file...',
      'complete': 'Complete!',
    };
    
    return steps[progress.step] || progress.step;
  };

  return (
    <div className="space-y-6">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select File
        </label>
        
        {!file ? (
          <div
            className={`drop-zone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              Drag and drop a file here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
            </p>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button variant="secondary" as="span" onClick={handleSelectFileClick}>
                Choose File
              </Button>
            </label>
          </div>
        ) : (
          <div className="card bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-600">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-red-600 hover:text-red-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recipient Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recipient
        </label>
        
        {!recipient ? (
          <div>
            <Input
              type="text"
              placeholder="Search for a user..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              leftIcon={<Search size={18} className="text-gray-400" />}
            />
            
            {searching && (
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            )}
            
            {searchResults.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleSelectRecipient(user)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                  >
                    <p className="font-medium text-gray-900">
                      {user.username}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="card bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {recipient.username}
                </p>
                <p className="text-sm text-gray-600">{recipient.email}</p>
              </div>
              <button
                onClick={() => setRecipient(null)}
                className="text-red-600 hover:text-red-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Optional Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message (Optional)
        </label>
        <textarea
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows="3"
          placeholder="Add a message for the recipient..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {/* Expiration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Expires In
        </label>
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={expiresIn}
          onChange={(e) => setExpiresIn(Number(e.target.value))}
        >
          {EXPIRATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Progress */}
      {sending && progress && (
        <div>
          <ProgressBar
            progress={progress.progress || 0}
            label={getProgressStep()}
          />
        </div>
      )}

      {/* Send Button */}
      <Button
        variant="primary"
        fullWidth
        onClick={handleSend}
        disabled={!file || !recipient || sending}
        loading={sending}
      >
        {sending ? 'Sending...' : 'Send Encrypted File'}
      </Button>
    </div>
  );
};

export default SendFile;
import { useState, useRef } from 'react';
import { Upload, FileKey, X, AlertCircle } from 'lucide-react';
import Button from '../common/Button.jsx';
import Alert from '../common/Alert.jsx';

const ImportPrivateKey = ({ onSuccess, onCancel }) => {
  const [error, setError] = useState('');
  const [pemContent, setPemContent] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setFileName(file.name);

    try {
      const text = await file.text();
      
      // Validate PEM format
      if (!text.includes('-----BEGIN PRIVATE KEY-----') || 
          !text.includes('-----END PRIVATE KEY-----')) {
        throw new Error('Invalid private key file. Must be in PEM format.');
      }

      setPemContent(text);
      console.log('✅ Private key file loaded:', file.name);
      console.log('Private key length:', text.length);
    } catch (err) {
      setError(err.message || 'Failed to read private key file');
      setPemContent('');
      setFileName('');
    }
  };

  const handlePaste = (e) => {
    const text = e.target.value;
    setPemContent(text);
    
    if (text.includes('-----BEGIN PRIVATE KEY-----') && 
        text.includes('-----END PRIVATE KEY-----')) {
      setFileName('Pasted from clipboard');
      setError('');
    }
  };

  const handleImport = () => {
    if (!pemContent) {
      setError('Please select a private key file or paste the content');
      return;
    }

    // Validate format one more time
    if (!pemContent.includes('-----BEGIN PRIVATE KEY-----') || 
        !pemContent.includes('-----END PRIVATE KEY-----')) {
      setError('Invalid private key format. Must contain PEM headers and footers.');
      return;
    }

    try {
      const trimmedKey = pemContent.trim();
      console.log('✅ Private key validated and ready to import');
      console.log('Private key length:', trimmedKey.length);
      
      // Pass the private key content to the success handler
      if (onSuccess) {
        onSuccess(trimmedKey);
      }
    } catch (err) {
      setError(err.message || 'Failed to import private key');
    }
  };

  const handleClear = () => {
    setPemContent('');
    setFileName('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  //handle browse files click
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">
              Import Your Private Key
            </h4>
            <p className="text-sm text-blue-800">
              To decrypt files, you need to import your private key PEM file. 
              The key will only be stored in memory for this session and will be 
              cleared when you close this page.
            </p>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Private Key File
        </label>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
          <FileKey size={48} className="mx-auto text-gray-400 mb-3" />
          
          {fileName ? (
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-sm text-gray-700">{fileName}</span>
              <button
                onClick={handleClear}
                className="text-red-600 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <p className="text-gray-600 mb-3">
              Click to browse or drag and drop your private key file
            </p>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pem,.key,.txt"
            onChange={handleFileSelect}
            className="hidden"
            id="private-key-file"
          />
          
          <label htmlFor="private-key-file">
            <Button variant="secondary" as="span" leftIcon={<Upload size={18} />} onClick={handleBrowseClick}>
              Browse Files
            </Button>
          </label>
        </div>
      </div>

      {/* Or Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or paste directly</span>
        </div>
      </div>

      {/* Paste Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paste Private Key Content
        </label>
        <textarea
          className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows="8"
          placeholder="-----BEGIN PRIVATE KEY-----&#10;Your private key content here...&#10;-----END PRIVATE KEY-----"
          value={pemContent}
          onChange={handlePaste}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            variant="secondary"
            fullWidth
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        
        <Button
          variant="primary"
          fullWidth
          onClick={handleImport}
          disabled={!pemContent}
          leftIcon={<FileKey size={18} />}
        >
          Import & Decrypt
        </Button>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-xs text-yellow-800">
          <strong>⚠️ Security Note:</strong> Your private key will only be kept in 
          memory during this session. It will be automatically cleared when you:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Complete the file decryption</li>
            <li>Close or refresh this page</li>
            <li>Navigate away from this page</li>
          </ul>
        </p>
      </div>
    </div>
  );
};

export default ImportPrivateKey;
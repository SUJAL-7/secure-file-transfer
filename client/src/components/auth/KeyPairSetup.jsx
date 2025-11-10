import { useState } from 'react';
import { Key, Download, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import Alert from '../common/Alert.jsx';
import { generateRSAKeyPair, exportPublicKeyToPEM, exportPrivateKeyToPEM } from '../../crypto/keyManagement.js';
import { updateUserPublicKey } from '../../api/users.js';
import { useAuth } from '../../hooks/useAuth.js';

const KeyPairSetup = ({ onComplete }) => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyGenerated, setKeyGenerated] = useState(false);
  const [privateKeyPEM, setPrivateKeyPEM] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      console.log('🔑 Generating RSA key pair...');
      
      // Generate key pair
      const keyPair = await generateRSAKeyPair();
      
      // Export to PEM
      const publicKeyPEM = await exportPublicKeyToPEM(keyPair.publicKey);
      const privatePEM = await exportPrivateKeyToPEM(keyPair.privateKey);
      
      console.log('✅ Keys generated and exported');
      
      // Upload public key to server
      console.log('📤 Uploading public key to server...');
      await updateUserPublicKey({ publicKey: publicKeyPEM });
      console.log('✅ Public key uploaded');
      
      // Store private key for download
      setPrivateKeyPEM(privatePEM);
      setKeyGenerated(true);
      
    } catch (err) {
      console.error('❌ Key generation failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPrivateKey = () => {
    try {
      const blob = new Blob([privateKeyPEM], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${user.username}_private_key_${Date.now()}.pem`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ Private key downloaded');
    } catch (err) {
      console.error('❌ Download failed:', err);
      setError('Failed to download private key');
    }
  };

  if (keyGenerated) {
    return (
      <div className="space-y-6">
        <Alert
          type="success"
          message="Key pair generated successfully!"
        />

        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
          <div className="flex gap-3 mb-4">
            <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-bold text-red-900 mb-2 text-lg">
                ⚠️ CRITICAL: Download Your Private Key NOW!
              </h4>
              <div className="text-sm text-red-800 space-y-2">
                <p className="font-semibold">
                  Your private key will NOT be stored anywhere. You MUST download it now!
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Without this key, you CANNOT decrypt files sent to you</li>
                  <li>This key will be deleted after you leave this page</li>
                  <li>Store it in a safe place (password manager, encrypted USB, etc.)</li>
                  <li>Never share this key with anyone</li>
                </ul>
              </div>
              
              <Button
                variant="danger"
                className="mt-4 bg-red-600 hover:bg-red-700"
                leftIcon={<Download size={20} />}
                onClick={handleDownloadPrivateKey}
                size="lg"
              >
                Download Private Key Now
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-3">
            📝 Next Steps:
          </h4>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Download your private key using the button above</li>
            <li>Store it securely (we recommend a password manager)</li>
            <li>When receiving files, you'll import this key to decrypt them</li>
            <li>Your public key has been uploaded to the server automatically</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleDownloadPrivateKey}
            leftIcon={<Download size={18} />}
          >
            Download Again
          </Button>
          
          <Button
            variant="primary"
            onClick={onComplete}
            className="flex-1"
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="text-primary-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Generate Your Encryption Keys
        </h2>
        <p className="text-gray-600">
          Create a secure key pair for encrypted file transfers
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Your private key will NOT be stored on the server or in your browser. 
          You will need to download and keep it safe to decrypt files.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <Input
          type="password"
          label="Password"
          placeholder="Enter a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          helperText="This password is just for verification during setup"
        />

        <Input
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Generate Key Pair
        </Button>
      </form>
    </div>
  );
};

export default KeyPairSetup;
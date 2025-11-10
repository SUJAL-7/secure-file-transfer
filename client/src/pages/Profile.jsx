import { useState } from 'react';
import { User, Key, Copy, CheckCircle, FileKey, Download } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useCrypto } from '../hooks/useCrypto.js';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Alert from '../components/common/Alert.jsx';
import { formatDate } from '../utils/constants.js';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const { hasPublicKey, publicKeyPEM } = useCrypto();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyPublicKey = () => {
    navigator.clipboard.writeText(publicKeyPEM);
    setCopied(true);
    toast.success('Public key copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateKeys = () => {
    navigate('/key-setup');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary-100 p-3 rounded-lg">
            <User size={28} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">
              Manage your account and encryption keys
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Account Information
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <Input
              type="text"
              value={user?.username || ''}
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={user?.email || ''}
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Member Since
            </label>
            <Input
              type="text"
              value={formatDate(user?.createdAt)}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Encryption Keys */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Encryption Keys
          </h2>
          <div className="flex items-center gap-2">
            {hasPublicKey ? (
              <>
                <CheckCircle size={20} className="text-green-600" />
                <span className="text-sm text-gray-600">Key Generated</span>
              </>
            ) : (
              <>
                <Key size={20} className="text-gray-400" />
                <span className="text-sm text-gray-600">No Keys</span>
              </>
            )}
          </div>
        </div>

        {hasPublicKey ? (
          <div className="space-y-4">
            <Alert
              type="info"
              message="Your public key is stored on the server and used by others to encrypt files for you. Your private key is NOT stored anywhere - you must keep it safe."
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Public Key (RSA-4096)
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyPublicKey}
                  leftIcon={copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-xs bg-gray-50"
                rows="6"
                value={publicKeyPEM || ''}
                readOnly
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <FileKey className="text-yellow-600 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    About Your Private Key
                  </h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>🔐 Your private key was downloaded when you generated your keys</li>
                    <li>📁 Keep it in a safe place (password manager, encrypted storage)</li>
                    <li>🚫 Never share your private key with anyone</li>
                    <li>📥 You'll need to import it each time you decrypt a file</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Generate New Keys
              </h3>
              <Alert
                type="warning"
                message="⚠️ Generating new keys will make you unable to decrypt files that were sent with your old public key!"
              />
              <Button
                variant="secondary"
                onClick={handleGenerateKeys}
                leftIcon={<Key size={18} />}
                className="mt-3"
              >
                Generate New Key Pair
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileKey size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              You haven't generated encryption keys yet
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Generate a key pair to start sending and receiving encrypted files
            </p>
            <Button
              variant="primary"
              onClick={handleGenerateKeys}
              leftIcon={<Key size={18} />}
            >
              Generate Key Pair
            </Button>
          </div>
        )}
      </div>

      {/* Security Info */}
      <div className="card bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <div className="flex items-start gap-4">
          <div className="bg-indigo-100 p-3 rounded-lg">
            <FileKey size={24} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              How Your Keys Work
            </h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>Public Key:</strong> Stored on the server. Others use it to encrypt files for you.
              </p>
              <p>
                <strong>Private Key:</strong> Downloaded and kept by you. Import it when you need to decrypt files.
              </p>
              <p className="text-indigo-700 font-medium">
                💡 This ensures maximum security - even we can't decrypt your files!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
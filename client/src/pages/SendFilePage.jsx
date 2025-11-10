import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import SendFile from '../components/transfer/SendFile.jsx';
import Button from '../components/common/Button.jsx';
import { useCrypto } from '../hooks/useCrypto.js';
import Alert from '../components/common/Alert.jsx';

const SendFilePage = () => {
  const navigate = useNavigate();
  const { hasPublicKey } = useCrypto();
  const [success, setSuccess] = useState(false);

  const handleSuccess = () => {
    setSuccess(true);
  };

  const handleSendAnother = () => {
    setSuccess(false);
  };

  if (!hasPublicKey) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <AlertCircle size={32} className="text-yellow-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Encryption Keys Required
              </h2>
              <p className="text-gray-600 mb-4">
                You need to generate encryption keys before you can send files.
                This is a one-time setup that takes just a few seconds.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/key-setup')}
              >
                Generate Encryption Keys
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            File Sent Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your encrypted file has been sent to the recipient.
            They will be notified and can download it anytime using their private key.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => navigate('/sent')}
            >
              View Sent Files
            </Button>
            <Button
              variant="primary"
              onClick={handleSendAnother}
            >
              Send Another File
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary-100 p-3 rounded-lg">
            <Upload size={28} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Send File</h1>
            <p className="text-gray-600">
              Encrypt and send files securely
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <SendFile onSuccess={handleSuccess} />
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">
          🔒 End-to-End Encryption Process:
        </h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Your file is encrypted with AES-256-GCM on your device</li>
          <li>The encryption key is encrypted with recipient's RSA-4096 public key</li>
          <li>Only encrypted data is uploaded to the server</li>
          <li>Only the recipient can decrypt with their private key</li>
          <li>Server never has access to unencrypted files or private keys</li>
        </ol>
      </div>
    </div>
  );
};

export default SendFilePage;
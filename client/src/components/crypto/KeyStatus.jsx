import { Key, Lock, Unlock, Download } from 'lucide-react';
import Button from '../common/Button.jsx';
import { useCrypto } from '../../hooks/useCrypto.js';
import { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Input from '../common/Input.jsx';
import Alert from '../common/Alert.jsx';

const KeyStatus = () => {
  const {
    hasKeys,
    isUnlocked,
    unlockPrivateKey,
    lockPrivateKey,
    exportPrivateKey,
  } = useCrypto();

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await unlockPrivateKey(password);
      
      if (result.success) {
        setShowUnlockModal(false);
        setPassword('');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await exportPrivateKey(password);
      
      if (result.success) {
        setShowExportModal(false);
        setPassword('');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!hasKeys) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 text-yellow-600">
          <Key size={24} />
          <div>
            <h3 className="font-semibold">No Encryption Keys</h3>
            <p className="text-sm text-gray-600">
              Generate keys to start sending and receiving files
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isUnlocked ? (
              <Unlock size={24} className="text-green-600" />
            ) : (
              <Lock size={24} className="text-gray-400" />
            )}
            <div>
              <h3 className="font-semibold">
                {isUnlocked ? 'Keys Unlocked' : 'Keys Locked'}
              </h3>
              <p className="text-sm text-gray-600">
                {isUnlocked
                  ? 'Your private key is unlocked and ready'
                  : 'Unlock your private key to decrypt files'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {isUnlocked ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowExportModal(true)}
                  leftIcon={<Download size={16} />}
                >
                  Export
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={lockPrivateKey}
                  leftIcon={<Lock size={16} />}
                >
                  Lock
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowUnlockModal(true)}
                leftIcon={<Unlock size={16} />}
              >
                Unlock
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Unlock Modal */}
      <Modal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        title="Unlock Private Key"
        size="sm"
      >
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        
        <form onSubmit={handleUnlock} className="space-y-4 mt-4">
          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowUnlockModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Unlock
            </Button>
          </div>
        </form>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Private Key"
        size="sm"
      >
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        
        <div className="mb-4">
          <Alert
            type="warning"
            message="Keep this file safe! Anyone with your private key can decrypt your files."
          />
        </div>

        <form onSubmit={handleExport} className="space-y-4">
          <Input
            type="password"
            label="Confirm Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowExportModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Export
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default KeyStatus;
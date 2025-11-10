import { useContext, useState, useEffect } from 'react';
import { Download, FileKey } from 'lucide-react';
import { TransferContext } from '../context/transferContext.js';
import { useCrypto } from '../hooks/useCrypto.js';
import { useFileTransfer } from '../hooks/useFileTransfer.js';
import TransferList from '../components/transfer/TransferList.jsx';
import Modal from '../components/common/Modal.jsx';
import ImportPrivateKey from '../components/crypto/ImportPrivateKey.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import { deleteTransfer } from '../api/transfers.js';
import toast from 'react-hot-toast';

const ReceivedFiles = () => {
  const {
    receivedTransfers,
    loading,
    fetchReceivedTransfers,
    clearNewTransferCount,
  } = useContext(TransferContext);
  const { hasPrivateKey, privateKeyPEM, clearPrivateKey } = useCrypto();
  const { receiveFile, receiving, progress } = useFileTransfer();

  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [importedPrivateKey, setImportedPrivateKey] = useState(null);

  // Clear notification count on mount
  useEffect(() => {
    clearNewTransferCount();
  }, [clearNewTransferCount]);

  // Clear private key when component unmounts
  useEffect(() => {
    return () => {
      console.log('🧹 Clearing private key on unmount');
      clearPrivateKey();
      setImportedPrivateKey(null);
    };
  }, [clearPrivateKey]);

  const handleDownload = async (transfer) => {
    console.log('🔽 Download clicked');
    console.log('Has private key in context:', hasPrivateKey);
    console.log('Has imported private key:', !!importedPrivateKey);

    // Check if we have a private key from import or context
    const availablePrivateKey = importedPrivateKey || privateKeyPEM;

    if (!availablePrivateKey) {
      console.log('🔒 Private key not available, showing import modal');
      setSelectedTransfer(transfer);
      setShowImportModal(true);
      return;
    }

    console.log('✅ Private key available, proceeding with download');
    await downloadFile(transfer, availablePrivateKey);
  };

  const downloadFile = async (transfer, privateKey) => {
    try {
      console.log('📥 Starting download for transfer:', transfer._id);
      console.log('Using private key, length:', privateKey?.length);
      
      if (!privateKey) {
        throw new Error('Private key not available. Please import your private key.');
      }

      // Pass the private key directly to the receive function
      await receiveFile(transfer._id, privateKey);
      toast.success('File downloaded and decrypted successfully!');
      
      // Clear private keys after successful decryption
      clearPrivateKey();
      setImportedPrivateKey(null);
      
      fetchReceivedTransfers();
    } catch (err) {
      console.error('❌ Download error:', err);
      toast.error(err.message || 'Failed to download file');
    }
  };

  const handleImportSuccess = async (privateKey) => {
    console.log('✅ Private key imported, length:', privateKey?.length);
    
    // Store the imported key temporarily
    setImportedPrivateKey(privateKey);
    setShowImportModal(false);
    
    // Small delay to ensure modal closes smoothly
    setTimeout(async () => {
      if (selectedTransfer && privateKey) {
        console.log('📥 Proceeding with download after import');
        await downloadFile(selectedTransfer, privateKey);
        setSelectedTransfer(null);
      }
    }, 100);
  };

  const handleDelete = async (transferId) => {
    if (!window.confirm('Are you sure you want to delete this transfer?')) {
      return;
    }

    try {
      await deleteTransfer(transferId);
      toast.success('Transfer deleted successfully');
      fetchReceivedTransfers();
    } catch (err) {
        console.log(err)
      toast.error('Failed to delete transfer');
    }
  };

  const getProgressStep = () => {
    if (!progress) return '';
    
    const steps = {
      'fetching-details': 'Fetching transfer details...',
      'downloading': 'Downloading encrypted file...',
      'reading': 'Reading file...',
      'decrypting': 'Decrypting file...',
      'saving': 'Saving file...',
      'complete': 'Complete!',
    };
    
    return steps[progress.step] || progress.step;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Download size={28} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Received Files</h1>
            <p className="text-gray-600">
              Files sent to you by others
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileKey className="text-blue-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                How to Download & Decrypt Files
              </h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Click the download button on any file</li>
                <li>Import your private key PEM file (you received this when generating keys)</li>
                <li>The file will be automatically decrypted and downloaded</li>
                <li>Your private key is cleared from memory after decryption</li>
              </ol>
              <p className="text-xs text-blue-700 mt-2">
                💡 Tip: Keep your private key file in a secure location like a password manager
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      {receiving && progress && (
        <div className="card">
          <ProgressBar
            progress={progress.progress || 0}
            label={getProgressStep()}
          />
        </div>
      )}

      {/* Transfer List */}
      <TransferList
        transfers={receivedTransfers}
        type="received"
        loading={loading}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />

      {/* Import Private Key Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setSelectedTransfer(null);
        }}
        title="Import Private Key to Decrypt"
        size="lg"
      >
        <ImportPrivateKey
          onSuccess={handleImportSuccess}
          onCancel={() => {
            setShowImportModal(false);
            setSelectedTransfer(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default ReceivedFiles;
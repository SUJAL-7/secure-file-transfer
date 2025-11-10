import { Download, Trash2, Clock, CheckCircle } from 'lucide-react';
import Button from '../common/Button.jsx';
import { formatFileSize, formatDate } from '../../utils/constants.js';
import { getFileIcon } from '../../utils/fileHelpers.js';
import { TRANSFER_STATUS } from '../../utils/constants.js';

const TransferCard = ({ transfer, type, onDownload, onDelete }) => {
  const isSent = type === 'sent';
  const otherUser = isSent ? transfer.recipient : transfer.sender;

  const getStatusBadge = () => {
    const statuses = {
      [TRANSFER_STATUS.PENDING]: {
        text: 'Pending',
        className: 'bg-yellow-100 text-yellow-800',
      },
      [TRANSFER_STATUS.UPLOADED]: {
        text: 'Ready',
        className: 'bg-blue-100 text-blue-800',
      },
      [TRANSFER_STATUS.DOWNLOADED]: {
        text: 'Downloaded',
        className: 'bg-green-100 text-green-800',
      },
      [TRANSFER_STATUS.EXPIRED]: {
        text: 'Expired',
        className: 'bg-gray-100 text-gray-800',
      },
    };

    const status = statuses[transfer.status] || statuses[TRANSFER_STATUS.PENDING];

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
        {status.text}
      </span>
    );
  };

  const canDownload = !isSent && transfer.status === TRANSFER_STATUS.UPLOADED;

  return (
    <div className="card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="text-3xl">{getFileIcon(transfer.originalFilename)}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {transfer.originalFilename}
            </h3>
            <p className="text-sm text-gray-600">
              {formatFileSize(transfer.fileSize)}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">
            {isSent ? 'To:' : 'From:'}
          </span>
          <span>{otherUser?.username || 'Unknown'}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={14} />
          <span>{formatDate(transfer.createdAt)}</span>
        </div>

        {transfer.downloadedAt && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle size={14} />
            <span>Downloaded {formatDate(transfer.downloadedAt)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {canDownload && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            leftIcon={<Download size={16} />}
            onClick={() => onDownload(transfer)}
          >
            Download & Decrypt
          </Button>
        )}
        
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(transfer._id)}
          leftIcon={<Trash2 size={16} />}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default TransferCard;
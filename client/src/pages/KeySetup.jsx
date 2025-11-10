import { useNavigate } from 'react-router-dom';
import KeyPairSetup from '../components/auth/KeyPairSetup.jsx';

const KeySetup = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <KeyPairSetup onComplete={handleComplete} />
        </div>
      </div>
    </div>
  );
};

export default KeySetup;
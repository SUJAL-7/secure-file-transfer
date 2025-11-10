import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, Mail, Eye, EyeOff } from 'lucide-react';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import Alert from '../common/Alert.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { generateRSAKeyPair, exportPublicKeyToPEM } from '../../crypto/keyManagement.js';
import { validateUsername, validateEmail, validatePassword } from '../../utils/validators.js';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Generate RSA key pair
      const keyPair = await generateRSAKeyPair();
      const publicKeyPEM = await exportPublicKeyToPEM(keyPair.publicKey);

      // Register user with public key
      const result = await register({
        username: formData.username.toLowerCase(),
        email: formData.email.toLowerCase(),
        password: formData.password,
        publicKey: publicKeyPEM,
      });
      
      if (result.success) {
        // Navigate to key setup page
        navigate('/key-setup');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="text-white" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Create Account
        </h2>
        <p className="text-gray-600">
          Join SecureTransfer for encrypted file sharing
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <Input
          type="text"
          name="username"
          label="Username"
          placeholder="Choose a username"
          value={formData.username}
          onChange={handleChange}
          leftIcon={<User size={18} className="text-gray-400" />}
          helperText="Lowercase letters, numbers, hyphens, and underscores only"
          required
        />

        <Input
          type="email"
          name="email"
          label="Email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          leftIcon={<Mail size={18} className="text-gray-400" />}
          required
        />

        <Input
          type={showPassword ? 'text' : 'password'}
          name="password"
          label="Password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleChange}
          leftIcon={<Lock size={18} className="text-gray-400" />}
          helperText="At least 8 characters with uppercase, lowercase, and number"
          required
        />

        <Input
          type={showPassword ? 'text' : 'password'}
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          leftIcon={<Lock size={18} className="text-gray-400" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          required
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          By signing up, a cryptographic key pair will be generated for you. Keep your private key safe!
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
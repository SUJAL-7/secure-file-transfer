import RegisterForm from '../components/auth/RegisterForm.jsx';

const Register = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default Register;
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ username, password }));
  };

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true }); 
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 dark:from-slate-900 dark:to-gray-900 transition-all duration-300">
      <div className="m-auto w-full max-w-md px-4 py-8 sm:px-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 flex items-center justify-center">
            <div className="absolute w-24 h-24 bg-white dark:bg-slate-800 rounded-full -bottom-12 flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full">
                <Lock className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
              </div>
            </div>
          </div>
          
          <div className="px-6 sm:px-8 pt-16 pb-8">
            <h2 className="text-2xl font-bold mb-2 text-center text-gray-800 dark:text-white">
              Welcome Back
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
              Sign in to access your account
            </p>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-400 rounded">
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500 dark:text-white text-base transition-all duration-200"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500 dark:text-white text-base transition-all duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              <button 
                type="submit" 
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-200 flex items-center justify-center text-base"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>
            </form>
            
            
          </div>
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-500">
          FCSE Course Offering System &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default Login;
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

const Register = () => {
  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              First Name
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Last Name
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder="Enter your last name"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Email
          </label>
          <input
            type="email"
            className="input w-full"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Password
          </label>
          <input
            type="password"
            className="input w-full"
            placeholder="Create a password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            className="input w-full"
            placeholder="Confirm your password"
          />
        </div>
        <button type="submit" className="btn-primary w-full">
          Create Account
        </button>
      </form>
      <p className="text-center text-gray-400 text-sm mt-4">
        Already have an account?{' '}
        <Link to={ROUTES.AUTH.LOGIN} className="text-primary-400 hover:text-primary-300">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Register;
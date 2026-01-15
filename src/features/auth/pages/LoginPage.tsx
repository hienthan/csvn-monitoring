import React, { useState } from 'react';
import { Card, CardHeader, CardBody, Input, Button, Alert } from '@heroui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LucideUser, LucideLock } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password });
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by context
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-content2">
      <Card className="w-full max-w-md p-4">
        <CardHeader className="flex flex-col gap-1 items-center">
          <h1 className="text-2xl font-bold">VG InfraDesk</h1>
          <p className="text-default-500">Log in to your account</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input
              label="Username"
              placeholder="Enter your username"
              value={username}
              onValueChange={setUsername}
              variant="bordered"
              isRequired
              labelPlacement="inside"
              classNames={{
                inputWrapper: "h-14",
                label: "text-default-500",
                input: "text-center pr-6", // pr-6 to balance the startContent
              }}
              startContent={<LucideUser className="text-default-400" size={18} />}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              type="password"
              value={password}
              onValueChange={setPassword}
              variant="bordered"
              isRequired
              labelPlacement="inside"
              classNames={{
                inputWrapper: "h-14",
                label: "text-default-500",
                input: "text-center pr-6",
              }}
              startContent={<LucideLock className="text-default-400" size={18} />}
            />
            
            <div className="min-h-[40px] flex items-center justify-center">
              {error && (
                <Alert 
                  color="danger" 
                  variant="flat"
                  classNames={{
                    base: "w-full flex justify-center text-center py-2 animate-in fade-in zoom-in-95 duration-200",
                    mainWrapper: "w-full",
                  }}
                >
                  {error}
                </Alert>
              )}
            </div>

            <Button
              color="primary"
              type="submit"
              isLoading={isLoading}
              fullWidth
              size="lg"
              className="font-bold shadow-lg shadow-primary/20"
            >
              Sign In
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default LoginPage;

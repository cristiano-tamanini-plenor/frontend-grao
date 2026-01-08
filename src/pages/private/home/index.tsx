import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import Logomarca from '@/components/components/Logomarca';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex-1 flex items-center justify-center h-full w-full">
      <Logomarca 
        alt="Grão Logo" 
        className="w-64 h-auto mx-auto"
      />
    </div>
  );
}

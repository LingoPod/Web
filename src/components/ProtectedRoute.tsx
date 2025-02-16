import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-black">
    <Spin
      spinning={true}
      indicator={<LoadingOutlined style={{ fontSize: 36, color: 'white' }} spin />}
    />
    <div className="mt-4 text-white text-sm">Yükleniyor...</div>
  </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !profile?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Yetkisiz Erişim</h1>
          <p className="text-gray-400">
            Bu sayfaya erişim yetkiniz bulunmamaktadır. Sadece admin kullanıcılar erişebilir.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 
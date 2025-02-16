import React, { useState } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { showError, showSuccess } from '../../utils/message';
import './Login.css';

const { Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [form] = Form.useForm<LoginFormValues>();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await signIn(values.email, values.password);
      showSuccess('Giriş başarılı!');
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="text-center mb-8">
          <h1 className="apple-title">
            LingoPod'a Hoş Geldiniz!
          </h1>
          <Text className="apple-subtitle">
            Dil öğrenmeye başlamak için giriş yapın
          </Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          className="form-spacing"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Email gerekli' },
              { type: 'email', message: 'Geçerli bir email girin' }
            ]}
          >
            <Input
              placeholder="Email"
              size="large"
              autoComplete="email"
              spellCheck={false}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Şifre gerekli' }]}
          >
            <Input.Password
              placeholder="Şifre"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button w-full"
              loading={loading}
            >
              Devam Et
            </Button>
          </Form.Item>

          <div className="flex justify-center space-x-4">
            <Link to="/forgot-password" className="apple-link">
              Şifremi Unuttum
            </Link>
            <Text className="dark-text-secondary">•</Text>
            <Link to="/register" className="apple-link">
              Kayıt Ol
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { showError, showSuccess } from '../../utils/message';
import '../Auth/Login.css';

const { Text } = Typography;

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
}

const Register: React.FC = () => {
  const [form] = Form.useForm<RegisterFormValues>();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      await signUp(values.email, values.password, values.name);
      showSuccess('Kayıt başarılı! Email adresinizi doğrulayın.');
      form.resetFields();
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
            LingoPod'a Katılın
          </h1>
          <Text className="apple-subtitle block">
            Yeni bir hesap oluşturun
          </Text>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          className="form-spacing"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Lütfen adınızı girin' }]}
          >
            <Input
              placeholder="Ad Soyad"
              size="large"
              autoComplete="name"
              spellCheck={false}
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Lütfen email adresinizi girin' },
              { type: 'email', message: 'Geçerli bir email adresi girin' }
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
            rules={[
              { required: true, message: 'Lütfen şifrenizi girin' },
              { min: 6, message: 'Şifre en az 6 karakter olmalıdır' }
            ]}
          >
            <Input.Password
              placeholder="Şifre"
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button w-full"
              loading={loading}
            >
              Hesap Oluştur
            </Button>
          </Form.Item>

          <div className="text-center mt-8">
            <Text className="dark-text-secondary">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="apple-link">
                Giriş Yap
              </Link>
            </Text>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Register;

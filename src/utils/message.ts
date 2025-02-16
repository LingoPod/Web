import { message } from 'antd';

export const showSuccess = (content: string) => {
  message.success({
    content,
    className: 'custom-message-success',
  });
};

export const showError = (error: any) => {
  let errorMessage = 'Bir hata oluştu';

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.message) {
    errorMessage = error.message;
  } else if (error?.error_description) {
    errorMessage = error.error_description;
  }

  message.error({
    content: errorMessage,
    className: 'custom-message-error',
  });
};

export const showInfo = (content: string) => {
  message.info({
    content,
    className: 'custom-message-info',
  });
};

// Hata mesajlarını daha kullanıcı dostu hale getiren yardımcı fonksiyon
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  
  if (error?.message) return error.message;
  
  // Supabase özel hata mesajları
  switch (error?.code) {
    case 'auth/invalid-email':
      return 'Geçersiz email adresi';
    case 'auth/user-disabled':
      return 'Kullanıcı hesabı devre dışı bırakılmış';
    case 'auth/user-not-found':
      return 'Kullanıcı bulunamadı';
    case 'auth/wrong-password':
      return 'Hatalı şifre';
    case 'auth/email-already-in-use':
      return 'Bu email adresi zaten kullanımda';
    case '23505':
      return 'Bu email adresi zaten kayıtlı';
    default:
      return 'Bir hata oluştu. Lütfen tekrar deneyin.';
  }
}; 
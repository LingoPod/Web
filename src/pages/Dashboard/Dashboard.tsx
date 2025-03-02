import React, { useEffect, useState } from 'react';
import { Layout, Button, Table, Modal, Form, Input, Space, Popconfirm, message, ConfigProvider, theme, Tabs, Select, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LogoutOutlined, UploadOutlined, SoundOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Category, Topic, Content } from '../../lib/supabase';
import './Dashboard.css';
import { getErrorMessage } from '../../utils/message';

const { Header, Content: LayoutContent } = Layout;

// Tip genişletmeleri ile ilgili hataları düzeltmek için Content ve Topic tiplerini genişletelim
interface ExtendedTopic extends Topic {
  short_description?: string;
  categories?: {
    name: string;
  };
}

interface ExtendedContent extends Omit<Content, 'audio_url'> {
  short_description?: string;
  description?: string;
  tags?: string[];
  topics?: {
    title: string;
  };
  audio_url: string | null;
}

const Dashboard: React.FC = () => {
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Topics state
  const [topics, setTopics] = useState<ExtendedTopic[]>([]);
  const [topicModalVisible, setTopicModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState<ExtendedTopic | null>(null);

  // Content state
  const [contents, setContents] = useState<ExtendedContent[]>([]);
  const [contentModalVisible, setContentModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState<ExtendedContent | null>(null);

  // Tüm etiketleri saklayan state
  const [allTags, setAllTags] = useState<string[]>([]);

  // Shared state
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categoryForm] = Form.useForm();
  const [topicForm] = Form.useForm();
  const [contentForm] = Form.useForm();
  const [audioLoading, setAudioLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchTopics();
    fetchContents();
    fetchAllTags();
  }, []);

  // Düzenleme durumunda form alanlarını ayarlamak için effect
  useEffect(() => {
    if (editingContent) {
      contentForm.setFieldsValue(editingContent);
    }
  }, [editingContent, contentForm]);

  useEffect(() => {
    if (editingTopic) {
      topicForm.setFieldsValue(editingTopic);
    }
  }, [editingTopic, topicForm]);

  useEffect(() => {
    if (editingCategory) {
      categoryForm.setFieldsValue(editingCategory);
    }
  }, [editingCategory, categoryForm]);

  // Categories functions
  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      console.log('Kategoriler alınıyor...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Kategori yanıtı:', { data, error });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      message.error(getErrorMessage(error) || 'Kategoriler yüklenirken bir hata oluştu');
      console.error('Kategoriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Topics functions
  const fetchTopics = async () => {
    try {
      setLoading(true);
      
      console.log('Konular alınıyor...');
      const { data, error } = await supabase
        .from('topics')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      console.log('Konu yanıtı:', { data, error });
      
      if (error) throw error;
      setTopics(data as ExtendedTopic[] || []);
    } catch (error) {
      message.error(getErrorMessage(error) || 'Konular yüklenirken bir hata oluştu');
      console.error('Konular yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Contents functions
  const fetchContents = async () => {
    try {
      setLoading(true);
      
      console.log('İçerikler alınıyor...');
      const { data, error } = await supabase
        .from('contents')
        .select('*, topics(title)')
        .order('created_at', { ascending: false });

      console.log('İçerik yanıtı:', { data, error });
      
      if (error) throw error;
      setContents(data as ExtendedContent[] || []);
    } catch (error) {
      message.error(getErrorMessage(error) || 'İçerikler yüklenirken bir hata oluştu');
      console.error('İçerikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tüm etiketleri getiren fonksiyon
  const fetchAllTags = async () => {
    try {
      
      console.log('Etiketler alınıyor...');
      const { data, error } = await supabase
        .from('contents')
        .select('tags');

      console.log('Etiket yanıtı:', { data, error });
      
      if (error) throw error;

      // Tüm etiketleri bir dizide toplama
      const tagsArray = data
        .flatMap(item => item.tags || [])
        .filter(Boolean);
      
      // Tekrarlanan etiketleri kaldırma
      const uniqueTags = [...new Set(tagsArray)];
      setAllTags(uniqueTags);
    } catch (error) {
      message.error(getErrorMessage(error) || 'Etiketler alınırken hata oluştu');
      console.error('Etiketler alınırken hata:', error);
    }
  };

  const handleAddEditTopic = async (values: { category_id: string; title: string; short_description: string; description: string }) => {
    try {
      console.log('Konu ekle/düzenle işlemi başlatılıyor...', values);
      setLoading(true);
      
      if (editingTopic) {
        console.log('Konu güncelleniyor:', editingTopic.id);
        const { error } = await supabase
          .from('topics')
          .update({
            category_id: values.category_id,
            title: values.title,
            short_description: values.short_description,
            description: values.description,
          })
          .eq('id', editingTopic.id);

        console.log('Konu güncelleme yanıtı:', { error });
        
        if (error) throw error;
        message.success('Konu başarıyla güncellendi');
        closeTopicModal();
        await fetchTopics();
      } else {
        console.log('Yeni konu ekleniyor');
        const { error, data } = await supabase
          .from('topics')
          .insert([values])
          .select();

        console.log('Konu ekleme yanıtı:', { error, data });
        
        if (error) throw error;
        message.success('Konu başarıyla eklendi');
        closeTopicModal();
        await fetchTopics();
      }
    } catch (error) {
      message.error(getErrorMessage(error) || 'İşlem sırasında bir hata oluştu');
      console.error('Konu kaydetme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEditContent = async (values: { topic_id: string; level: string; content: string; short_description: string; description: string; tags: string[] }) => {
    try {
      console.log('İçerik ekle/düzenle işlemi başlatılıyor...', values);
      setLoading(true);
      
      if (editingContent) {
        console.log('İçerik güncelleniyor:', editingContent.id);
        const { error } = await supabase
          .from('contents')
          .update({
            topic_id: values.topic_id,
            level: values.level,
            content: values.content,
            short_description: values.short_description,
            description: values.description,
            tags: values.tags
          })
          .eq('id', editingContent.id);

        console.log('İçerik güncelleme yanıtı:', { error });
        
        if (error) throw error;
        message.success('İçerik başarıyla güncellendi');
        closeContentModal();
        await fetchContents();
        await fetchAllTags();
      } else {
        console.log('Yeni içerik ekleniyor');
        const { error, data } = await supabase
          .from('contents')
          .insert([{
            topic_id: values.topic_id,
            level: values.level,
            content: values.content,
            short_description: values.short_description,
            description: values.description,
            tags: values.tags
          }])
          .select();

        console.log('İçerik ekleme yanıtı:', { error, data });
        
        if (error) throw error;
        message.success('İçerik başarıyla eklendi');
        closeContentModal();
        await fetchContents();
        await fetchAllTags();
      }
    } catch (error) {
      message.error(getErrorMessage(error) || 'İşlem sırasında bir hata oluştu');
      console.error('İçerik kaydetme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      console.log('Konu siliniyor:', id);
      setLoading(true);
      
      const { error } = await supabase.from('topics').delete().eq('id', id);

      console.log('Konu silme yanıtı:', { error });
      
      if (error) throw error;
      message.success('Konu başarıyla silindi');
      fetchTopics();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Konu silinirken bir hata oluştu');
      console.error('Konu silme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      console.log('İçerik siliniyor:', id);
      setLoading(true);
      
      const { error } = await supabase.from('contents').delete().eq('id', id);

      console.log('İçerik silme yanıtı:', { error });
      
      if (error) throw error;
      message.success('İçerik başarıyla silindi');
      fetchContents();
    } catch (error) {
      message.error(getErrorMessage(error) || 'İçerik silinirken bir hata oluştu');
      console.error('İçerik silme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('Kategori siliniyor:', id);
      setLoading(true);
      
      const { error } = await supabase.from('categories').delete().eq('id', id);

      console.log('Kategori silme yanıtı:', { error });
      
      if (error) throw error;
      message.success('Kategori başarıyla silindi');
      fetchCategories();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Kategori silinirken bir hata oluştu');
      console.error('Kategori silme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      message.success('Başarıyla çıkış yapıldı');
    } catch (error) {
      message.error('Çıkış yapılırken bir hata oluştu');
      console.error('Çıkış yapma hatası:', error);
    }
  };

  // Modal kapatma işlemleri için ortak fonksiyonlar
  const closeContentModal = () => {
    setContentModalVisible(false);
    setEditingContent(null);
    contentForm.resetFields();
  };

  const closeTopicModal = () => {
    setTopicModalVisible(false);
    setEditingTopic(null);
    topicForm.resetFields();
  };

  const closeCategoryModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
    categoryForm.resetFields();
  };

  const handleAddEdit = async (values: { name: string; description: string }) => {
    try {
      console.log('Kategori ekle/düzenle işlemi başlatılıyor...', values);
      setLoading(true);
      
      if (editingCategory) {
        console.log('Kategori güncelleniyor:', editingCategory.id);
        const { error } = await supabase
          .from('categories')
          .update({
            name: values.name,
            description: values.description,
          })
          .eq('id', editingCategory.id);

        console.log('Kategori güncelleme yanıtı:', { error });
        
        if (error) throw error;
        message.success('Kategori başarıyla güncellendi');
        closeCategoryModal();
        await fetchCategories();
      } else {
        console.log('Yeni kategori ekleniyor');
        const { error, data } = await supabase
          .from('categories')
          .insert([
            {
              name: values.name,
              description: values.description,
            },
          ])
          .select();

        console.log('Kategori ekleme yanıtı:', { error, data });
        
        if (error) throw error;
        message.success('Kategori başarıyla eklendi');
        closeCategoryModal();
        await fetchCategories();
      }
    } catch (error) {
      message.error(getErrorMessage(error) || 'İşlem sırasında bir hata oluştu');
      console.error('Kategori kaydetme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioUpload = async (file: File, content_id: string) => {
    try {
      console.log('Ses dosyası yükleniyor...', { content_id, fileName: file.name });
      setAudioLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${content_id}.${fileExt}`;
      const filePath = `audio/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('lingopod')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      console.log('Ses dosyası yükleme yanıtı:', { uploadError, uploadData });
      
      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('lingopod')
        .getPublicUrl(filePath);

      console.log('Public URL:', data);
      
      if (!data.publicUrl) throw new Error('Public URL alınamadı');

      // Update content record with audio URL
      const { error: updateError } = await supabase
        .from('contents')
        .update({ audio_url: data.publicUrl })
        .eq('id', content_id);

      console.log('İçerik güncelleme yanıtı:', { updateError });
      
      if (updateError) throw updateError;

      message.success('Ses dosyası başarıyla yüklendi');
      await fetchContents();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Ses dosyası yüklenirken bir hata oluştu');
      console.error('Ses dosyası yükleme hatası:', error);
    } finally {
      setAudioLoading(false);
    }
  };

  const handleAudioDelete = async (content_id: string, audio_url: string) => {
    try {
      console.log('Ses dosyası siliniyor...', { content_id, audio_url });
      setLoading(true);
      const fileName = audio_url.split('/').pop();
      
      // Delete from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from('lingopod')
        .remove([`audio/${fileName}`]);

      console.log('Ses dosyası silme yanıtı:', { deleteError });
      
      if (deleteError) throw deleteError;

      // Update content record
      const { error: updateError } = await supabase
        .from('contents')
        .update({ audio_url: null })
        .eq('id', content_id);

      console.log('İçerik güncelleme yanıtı:', { updateError });
      
      if (updateError) throw updateError;

      message.success('Ses dosyası başarıyla silindi');
      await fetchContents();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Ses dosyası silinirken bir hata oluştu');
      console.error('Ses dosyası silme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ses çalma fonksiyonu
  const handlePlayAudio = (audioUrl: string) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(audioUrl);
    audio.onended = () => {
      setCurrentAudio(null);
    };
    audio.play();
    setCurrentAudio(audio);
  };

  // Table columns
  const categoryColumns = [
    {
      title: 'Kategori Adı',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Category, b: Category) => a.name.localeCompare(b.name),
      width: '30%',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Ara"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Ara
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Sıfırla
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value: any, record: Category) => record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      width: '50%',
      render: (text: string) => text || '-',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Ara"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Ara
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Sıfırla
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value: any, record: Category) => 
        record.description?.toLowerCase().includes(value.toLowerCase()) || false,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: '20%',
      render: (_: any, record: Category) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            className="action-button"
            onClick={() => {
              setEditingCategory(record);
              categoryForm.setFieldsValue(record);
              setModalVisible(true);
            }}
            title="Düzenle"
          />
          <Popconfirm
            title="Bu kategoriyi silmek istediğinizden emin misiniz?"
            description="Bu işlem geri alınamaz ve kategoriye bağlı tüm konular silinecektir."
            onConfirm={() => handleDelete(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button type="text" danger icon={<DeleteOutlined />} className="action-icon delete" title="Sil" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const topicColumns = [
    {
      title: 'Konu Başlığı',
      dataIndex: 'title',
      key: 'title',
      sorter: (a: ExtendedTopic, b: ExtendedTopic) => a.title.localeCompare(b.title),
      width: '20%',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Ara"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Ara
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Sıfırla
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value: any, record: ExtendedTopic) => record.title.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Kategori',
      dataIndex: ['categories', 'name'],
      key: 'category',
      width: '15%',
      filters: categories.map(cat => ({ text: cat.name, value: cat.id })),
      onFilter: (value: any, record: ExtendedTopic) => record.category_id === value,
    },
    {
      title: 'Kısa Açıklama',
      dataIndex: 'short_description',
      key: 'short_description',
      width: '20%',
      render: (text: string) => text || '-',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Ara"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Ara
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Sıfırla
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value: any, record: ExtendedTopic) => 
        record.short_description?.toLowerCase().includes(value.toLowerCase()) || false,
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      width: '25%',
      render: (text: string) => text || '-',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Ara"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Ara
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Sıfırla
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value: any, record: ExtendedTopic) => 
        record.description?.toLowerCase().includes(value.toLowerCase()) || false,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: '20%',
      render: (_: any, record: ExtendedTopic) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            className="action-button"
            onClick={() => {
              setEditingTopic(record);
              topicForm.setFieldsValue(record);
              setTopicModalVisible(true);
            }}
            title="Düzenle"
          />
          <Popconfirm
            title="Bu konuyu silmek istediğinizden emin misiniz?"
            description="Bu işlem geri alınamaz ve konuya bağlı tüm içerikler silinecektir."
            onConfirm={() => handleDeleteTopic(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button type="text" danger icon={<DeleteOutlined />} className="action-icon delete" title="Sil" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const contentColumns = [
    {
      title: 'Konu',
      dataIndex: ['topics', 'title'],
      key: 'topic',
      width: '15%',
      filters: topics.map(topic => ({ text: topic.title, value: topic.id })),
      onFilter: (value: any, record: ExtendedContent) => record.topic_id === value,
    },
    {
      title: 'Seviye',
      dataIndex: 'level',
      key: 'level',
      width: '10%',
      filters: [
        { text: 'Kolay', value: 'easy' },
        { text: 'Orta', value: 'medium' },
        { text: 'Zor', value: 'hard' },
      ],
      onFilter: (value: string, record: ExtendedContent) => record.level === value,
      render: (level: string) => {
        const levelMap: { [key: string]: string } = {
          easy: 'Kolay',
          medium: 'Orta',
          hard: 'Zor',
        };
        return levelMap[level] || level;
      }
    },
    {
      title: 'Kısa Açıklama',
      dataIndex: 'short_description',
      key: 'short_description',
      width: '15%',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Ara"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Ara
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Sıfırla
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value: any, record: ExtendedContent) => 
        record.short_description?.toLowerCase().includes(value.toLowerCase()) || false,
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      width: '15%',
      render: (text: string) => text || '-',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Ara"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Ara
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Sıfırla
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value: any, record: ExtendedContent) => 
        record.description?.toLowerCase().includes(value.toLowerCase()) || false,
    },
    {
      title: 'İçerik',
      dataIndex: 'content',
      key: 'content',
      width: '20%',
      render: (text: string) => (
        <div className="content-text">
          {text}
        </div>
      ),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Ara"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Ara
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Sıfırla
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value: any, record: ExtendedContent) => 
        record.content?.toLowerCase().includes(value.toLowerCase()) || false,
    },
    {
      title: 'Etiketler',
      dataIndex: 'tags',
      key: 'tags',
      width: '15%',
      render: (tags: string[]) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {tags?.map((tag, index) => (
            <code 
              key={index}
              style={{ 
                fontFamily: 'monospace',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '3px',
                padding: '2px 5px',
                fontSize: '12px',
                color: '#333',
                display: 'inline-block',
                margin: '2px'
              }}
            >
              {tag}
            </code>
          ))}
        </div>
      ),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Etiket ara"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Ara
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Sıfırla
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value: any, record: ExtendedContent) => {
        if (!record.tags) return false;
        const tagStr = record.tags.join(' ').toLowerCase();
        return tagStr.includes(value.toLowerCase());
      },
      filters: [...new Set(allTags)].map(tag => ({ text: tag, value: tag })),
    },
    {
      title: 'Ses',
      key: 'audio',
      width: '15%',
      render: (_: any, record: ExtendedContent) => (
        <Space>
          {record.audio_url ? (
            <>
              <Button
                type="text"
                icon={<SoundOutlined />}
                onClick={() => {
                  if (record.audio_url) {
                    handlePlayAudio(record.audio_url);
                  }
                }}
                title="Dinle"
              />
              <Popconfirm
                title="Ses dosyasını silmek istediğinizden emin misiniz?"
                onConfirm={() => handleAudioDelete(record.id, record.audio_url!)}
                okText="Evet"
                cancelText="Hayır"
              >
                <Button type="text" danger icon={<DeleteOutlined />} className="action-icon delete" title="Sesi Sil" />
              </Popconfirm>
            </>
          ) : (
            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                const isAudio = file.type.startsWith('audio/');
                if (!isAudio) {
                  message.error('Sadece ses dosyası yükleyebilirsiniz!');
                  return false;
                }
                const isLt10M = file.size / 1024 / 1024 < 10;
                if (!isLt10M) {
                  message.error('Ses dosyası 10MB\'dan küçük olmalıdır!');
                  return false;
                }
                handleAudioUpload(file, record.id);
                return false;
              }}
            >
              <Button
                type="text"
                icon={<UploadOutlined />}
                className="action-button"
                title="Ses Yükle"
                loading={audioLoading}
              />
            </Upload>
          )}
        </Space>
      ),
      filters: [
        { text: 'Ses Var', value: 'hasAudio' },
        { text: 'Ses Yok', value: 'noAudio' },
      ],
      onFilter: (value: any, record: ExtendedContent) => {
        if (value === 'hasAudio') return !!record.audio_url;
        if (value === 'noAudio') return !record.audio_url;
        return true;
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: '20%',
      render: (_: any, record: ExtendedContent) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            className="action-button"
            onClick={() => {
              setEditingContent(record);
              contentForm.setFieldsValue(record);
              setContentModalVisible(true);
            }}
            title="Düzenle"
          />
          <Popconfirm
            title="Bu içeriği silmek istediğinizden emin misiniz?"
            description="Bu işlem geri alınamaz."
            onConfirm={() => handleDeleteContent(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button type="text" danger icon={<DeleteOutlined />} className="action-icon delete" title="Sil" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#0050ff',
        },
      }}
    >
      <Layout>
        <Header>
          <div className="header-title">LingoPod Dashboard</div>
          <div className="header-profile">
            <span>Admin Panel</span>
            <Button
              icon={<LogoutOutlined />}
              onClick={handleSignOut}
              className="action-button"
            >
              Çıkış Yap
            </Button>
          </div>
        </Header>
        <LayoutContent className="dashboard-content">
          <div className="content-card">
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="Kategoriler" key="1">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingCategory(null);
                    categoryForm.resetFields();
                    setModalVisible(true);
                  }}
                  className="create-button"
                >
                  Yeni Kategori
                </Button>
                <Table
                  columns={categoryColumns}
                  dataSource={categories}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    position: ['bottomCenter'],
                    showSizeChanger: false,
                    showTotal: (total) => `Toplam ${total} kategori`,
                  }}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Konular" key="2">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingTopic(null);
                    topicForm.resetFields();
                    setTopicModalVisible(true);
                  }}
                  className="create-button"
                >
                  Yeni Konu
                </Button>
                <Table
                  columns={topicColumns}
                  dataSource={topics}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    position: ['bottomCenter'],
                    showSizeChanger: false,
                    showTotal: (total) => `Toplam ${total} konu`,
                  }}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="İçerikler" key="3">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingContent(null);
                    contentForm.resetFields();
                    setContentModalVisible(true);
                  }}
                  className="create-button"
                >
                  Yeni İçerik
                </Button>
                <Table
                  columns={contentColumns as any}
                  dataSource={contents}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    position: ['bottomCenter'],
                    showSizeChanger: false,
                    showTotal: (total) => `Toplam ${total} içerik`,
                  }}
                />
              </Tabs.TabPane>
            </Tabs>
          </div>
        </LayoutContent>
      </Layout>

      {/* Modal düzenlemeleri */}
      <Modal
        title={editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
        open={modalVisible}
        onCancel={closeCategoryModal}
        footer={null}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleAddEdit}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Kategori Adı"
            rules={[{ required: true, message: 'Lütfen kategori adı girin!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Açıklama" rules={[{ required: true, message: 'Lütfen kısa açıklama girin!' }]}>
            <Input.TextArea />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={closeCategoryModal}>İptal</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingCategory ? 'Güncelle' : 'Ekle'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingTopic ? 'Konu Düzenle' : 'Yeni Konu'}
        open={topicModalVisible}
        onCancel={closeTopicModal}
        footer={null}
      >
        <Form
          form={topicForm}
          layout="vertical"
          onFinish={handleAddEditTopic}
          className="mt-4"
        >
          <Form.Item
            name="category_id"
            label="Kategori"
            rules={[{ required: true, message: 'Lütfen kategori seçin!' }]}
          >
            <Select>
              {categories.map(category => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Konu Başlığı"
            rules={[{ required: true, message: 'Lütfen konu başlığı girin!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="short_description"
            label="Kısa Açıklama"
            rules={[{ required: true, message: 'Lütfen kısa açıklama girin!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Açıklama" rules={[{ required: true, message: 'Lütfen açıklama girin!' }]}>
            <Input.TextArea />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={closeTopicModal}>İptal</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingTopic ? 'Güncelle' : 'Ekle'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingContent ? 'İçerik Düzenle' : 'Yeni İçerik'}
        open={contentModalVisible}
        onCancel={closeContentModal}
        footer={null}
      >
        <Form
          form={contentForm}
          layout="vertical"
          onFinish={handleAddEditContent}
        >
          <Form.Item
            name="topic_id"
            label="Konu"
            rules={[{ required: true, message: 'Lütfen bir konu seçin' }]}
          >
            <Select placeholder="Konu seçin">
              {topics.map((topic) => (
                <Select.Option key={topic.id} value={topic.id}>
                  {topic.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="level"
            label="Seviye"
            rules={[{ required: true, message: 'Lütfen bir seviye seçin' }]}
          >
            <Select placeholder="Seviye seçin">
              <Select.Option value="easy">Kolay</Select.Option>
              <Select.Option value="medium">Orta</Select.Option>
              <Select.Option value="hard">Zor</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="short_description"
            label="Kısa Açıklama"
            rules={[{ required: true, message: 'Lütfen kısa bir açıklama girin' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Açıklama"
            rules={[{ required: true, message: 'Lütfen açıklama girin' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="content"
            label="İçerik"
            rules={[{ required: true, message: 'Lütfen içerik girin' }]}
          >
            <Input.TextArea rows={6} />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Etiketler"
            rules={[{ required: true, message: 'Lütfen en az bir etiket girin' }]}
          >
            <Select
              mode="tags"
              placeholder="Etiket eklemek için yazın"
              options={allTags.map(tag => ({ label: tag, value: tag }))}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingContent ? 'Güncelle' : 'Ekle'}
              </Button>
              <Button onClick={closeContentModal}>İptal</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

export default Dashboard;

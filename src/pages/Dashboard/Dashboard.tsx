import React, { useEffect, useState } from 'react';
import { Layout, Button, Table, Modal, Form, Input, Space, Popconfirm, message, ConfigProvider, theme, Tabs, Select, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LogoutOutlined, UploadOutlined, SoundOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Category, Topic, Content } from '../../lib/supabase';
import './Dashboard.css';
import { getErrorMessage } from '../../utils/message';

const { Header, Content: LayoutContent } = Layout;

const Dashboard: React.FC = () => {
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Topics state
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicModalVisible, setTopicModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  // Content state
  const [contents, setContents] = useState<Content[]>([]);
  const [contentModalVisible, setContentModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);

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
  }, []);

  // Categories functions
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

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
      const { data, error } = await supabase
        .from('topics')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTopics(data || []);
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
      const { data, error } = await supabase
        .from('contents')
        .select('*, topics(title)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      message.error(getErrorMessage(error) || 'İçerikler yüklenirken bir hata oluştu');
      console.error('İçerikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEditTopic = async (values: { category_id: string; title: string; description: string }) => {
    try {
      setLoading(true);
      if (editingTopic) {
        const { error } = await supabase
          .from('topics')
          .update({
            category_id: values.category_id,
            title: values.title,
            description: values.description,
          })
          .eq('id', editingTopic.id);

        if (error) throw error;
        message.success('Konu başarıyla güncellendi');
      } else {
        const { error } = await supabase
          .from('topics')
          .insert([values])
          .select();

        if (error) throw error;
        message.success('Konu başarıyla eklendi');
      }

      setTopicModalVisible(false);
      topicForm.resetFields();
      await fetchTopics();
    } catch (error) {
      message.error(getErrorMessage(error) || 'İşlem sırasında bir hata oluştu');
      console.error('Konu kaydetme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEditContent = async (values: { topic_id: string; level: string; content: string }) => {
    try {
      setLoading(true);
      if (editingContent) {
        const { error } = await supabase
          .from('contents')
          .update(values)
          .eq('id', editingContent.id);

        if (error) throw error;
        message.success('İçerik başarıyla güncellendi');
      } else {
        const { error } = await supabase
          .from('contents')
          .insert([values])
          .select();

        if (error) throw error;
        message.success('İçerik başarıyla eklendi');
      }

      setContentModalVisible(false);
      contentForm.resetFields();
      await fetchContents();
    } catch (error) {
      message.error(getErrorMessage(error) || 'İşlem sırasında bir hata oluştu');
      console.error('İçerik kaydetme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.from('topics').delete().eq('id', id);

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
      setLoading(true);
      const { error } = await supabase.from('contents').delete().eq('id', id);

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
      setLoading(true);
      const { error } = await supabase.from('categories').delete().eq('id', id);

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

  const handleAddEdit = async (values: { name: string; description: string }) => {
    try {
      setLoading(true);
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: values.name,
            description: values.description,
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        message.success('Kategori başarıyla güncellendi');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([
            {
              name: values.name,
              description: values.description,
            },
          ])
          .select();

        if (error) throw error;
        message.success('Kategori başarıyla eklendi');
      }

      setModalVisible(false);
      categoryForm.resetFields();
      await fetchCategories();
    } catch (error) {
      message.error(getErrorMessage(error) || 'İşlem sırasında bir hata oluştu');
      console.error('Kategori kaydetme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioUpload = async (file: File, content_id: string) => {
    try {
      setAudioLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${content_id}.${fileExt}`;
      const filePath = `audio/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError, data: _ } = await supabase.storage
        .from('lingopod')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('lingopod')
        .getPublicUrl(filePath);

      if (!data.publicUrl) throw new Error('Public URL alınamadı');

      // Update content record with audio URL
      const { error: updateError } = await supabase
        .from('contents')
        .update({ audio_url: data.publicUrl })
        .eq('id', content_id);

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
      setLoading(true);
      const fileName = audio_url.split('/').pop();
      
      // Delete from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from('lingopod')
        .remove([`audio/${fileName}`]);

      if (deleteError) throw deleteError;

      // Update content record
      const { error: updateError } = await supabase
        .from('contents')
        .update({ audio_url: null })
        .eq('id', content_id);

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
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      width: '50%',
      render: (text: string) => text || '-',
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
      sorter: (a: Topic, b: Topic) => a.title.localeCompare(b.title),
      width: '25%',
    },
    {
      title: 'Kategori',
      dataIndex: ['categories', 'name'],
      key: 'category',
      width: '20%',
      filters: categories.map(cat => ({ text: cat.name, value: cat.id })),
      onFilter: (value: any, record: Topic) => record.category_id === value,
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      width: '35%',
      render: (text: string) => text || '-',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: '20%',
      render: (_: any, record: Topic) => (
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
      width: '25%',
      filters: topics.map(topic => ({ text: topic.title, value: topic.id })),
      onFilter: (value: any, record: Content) => record.topic_id === value,
    },
    {
      title: 'Seviye',
      dataIndex: 'level',
      key: 'level',
      width: '15%',
      filters: [
        { text: 'A1', value: 'A1' },
        { text: 'A2', value: 'A2' },
        { text: 'B1', value: 'B1' },
        { text: 'B2', value: 'B2' },
        { text: 'C1', value: 'C1' },
        { text: 'C2', value: 'C2' },
      ],
      onFilter: (value: string, record: Content) => record.level === value,
    },
    {
      title: 'İçerik',
      dataIndex: 'content',
      key: 'content',
      width: '40%',
      render: (text: string) => (
        <div className="content-text">
          {text}
        </div>
      )
    },
    {
      title: 'Ses',
      key: 'audio',
      width: '15%',
      render: (_: any, record: Content) => (
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
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: '20%',
      render: (_: any, record: Content) => (
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
        onCancel={() => setModalVisible(false)}
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

          <Form.Item name="description" label="Açıklama">
            <Input.TextArea />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => setModalVisible(false)}>İptal</Button>
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
        onCancel={() => setTopicModalVisible(false)}
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

          <Form.Item name="description" label="Açıklama">
            <Input.TextArea />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => setTopicModalVisible(false)}>İptal</Button>
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
        onCancel={() => setContentModalVisible(false)}
        footer={null}
      >
        <Form
          form={contentForm}
          layout="vertical"
          onFinish={handleAddEditContent}
          initialValues={editingContent || {}}
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
              <Select.Option value="beginner">Başlangıç</Select.Option>
              <Select.Option value="intermediate">Orta</Select.Option>
              <Select.Option value="advanced">İleri</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="content"
            label="İçerik"
            rules={[{ required: true, message: 'Lütfen içerik girin' }]}
          >
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingContent ? 'Güncelle' : 'Ekle'}
              </Button>
              <Button onClick={() => setContentModalVisible(false)}>İptal</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

export default Dashboard;

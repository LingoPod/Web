import React from 'react';
import { Typography, Card, Button, Row, Col } from 'antd';
import { ReadOutlined, SoundOutlined, RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const levels = [
  { level: 'A1', description: 'Beginner - Basic phrases and everyday expressions' },
  { level: 'A2', description: 'Elementary - Simple communication and routine tasks' },
  { level: 'B1', description: 'Intermediate - Main points of familiar matters' },
  { level: 'B2', description: 'Upper Intermediate - Complex texts and technical discussions' },
  { level: 'C1', description: 'Advanced - Complex and demanding content' },
  { level: 'C2', description: 'Mastery - Understanding virtually everything' },
];

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Login Button */}
      <div className="absolute top-4 right-4">
        <Button type="primary" onClick={() => navigate('/login')}>
          Login
        </Button>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Title level={1} className="text-4xl md:text-6xl mb-6">
            Master English Through Topics You Love
          </Title>
          <Paragraph className="text-lg text-gray-600 mb-8">
            Improve your English skills with our specialized reading and listening exercises
            across various topics and proficiency levels
          </Paragraph>
          <Button type="primary" size="large" onClick={() => navigate('/categories')}>
            Explore Topics
          </Button>
        </div>

        {/* Features Section */}
        <Row gutter={[24, 24]} className="mb-16">
          <Col xs={24} md={8}>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <ReadOutlined className="text-4xl text-blue-500 mb-4" />
              <Title level={4}>Reading Practice</Title>
              <Paragraph>
                Engaging texts across different topics and difficulty levels
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <SoundOutlined className="text-4xl text-blue-500 mb-4" />
              <Title level={4}>Listening Exercise</Title>
              <Paragraph>
                Authentic audio content to improve your listening comprehension
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <RocketOutlined className="text-4xl text-blue-500 mb-4" />
              <Title level={4}>Track Progress</Title>
              <Paragraph>
                Monitor your improvement across different proficiency levels
              </Paragraph>
            </Card>
          </Col>
        </Row>

        {/* Levels Section */}
        <Title level={2} className="text-center mb-8">
          Choose Your Level
        </Title>
        <Row gutter={[16, 16]}>
          {levels.map(({ level, description }) => (
            <Col xs={24} sm={12} lg={8} key={level}>
              <Card 
                hoverable 
                className="text-center h-full"
                onClick={() => navigate(`/categories?level=${level}`)}
              >
                <Title level={3} className="text-blue-600">{level}</Title>
                <Paragraph>{description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Landing;

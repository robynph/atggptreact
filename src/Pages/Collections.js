
import API_ENDPOINTS from '../apiConfig';
import Drag from '../Components/Drag';
import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../Components/axiosInstance';
import { UserContext } from '../Components/UserContext';
import styles from '../styles/Collections.module.css';
import 'antd/dist/reset.css';

import {
  message,
  Button,
  Tabs,
  Input,
  notification,
  Select,
  Spin,
  Card,
  Row,
  Col,
  Table,
  Popconfirm,
  Text,
  Typography,
  Space
} from 'antd';

export default function Collections() {
  const { uid } = useContext(UserContext);
  const { token } = useContext(UserContext);
  const [collections, setCollections] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentCollectionName, setCurrentCollectionName] = useState('');
  const [selectedCollectionKey, setSelectedCollectionKey] = useState(
    collections.length > 0 ? collections[0].key : ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const { Option } = Select;
  const { Text } = Typography;
  const [chunkSize, setChunkSize] = useState('');
  const [overlap, setOverlap] = useState('');

  const onChange = (checked) => {
    setLoading(!checked);
  };

  const fetchCollectionsData = () => {
    setIsLoading(true);
    axiosInstance(token)
      .get(`${API_ENDPOINTS.collections}?uid=${uid}`)
      .then((response) => {
        setCollections(response.data.data);
      })
      .catch((error) => {
        console.log(error);
        notification.error({
          message: 'Error',
          description: 'Failed to fetch collection. Please try again later.',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCollectionsData();
  }, []);

  const createCollection = () => {
    const nsname = prompt('Enter a name for the new collection:');
    if (nsname) {
      setIsLoading(true);
      axiosInstance(token)
        .post(`${API_ENDPOINTS.collections}?uid=${uid}&nsname=${nsname}`)
        .then((response) => {
          console.log('Collection created ', response.data);
          fetchCollectionsData();

          if (response.data && response.data.nskey) {
            const newCollectionKey = response.data.nskey;
            setSelectedCollectionKey(newCollectionKey);
            console.log('New collection key: ', newCollectionKey, selectedCollectionKey);
          } else {
            console.log('Unexpected response structure:', response.data);
          }
        })
        .catch((error) => {
          console.log(error);
          console.log(error.response.data.message);
          notification.error({
            message: 'Error',
            description: 'Failed to create collection. Please try again later.',
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const renameCollection = () => {
    const nskey = selectedCollectionKey;
    const label = collections.find((collection) => collection.key === nskey)?.label;
    const newLabel = prompt(`Enter a new name for ${label}:`);
    if (newLabel) {
      axiosInstance(token)
        .patch(`${API_ENDPOINTS.collections}?uid=${uid}&nskey=${nskey}&nsnew=${newLabel}`)
        .then((response) => {
          console.log(`Collection ${nskey} renamed to ${newLabel}`);
          fetchCollectionsData();
        })
        .catch((error) => {
          console.log(error);
          console.log(error.response.data.message);
          notification.error({
            message: 'Error',
            description: 'Failed to rename collection. Please try again later.',
          });
        });
    }
  };

  const deleteCollection = () => {
    const nskey = selectedCollectionKey;
    const label = collections.find((collection) => collection.key === nskey)?.label;

    axiosInstance(token)
      .delete(`${API_ENDPOINTS.collections}?uid=${uid}&nskey=${nskey}`)
      .then((response) => {
        console.log('Collection deleted ', response.data);
        // Reset selectedCollectionKey to clear the selection
        setSelectedCollectionKey('');
        fetchCollectionsData(); // Fetch updated list of collections
      })
      .catch((error) => {
        console.log(error);
        console.log(error.response.data.message);
        notification.error({
          message: 'Error',
          description: 'Failed to delete collection. Please try again later.',
        });
      });
  };

  const pullList = () => {
    const nskey = selectedCollectionKey;

    setIsLoading(true);
    axiosInstance(token)
      .get(`${API_ENDPOINTS.collectionsUpload}?uid=${uid}&nskey=${nskey}`)
      .then((response) => {
        setUploadedFiles(response.data.data);
        console.log(response.data.data);

        if (response.data.data.length === 0) {
          message.info('This bucket is empty.');
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response) {
          notification.error({
            message: 'Error',
            description: 'Failed to pull list of collection. Please try again later.',
          });
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };


  const handleRefresh = () => {
    const collection = collections.find((collection) => collection.key === selectedCollectionKey);
    const collectionName = collection ? collection.label : '';
    setCurrentCollectionName(collectionName);
    pullList();
  };

  const handleFileDelete = (filename) => {
    const nskey = selectedCollectionKey;
    const encodedFilename = encodeURIComponent(filename);

    axiosInstance(token)
      .delete(`${API_ENDPOINTS.collectionsUpload}/docs?uid=${uid}&nskey=${nskey}&filename=${encodedFilename}`)
      .then((response) => {
        console.log('File has been deleted ', response.data);
        pullList();

        message.success('File deleted successfully');
      })
      .catch((error) => {
        console.log(error);
        console.log(error.response.data.message);
        notification.error({
          message: 'Error',
          description: 'Failed to delete the file. Please try again later.',
        });
      });
  };

  const columns = [
    {
      title: 'Filename',
      dataIndex: 'filename',
    },
    {
      title: 'File Status',
      dataIndex: 'status',
    },
    {
      title: 'File Link',
      dataIndex: 's3_url',
      render: (text, record) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          Download
        </a>
      ),
    },
    {
      title: 'No. Vectors',
      dataIndex: 'vector_count',
    },
    {
      title: 'Last Updated',
      dataIndex: 'last_updated',
    },
    {
      title: 'Remove ?',
      dataIndex: 'delete_placeholder',
      render: (text, record) => (
        <Popconfirm
          title="Are you sure you want to delete this file?"
          okText="Delete"
          okType="danger"
          cancelText="Cancel"
          onConfirm={() => handleFileDelete(record.filename)}
        >
          <a>Delete</a>
        </Popconfirm>
      ),
    },
  ];

  const updatedUploadedFiles = uploadedFiles.map((data, index) => ({
    ...data,
    key: index.toString(),
  }));

  const tableTitle = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px' }}>
      <h3>
        {currentCollectionName === ''
          ? 'Please click the button to refresh table details'
          : `Collection Contents: "${currentCollectionName}"`
        }
      </h3>
      <Button type="primary" onClick={handleRefresh}>
        Refresh File List
      </Button>
    </div>
  );

  const tableFooter = () => null;

    const loadSettings = () => {
      axiosInstance(token)
        .get(`${API_ENDPOINTS.collections}?nskey=${selectedCollectionKey}&uid=${uid}`)
        .then((response) => {
  
          const chunk_size = response.data.data.chunk_size;
          const overlap = response.data.data.overlap; 
          setChunkSize(chunk_size);
          setOverlap(overlap);
        })
        .catch((error) => {
          console.log(error);
          notification.error({
            message: 'Error',
            description: 'Failed to fetch collection details. Please try again later.',
          });
        });
    };

    const saveSettings = () => {
      axiosInstance(token)
        .patch(`${API_ENDPOINTS.collectionsIngest}/docs?nskey=${selectedCollectionKey}&uid=${uid}&chunk=${chunkSize}&overlap=${overlap}`)
        .then((response) => {
          console.log('Settings updated successfully');
          // You can show a success message or perform any additional actions here
        })
        .catch((error) => {
          console.log(error);
          notification.error({
            message: 'Error',
            description: 'Failed to update collection settings. Please try again later.',
          });
        });
    };

    const onSearch = (value: string) => {
      console.log('search:', value);
    };


  return (
    <div className={styles.mainContainer}>
      <div>
        <Row gutter={18} height={'100%'}>
          <Col span={12} height={'100%'} width={'100%'} align={'center'}>
            <Card bordered hoverable >
              <Tabs size="large">
                <Tabs.TabPane tab={<h3>Select Namespace</h3>} key="1">
                  <Card
                    actions={[
                      <Button type="primary" onClick={createCollection}> New </Button>,
                      <Button onClick={renameCollection}> Rename </Button>,
                      <Popconfirm
                        title="Are you sure you want to delete the collection?"
                        okText="Delete"
                        okType="danger"
                        cancelText="Cancel"
                        onConfirm={deleteCollection}
                      >
                        <Button danger > Delete </Button>
                      </Popconfirm>
                    ]}
                    >
                    <Select
                      showSearch
                      onSearch={onSearch}
                      optionFilterProp="children"  
                      style={{ width: '85%' }}
                      value={selectedCollectionKey}
                      onChange={(value) => setSelectedCollectionKey(value)}
                      align={'left'}
                    >
                      <Option value="">Select Namespace</Option>
                      {collections.map((collection) => (
                        <Option key={collection.key} value={collection.key}>
                          {collection.label}
                        </Option>
                      ))}
                    </Select>
                    </Card>
                 
                </Tabs.TabPane>
                <Tabs.TabPane tab={<h3>Namespace Settings</h3>} key="2">
                <Card
                  size='small'
                  align='left'
                  actions={[
                    <Button size='small' onClick={loadSettings}>Load Settings</Button>,
                    <Button size='small' onClick={saveSettings}>Reprocess Vectors</Button>
                  ]}
                >
                   <Space direction="horizontal" size="large"> 
                   <Text className={styles.label}>Chunk Size:</Text>
                      <Input
                        style={{ width: '40%' }}
                        value={chunkSize}
                        onChange={(e) => setChunkSize(e.target.value)}
                      />
                      <Text className={styles.label}>Overlap:</Text>
                      <Input
                        style={{ width: '40%' }}
                        value={overlap}
                        onChange={(e) => setOverlap(e.target.value)}
                      />
                    </Space>
                    
                </Card>
                </Tabs.TabPane>
              </Tabs>
            </Card>
          </Col>
          <Col span={12}>
          <Card
            className="flexible-card"
            bordered
            hoverable
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <Tabs defaultActiveKey="1" onChange={onChange} size={"large"}>
              <Tabs.TabPane tab={<h3>File Upload</h3>} key="1">
                <div className="drag">
                  <Drag
                    selectedCollectionKey={selectedCollectionKey}
                    setSelectedCollectionKey={setSelectedCollectionKey}
                  />
                </div>
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </Col>
        </Row>
      </div>
      <div>
        {isLoading ? (
          <Spin size="large" />
        ) : (
          <Row justify="space-around" align="middle">
            <Col span={24} push={0.5}>
              <Card bordered hoverable>
                {uploadedFiles && (
                  <Table
                    dataSource={updatedUploadedFiles}
                    pagination={false}
                    bordered
                    hoverable
                    columns={columns}
                    title={tableTitle}
                    footer={tableFooter}
                    size="small"
                  />
                )}
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
}

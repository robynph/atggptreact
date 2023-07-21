import React, { useState, useContext, useCallback, useEffect } from 'react';
import { Button, Card, Divider, Table, Space, Modal, Input, Select, notification, Popconfirm, message, Row, Col, Spin, Typography } from 'antd';
import axiosInstance from '../../Components/axiosInstance';
import API_ENDPOINTS from '../../apiConfig';
import { UserContext } from '../UserContext';

const { Option } = Select;

const ReportSetup = ({
  selectedCollectionKey,
  collections,
  reports,
  fetchReports,
  setCurrentStep,
  setSelectedCollectionKey,
  selectedReportKey,
  setSelectedReportKey,
  selectedReport,
  setSelectedReport,
  reportLoading,
  ...otherProps
}) => {
  const { uid } = useContext(UserContext);
  const { token } = useContext(UserContext);

  // const [loading, setLoading] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [reportName, setReportName] = useState('');
  const [collectionKey, setCollectionKey] = useState('');
  const [description, setDescription] = useState('');

  const [reportEditing, setReportModalEditing] = useState(false);
  const [questionEditing, setQuestionModalEditing] = useState(false);
  const [editReportKey, setEditReportKey] = useState(null);
  const [editDescription, setEditDescription] = useState(null);

  const [questionInput, setQuestionInput] = useState('');
  const [filteredInfo, setFilteredInfo] = useState({});
  
  const { Option } = Select;


  useEffect(() => {
    console.log('reports prop in ReportSetup:', reports);
  }, [reports]);

  const handleChange = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    setFilteredInfo(filters);
  };
  const clearFilters = () => {
    setFilteredInfo({});
  };

  const showReportModal = () => {
    setReportModalVisible(true);
    setReportName(''); // Set default value for report name
    setCollectionKey(''); // Set default value for collection key
    setDescription(''); // Set default value for description
  };


  const handleReportModalOk = () => {
    console.log(`${API_ENDPOINTS.reports}?uid=${uid}&reportkey=${editReportKey}&newreportname=${reportName}&nskey=${collectionKey}`)
    console.log(description)
    if (reportEditing) {
      // PATCH API call for updating report      
      axiosInstance(token)
        .patch(`${API_ENDPOINTS.reports}?uid=${uid}&reportkey=${editReportKey}&newreportname=${reportName}&nskey=${collectionKey}`,
        {
          description: description
        }
        )
        .then((response) => {
          fetchReports();
          setReportModalVisible(false);
          setReportModalEditing(false);
          notification.success({ message: 'Report updated successfully' });
        })
        .catch((error) => {
          notification.error({ message: 'Error', description: 'Failed to update report' });
        });
    } else {
      // POST API call for creating report
      axiosInstance(token)
        .post(`${API_ENDPOINTS.reports}?uid=${uid}&reportname=${reportName}&nskey=${collectionKey}`,
        {
          description: description
        })
        .then((response) => {
          fetchReports();
          setReportModalVisible(false);
          notification.success({ message: 'Report created successfully' });
        })
        .catch((error) => {
          notification.error({ message: 'Error', description: 'Failed to create report' });
        });
    }
  };

  const handleQuestionModalOk = () => {
    setQuestionModalVisible(false);
    setQuestionModalEditing(false);
  };

  const handleQuestionModalCancel = () => {
    setQuestionModalVisible(false);
    setQuestionModalEditing(false);
  };


  const handleReportModalCancel = () => {
    setReportModalVisible(false);
    setReportModalEditing(false);
  };

  const handleDelete = (reportKey) => {
    // DELETE API call for deleting report
    axiosInstance(token)
      .delete(`${API_ENDPOINTS.reports}?uid=${uid}&reportkey=${reportKey}`)
      .then((response) => {
        fetchReports();
        notification.success({ message: 'Report deleted successfully' });
      })
      .catch((error) => {
        notification.error({ message: 'Error', description: 'Failed to delete report' });
      });
  };

  const handleReportEdit = (record) => {
    setReportName(record.label);
    setCollectionKey(record.nskey);
    setEditReportKey(record.key);
    console.log('handleReportEdit key:', record.key); 
    setDescription(record.description);
    setReportModalEditing(true);
    setReportModalVisible(true);
  };

  const handleQuestionEdit = (record) => {
    setReportName(record.label);
    setEditReportKey(record.key);
    console.log('handleQEdit key:', record.key); 
    setQuestionInput('');
    setQuestionModalEditing(true);
    setQuestionModalVisible(true);
  };

  const handleReportPreview = (record) => {
    setReportName(record.label);
    setEditReportKey(record.key);
    setSelectedReportKey(record.key);
    setSelectedReport(record.label);
    setCurrentStep(1);
  };

  const columns = [
    {
      title: 'Report',
      dataIndex: 'label',
      filteredValue: filteredInfo.label || null,
      onFilter: (value, record) => record.label.includes(value),
      ellipsis: true,
    },
    {
      title: 'Collection',
      dataIndex: 'nsname',
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Question Count',
      dataIndex: 'question_count',
      align: 'center',
      width: 50,
    },
      {
        title: 'Actions',
        width: 100,
        align: 'center',
        render: (text, record) => {
          console.log('Actions render for record:', record);
          return (
            <span>
              <Space>
                <Button size="small" onClick={() => handleReportPreview(record)}>Preview</Button>
                <Button size="small" onClick={() => handleReportEdit(record)}>Edit</Button>
                <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
                  <Button size="small">Delete</Button>
                </Popconfirm>
                <Button size="small" onClick={() => handleQuestionEdit(record)}>Update Questions</Button>
              </Space>
            </span>
          );
        },
      },
  ];

  const loadQuestions = () => {
    axiosInstance(token)
    .get(`${API_ENDPOINTS.reports}/questions?uid=${uid}&reportkey=${selectedReportKey}`)
    .then((response) => {
      console.log('API response:', response.data.data.questions);

      const questions = response.data.data.questions;
      console.log('Questions:', questions);

      let formattedQuestions = '';

      for (const question of questions) {
        if (formattedQuestions !== '') {
          formattedQuestions += '\n\n';
        }

        formattedQuestions += `Header: ${question.header}\n${question.question_detail}`;
      }

      setQuestionInput(formattedQuestions);
    })
    .catch((error) => {
      // Handle the error
      console.log('API error:', error);
    });
};


  const handleQuestionInputChange = useCallback((e) => { 
    setQuestionInput(e.target.value);

    }, []);

    
    const updateQuestions = () => {
      console.log("this is ", editReportKey);
    
      const lines = questionInput.split('\n');
      const questions = [];
      let header = '';
    
      for (const line of lines) {
        if (line.startsWith('Header:')) {
          header = line.slice('Header:'.length).trim();
        } else {
          const question = line.trim();
          if (question !== '') {
            questions.push({
              question,
              header,
              interaction_flag: 'agent',
              order: questions.length + 1,
              feedback: false,
            });
          }
        }
      }
    
      const payload = {
        questions,
      };
    
      // Make the API request to send the payload
      axiosInstance(token)
        .post(`${API_ENDPOINTS.reports}/questions?uid=${uid}&reportkey=${editReportKey}`, payload)
        .then((response) => {
          // Handle the response
          console.log('API response:', response.data);
          message.success('Questions updated successfully');
        })
        .catch((error) => {
          // Handle the error
          console.log('API error:', error);
        });
    };
    


    
 

  return (
  
   <div>
      <Row gutter={2} justify="space-between" align="middle">
      <Col span={24} style={{ textAlign: 'right' }}>
        <Card>
        <Spin spinning={reportLoading} tip="Fetching reports!">
        <div>
          <div style={{ marginBottom: '20px' }}>
          <Space direction="horizontal" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="default" onClick={fetchReports} style={{ marginLeft: '10px' }}>Refresh</Button>
            <Button type="primary" onClick={showReportModal}>Create Report</Button>
          </Space>
          </div>
          <div>
           <Table 
            scroll={{ x: 'max-content'}}
            columns={columns} 
            bordered
            dataSource={reports} 
         
            rowKey="key" 
            />
              </div>
            </div>
            </Spin>
          </Card>
        </Col>
      </Row>
     <Modal
        title={reportEditing ? `Edit Details for ${reportName}` : 'Create Report'}
        visible={reportModalVisible}
        width={"40%"}
        onOk={handleReportModalOk}
        onCancel={handleReportModalCancel}
>
        <Divider />
        <Typography.Text>Report Name</Typography.Text>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="Report Name"
            value={reportName}
            onChange={e => setReportName(e.target.value)}
          />
          <Typography.Text>Report Description</Typography.Text>
          <Input
            placeholder="Report Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <Divider />
          <Typography.Text>Select collection</Typography.Text>
          <Select
            placeholder="Select collection"
            value={collectionKey}
            style={{ width: '100%' }}
            onChange={value => setCollectionKey(value)}
          >
            {collections.map((collection) => (
              <Option key={collection.key} value={collection.key}>
                {collection.label}
              </Option>
            ))}
          </Select>
        </Space>
      </Modal>
      <Modal
        title={`Update Questions for ${reportName}`}
        visible={questionModalVisible}
        onOk={handleQuestionModalOk}
        onCancel={handleQuestionModalCancel}
        size="large"
        width={"60%"}
      >
        <div>                        
                <br></br>
                    <Card 
                        size="middle"
                        hoverable
                        align="center"
                        actions={[
                            <Button >New from Template</Button>,
                            <Button onClick={loadQuestions}>Load Existing Questions</Button>,
                            <Button onClick={updateQuestions}>Save Questions</Button>
                            
                        ]}
                    >
                        <Input.TextArea
                            rows={8}
                            placeholder="Copy & paste your questions here"
                            onChange={handleQuestionInputChange}
                            value={questionInput}
                        />
                    </Card>
            </div>
        
      </Modal>
    </div>

  );
};

export default ReportSetup;

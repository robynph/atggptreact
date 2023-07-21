import API_ENDPOINTS from '../../../apiConfig';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {Button, Collapse, Card, Space, message, notification, InputNumber, Input, Drawer, Select, Typography, Text, Popconfirm} from 'antd';
import { UserContext } from '../../../Components/UserContext';
import axiosInstance from '../../../Components/axiosInstance'; // Import the axiosInstance function

const { Panel } = Collapse;

const QADrawer = ({
    
    handleModelDetailsSave,
    handleModelDetailsRefresh,
    handleConversationChange,
    handleTemplateChange,

    fetchConversationsData,
    
    selectedTemplateKey,
    setSelectedTemplateKey,
    selectedTemplate,

    selectedConversationKey,
    setSelectedConversationKey,

    updatedTemperature,
    setUpdatedTemperature,
    updatedModel,
    setUpdatedModel,
    updatedK,
    setUpdatedK,

    templates,
    conversations,

    promptTemplate,
    inputValues,
    setInputValues,
    
    ...otherProps
  }) => {
    const { uid } = useContext(UserContext);
    const { token } = useContext(UserContext);
    const { Option } = Select;
   
  
    const createConversation = () => {
      const convoname = prompt('Enter a name for the new conversation:');

      if (convoname) {
        axiosInstance(token)
          .post(`${API_ENDPOINTS.conversations}?uid=${uid}&convoname=${convoname}`)
          .then((response) => {
            console.log('Conversation created ', response.data);
            fetchConversationsData();
            if (response.data && response.data.data) {
              const newConversationKey = response.data.data;
              setSelectedConversationKey(newConversationKey);
              console.log('New conversation key: ', newConversationKey);
              message.success('Conversation created successfully!');
            } else {
              console.log('Unexpected response structure:', response.data);
            }
          })
          .catch((error) => {
            console.log(error);
            console.log(error.response.data.message);
            notification.error({
              message: 'Error',
              description: 'Failed to create conversation. Please try again later.',
            });
          });
      }
    };
  
    const renameConversation = () => {
      const newLabel = prompt(`Enter a new name for ${selectedConversationKey}:`);
      if (newLabel) {
        axiosInstance(token)
          .patch(`${API_ENDPOINTS.conversations}?uid=${uid}&convokey=${selectedConversationKey}&convonew=${newLabel}`)
          .then((response) => {
            console.log(`Conversation ${selectedConversationKey} renamed to ${newLabel}`);
            message.success('Conversation renamed successfully!');
            fetchConversationsData();
          })
          .catch((error) => {
            console.log(error);
            console.log(error.response.data.message);
            notification.error({
              message: 'Error',
              description: 'Failed to rename conversation. Please try again later.',
            });
          });
      }
    };
  
    const deleteConversation = () => {
      axiosInstance(token)
        .delete(`${API_ENDPOINTS.conversations}?uid=${uid}&convokey=${selectedConversationKey}`)
        .then((response) => {
          console.log('Conversation deleted ', response.data);
          message.success('Conversation deleted successfully!');
          fetchConversationsData();
        })
        .catch((error) => {
          console.log(error);
          console.log(error.response.data.message);
          notification.error({
            message: 'Error',
            description: 'Failed to delete conversation. Please try again later.',
          });
        });
    };

    const onSearch = (value: string) => {
      console.log('search:', value);
    };


    return (
       <div>
          <br></br>
        <Card 
          hoverable size="small" 
          align="left" 
          className="custom-card" 
          title="Select template"
          extra={[
            <Button size="small" onClick={handleModelDetailsSave}>Save</Button>,
            <Button size="small" onClick={handleModelDetailsRefresh}>Refresh</Button>
        ]}
        >
          <div>
            <Select           
                showSearch
                onSearch={onSearch}
                optionFilterProp="children"
                style={{ width: '100%' }} 
                value={selectedTemplateKey} 
                onChange={handleTemplateChange}>
              <Option value="">Select Template</Option>
              {templates.map((template) => (
                <Option key={template.key} value={template.key}>
                  {template.label}
                </Option>
              ))}
            </Select>
          </div>
          <Collapse
            bordered={false}
            size="small"
            style={{ width: '95%' }}
            
            >
            <Panel
              size="small"
              align="center"
              header={selectedTemplateKey ? (
                <Typography.Text>Update model details for {selectedTemplate}</Typography.Text>
              ) : (
                <label>Select a template to update model properties</label>
              )}
              key="1">
              <Card 
                size="small" 
                type="inner" 
                key="2" 
                style={{ width: '100%' }} 
                >
                <Card className="custom-card"  title="Update Temperature" size="small">
                  <Space direction="vertical" size="small">
                    <Space.Compact>
                      <InputNumber
                        style={{ width: '100%' }}
                        value={updatedTemperature}
                        onChange={(value) => setUpdatedTemperature(value)}
                        maxLength={5}
                        step={0.1}
                      />
                    </Space.Compact>
                  </Space>
                </Card>
                <Card className="custom-card"  title="Update Model" size="small">
                  <Space direction="vertical" size="small">
                    <Space.Compact>
                      <Input
                        style={{ width: '100%' }}
                        value={updatedModel}
                        onChange={(e) => setUpdatedModel(e.target.value)}
                        allowClear={true}
                      />
                    </Space.Compact>
                  </Space>
                </Card>
                <Card className="custom-card"  title="Update K Sources" size="small">
                  <Space direction="vertical" size="small">
                    <Space.Compact>
                      <InputNumber
                        style={{ width: '100%' }}
                        value={updatedK}
                        onChange={(value) => setUpdatedK(value)}
                        allowClear={true}
                        maxLength={5}
                        step={1}
                        min={1}
                        max={15}
                      />
                    </Space.Compact>
                  </Space>
                </Card>
                {Array.isArray(promptTemplate?.input_variables) && promptTemplate.input_variables.length > 0 && (
                <Card className="custom-card" title="Update Variables" size="small">
                  <div>
                    {/* Render the input boxes dynamically if input_variables exist */}
                    {promptTemplate.input_variables.map((variable) => (
                      <Space direction="vertical" size="small" key={variable}>
                        <div align="left">
                          <label htmlFor={variable}>{variable}</label>
                          <Input
                            value={inputValues[variable] || ''}
                            onChange={(e) => setInputValues({ ...inputValues, [variable]: e.target.value })}
                            placeholder={variable}
                          />
                        </div>
                      </Space>
                    ))}
                  </div>
                </Card>
                )}
              </Card>
              </Panel>
            </Collapse>
            </Card>
            <br></br>
        <Card
          hoverable
          
          size="small"
          className="custom-card"
          title="Select conversation"
          align="left"
          actions={[
            <Button type="primary" size="small" onClick={createConversation}>
              Create
            </Button>,
            <Button size="small" onClick={renameConversation}>
              Rename
            </Button>,
            <Popconfirm
              title="Are you sure you want to delete the collection?"
              okText="Delete"
              okType="danger"
              cancelText="Cancel"
              onConfirm={deleteConversation}
            >
              <Button danger size="small">
                Delete
              </Button>
            </Popconfirm>,
          ]}
        >
          <Select
            showSearch
            onSearch={onSearch}
            optionFilterProp="children"
            style={{ width: '100%' }}
            value={selectedConversationKey}
            onChange={handleConversationChange}
          >
            <Option value="Bypass">Memory bypass - no conversation</Option>
            {conversations.map((conversation) => (
              <Option key={conversation.key} value={conversation.key}>
                {conversation.label}
              </Option>
            ))}
          </Select>
        </Card>
      </div>
    );
  };
  
  export default QADrawer;
  
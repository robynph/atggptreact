
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {Button, Card, Space, message, notification, InputNumber, Input, Drawer, Select, Typography, Text, Popconfirm} from 'antd';
import { UserContext } from '../../../Components/UserContext';


import QADrawer from './QADrawer';
import SummaryDrawer from './SummaryDrawer';
import TabularDrawer from './TabularDrawer';

const ModelPropertiesDrawer = ({ 
    visible,
    onClose,
    selectedTab,
    
    handleModelDetailsSave,
    handleModelDetailsRefresh,
    handleConversationChange,
    handleTemplateChange,
    handleCollectionChange,

    fetchConversationsData,

    setSelectedCollectionKey,
    selectedCollectionKey,
    selectedCollection,
    setSelectedCollection,
    
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
    collections,

    promptTemplate,
    inputValues,
    setInputValues,
    
    ...otherProps
}) => {

   const { uid } = useContext(UserContext);
   const { token } = useContext(UserContext);
   const { Text } = Typography;
   const { Option } = Select;

  
   useEffect(() => {
    if (visible) {
      console.log('This is the selected tab:', selectedTab);

    }
  }, [visible, selectedTab]);

  const onSearch = (value: string) => {
    console.log('search:', value);
  };


      const CommonCard = (
        <Card
            className='custom-card'
            title="Select collection"
            hoverable
            size="small"
            >
            <div>
                <h3>
                    <label></label>
                </h3>
                <Select
                    showSearch
                    onSearch={onSearch}
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                    value={selectedCollectionKey} 
                    onChange={handleCollectionChange}
                >
                    <Option value=''>Select Namespace</Option>
                    {collections.map((collection) => (
                    <Option key={collection.key} value={collection.key}>
                        {collection.label}
                    </Option>
                    ))}
                </Select>
                <br></br>
            </div>
        </Card>
       
      );

  return (
    <Drawer
      title="Model Properties"
      key="ModelPropertiesDrawer"
      placement="right"
      closable={true}
      onClose={onClose}
      open={visible}
      width={window.innerWidth <= 768 ? '100%' : '50%'}
    >
      {/* Drawer settings that are common across all tabs */}
      {CommonCard}

      {/* Drawer settings for the first tab - Q&A */}
      {(!selectedTab || selectedTab === '1') && (
        <QADrawer
          conversations={conversations}
          selectedConversationKey={selectedConversationKey}
          setSelectedConversationKey={setSelectedConversationKey}
          handleModelDetailsSave={handleModelDetailsSave}
          handleModelDetailsRefresh={handleModelDetailsRefresh}
          handleTemplateChange={handleTemplateChange}
          handleConversationChange={handleConversationChange}
          fetchConversationsData={fetchConversationsData}
          updatedTemperature={updatedTemperature}
          setUpdatedTemperature={setUpdatedTemperature}
          updatedModel={updatedModel}
          setUpdatedModel={setUpdatedModel}
          updatedK={updatedK}
          setUpdatedK={setUpdatedK}
          templates={templates}
          promptTemplate={promptTemplate}
          inputValues={inputValues}
          setInputValues={setInputValues}
          selectedTemplateKey={selectedTemplateKey}
          setSelectedTemplateKey={setSelectedTemplateKey}
          selectedTemplate={selectedTemplate}
        ></QADrawer>
      )}

      {/* Drawer settings for the second tab - Summary */}
      {selectedTab === '2' && (
        <SummaryDrawer
          selectedTemplateKey={selectedTemplateKey}
          selectedCollectionKey={selectedCollectionKey}
          selectedCollection={selectedCollection}
        ></SummaryDrawer>
      )}

      {/* Drawer settings for the third tab - Tabular */}
      {selectedTab === '3' && (
        <TabularDrawer>
          selectedCollectionKey={selectedCollectionKey}
          selectedCollection={selectedCollection}
        </TabularDrawer>
      )}
    </Drawer>
  )
};

export default ModelPropertiesDrawer;
import API_ENDPOINTS from '../apiConfig';

import React, { useState, useEffect, useContext, useCallback } from 'react';
import {Card, Col, Row, Tabs, Button, message, notification } from 'antd';
import axiosInstance from '../Components/axiosInstance'; 
import { UserContext } from '../Components/UserContext';

import styles from '../styles/Interactions.module.css';

import QA from '../Components/Interactions/QA';
import Summary from '../Components/Interactions/Summary';
import Tabular from '../Components/Interactions/Tabular';
import ModelPropertiesDrawer from '../Components/Interactions/ModelPropertiesDrawer/ModelPropertiesDrawer';



const { TabPane } = Tabs;

  const Interactions = (
  ) => {

    const { uid } = useContext(UserContext);
    const { token } = useContext(UserContext);
    
    const [collections, setCollectionList] = useState([]);
    const [templates, setTemplateList] = useState([]);
    const [conversations, setConversations] = useState([]);

    const [selectedCollectionKey, setSelectedCollectionKey] = useState(collections.length > 0 ? collections[0].key : '');
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [selectedTemplateKey, setSelectedTemplateKey] = useState(templates.length > 0 ? templates[0].key : '');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [selectedConversationKey, setSelectedConversationKey] = useState(conversations.length > 0 ? conversations[0].key : '');
    const [selectedConversation, setSelectedConversation] = useState(null);

    // need to remove unnecessary states
    const [resultloading, setResultLoading] = useState(false);
    const [qaloading, setQALoading] = useState(false);
    const [question, setQuestion] = useState('');
    const [results, setResults] = useState([]);
    const [sources, setSources] = useState([]);
    const [QASummary, setQASummary] = useState('');

    const [updatedTemperature, setUpdatedTemperature] = useState('');
    const [updatedModel, setUpdatedModel] = useState('');
    const [updatedK, setUpdatedK] = useState('');

    const [selectedTab, setSelectedTab] = useState('1');
    const [drawerVisible, setDrawerVisible] = useState(false);

    const [promptTemplate, setPromptTemplate] = useState({});
    const [inputValues, setInputValues] = useState({});
 
       
    const showDrawer = () => {
      setDrawerVisible(true);
    };
  
    const handleDrawerClose = () => {
      setDrawerVisible(false);
    };

    const handleTabChange = (key) => {
      setSelectedTab(key);
    };

    // COLLECTIONS

    useEffect(() => {
     
      const fetchCollectionList = async () => {
      try {
          const response = await axiosInstance(token).get(
              `${API_ENDPOINTS.collections}?uid=${uid}`
              );  
          setCollectionList(response.data.data);  
      } catch (error) {
          console.log(error);
          // Display error notification to the user
          notification.error({
          message: 'Error',
          description: 'Failed to fetch collections. Please try again later.',
          })
      }
  };
       fetchCollectionList();
  }, [selectedTab]); 
  
  
      const handleCollectionChange = useCallback((value) => {
          setSelectedCollectionKey(value);
        
          const selectedCollectionObj = collections.find(
            (collection) => collection.key === value
          );
          if (selectedCollectionObj) {
            setSelectedCollection(selectedCollectionObj.label);
          }
        }, [collections]);


        // CONVERSATIONS

       const fetchConversationsData = useCallback(async () => {
          try {
            const response = await axiosInstance(token).get(`${API_ENDPOINTS.conversations}`, {
              params: {
                uid: uid,
              },
            });
            if (response.data && Array.isArray(response.data.data)) {
              setConversations(response.data.data);
            } else {
              throw new Error('Unexpected data structure');
            }
          } catch (error) {
            console.log(error);
            notification.error({
              message: 'Error',
              description: 'Failed to fetch conversations. Please try again later.',
            });
          }
        }, [uid]);
      
        useEffect(() => {
          fetchConversationsData();
        }, [fetchConversationsData]);
      
        
        const handleConversationChange = (value, option) => {
          setSelectedConversationKey(value); 
       
          const selectedConversationObj = conversations.find((conversation) => conversation.key === value);
          if (selectedConversationObj) {
            setSelectedConversation(selectedConversationObj.label);
            console.log(selectedConversation)
          }
        };
      
        // TEMPLATES

                const handleTemplateChange = (value, option) => {
          setSelectedTemplateKey(value);
    
          const selectedTemplateObj = templates.find((template) => template.key === value);
          if (selectedTemplateObj) {
            setSelectedTemplate(selectedTemplateObj.label);
          }
        };
    
        useEffect(() => {
          if (selectedTemplateKey) {
            handleModelDetailsRefresh();
          }
        }, [selectedTemplateKey]);


        useEffect(() => {
          const fetchTemplateList = async () => {
            try {
              const response = await axiosInstance(token).get(`${API_ENDPOINTS.templates}`, {
                params: {
                  uid: uid,
                },
              });
              if (response.data && Array.isArray(response.data.data)) {
                setTemplateList(response.data.data);
              } else {
                throw new Error('Unexpected data structure');
              }
            } catch (error) {
              console.log(error);
              notification.error({
                message: 'Error',
                description: 'Failed to fetch templates. Please try again later.',
              });
            }
          };
          fetchTemplateList();
        }, [selectedTab, uid]);
      


        // MODEL CHANGE
  
        const handleModelDetailsRefresh = async () => {
          if (selectedTemplateKey) {
            
              try {
              // Fetch model details
              const response = await axiosInstance(token).get(
                  `${API_ENDPOINTS.templates}/details?uid=${uid}&templatekey=${selectedTemplateKey}`
              );
              if (response.data && response.data.data) {
        
                setPromptTemplate(response.data.data.template_details.prompt_template);
                if (response.data.data.user_input_var) {
                  setInputValues(response.data.data.user_input_var);
                } else {
                  setInputValues({});
                }
                setUpdatedTemperature(response.data.data.temperature);
                setUpdatedModel(response.data.data.model);
                setUpdatedK(response.data.data.k);
                message.success('Model details refreshed successfully!');
              } else {
                throw new Error('Unexpected data structure');
              }
              } catch (err) {
              console.error(err);
              message.error('Failed to refresh model details. Please make sure a template is selected first!');
              }
          } else {
              message.warning('Please select a template first before refreshing');
          }
          };

          const handleModelDetailsSave = async () => {

              try {
                
              await axiosInstance(token).patch(
                  `${API_ENDPOINTS.templates}/details?uid=${uid}&templatekey=${selectedTemplateKey}&newtemp=${updatedTemperature}&newmodel=${updatedModel}&newk=${updatedK}`,
                  { "input_variables": inputValues }
              );
          
              // Fetch the updated temperature after saving
              const response = await axiosInstance(token).get(
                  `${API_ENDPOINTS.templates}/details?uid=${uid}&templatekey=${selectedTemplateKey}`
              );
              setUpdatedTemperature(response.data.data.temperature);
              setUpdatedModel(response.data.data.model);
              setUpdatedK(response.data.data.k);
              setPromptTemplate(response.data.data.template_details.prompt_template);
              message.success('Model details saved successfully!');
              } catch (err) {
              console.error(err);
              message.error('Failed to save model details. Please make sure a template is selected first!');
              }
          };

          return (
            <div className={styles.mainContainer}>
              <div>
                <Row gutter={20}>
                  {/*  Section 1 */}
                  <Col span={24}>
                    <Card hoverable>
                      <Tabs
                        size="large"
                        tabPosition="top"
                        defaultActiveKey="1"
                        onChange={handleTabChange}
                        tabBarExtraContent={
                          <Button type="primary" onClick={showDrawer}>
                            Open Model Properties
                          </Button>
                        }
                      >
                        <TabPane tab="Q&A Docs" key="1">
                          <QA
                            selectedCollectionKey={selectedCollectionKey}
                            selectedTemplateKey={selectedTemplateKey}
                            selectedConversationKey={selectedConversationKey}
                            selectedTemplate={selectedTemplate}
                            selectedCollection={selectedCollection}
                            selectedConversation={selectedConversation}
                            question={question}
                            setQuestion={setQuestion}
                            resultloading={resultloading}
                            results={results}
                            sources={sources}
                            qaloading={qaloading}
                            QASummary={QASummary}
                            updatedTemperature={updatedTemperature}
                            updatedModel={updatedModel}
                            updatedK={updatedK}
                            promptTemplate={promptTemplate}
                            inputValues={inputValues}
                          ></QA>
                        </TabPane>
                        {/* <TabPane tab="Summary" key="2">
                          <Summary
                            selectedCollectionKey={selectedCollectionKey}
                            selectedCollection={selectedCollection}
                            selectedTemplateKey={selectedTemplateKey}
                            selectedTemplate={selectedTemplate}
                          ></Summary>
                        </TabPane> */}
                      </Tabs>
                    </Card>
                  </Col>
     
              {selectedTab && <ModelPropertiesDrawer 
                    visible={drawerVisible} 
                    onClose={handleDrawerClose} 

                    selectedTab={selectedTab} 
                    setSelectedTab={setSelectedTab}
                    
                    selectedCollectionKey={selectedCollectionKey}
                    selectedCollection={selectedCollection}
                    selectedTemplateKey={selectedTemplateKey}
                    selectedTemplate={selectedTemplate}
                    selectedConversationKey={selectedConversationKey}
                    selectedConversation={selectedConversation} 
                    
                    setSelectedConversationKey={setSelectedConversationKey}
                    
                    collections={collections}
                    templates={templates}
                    conversations={conversations}
 
                    handleConversationChange={handleConversationChange}
                    handleTemplateChange={handleTemplateChange}
                    handleCollectionChange={handleCollectionChange}
                    handleModelDetailsRefresh={handleModelDetailsRefresh}
                    handleModelDetailsSave={handleModelDetailsSave}

                    fetchConversationsData={fetchConversationsData}

                    updatedTemperature={updatedTemperature}
                    setUpdatedTemperature={setUpdatedTemperature}
                    updatedModel={updatedModel}
                    setUpdatedModel={setUpdatedModel}
                    updatedK={updatedK}
                    setUpdatedK={setUpdatedK}

                    promptTemplate={promptTemplate}
                    inputValues={inputValues}
                    setInputValues={setInputValues}

                  />}
            </Row>
          </div>
        </div>
    )
  };
    
    export default Interactions;

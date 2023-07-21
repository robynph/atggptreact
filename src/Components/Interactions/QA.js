import API_ENDPOINTS from '../../apiConfig';
import React, { useState, useEffect, useContext } from 'react';
import {Button, Typography, Text, Spin, Collapse, Card, Space, message, notification, Popconfirm, Input, List } from 'antd';
import { UserContext } from '../../Components/UserContext';
import axiosInstance from '../../Components/axiosInstance'; // Import the axiosInstance function


const { Panel } = Collapse;
const {TextArea} = Input;
const { Link } = Typography

const QA = ({ 
  selectedCollectionKey, 
  selectedTemplateKey, 
  selectedConversationKey,

  selectedCollection,
  selectedTemplate,
  selectedConversation,

  updatedTemperature,
  updatedModel,
  updatedK,
  promptTemplate,
  inputValues
}) => {

    const { uid } = useContext(UserContext);
    const { token } = useContext(UserContext);
    const { Text } = Typography;

    /* SECTION 1 */
   
    const [resultloading, setResultLoading] = useState(false);
    const [qaloading, setQALoading] = useState(false);
    const [question, setQuestion] = useState('');
    const [results, setResults] = useState([]);
    const [sources, setSources] = useState([]);
    const [QASummary, setQASummary] = useState('');
      
    const sendQuestion = async () => {
      setResultLoading(true); // Set loading state to true
       console.log('This is the selected convo key:', selectedConversationKey);
      
      try {
        if (selectedCollectionKey==='') {
          message.warning('Please select a collection using "Model Properties"!');
          return;
        }
        if (selectedTemplateKey==='') {
          message.warning('Please select a template using "Model Properties"!');
          return;
        }
        if (selectedConversationKey==='') {
          message.warning('Please select a conversation using "Model Properties"!');
          return;
        }
        if (!question) {
          message.warning('Please submit a question!');
          return;
        }
        let url = `${API_ENDPOINTS.interactions}/qa?uid=${uid}&tempkey=${selectedTemplateKey}&nskey=${selectedCollectionKey}&convokey=${selectedConversationKey}`;
        const response = await axiosInstance(token).post(url, {
          query: question,
        });
    
        console.log('This is the Response:', response.data);
        console.log('This is the query:', response.data.task.query);
        console.log('This is the result:', response.data.task.result);
        console.log('This is the sources:', response.data.task.sources);
    
        // Update the results area with the response data
        setResults(response.data.task.result);
        message.success('Message sent and results received');
        // Update the sources panel with the "page_content" and "metadata" arrays
        setSources(response.data.task.sources);
        message.success('Sources updated successfully!');
      } catch (error) {
        console.log(error);
        console.log(error.response.data.message);
    
        // Display error notification to the user
        notification.error({
          message: 'Error',
          description: 'Failed to send question. Please try again later.',
        });
      } finally {
        setResultLoading(false); // Set loading state to false after the request is completed
      }
    };
  

  const fetchQASummary = async () => {
    setQALoading(true); // Set loading state to true
    try {
      const response = await axiosInstance(token).get(`${API_ENDPOINTS.interactions}/qa?uid=${uid}&tempkey=${selectedTemplateKey}&convokey=${selectedConversationKey}`);
      setQASummary(response.data.task);
        console.log('This is the QA Summary response:', response.data);
        console.log('This is the template key:', selectedTemplateKey);
        console.log('This is the conversation key:', selectedConversationKey);
      message.success('QA summary returned successfully!');
    } catch (error) {
      console.log(error);
      // Display error notification to the user
      notification.error({
        message: 'Error',
        description: 'Failed to fetch QA summary. Ensure you have conversation & template selected!',
      });
    } finally {
        setQALoading(false); // Set loading state to false after the request is completed
      }
  };

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
     <Collapse ghost size="small" >
        <Panel align="left" size="small" header="Review conversation details" key="1">
          <Card
            size='small'
            title="Model and Template Details"
          >
            <div>
              <Text strong>Collection Name:</Text> <Text> {selectedCollection}</Text><br></br>
              <Text strong>Template Name:</Text> <Text> {selectedTemplate}</Text><br></br>
              <Text strong>Conversation Name:</Text> <Text> {selectedConversation}</Text><br></br>
              <Text>Temperature: {updatedTemperature}, Model: {updatedModel}, Sources: {updatedK}</Text><br></br>
              {Object.keys(inputValues).length > 0 && (
              <div><Text strong>Input Variables:</Text> <Text> {JSON.stringify(inputValues)}</Text></div>
              )}
            </div>
            <div>
              <Text strong>Prompt:</Text><Text> {promptTemplate.prompt}</Text>
            </div>
          </Card>
          {qaloading ? (
                // Display loading spinner while loading is true
                <Spin size="large" />
          ) : (
          <Card 
            size='small'
            title="Conversation Summary" 
            align="left" 
            hoverable
            extra={[<Button size="small" type="primary" algin="left" onClick={fetchQASummary}>Generate</Button>
                   ]}
            >
           
                        {QASummary}
          </Card>              
        )}
        </Panel>
      </Collapse>
    <Card  hoverable>
      <Card 
        align="left" 
        className="custom-card" 
        title={selectedCollection ? `Question over collection "${selectedCollection}"` : "Select a collection to question over"}>
        <TextArea
            style={{ width: '95%', height: '15%' }}
            placeholder="Write your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            />
            <Button size="small" type="primary" onClick={sendQuestion}>
                Send
            </Button>
       </Card>
       <div>
          {resultloading ? (
            // Display loading spinner while loading is true
            <Spin size="large" />
          ) : (
            <>
              {results.length > 0 && (
                <Card className="custom-card" title="Results" align="left">
                  <Text>{results}</Text>
                  <br></br>
                  <br></br>
                  <Collapse size="small" ghost align="left">
                    <Panel header={<Text strong>Q&A sources</Text>} key="1">           
                      <Collapse size="small" ghost align="left">
                        {sources.map((source, index) => (
                          <Panel
                            size="small"
                            key={index}
                            header={
                              <div>
                                <Typography.Text strong>Source {index + 1}: </Typography.Text>
                                <Link href={source.metadata.source} target="_blank">
                                  {source.metadata.source}
                                </Link>
                              </div>
                            }
                          >
                            <List.Item bordered size="small">
                              <Typography.Text strong>Page Content: </Typography.Text>
                              {source.page_content}
                            </List.Item>
                            <List.Item bordered size="small">
                              <Typography.Text strong>Page No: </Typography.Text>
                              {source.metadata.page} of {source.metadata.pageTotal}
                            </List.Item>
                          </Panel>
                        ))}
                      </Collapse>
                    </Panel>
                  </Collapse>
                </Card>
              )}
            </>
          )}
        </div>
    </Card>
  </Space>
  );
};

export default QA;

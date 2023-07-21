import React, { useContext, useState, useEffect } from 'react';
import { Button, Card, Input, InputNumber, Collapse, Space, Spin, Typography, message, notification } from 'antd';
import { UserContext } from '../../Components/UserContext';
import axiosInstance from '../../Components/axiosInstance';
import API_ENDPOINTS from '../../apiConfig';

const { Text } = Typography;
const { Panel } = Collapse;

const Summary = ({ 
    selectedCollectionKey,
    selectedTemplateKey,
    selectedCollection,
    selectedTemplate,
    ...otherProps
  }) => {
  
  const { uid, token } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [docSummaries, setDocSummaries] = useState('');
  const [docFinalSummary, setDocFinalSummary] = React.useState(null);
  const [inputValue, setInputValue] = useState('');
  const [clusterNum, setClusterNum] = useState(11);
  
  const fetchDocSummaries = async (clusterNum) => {
    setLoading(true);
    try {
      if (selectedCollectionKey==='') {
        message.warning('Please select a collection using "Model Properties"!');
        return;
      }
      const response = await axiosInstance(token).post(
        `${API_ENDPOINTS.interactions}/summary2?uid=${uid}&nskey=${selectedCollectionKey}&clusters=${clusterNum}`
      );
  
      setDocSummaries(response.data.task.summaries);
      message.success('Summaries generated successfully!');
    } catch (error) {
      console.log(error);
      notification.error({
        message: 'Error',
        description: 'Failed to produce summaries. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (docSummaries === null) {
      message.error('Failed to generate summaries. Please try again.');
    }
    if (docFinalSummary === null) {
      message.error('Failed to generate final summary. Please try again.');
    }
  }, [docSummaries, docFinalSummary]);


  const fetchDocFinalSummary = async () => {
    setLoading(true);
    console.log("This is the selectedCollectionKey:", selectedCollectionKey)
    console.log("This is the inputValue:", inputValue)

    try {
      if (selectedCollectionKey==='') {
        message.warning('Please select a collection using "Model Properties"!');
        return;
      }
      const response = await axiosInstance(token).post(
        `${API_ENDPOINTS.interactions}/summary3?uid=${uid}&nskey=${selectedCollectionKey}`,
        {
          query: inputValue,
        }
      );

      console.log("Response data:", response.data);
      setDocFinalSummary(response.data.task.summary);
      console.log("Final Summary:", docFinalSummary);

      message.success('Final summary generated successfully!');
    } catch (error) {
      console.log(error);
      notification.error({
        message: 'Error',
        description: 'Failed to produce final summary. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderParagraphs = (text) => {
    if (typeof text === 'string') {
      const paragraphs = text.split('\n');
      return paragraphs.map((paragraph, index) => (
        <Typography.Paragraph key={index}>{paragraph}</Typography.Paragraph>
      ));
    } else {
      return null;
    }
  };

  React.useEffect(() => {
    console.log("this is the docFinalSummary", docFinalSummary);

  }, [docFinalSummary]);

  const handleClipboardCopy = () => {
    navigator.clipboard
      .writeText(docFinalSummary)
      .then(() => {
        message.success('Text copied to clipboard');
      })
      .catch((error) => {
        message.error('Failed to copy text to clipboard');
        console.error(error);
      });
  };

  const fetchReveiwSummariesJSON = async () => {
    setLoading(true); // Set loading state to true
    try {
      if (selectedCollectionKey==='') {
        message.warning('Please select a collection using "Model Properties"!');
        return;
      }
      const response = await axiosInstance(token).get(`${API_ENDPOINTS.interactions}/summary2?uid=${uid}&nskey=${selectedCollectionKey}`);
      
      if (response.data.task.page_content.length === 0) {
        message.error('Failed to retrieve summaries on file. Please generate summaries.');
        return;
      }

      console.log('This is the Response:', response.data);
      console.log('This is the result:', response.data.task);
  
      // Update the results area with the response data
      setDocSummaries(response.data.task.page_content);
      message.success('Message sent and results received');
    } catch (error) {
      console.log(error);
      console.log(error.response.data.message);
  
      // Display error notification to the user
      notification.error({
        message: 'Error',
        description: 'Failed to retrieve summaries on file. Please try again later.',
      });
    } finally {
      setLoading(false); // Set loading state to false after the request is completed
    }
  };

  const fetchFinalSummaryJSON = async () => {
    setLoading(true); // Set loading state to true
    try {
      if (selectedCollectionKey==='') {
        message.warning('Select a collection using "Model Properties"!');
        return;
      }
      const response = await axiosInstance(token).get(`${API_ENDPOINTS.interactions}/summary3?uid=${uid}&nskey=${selectedCollectionKey}`);
  
      if (response.data.task.page_content.length === 0) {
        message.error('Failed to retrieve final summary on file. Please generate final summary.');
        return;
      }

      console.log('This is the Response:', response.data);
      console.log('This is the result:', response.data.task.page_content);
  
      // Update the results area with the response data
      setDocFinalSummary(response.data.task.page_content);
      message.success('Message sent and results received');
    } catch (error) {
      console.log(error);
      console.log(error.response.data.message);
  
      // Display error notification to the user
      notification.error({
        message: 'Error',
        description: 'Failed to retrieve final summary on file. Please try again later.',
      });
    } finally {
      setLoading(false); // Set loading state to false after the request is completed
    }
  };


  return (
    <div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <div>
            <Card
              hoverable
              // className="custom-card"
              title={selectedCollection ? `Generate Summary for Documents in Collection "${selectedCollection}"` : "Please select a collection to summarize"}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Input
                  style={{ width: '85%' }}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Write a summary within 250 words"
                />
                <Space direction="horizontal" size="small">
                  <div></div>
                  <Button type="primary" size="small" onClick={fetchDocFinalSummary}>Generate</Button>
                  <Button size="small" onClick={fetchFinalSummaryJSON}>Load Existing</Button>
                  <Button size="small" onClick={handleClipboardCopy}>Copy</Button>
                </Space>
              </div>
                  <br></br>
                  <Card ghost className="custom-card" align="left">
                    {renderParagraphs(docFinalSummary)}
                  </Card>
            </Card>
          <Collapse ghost>
           <Panel header={<Text strong>Summary sources</Text>} key="1">
            <Card
              className="custom-card"
              hoverable
              extra={[
                <Space direction="horizontal" size="small">
                   <Text strong>Number of Clusters:   </Text>
                    <InputNumber value={clusterNum} onChange={(value) => setClusterNum(value)} /> 
                   <Button type="primary" size="small" onClick={() => fetchDocSummaries(clusterNum, token, uid, selectedCollectionKey)}>Generate</Button>
                  <Button size="small" onClick={fetchReveiwSummariesJSON}>Load Existing</Button>
                </Space>
              ]}
            >
              <Card align="left" >
                {renderParagraphs(docSummaries)}
              </Card>
            </Card>
            </Panel>
            </Collapse>
        </div>

      )}
    </div>
  );
};

export default Summary;


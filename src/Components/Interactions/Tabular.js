import { Button, Card, Input, Spin, Typography, message, notification } from 'antd';
import { UserContext } from '../../Components/UserContext';
import axiosInstance from '../../Components/axiosInstance';
import API_ENDPOINTS from '../../apiConfig';
import { useRef } from 'react'
import { Line } from '@antv/g2plot'
import axios from 'axios'
import React, { useState, useEffect, useContext } from 'react'
import {Collapse, List } from 'antd'


const Tabular = ({

    selectedCollectionKey, 
    selectedCollection,
    ...otherProps }) => {

    const { uid, token } = useContext(UserContext)

    // const { Panel } = Collapse
    const { TextArea } = Input
    // const { Link } = Typography

    const [resultloading, setResultLoading] = useState(false)
    // const [sources, setSources] = useState([])
    const [questiontab, setQuestionTab] = useState('')
    const [resultstab, setResultsTab] = useState([])
    
    useEffect(() => {
      console.log('This is docSummaries', selectedCollectionKey)
    }, [])

    const sendQuestionTab = async () => {
      setResultLoading(true);
      console.log(selectedCollectionKey);
      console.log(uid);
      try {
        const response = await axiosInstance(token).post(
          `${API_ENDPOINTS.interactions}/tabular1?nskey=${selectedCollectionKey}&uid=${uid}`,
          {
            query: questiontab,
          }
        );
    
        console.log('This is the Response:', response.data);
        console.log('This is the query:', questiontab);
        setResultsTab(response.data.task);
        message.success('Message sent and results received');
    
        // Call renderChart here to load the visual chart
        renderChart();
      } catch (error) {
        console.log(error);
        notification.error({
          message: 'Error',
          description: 'Failed to send question. Please try again later.',
        });
      } finally {
        setResultLoading(false);
      }
    };

    const chartRef = useRef(null)
    const containerRef = useRef(null)  
    useEffect(() => {
      // renderChart()
      return () => {
        if (chartRef.current) {
          chartRef.current.destroy()
          chartRef.current = null
        }
      }
    }, [])


 const renderChart = () => {
  console.log("This is uid", uid);
  console.log("This is selected collection", selectedCollectionKey);
  const url = `https://canurta-s3-docs.s3.amazonaws.com/canurta-gpt-docs/visuals/${uid}/${selectedCollectionKey}/visuals.json`;
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (chartRef.current) {
        console.log(data);
        chartRef.current.destroy();
      }
      if (containerRef.current) {
        const chart = new Line(containerRef.current, {
          data,
          padding: 'auto',
          xField: 'date',
          yField: 'close',
          xAxis: {
            // type: 'timeCat',
            tickCount: 50,
          },
        });
        chart.render();
        chartRef.current = chart;
      }
    });
};
    


    return (
      <div>
          <Card align="left" hoverable title={selectedCollection ? `Query collection "${selectedCollection}"` : "Select a collection to query"}>
            <TextArea
              style={{ width: '95%', height: '15%' }}
              placeholder="Write your question here please..."
              value={questiontab}
              onChange={(e) => setQuestionTab(e.target.value)}
            />
            <Button size="small" type="primary" onClick={sendQuestionTab}>
              Send
            </Button>
          </Card>
          <div>
            {resultloading ? (
              // Display loading spinner while loading is true
              <Spin size="large" />
            ) : (
              resultstab.length > 0 && (
              <Card title="Results" align="left">
                {resultstab}
              </Card>
              )
            )}
          </div>
          <div>
          {resultstab.length > 0 && (
           <Card
              title="Visual"
              hoverable
              align="left"
              actions={[
                <Button type="primary" size="small" onClick={renderChart}>
                  {' '}
                  Show{' '}
                  </Button>,
              ]}
              >
              <div id="container" ref={containerRef}></div>{' '}
              {/* Add ref to the div */}
              </Card>
              )}
          </div>
      </div>
    )
}
    export default Tabular;

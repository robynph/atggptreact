import {Button, Card, Input, Space, Spin, Typography, message, notification } from 'antd'
import { UserContext } from '../../Components/UserContext'
import axiosInstance from '../../Components/axiosInstance'
import API_ENDPOINTS from '../../apiConfig'
import { useRef } from 'react'
import { Line } from '@antv/g2plot'
import axios from 'axios'
import React, { useState, useEffect, useContext } from 'react'

import { Collapse, Tabs, List } from 'antd'
const Tabular = ({
     selectedCollectionKey, 
    selectedCollection,
    ...otherProps }) => {

    const { uid } = useContext(UserContext);
    const { token } = useContext(UserContext);

   
    const { TabPane } = Tabs
    const { Panel } = Collapse
    const { TextArea } = Input
    const { Text, Link } = Typography



    /* SECTION 1 */
    const [conversations, setConversations] = useState([])
    const [selectedConversationKey, setSelectedConversationKey] = useState(
      conversations.length > 0 ? conversations[0].key : ''
    )
    const [resultloading, setResultLoading] = useState(false)
    const [qaloading, setQALoading] = useState(false)

    /* SECTION 2 */
    const [collections, setCollectionList] = useState([])
    const [templates, setTemplateList] = useState([])
  
 
    const [updatedTemperature, setUpdatedTemperature] = useState('')
    const [updatedModel, setUpdatedModel] = useState('')
    const [updatedK, setUpdatedK] = useState('')
    const [question, setQuestion] = useState('')
    const [results, setResults] = useState([])
    const [sources, setSources] = useState([])
    const [QASummary, setQASummary] = useState('')
    const [questiontab, setQuestionTab] = useState('')
    const [resultstab, setResultsTab] = useState([])
    const [urlInput, setUrlInput] = useState([])

    useEffect(() => {
      console.log('This is the selected Collection', selectedCollectionKey)
    }, [])



    const fetchDocFinalSummary = async () => {
      setLoading(true)
      try {
        const response = await axiosInstance(token).post(
          `${API_ENDPOINTS.interactions}/summary3?uid=${uid}&nskey=${selectedCollectionKey}`,
          {
            query: inputValue,
          }
        )

        setDocFinalSummary(response.data.task.page_context)
        handleStep2()
        message.success('Final summary generated successfully!')
      } catch (error) {
        console.log(error)
        notification.error({
          message: 'Error',
          description:
            'Failed to produce final summary. Please try again later.',
        })
      } finally {
        setLoading(false)
      }
    }

    const sendQuestionTab = async () => {
      setResultLoading(true) 
      try {
        const response = await axiosInstance(token).post(
          `${API_ENDPOINTS.interactions}/tabular1?nskey=${selectedCollectionKey}&uid=${uid}`,
          {
            query: questiontab,
          }
        )
 
        console.log('This is the Response:', response.data)
        console.log('This is the query:', questiontab)
        setResultsTab(response.data.task)
        message.success('Message sent and results received')
      } catch (error) {
        console.log(error)
        console.log(error.response.data.message)

        // Display error notification to the user
        notification.error({
          message: 'Error',
          description: 'Failed to send question. Please try again later.',
        })
      } finally {
        setResultLoading(false) // Set loading state to false after the request is completed
      }
    }
    const chartRef = useRef(null)
    const containerRef = useRef(null) // reference for the container div
    useEffect(() => {
      renderChart()
      return () => {
        if (chartRef.current) {
          chartRef.current.destroy()
          chartRef.current = null
        }
      }
    }, [])
    const renderChart = () => {
      console.log("This is uid",uid)
      console.log("This is selected collection",selectedCollectionKey)
      const url = `https://canurta-s3-docs.s3.amazonaws.com/canurta-gpt-docs/visuals/${uid}/${selectedCollectionKey}/visuals.json`
      fetch(
        //'https://canurta-s3-docs.s3.amazonaws.com/canurta-gpt-docs/visuals/{uid}/{namespace}/visual.json'
        url
        //'https://canurta-s3-docs.s3.ca-central-1.amazonaws.com/canurta-gpt-docs/bca648042c0a4b31/may31_6O6G/datagz1.json'
      )
        .then((res) => res.json())

        .then((data) => {
          if (chartRef.current) {
            console.log(data)
            chartRef.current.destroy()
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
            })
            chart.render()
            chartRef.current = chart
          }
        })
    }
    return (
      <div>
        <Card align="left" hoverable title="Question1">
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
            <Card title="Results" align="left">
              {resultstab}
              <Collapse size="small" bordered  align="left">
                {sources.map((source, index) => (
                  <Panel
                    size="small"
                    header={`Source ${index + 1}`}
                    key={index}
                  >
                    <List.Item bordered size="small">
                      <Typography.Text strong>Page Content: </Typography.Text>
                      {source.page_content}
                    </List.Item>
                    <List.Item bordered size="small">
                      <Typography.Text strong>Page No: </Typography.Text>
                      {source.metadata.page} of {source.metadata.pageTotal}
                    </List.Item>
                    <List.Item bordered size="small">
                      <Typography.Text strong>Source: </Typography.Text>
                      <Link href={source.metadata.source} target="_blank">
                        {source.metadata.source}
                      </Link>
                    </List.Item>
                  </Panel>
                ))}
              </Collapse>
            </Card>
          )}
        </div>
        <div>
          <Collapse defaultActiveKey={['1']} size="small" bordered >
            <Panel
              align="left"
              size="small"
              header="Display tabular data"
              key="1"
            >
              <Card
                size="small"
                hoverable
                
                align="center"
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
            </Panel>
          </Collapse>
        </div>
      </div>
    )

}
export default Tabular
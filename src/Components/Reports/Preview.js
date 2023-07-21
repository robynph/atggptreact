import React, { useState, useEffect, useContext, useRef } from 'react';
import { Button, Upload, Tooltip, Progress, Typography, Text, Spin, Collapse, Card, Space, message, notification, Popconfirm, Input, List, Col, Row, Select, Checkbox, Pagination } from 'antd';
import { UserContext } from '../UserContext';
import { UploadOutlined, EditOutlined, SaveOutlined, ReloadOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import axiosInstance from '../../Components/axiosInstance';
import { Line, Column, Pie } from '@antv/g2plot';

import API_ENDPOINTS from '../../apiConfig';
import styles from '../../styles/Reports.module.css';

const { TextArea } = Input;
const { Panel } = Collapse;

const Preview = ({
  setCurrentStep,
  selectedCollectionKey,
  selectedCollection,
  setSelectedCollectionKey,
  selectedTemplateKey,
  setSelectedTemplateKey,
  selectedReportKey,
  setSelectedReportKey,
  selectedReport,
  setSelectedReport,
  ...otherProps
}) => {
  const { uid, token } = useContext(UserContext);
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 1;
  const [tempInteractionFlag, setTempInteractionFlag] = useState('');
  const [isPopconfirmVisible, setIsPopconfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [questionIndex, setLoadingQuestionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);
  const [reloadProgress, setReloadProgress] = useState(0);
  const [questiontab, setQuestionTab] = useState('');
  const [resultstab, setResultsTab] = useState([]);
  const [tabularResultLoading, setTabularResultLoading] = useState(false);
  const chartData = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (questions.length > 0) {
      renderChart(currentIndex);
    }
  }, [currentIndex, questions]);

  const fetchQuestions = async () => {
    try {
      const url = `${API_ENDPOINTS.reports}/questions?uid=${uid}&reportkey=${selectedReportKey}`;
      setLoading(true);
      const response = await axiosInstance(token).get(url);
      const data = response.data.data;
  
      const parsedQuestions = data.questions.map((question) => {
        if (
          question.question_id &&
          question.interaction_id &&
          question.header &&
          question.order
        ) {
          return {
            questionid: question.question_id,
            question: question.question_detail || '',
            header: question.header,
            interaction_flag: question.interaction_id,
            order: question.order,
            feedback: question.feedback || false,
            response: question.response_detail || '',
            visual_key: question.visual_path ? JSON.parse(question.visual_path) : '',
            qasources: question.qasources || {},
            summarysources: question.sumsources || {},
          };
        }
        return null;
      });
  
      setQuestions(parsedQuestions.filter(Boolean));
      if (parsedQuestions.length > 0) {
        setTempInteractionFlag(parsedQuestions[0].interaction_flag);
        renderChart(0); // Render the chart for the first question
      }
    } catch (error) {
      console.log('Error fetching questions:', error);
    }
    setLoading(false);
  };

 
  useEffect(() => {
    fetchQuestions();
  
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [uid]);

  const toggleEdit = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].editMode = !updatedQuestions[index].editMode;
    setQuestions(updatedQuestions);
  };

  const handleInputChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const handleSave = (index) => {
    console.log(`Saving question at index ${index}`, questions[index]);
  };

  const handleChangePage = (page) => {
    setCurrentPage(page);
    setCurrentIndex((page - 1) * pageSize);
  };

  const nextStep = () => {
    if (selectedReportKey) {
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      message.error('Please select a report');
    }
  };

  const backStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const start = (currentPage - 1) * pageSize;
  const end = currentPage * pageSize;

  const handleInteractionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].interaction_flag = value;
    setQuestions(updatedQuestions);
    saveQuestionInteractionFlag(index, value);
    setTempInteractionFlag(value);
  };

  const saveQuestionInteractionFlag = async (index, value) => {
    console.log(`Saving interaction flag for question at index ${index}`);
    console.log(questions[index]);
    try {
      const response = await axiosInstance(token).patch(
        `${API_ENDPOINTS.reports}/preview?uid=${uid}&questionkey=${questions[index].questionid}&newflag=${encodeURIComponent(
          value
        )}`
      );
      notification.success({ message: 'Interaction flag saved successfully' });
    } catch (error) {
      notification.error({ message: 'Error', description: 'Failed to save interaction flag' });
    }
  };

  const fetchUpdatedQuestionData = async (index) => {
    const question = questions[index];
    if (!question) {
      console.error('No question found at index:', index);
      return null;
    }
    try {
      const response = await axiosInstance(token).get(
        `${API_ENDPOINTS.reports}/preview?uid=${uid}&questionkey=${questions[index].questionid}`
      );
      notification.success({ message: 'Updated question data retrieved successfully' });
      return response.data.data;
    } catch (error) {
      notification.error({ message: 'Error', description: 'Failed to retrieve question data' });
      return null;
    }
  };


  useEffect(() => {
    if (reloadProgress === 100) {
      setTimeout(() => {
        setReloadProgress(0);
      }, 1000);
    }
  }, [reloadProgress]);

  const reloadQuestion = async (index) => {

    const updatedQuestionData = await fetchUpdatedQuestionData(index);
    if (updatedQuestionData) {
      setQuestions((oldQuestions) => {
        const newQuestions = [...oldQuestions];
        newQuestions[index] = {
          ...newQuestions[index],
          ...updatedQuestionData,
        };
        return newQuestions;
      });
      setCurrentIndex(index);
    }
  };

  const chartRef = useRef(null);
  const containerRef = useRef(null);
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  const renderChart = (currentIndex) => {
    const question = questions?.[currentIndex];
    const visualKey = question?.visual_key;
    console.log('renderChart', visualKey)

    console.log('renderChart', visualKey)
    console.log("type", visualKey.chart_type)
    console.log("data", visualKey.chart_data)

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    if (visualKey.chart_data && visualKey.chart_data.length > 0) {
      const data = visualKey.chart_data;
      console.log(data)
          

      if (visualKey.chart_type === "bar" && containerRef.current) {
        const chart = new Column(containerRef.current, {
          data: visualKey.chart_data,
          isGroup: true,
          padding: 'auto',
          xField: visualKey["x-field"],
          yField: visualKey["y-field"],
          seriesField: visualKey.series,
          color: ['#1890ff', '#ff4d4f', '#52c41a'], // Set blue and red colors for the bars
          yAxis: {
            label: {
              formatter: (value) => {
                if (typeof value === 'number') {
                  return `$${value.toFixed(2)}`; // Format numeric values as dollars
                }
                return value; // Return non-numeric values as is
              },
            },
          },
          legend: {
            position: 'top', // Add legend and position it at the top
          },
      });
        chart.render();
        chartRef.current = chart;
      } else if (visualKey.chart_type === "pie" && containerRef.current) {
        const chart = new Pie(containerRef.current, {
          data: data,
          padding: 'auto',
          angleField: 'Cost',
          colorField: 'Category',
          radius: 1,
          innerRadius: 0.6,
          interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
          statistic: {
            title: false,
            content: {
              style: {
                whiteSpace: 'pre-wrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
              content: '',
            },
          },
        });

        chart.render();
        chartRef.current = chart;
      }
    }
  };

  const newQuestionFromTemplate = () => {
    // hardcoded template.
    console.log(selectedReport);
    console.log(selectedReportKey);
    axiosInstance(token)
      .post(`${API_ENDPOINTS.reports}/template?uid=${uid}&reportkey=${selectedReportKey}`)
      .then((response) => {
        // Handle the response
        console.log('API response:', response.data);
      })
      .catch((error) => {
        // Handle the error
        console.log('API error:', error);
      });
  };

  const handleRunAllClick = async () => {
    await newQuestionFromTemplate();
    fetchQuestions();
    questions.forEach((question, index) => {
      setTimeout(() => {
        setProgress((index + 1) / questions.length * 100);
        setCurrentQuestionIndex(index + 1);
      }, index * 1000);
    });
  };

  return (
    <div>
      <Card
        title={
          selectedReport
            ? `Preview Responses for ${selectedReport}`
            : 'Please select a report on Step 1!'
        }
        className="custom-card"
        hoverable
        extra={[
          <Space size="small" direction="horizontal">
            <Button size="middle" onClick={handleRunAllClick}>
              Run All
            </Button>
            <Button size="middle" onClick={fetchQuestions}>
              Load Existing
            </Button>
            <span> </span>
            <Button type="primary" size="middle" onClick={backStep}>
              Back
            </Button>
            <Button type="primary" size="middle" onClick={nextStep}>
              Next
            </Button>
          </Space>
        ]}
      >
        {questions.slice(start, end).map((question, index) => (
          <>
            {progress > 0 && progress < 100 && (
              <>
                <Progress percent={progress} status="active" format={(percent) => `${Math.floor(percent)}%`} />
                <p>
                  <Typography.Text>Loading question {currentQuestionIndex} / {questions.length}</Typography.Text>
                </p>
              </>
            )}
            <Card
              key={question.questionid}
              title={`Question ${question.order}: ${question.header} `}
              extra={
                <>
                  <Tooltip title="Edit">
                    <Button icon={<EditOutlined />} onClick={() => toggleEdit(index)} />
                  </Tooltip>
                  <Tooltip title="Save">
                    <Button icon={<SaveOutlined />} onClick={() => handleSave(index)} />
                  </Tooltip>
                  <Tooltip title="Reload">
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        console.log('Reloading question:', question); // Add this
                        setReloadProgress(0);
                        reloadQuestion(index); // Pass the index here
                        setTimeout(() => {
                          setReloadProgress(100);
                        }, 1000);
                      }}
                    />
                  </Tooltip>
                  <span> </span>
                  <Popconfirm
                    title="Are you sure you want to reload interaction?"
                    onConfirm={() => {
                      handleInteractionChange(index, tempInteractionFlag);
                      setIsPopconfirmVisible(false);
                      setReloadProgress(0);
                      setTimeout(() => {
                        setReloadProgress(100);
                        setLoading(false);
                        setLoadingQuestionIndex(null);
                      }, 1000);
                    }}
                    onCancel={() => {
                      setTempInteractionFlag(question.interaction_flag);
                      setIsPopconfirmVisible(false);
                    }}
                    okText="Yes"
                    cancelText="No"
                    open={isPopconfirmVisible}
                  >
                    <Select
                      showSearch
                      optionFilterProp="children"
                      style={{ width: 120 }}
                      value={question.interaction_flag}
                      onChange={(value) => {
                        setTempInteractionFlag(value);
                        setIsPopconfirmVisible(true);
                      }}
                    >
                      <Select.Option value="Q&A">Q&A</Select.Option>
                      <Select.Option value="Summary">Summary</Select.Option>
                      <Select.Option value="Tabular">Tabular</Select.Option>
                    </Select>
                  </Popconfirm>
                  <span> </span>
                  <Button icon={<LikeOutlined />}>Like</Button>
                </>
              }
            >
              {question.interaction_flag === 'Q&A' ? (
                <>
                  {reloadProgress > 0 && (
                    <Progress percent={reloadProgress} status="active" format={(percent) => `${Math.floor(percent)}%`} />
                  )}
                  <p>
                    <strong>Question: </strong>
                    <TextArea
                      value={question.question}
                      onChange={(e) => handleInputChange(index, 'question', e.target.value)}
                      disabled={!question.editMode}
                      className={`${styles.textArea} ${!question.editMode ? styles.textAreaLocked : ''}`}
                    />
                  </p>
                  <p>
                    <strong>Response: </strong>
                    <TextArea
                      value={question.response}
                      onChange={(e) => handleInputChange(index, 'response', e.target.value)}
                      disabled={!question.editMode}
                      className={`${styles.textArea} ${!question.editMode ? styles.textAreaLocked : ''}`}
                    />
                  </p>
                  <Collapse size="small">
                    <Panel header="Q&A sources">
                      {question.qasources && (
                        <ul>
                          {Object.entries(question.qasources).map(([key, value], i) => (
                            <li key={i}>
                              {key}: {value}
                            </li>
                          ))}
                        </ul>
                      )}
                      {question.visual_key !== null && question.visual_key !== '' && (
                        <img src={question.visual_key} alt="Visual" />
                      )}
                    </Panel>
                  </Collapse>
                </>
              ) : question.interaction_flag === 'Summary' ? (
                <>
                  {reloadProgress > 0 && (
                    <Progress percent={reloadProgress} status="active" format={(percent) => `${Math.floor(percent)}%`} />
                  )}
                  <p>
                    <strong>Query: </strong>
                    <TextArea
                      value={question.question}
                      onChange={(e) => handleInputChange(index, 'question', e.target.value)}
                      disabled={!question.editMode}
                      className={`${styles.textArea} ${!question.editMode ? styles.textAreaLocked : ''}`}
                    />
                  </p>
                  <p>
                    <strong>Summary: </strong>
                    <TextArea
                      value={question.response}
                      onChange={(e) => handleInputChange(index, 'response', e.target.value)}
                      disabled={!question.editMode}
                      className={`${styles.textArea} ${!question.editMode ? styles.textAreaLocked : ''}`}
                    />
                  </p>
                  <Collapse size="small">
                    <Panel header="Summary sources">
                      {question.qasources && (
                        <ul>
                          {Object.entries(question.qasources).map(([key, value], i) => (
                            <li key={i}>
                              {key}: {value}
                            </li>
                          ))}
                        </ul>
                      )}
                      {question.visual_key !== null && question.visual_key !== '' && (
                        <img src={question.visual_key} alt="Visual" />
                      )}
                    </Panel>
                  </Collapse>
                </>
              ) : question.interaction_flag === 'Tabular' ? (
                <>
                  {reloadProgress > 0 && (
                    <Progress percent={reloadProgress} status="active" format={(percent) => `${Math.floor(percent)}%`} />
                  )}
                  <p>
                    <strong>Query: </strong>
                    <TextArea
                      value={question.question}
                      onChange={(e) => handleInputChange(index, 'question', e.target.value)}
                      disabled={!question.editMode}
                      className={`${styles.textArea} ${!question.editMode ? styles.textAreaLocked : ''}`}
                    />
                  </p>
                  <div>
                    {question.response.length > 0 && (
                      <p>
                        <strong>Response: </strong>
                        <TextArea
                          value={question.response}
                          onChange={(e) => handleInputChange(index, 'response', e.target.value)}
                          disabled={!question.editMode}
                          className={`${styles.textArea} ${!question.editMode ? styles.textAreaLocked : ''}`}
                        />
                      </p>
                    )}
                  </div>
                  <div>
                    <Card title="Visual" hoverable align="left">
                    <div className={styles.chartContainer} ref={containerRef}></div>
                    </Card>
                  </div>
                </>
              ) : null}
            </Card>
          </>
        ))}

        <Pagination
          current={currentPage}
          onChange={handleChangePage}
          total={questions.length}
          pageSize={pageSize}
          showSizeChanger={false}
          showQuickJumper
        />
      </Card>
    </div>
  );
};

export default Preview;
 

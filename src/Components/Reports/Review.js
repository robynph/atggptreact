import API_ENDPOINTS from '../../apiConfig';
import React, { useContext, useState, useEffect } from 'react';
import { Button, Card, Col, Collapse, Input, List, Modal, Popconfirm, Row, Space, Spin, Table, Typography, Upload, notification } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axiosInstance from '../../Components/axiosInstance';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UserContext } from '../UserContext';

import styles from '../../styles/Reports.module.css';
import 'antd/dist/reset.css';

const { confirm } = Modal;

const Review = ({
  setCurrentStep,
  selectedCollectionKey,
  setSelectedCollectionKey,
  selectedCollection,
  selectedReportKey,
  setSelectedReportKey,
  selectedReport,
  setSelectedReport,
  reports,
  ...otherProps
}) => {

  const { uid } = useContext(UserContext);
  const { token } = useContext(UserContext);
  const [questionOrderModalVisible, setQuestionOrderModalVisible] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [newOrderQuestions, setNewOrderQuestions] = useState([]);
  const [savedQuestions, setSavedQuestions] = useState([]);



  const fetchQuestions = async () => {
    try {
      const url = `${API_ENDPOINTS.reports}/questions?uid=${uid}&reportkey=${selectedReportKey}`;
      const response = await axiosInstance(token).get(url);
      const data = response.data;
      return data.data.questions.map((question, index) => ({
        key: index.toString(),
        question: question.question_detail || '',
        header: question.header || '',
        interaction_flag: question.interaction_id || '',
        order: question.order || 0,
        feedback: question.feedback || false,
        response: question.response_detail || '',
        visual_key: question.visual_key || '',
        sources: question.sources || {},
      }));
    } catch (error) {
      console.log('Error fetching questions:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchQuestions().then((data) => {
      const sortedData = data.sort((a, b) => a.order - b.order);
      setQuestions(sortedData);
      setNewOrderQuestions(sortedData); // add this line
    });
  }, [uid, selectedReportKey]);

  const nextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const backStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const showQuestionOrderModal = () => {
    setQuestionOrderModalVisible(true);
  };

  const handleQuestionOrderModalCancel = () => {
    setQuestionOrderModalVisible(false);
  };


  const handleQuestionOrderModalOk = () => {
    setQuestionOrderModalVisible(false);
    setSavedQuestions(newOrderQuestions);
  };

  const handleExportConfirm = () => {
    confirm({
      title: 'Export to Word',
      content: 'Are you sure you want to export to Word?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: exportToWord,
    });
  };

  const exportToWord = async () => {
    try {
      const response = await axiosInstance(token).post(
        `${API_ENDPOINTS.reports}/final?uid=${uid}&reportkey=${selectedReportKey}`,
        { reportId: selectedReportKey }
      );
  
      const fileUrl = response.data.data; // assuming the URL to the file is returned directly
  
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', 'report.docx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      notification.success({ message: 'Export to Word successful' });
    } catch (error) {
      console.log('Error exporting to Word:', error);
      notification.error({ message: 'Export to Word failed' });
    }
  };
    

  const columns = [
    {
      title: 'Header',
      dataIndex: 'header',
      key: 'header',
    },
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
    },
  ];

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setNewOrderQuestions((prev) => {
        const activeIndex = prev.findIndex((i) => i.key === active.id);
        const overIndex = prev.findIndex((i) => i.key === over?.id);
        return arrayMove(prev, activeIndex, overIndex);
      });
    }
  };

  const saveQuestionOrderToTable = async () => {
    try {
      // Make an API call to save the questions to the table
      // Use the `savedQuestions` state variable for the updated order
      await axiosInstance(token).post(
        `${API_ENDPOINTS.reports}/questions?uid=${uid}&reportkey=${selectedReportKey}`,
        { questions: savedQuestions }
      );
      // Show success notification
      notification.success({ message: 'Question order saved successfully' });
    } catch (error) {
      // Show error notification
      notification.error({ message: 'Error', description: 'Failed to save question order' });
    }
  };

  const DraggableBodyRow = (props) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: props['data-row-key'],
    });

    const style = {
      ...props.style,
      transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
      transition,
      cursor: 'move',
      ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };

    return <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />;
  };

  const tableData = [
    {
      key: '1',
      title: `${selectedReport} - Word Report`,
      type: 'Word'
    },
    {
      key: '2',
      title: `${selectedReport} - Excel Visuals`,
      type: 'Excel',
      downloadLink: 'https://canurta-s3-docs.s3.amazonaws.com/canurta-gpt-docs/reports/bec2e2bf70d0d2ca/ReportTest1_R2RJ/reportCharts.xlsx'
    },
  ];

  const tableColumns = [
    {
      title: 'Document',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Download',
      key: 'downloadLink',
      render: (text, record) => {
        if (record.type === 'Word') {
          return <a onClick={handleExportConfirm}>Link</a>
        } else {
          return <a href={record.downloadLink}>Link</a>
        }
      },
    },
  ];
  


  return (
    <div>
      <Card
        title={
          selectedReport
            ? `Review Filing for ${selectedReport}`
            : 'Please select a report on Step 1!'
        }
        hoverable
        className="custom-card"
        extra={[
          <Space size="small" direction="horizontal" key="extra-space">
            <Button size="middle" onClick={showQuestionOrderModal}>
              Reorder
            </Button>
            <Button type="primary" size="middle" onClick={backStep}>
              Back
            </Button>
          </Space>,
        ]}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Card bordered={false}>
              <Table dataSource={tableData} columns={tableColumns} />
            </Card>
          </Col>
        </Row>
      </Card>

      <Modal
        title={`Question Order for ${selectedReport}`}
        visible={questionOrderModalVisible}
        width={'80%'}
        onOk={handleQuestionOrderModalOk}
        onCancel={handleQuestionOrderModalCancel}
        footer={[
          <Button key="save" type="primary" onClick={saveQuestionOrderToTable}>
            Save
          </Button>,
        ]}
        >
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
        <SortableContext items={newOrderQuestions.map((q) => q.key)} strategy={verticalListSortingStrategy}>

            <Table
              dataSource={newOrderQuestions}
              columns={columns}
              rowKey={(record) => record.key}
              components={{
                body: {
                  row: DraggableBodyRow,
                },
              }}
              pagination={false}
            />
          </SortableContext>
        </DndContext>
      </Modal>
    </div>
  );
};

export default Review;

import API_ENDPOINTS from '../apiConfig';
import Drag from '../Components/Drag';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Button, Typography, Text, Spin, Collapse, Card, Space, message, notification, Popconfirm, Input, List, Steps, Row, Col, Progress } from 'antd';
import { UserContext } from '../Components/UserContext';
import axiosInstance from '../Components/axiosInstance'; // Import the axiosInstance function

import styles from '../styles/Collections.module.css';
import 'antd/dist/reset.css';

import ReportSetup from '../Components/Reports/ReportSetup';
import Preview from '../Components/Reports/Preview';
import Review from '../Components/Reports/Review';

const { Step } = Steps;

const Reports = () => {
  const { uid } = useContext(UserContext);
  const { token } = useContext(UserContext);
  const [currentStep, setCurrentStep] = useState(0);

  const [collections, setCollectionList] = useState([]);
  const [reports, setReportList] = useState([]);
  const [templates, setTemplateList] = useState([]);

  const [reportLoading, setReportLoading] = useState(true);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedReportKey, setSelectedReportKey] = useState('');
  const [selectedCollectionKey, setSelectedCollectionKey] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);

  useEffect(() => {
    const fetchCollectionsList = async () => {
      try {
        const response = await axiosInstance(token).get(`${API_ENDPOINTS.collections}?uid=${uid}`);
        const data = response.data.data;
        setCollectionList(data);
        setSelectedCollectionKey(data.length > 0 ? data[0].key : '');
      } catch (error) {
        console.log('Error fetching collections:', error);
      }
    };
  
    fetchCollectionsList();
  }, [token, uid, setCollectionList, setSelectedCollectionKey]);

  const fetchTemplates = async () => {
    try {
      const response = await axiosInstance(token).get(`${API_ENDPOINTS.templates}?uid=${uid}`);
      const data = response.data;
      setTemplateList(data.collections);
      setSelectedTemplateKey(data.templates.length > 0 ? data.templates[0].key : '');
    } catch (error) {
      console.log('Error fetching templates:', error);
    }
  };

  const fetchReports = useCallback(async () => {
    try {
      const response = await axiosInstance(token).get(`${API_ENDPOINTS.reports}?uid=${uid}`);
      const data = response.data.data;
      console.log('This is the data from report.js fetchreports', data);
      setReportList(data);
      setSelectedReportKey(data.length > 0 ? data[0].key : '');
      setReportLoading(false);
    } catch (error) {
      console.log('Error fetching reports:', error);
    }
  }, [token, uid]);

  useEffect(() => {
    fetchReports();
    console.log('reports state:', reports);
    console.log('currentStep state:', currentStep);

  }, [fetchReports]);

 
  const handleCollectionChange = useCallback((value, option) => {
    setSelectedCollectionKey(value);
    const selectedCollectionObj = collections.find((collection) => collection.key === value);
    if (selectedCollectionObj) {
      setSelectedCollection(selectedCollectionObj.label);
      setSelectedCollectionKey(selectedCollectionObj.key);
      console.log('This is selected collection->', selectedCollection, selectedCollectionKey);
    }
  }, [collections]);


  const handleReportNameChange = (value) => {
    setSelectedReportKey(value);
    const selectedReport = reports.find(report => report.key === value);
    if (selectedReport) {
      setSelectedReport(selectedReport.label);
      setSelectedCollectionKey(selectedReport.nskey);
      console.log("this is the obj from the report object", selectedReport)
      const selectedCollection = collections.find(collection => collection.key === selectedReport.nskey);
      if (selectedCollection) {
        setSelectedCollection(selectedCollection.label);
      }
    }
  };

  useEffect(() => {
    console.log("Updated selectedCollectionKey", selectedCollectionKey);
    const selectedCollection = collections.find(collection => collection.key === selectedCollectionKey);
    if (selectedCollection) {
      setSelectedCollection(selectedCollection.label);
    }
  }, [selectedCollectionKey]);

  return (
    <div className={styles.mainContainer}>
      <div>
        <Row gutter={20}>
          <Col span={24}>
            <div>
              <Card>
                <Steps current={currentStep} >
                  <Step title="Report Setup" status={currentStep === 0 ? 'process' : 'finish'} />
                  <Step title="Preview Responses" status={currentStep === 1 ? 'process' : currentStep > 1 ? 'finish' : 'wait'} />
                  <Step title="Review Filing" status={currentStep === 2 ? 'process' : currentStep > 2 ? 'finish' : 'wait'} />
                </Steps>
              </Card>
              <br></br>
              <Card>
                {currentStep === 0 && (
                  <div>
                    <ReportSetup
                      handleReportNameChange={handleReportNameChange}
                      handleCollectionChange={handleCollectionChange}
                      setCurrentStep={setCurrentStep}
                      selectedCollectionKey={selectedCollectionKey}
                      setSelectedCollectionKey={setSelectedCollectionKey}
                      selectedCollection={selectedCollection}
                      selectedReportKey={selectedReportKey}
                      setSelectedReportKey={setSelectedReportKey}
                      selectedReport={selectedReport}
                      setSelectedReport={setSelectedReport}
                      collections={collections}
                      reports={reports}
                      fetchReports={fetchReports}
                      setReportList={setReportList}
                      reportLoading={reportLoading}
                    />
                  </div>
                )}
                {currentStep === 1 && (
                  <div>
                    <Preview
                      setCurrentStep={setCurrentStep}
                      selectedCollectionKey={selectedCollectionKey}
                      setSelectedCollectionKey={setSelectedCollectionKey}
                      selectedReportKey={selectedReportKey}
                      setSelectedReportKey={setSelectedReportKey}
                      selectedReport={selectedReport}
                      setSelectedReport={setSelectedReport}
                      selectedTemplateKey={selectedTemplateKey}
                      setSelectedTemplateKey={setSelectedTemplateKey}
                    />
                  </div>
                )}
                {currentStep === 2 && (
                  <div>
                    <br />
                    <Review
                      setCurrentStep={setCurrentStep}
                      selectedCollectionKey={selectedCollectionKey}
                      setSelectedCollectionKey={setSelectedCollectionKey}
                      selectedReportKey={selectedReportKey}
                      setSelectedReportKey={setSelectedReportKey}
                      selectedReport={selectedReport}
                      setSelectedReport={setSelectedReport}
                    />
                  </div>
                )}
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Reports;

import API_ENDPOINTS from '../../../apiConfig';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {Button, Card, Space, message, notification, Input, Drawer, Select, Typography, Text, Popconfirm} from 'antd';
import { UserContext } from '../../../Components/UserContext';
import axiosInstance from '../../../Components/axiosInstance'; // Import the axiosInstance function



const SummaryDrawer = ({
    selectedCollectionKey,
    selectedCollection,
    selectedTab

}) => {
    const { uid } = useContext(UserContext);
    const { token } = useContext(UserContext);
    const [docVectorDetails, setDocVectorsDetails] = useState({});
    const { Text } = Typography;

    const fetchDocVectors = async () => {
        try {
          const response = await axiosInstance(token).post(
            `${API_ENDPOINTS.interactions}/summary1?uid=${uid}&nskey=${selectedCollectionKey}`
          );
    
          const { shape_docs, shape_processed_docs, shape_vectors } = response.data.task;
          setDocVectorsDetails({ shape_docs, shape_processed_docs, shape_vectors });
          message.success('Vector count fetched successfully!');
        } catch (error) {
          console.log(error);
          notification.error({
            message: 'Error',
            description: 'Failed to retrieve vector details. Please try again later.',
          });
        }
      };

    
      return (
        <div>
          <Card  className="custom-card" hoverable title={<Text strong>Collection Summaries Settings</Text>}>
                <Card
                    title="Vector Details"
                    size='small'
                    extra={[
                        <Button size="small" onClick={fetchDocVectors}>Fetch Vector Count</Button>
                    ]}>
                    <div>
                        <Text strong>Document Count: </Text><Text> {docVectorDetails.shape_docs}</Text><br></br>
                        <Text strong>Processed Vectors: </Text><Text>{docVectorDetails.shape_processed_docs}</Text><br></br>
                    </div>
                </Card>
                <br></br>
          </Card>
        </div>
      );
    };
    
    export default SummaryDrawer;
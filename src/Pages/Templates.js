
import API_ENDPOINTS from '../apiConfig';
import { useState, useContext, useEffect } from 'react';
import { Button, message, Select, Card, Typography, Input, Tabs, Row, Col, Popconfirm, Space } from 'antd';
import axiosInstance from '../Components/axiosInstance';
import { UserContext } from '../Components/UserContext';

import styles from '../styles/Collections.module.css';
import 'antd/dist/reset.css';

const { Option } = Select;
const { Text } = Typography;
const { TextArea } = Input;

export default function Templates() {
  const { uid } = useContext(UserContext);
  const { token } = useContext(UserContext);
  const [templates, setTemplates] = useState([]);
  const [jsonData, setJsonData] = useState([]);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('');
  const [templateData, setTemplateData] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [updatePromptVariables, setUpdatePromptVariables] = useState('');
  const [updatePromptTemplate, setUpdatePromptTemplate] = useState('');
  const [selectedTemplateLabel, setSelectedTemplateLabel] = useState('');


  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplateKey) {
      pullTemplate();
    } else {
      setUpdatePromptTemplate('');
      setUpdatePromptVariables('');
    }
  }, [selectedTemplateKey]);

  const fetchTemplates = () => {
    axiosInstance(token)
      .get(`${API_ENDPOINTS.templates}?uid=${uid}`)
      .then((response) => {
        setTemplates(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const createTemplate = () => {
    const nsname = prompt('Enter a name for the new template:');
    if (nsname) {
      axiosInstance(token)
        .post(`${API_ENDPOINTS.templates}?uid=${uid}&templatename=${nsname}`)
        .then((response) => {
          console.log('Template created ', response.data);
          fetchTemplates();
          setSelectedTemplateKey(response.data.template_key);
          message.success('Template created');
        })
        .catch((error) => {
          console.log(error);
          console.log(error.response.data.message);
          message.error('Template not created');
        });
    }
  };

  const renameTemplate = () => {
    const nskey = selectedTemplateKey;
    const label = templates.find((template) => template.key === nskey)?.label;
    const newLabel = prompt(`Enter a new name for ${label}:`);
    if (newLabel) {
      axiosInstance(token)
        .patch(
          `${API_ENDPOINTS.templates}?uid=${uid}&templatekey=${nskey}&newtemplatename=${newLabel}`
        )
        .then((response) => {
          console.log(`Template ${nskey} renamed to ${newLabel}`);
          fetchTemplates();
          message.success('Template renamed');
        })
        .catch((error) => {
          console.log(error);
          console.log(error.response.data.message);
          message.error('Template not renamed');
        });
    }
  };

  const deleteTemplate = () => {
    const nskey = selectedTemplateKey;
    const label = templates.find((template) => template.key === nskey)?.label;
    const confirmDelete = window.confirm(`Are you sure you want to delete the template "${label}"?`);
  
    if (confirmDelete) {
      axiosInstance(token)
        .delete(`${API_ENDPOINTS.templates}?uid=${uid}&templatekey=${nskey}`)
        .then((response) => {
          console.log('Template deleted ', response.data);
          // Reset selectedTemplateKey to clear the selection
          setSelectedTemplateKey('');
          fetchTemplates(); // Fetch updated list of templates
          message.success('Template deleted');
        })
        .catch((error) => {
          console.log(error);
          console.log(error.response.data.message);
          message.error('Template not deleted');
        });
    }
  };

  const pullTemplate = async () => {
    const label = selectedTemplateLabel;
    message.loading('Loading template');
    console.log(`Pulling template (${label})`);
  
    axiosInstance(token)
      .get(`${API_ENDPOINTS.templatesUpload}?uid=${uid}&templatekey=${selectedTemplateKey}`)
      .then((response) => {
        const result = response.data.data;
        console.log(result);
        setUpdatePromptTemplate(result[0].prompt_template.prompt);
  
        const inputVariables = result[0].prompt_template.input_variables;
        const inputVariablesString = inputVariables.join(', ');
        setUpdatePromptVariables(inputVariablesString);
        message.success('Template loaded');
      })
      .catch((error) => {
        console.log(error);
        message.error('Template not uploaded - did you select a template?');
      });
  };
  
  
  const postData = async () => {
    const url = `${API_ENDPOINTS.templatesUpload}?uid=${uid}&templatekey=${selectedTemplateKey}`;
  
    try {
      let data;
  
      if (updatePromptVariables.trim() === '') {
        // Set input_variables as an empty JSON object
        data = {
          interaction: "qasource",
          input_variables: [],
          prompt: updatePromptTemplate
        };
      } else {
        data = {
          interaction: "qasource",
          input_variables: updatePromptVariables.split(',').map(variable => variable.trim()),
          prompt: updatePromptTemplate
        };
      }
  
      const response = await axiosInstance(token).post(url, data);
      console.log(response.request);
      console.log(data);
      console.log(response.data);
      message.success('Template uploaded');
    } catch (error) {
      console.error(error);
      message.error('Template not uploaded');
    }
  };

  const onSearch = (value: string) => {
    console.log('search:', value);
  };


  return (
    <div className={styles.mainContainer}>
      <Row gutter={18} height={'100%'}>
        <Col span={4} height={'100%'} width={'100%'} align={'center'}> 
        </Col>
            <Col span={16} height={'100%'} width={'100%'} align={'center'}> 
            <Card
            hoverable
              actions={[
                <Button type="primary" onClick={createTemplate}>
                  New
                </Button>,
                <Button onClick={renameTemplate}>
                  Rename
                </Button>,
                <Popconfirm
                  title="Are you sure you want to delete the template?"
                  okText="Delete"
                  okType="danger"
                  cancelText="Cancel"
                  onConfirm={deleteTemplate}
                >
                  <Button danger>
                    Delete
                  </Button>
                </Popconfirm>,
              ]}
            >
              <Tabs size="large">
                <Tabs.TabPane tab={<h3>Select Template</h3>} key="1">
                  <Select
                      showSearch
                      onSearch={onSearch}
                      optionFilterProp="children"  
                      id="collection-select"
                      value={selectedTemplateKey}
                      align={'left'}
                      onChange={(value, option) => {
                        setSelectedTemplateKey(value);
                        setSelectedTemplateLabel(option.children);
                      }}
                      style={{ width: '100%' }}
                    >
                      <Option value="">Select Template</Option>
                      {templates.map((template) => (
                        <Option key={template.key} value={template.key}>
                          {template.label}
                        </Option>
                      ))}
                    </Select>
                  </Tabs.TabPane>
                </Tabs>
            </Card>
            <br></br>
            <Card
              className="custom-card"
              hoverable
              >
            <Tabs
                tabBarExtraContent={
                  <>
                  <Space>
                      <Button size="small" onClick={pullTemplate}>Refresh</Button>
                      <Popconfirm
                        title="Are you sure you want to update the template?"
                        okText="Update"
                        okType="warning"
                        cancelText="Cancel"
                        onConfirm={postData}
                        >
                          <Button size="small" type="primary" disabled={!jsonData}>Update</Button>
                      </Popconfirm>
                  </Space>
                  </>
                }
            >
              <Tabs.TabPane 
              tab={
                      selectedTemplateKey ? (
                        <Typography.Text>Update prompt details for {selectedTemplateLabel}</Typography.Text>
                      ) : (
                        <Typography.Text>Please select a template to update prompt</Typography.Text>
                      )
                    } 
              key="1">
                    <Card
                      title="Update User Prompt Variables"
                      className='custom-card'
                      
                      size="small"
                      type="inner"
                      align={'left'}
                    >
                      <Input
                        placeholder="Variable1, Variable2, Variable3"
                        value={updatePromptVariables}
                        onChange={(e) => setUpdatePromptVariables(e.target.value)}
                      />
                    </Card>
                    <br></br>
                    <Card
                        title="Update Prompt Template"
                        className="custom-card"
                        
                        size="small"
                        type="inner"
                      >
                        <TextArea
                          placeholder="Please paste your prompt here. Remember to include {variables} ...."
                          rows={4}
                          value={updatePromptTemplate}
                          onChange={(e) => setUpdatePromptTemplate(e.target.value)}
                        />
                      </Card>
                    </Tabs.TabPane>
                  </Tabs>
              </Card>
            </Col>
      </Row>
    </div>
  );
}
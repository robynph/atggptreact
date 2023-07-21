import { Form, Input, Typography } from 'antd'
import { useState } from 'react'
const { Paragraph } = Typography
const CustomizedForm = ({ onChange, fields }) => (
  <Form
    name="global_state"
    layout="inline"
    fields={fields}
    onFieldsChange={(_, allFields) => {
      onChange(allFields)
    }}
  >
    <Form.Item
      name="username"
      label="Username"
      rules={[
        {
          required: true,
          message: 'Username is required!',
        },
      ]}
    >
      <Input />
    </Form.Item>
  </Form>
)
const App1 = () => {
  const [fields, setFields] = useState([
    {
      name: ['username'],
      value: 'Ant Design',
    },
  ])
  return (
    <>
      <CustomizedForm
        fields={fields}
        onChange={(newFields) => {
          setFields(newFields)
        }}
      />
      <Paragraph
        style={{
          maxWidth: 440,
          marginTop: 24,
        }}
      >
        <pre
          style={{
            border: 'none',
          }}
        >
          {JSON.stringify(fields, null, 2)}
        </pre>
      </Paragraph>
    </>
  )
}
export default App1

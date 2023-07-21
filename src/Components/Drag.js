import { InboxOutlined } from '@ant-design/icons'
import { message, Upload } from 'antd'
import { useState, useContext } from 'react'
import API_ENDPOINTS from '../apiConfig'
import { UserContext } from '../Components/UserContext';

const Drag = ({ selectedCollectionKey }) => {
  const { Dragger } = Upload
  const [nskey, setNskey] = useState([])
  const { uid } = useContext(UserContext);
  const { token } = useContext(UserContext);

  const props = {
    name: 'files',
    multiple: true,
    action: `${API_ENDPOINTS.collectionsUpload}/docs/trigger?uid=${uid}&nskey=${selectedCollectionKey}`,
    headers: { Authorization: `Bearer ${token}` },
    onChange(info) {
      const { status } = info.file
      if (status !== 'uploading') {
        console.log(nskey)
        console.log(info.file, info.fileList)
      }
      if (status === 'done') {
        message.success(`${info.file.name} file sent to queue successfully. Check Collection Content for status.`)
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`)
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files)
      console.log(nskey)
    },
  }
  return (
    <div className="drag">
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">Support for a single or bulk upload.</p>
      </Dragger>
    </div>
  )
}
export default Drag
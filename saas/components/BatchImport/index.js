import { useState } from 'react';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Row, Col, Upload, Button, message } from 'antd';
import { uploadToCDN } from './upload';
const BatchImport = ({ handleDownLoad, handleUpload, onCancel }) => {
  // 文件路径状态
  const [fileUrl, setFileUrl] = useState(false);
  // 上传文件列表
  const [fileList, setFileList] = useState([]);
  // 下载模板
  const downLoad = () => {
    if (typeof handleDownLoad === 'function') {
      handleDownLoad();
    } else {
      message.error('没有提供下载模板');
    }
  };

  // 选择文件
  const requestUpload = async ({ file, onSuccess, onProgress }) => {
    const { userId } = localStorage;

    const res = await uploadToCDN(file, userId, {
      onProgress: percent => {
        onProgress({ percent: percent * 100 });
      },
    });
    onSuccess();

    setFileUrl(res);
    setFileList([file]);
  };

  // 移除上传文件
  const fileRemove = () => {
    setFileUrl(false);
    setFileList([]);
  };

  // 上传
  const upload = () => {
    handleUpload(fileUrl);
  };

  return (
    <>
      <Row type="flex" align="top">
        <Col span={4}>Excel文件：</Col>
        <Col span={16}>
          <Upload
            customRequest={requestUpload}
            supportServerRender={true}
            onRemove={fileRemove}
            fileList={fileList}
            accept=".xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
            <Button type="link" size="small">
              <UploadOutlined />
              本地上传
            </Button>
          </Upload>
        </Col>
      </Row>
      <Row type="flex" align="middle" style={{ marginTop: 12 }}>
        <Col span={4}>Excel模板：</Col>
        <Col span={16}>
          <Button type="primary" onClick={() => downLoad()}>
            <DownloadOutlined />
            下载
          </Button>
        </Col>
      </Row>
      <Row type="flex" align="top" style={{ marginTop: 20 }}>
        <Col span={2} style={{ fontSize: 16, color: 'red', marginTop: -2 }}>
          注：
        </Col>
        <Col span={20}>
          <p>1. 是否已经导入过相同记录</p>
          <p>2. 请严格按照下载excel模版中的信息填写；</p>
          <p>3. 请勿在信息中间出现空行间隔</p>
          <p>4. 若不按要求进行将会导入失败。</p>
        </Col>
      </Row>
      <Row>
        <Col style={{ float: 'right' }}>
          <Button onClick={onCancel}>取消</Button>
          <Button style={{ marginLeft: 20 }} type="primary" disabled={!fileUrl} onClick={upload}>
            确定
          </Button>
        </Col>
      </Row>
    </>
  );
};
export default BatchImport;

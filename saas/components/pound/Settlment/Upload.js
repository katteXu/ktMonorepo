import { useState, useRef } from 'react';
import { Button, Upload, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { uploadToCDN } from '@components/BatchImport/upload';
import styles from './styles.less';
const Index = props => {
  const [excelFileList, setExcelFileList] = useState([]);
  const [excelFile, setExcelFile] = useState('');
  const [loading, setLoading] = useState(false);
  const btnRef = useRef(null);

  // 上传excel附件
  const uploadExcel = async ({ onSuccess, onProgress, file }) => {
    const { userId } = localStorage;
    if (excelFileList.length > 0) {
      message.info('附件只能上传一个，上传多个只有最后一次上传生效');
    }
    setExcelFileList([file]);
    const resUrl = await uploadToCDN(file, userId, {
      onProgress: percent => {
        onProgress({ percent: percent * 100 });
      },
    });
    const fileObj = {
      fileType: 1,
      fileName: file.name,
      fileUrl: resUrl,
      discernContent: '',
    };

    onSuccess(fileObj);
  };

  // 附件change
  const changeExcel = ({ file, fileList }) => {
    const resultExcel = fileList.map(item => item.response);
    if (file.status === 'done') {
      setExcelFile(resultExcel);
    } else if (file.status === 'removed') {
      setExcelFile(resultExcel);
    }
  };

  // 移除上传文件
  const fileRemove = () => {
    setExcelFile([]);
    setExcelFileList([]);
  };

  function beforeUpload(file) {
    const isType = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (!isType) {
      message.error('您上传的文件格式不正确!');
      return false;
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('您上传的文件太大!');
      return false;
    }
    return true;
  }

  const submit = async () => {
    if (excelFile.length > 0) {
      setLoading(true);
      const { fileUrl } = excelFile[0];
      await props.onSubmit(fileUrl);
      setLoading(false);
    } else {
      message.error('请选择上传文件');
    }
  };

  return (
    <>
      <div className={styles['upload-block']}>
        <div className={styles.left}>上传文件:</div>
        <div className={styles.right}>
          <Button onClick={() => btnRef.current.click()}>上传文件</Button>
          <p className={styles.description}>
            文件后缀名必须为：xlsx (即Excel格式),(文件大小 在10M以内且行数在2000以内，若超出限制，请分批导入）
          </p>
          <Upload
            accept=".xlsx,.xls"
            supportServerRender={true}
            customRequest={uploadExcel}
            beforeUpload={beforeUpload}
            onRemove={fileRemove}
            fileList={excelFileList}
            onChange={changeExcel}>
            <button style={{ display: 'none' }} ref={btnRef}></button>
          </Upload>
        </div>
      </div>
      <div className={styles['btn-download']}>
        <a href="/static/temp/settlment_template.xlsx" download="导入模板">
          <DownloadOutlined style={{ color: '#477AEF', marginRight: 2 }} />
          下载模板
        </a>
      </div>
      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <Button size="default" onClick={props.onClose}>
          取消
        </Button>
        <Button size="default" loading={loading} type="primary" style={{ marginLeft: 8 }} onClick={submit}>
          确定
        </Button>
      </div>
    </>
  );
};

export default Index;

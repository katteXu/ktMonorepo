import { Upload } from 'antd';
import { uploadToCDN } from './BatchImport/upload';

const Index = ({ onChange, value, children, ...props }) => {
  const onChangeFile = ({ file, fileList }) => {
    if (!file.status) {
      let newFileList = [...fileList];
      newFileList = fileList.map(file => {
        if (!file.response) {
          file.status = 'error';
        }
        return file;
      });

      onChange([...newFileList]);
    } else {
      onChange([...fileList]);
    }
  };

  const onRemove = file => {
    const files = value && value.filter(v => v.url !== file.url);
    onChange(files);
  };

  const customRequest = async ({ onSuccess, onProgress, file }) => {
    const { userId } = localStorage;
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

  const handlePreview = e => {
    window.open(URL.createObjectURL(e?.originFileObj));
  };

  return (
    <Upload
      {...props}
      fileList={value}
      onChange={onChangeFile}
      onRemove={onRemove}
      customRequest={customRequest}
      onPreview={handlePreview}>
      {children}
    </Upload>
  );
};

export default Index;

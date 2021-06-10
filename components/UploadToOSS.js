import { Upload } from 'antd';
import { uploadToCDN } from './BatchImport/upload';

const Index = ({ onChange, value, children, ...props }) => {
  const onChangeFile = ({ fileList }) => {
    onChange([...fileList]);
  };

  const onRemove = file => {
    const files = value.filter(v => v.url !== file.url);
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
  return (
    <Upload {...props} fileList={value} onChange={onChangeFile} onRemove={onRemove} customRequest={customRequest}>
      {children}
    </Upload>
  );
};

export default Index;

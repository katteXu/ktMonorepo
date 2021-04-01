import { Button } from 'antd';
import { useEffect, useState, useRef } from 'react';

const LoadingBtn = ({ children, loading, onClick, style, type, htmlType, ghost }) => {
  const length = children.length;
  const [width, setwidth] = useState(64);
  useEffect(() => {
    if (length > 2) {
      setwidth(74 + (length - 2) * 14);
    }
  }, []);
  // 64 74 88 102
  return (
    <Button
      style={{ width: width, ...style }}
      ghost={ghost ? true : false}
      onClick={onClick}
      loading={loading}
      type={type}
      htmlType={htmlType}>
      {loading ? '' : children}
    </Button>
  );
};

export default LoadingBtn;

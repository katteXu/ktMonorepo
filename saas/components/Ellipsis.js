import { Tooltip } from 'antd';

const maxLabel = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const Ellipsis = ({ value, width, align = 'top' }) => {
  return (
    <Tooltip title={value} placement={align}>
      <div style={{ ...maxLabel, width }}>{value || '-'}</div>
    </Tooltip>
  );
};

export default Ellipsis;

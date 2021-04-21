import agent from '@api/agent';
import { useEffect, useState } from 'react';
import { Checkbox, Button } from 'antd';
import styles from './styles.less';
const SelectCompany = ({ onClose, onChange, selectValue }) => {
  const [list, setList] = useState([]);
  let [checkList, setCheckList] = useState(selectValue);
  useEffect(() => {
    setCompanyList();
    if (selectValue && selectValue.length > 0) {
      setCheckList(selectValue.map(item => item.id));
    }
  }, []);

  const setCompanyList = async () => {
    const res = await agent.getGoodsOwnerList();
    if (res.status === 0) {
      setList(res.result[0]);
    }
  };

  // 关闭
  const handleClose = () => {
    onClose && onClose();
  };

  // 确定
  const handleSubmit = () => {
    const query = list.filter(item => checkList.includes(item.id));
    onChange && onChange(query);
  };

  // 勾选
  const checkChange = value => {
    setCheckList(value);
  };

  // 全选
  const checkAll = target => {
    const { checked } = target;
    if (checked) {
      checkList = list.map(item => item.id);
    } else {
      checkList = [];
    }
    setCheckList(checkList);
  };
  return (
    <div>
      <div style={{ lineHeight: '30px' }}>
        <Checkbox key="all" onChange={e => checkAll(e.target)}>
          全选
        </Checkbox>
      </div>
      <div className={styles['selectCompany-checkbox']}>
        <Checkbox.Group
          value={checkList}
          onChange={checkChange}
          options={list.map(item => ({ label: item.companyName, value: item.id }))}
        />
      </div>

      <div style={{ textAlign: 'right' }}>
        <Button onClick={handleClose}>取消</Button>
        <Button type="primary" style={{ marginLeft: 8 }} onClick={handleSubmit}>
          确定
        </Button>
      </div>
    </div>
  );
};

export default SelectCompany;

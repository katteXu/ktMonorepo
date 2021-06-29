import { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Search, Content, Status, Ellipsis, ChildTitle } from '@components';
import styles from '../../../pages/productManagement/equipmentManagement/equipmentManagement.less';
import Link from 'next/link';
import { Modal, Input, message } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import { useRTTask } from '@components/Hooks';
import { Format } from '@utils/common';
import { product } from '@api';
const Index = props => {
  const { data, did, refDetail } = props;
  const inputRef = useRef();

  const [edit, setEdit] = useState(false);
  const [titleName, setTitleName] = useState('');
  useEffect(() => {}, []);

  const saveInfo = async () => {
    const params = {
      subDeviceId: data.id,
      name: titleName || data.name,
    };
    const res = await product.modify_sub_device_name({ params });
    if (res.status === 0) {
      setEdit(false);
      refDetail();
    } else {
      message.error(res.detail || res.description);
    }
  };
  // 关闭
  const shutDown = () => {
    Modal.confirm({
      icon: <QuestionCircleFilled />,
      title: '确认关闭吗？',
      onOk: async () => {
        const params = {
          subDeviceId: data.id,
          openOrStop: 1,
        };
        const res = await product.start_or_stop({ params });
        if (res.status === 0) {
          refDetail();
        } else {
          message.error(res.detail || res.description);
        }
      },

      okText: '确认',
      cancelText: '取消',
    });
  };
  // 开启
  const open = () => {
    Modal.confirm({
      icon: <QuestionCircleFilled />,
      title: '确认开启吗？',
      onOk: async () => {
        const params = {
          subDeviceId: data.id,
          openOrStop: 0,
        };
        const res = await product.start_or_stop({ params });
        if (res.status === 0) {
          refDetail();
        } else {
          message.error(res.detail || res.description);
        }
      },
      okText: '确认',
      cancelText: '取消',
    });
  };

  const changeTitle = () => {
    setEdit(true);
  };

  useEffect(() => {
    if (edit) {
      inputRef.current.focus();
    }
  }, [edit]);

  const onChangeInfo = e => {
    setTitleName(e.target.value);
  };

  return (
    <>
      <div className={styles.equipment}>
        <div className={styles.title} onClick={() => changeTitle()}>
          {edit ? (
            <Input ref={inputRef} onChange={e => onChangeInfo(e)} onBlur={saveInfo} defaultValue={data.name} />
          ) : (
            <span> {data.name || '-'}</span>
          )}
        </div>
        <div>
          {!data.status ? (
            <div>
              <span className={styles.statusInfo} style={{ background: '#66BD7E' }}></span>
              已开启
            </div>
          ) : (
            <div>
              <span className={styles.statusInfo} style={{ background: '#E44040' }}></span>
              已关闭
            </div>
          )}
        </div>
        <div>
          {!data.status ? (
            <span style={{ color: '#E44040' }} className={styles.btn} onClick={shutDown}>
              关闭
            </span>
          ) : (
            <span style={{ color: '#66BD7E' }} className={styles.btn} onClick={open}>
              开启
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default Index;

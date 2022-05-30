import { useState, useEffect, useRef } from 'react';
import { Table, Form, DatePicker, Button, Input, message, Popconfirm, Checkbox, Drawer, Modal } from 'antd';
import { PlusOutlined, QuestionCircleFilled } from '@ant-design/icons';
import ChooseRouteModal from '../chooseRouteModal';
import moment from 'moment';
import styles from '../supplement.less';
import TableForm from '../SupplementForm';
import { pound } from '@api';
import { ChildTitle } from '@components';
const Supplement = ({ poundType, onClose, onSubmit }) => {
  const tableRef = useRef();
  const [visible, setVisible] = useState(false);
  const [railInfo, setRailInfo] = useState({});

  const [dataList, setDataList] = useState([]);
  const handleShowChooseRail = () => {
    setVisible(true);
  };

  // 选择专线
  const handleRailChange = (id, fromCompany, toCompany, goodsType, unitPrice) => {
    setRailInfo({ id, fromCompany, toCompany, goodsType, unitPrice });
    setVisible(false);
  };

  const { userId } = localStorage;

  // 提交磅单补录
  const handleSubmit = (data, selectedRowKeys, cb) => {
    const { id, fromCompany, toCompany, goodsType, unitPrice } = railInfo;

    if (fromCompany) {
      const params = {
        fromCompany,
        toCompany,
        goodsType,
        routeId: id,
      };

      params.order = data
        .filter(item => selectedRowKeys.includes(item.key))
        .reduce(
          (
            obj,
            {
              poundId,
              time,
              carWeight,
              trailerPlateNumber,
              goodsWeight,
              fromGoodsWeight,
              loss,
              totalWeight,
              mobilePhoneNumber,
            },
            idx
          ) => {
            let numReg = /^-?(\d+|\d+\.\d{1,2})$/;
            let record = {
              poundId,
              time,
              trailerPlateNumber: trailerPlateNumber.toUpperCase(),
              mobilePhoneNumber,
              totalWeight: +(totalWeight * 1000).toFixed(0),
              carWeight: +(carWeight * 1000).toFixed(0),
              goodsWeight: +(goodsWeight * 1000).toFixed(0),
              loss: +(loss * 1000).toFixed(0),
            };

            numReg.test(fromGoodsWeight) && (record.fromGoodsWeight = +(fromGoodsWeight * 1000).toFixed(0));
            // numReg.test(loss) && (record.loss = +(loss * 1000).toFixed(0));

            obj[idx] = record;
            return obj;
          },
          {}
        );

      // 统计一下，当前选择磅单的总收货净重、总发货净重
      let goodsWeightAll = 0,
        fromGoodsWeightAll = 0;
      for (let k in params.order) {
        goodsWeightAll += params.order[k].goodsWeight || 0;
        fromGoodsWeightAll += params.order[k].fromGoodsWeight || 0;
      }

      Modal.confirm({
        title: '信息确认',
        icon: <QuestionCircleFilled />,
        content: (
          <div className={styles.sureInfo}>
            <p>
              <span>发货企业：</span>
              {fromCompany}
            </p>
            <p>
              <span>收货企业：</span>
              {toCompany}
            </p>
            <p>
              <span>货品名称：</span>
              {goodsType}
            </p>
            <p>
              <span>运费单价：</span>
              {(unitPrice / 100).toFixed(2)}元
            </p>
            <p>
              <span>磅单数量：</span>
              {Object.keys(params.order).length}
            </p>
            <p>
              <span>实收净重：</span>
              {(goodsWeightAll / 1000).toFixed(2)}吨
            </p>
            {poundType === 'to' && (
              <p>
                <span>原发净重：</span>
                {(fromGoodsWeightAll / 1000).toFixed(2)}吨
              </p>
            )}
          </div>
        ),
        onCancel: () => {
          Modal.destroyAll();
          cb('cancel');
        },
        onOk: async () => {
          const { status, detail, description } = await pound.insertPoundBill(params);
          if (status === 0) {
            message.success('磅单补录成功!');
            tableRef.current.resetForm();
            Modal.destroyAll();
            let leaveData = data
              .filter(item => !selectedRowKeys.includes(item.key))
              .map((item, idx) => ({
                ...item,
                key: idx,
              }));
            if (leaveData.length) {
              cb('sure', leaveData);
            } else {
              cb('new', []);
              onSubmit();
              setTimeout(() => {
                onClose();
              }, 0);
            }
          } else {
            message.error(`补录提交失败，原因：${detail || description}`);
          }
        },
      });
    } else {
      message.warning('请选择一条专线');
    }
  };
  return (
    <>
      <div className={styles['rail-info']}>
        <div className={styles.header}>
          <div className={styles.title}>
            <ChildTitle className="hei14">专线信息</ChildTitle>
          </div>
          {railInfo.id && (
            <Button className={styles['btn-change']} onClick={handleShowChooseRail}>
              更换专线
            </Button>
          )}
        </div>
        <div className={styles.body}>
          {railInfo.id ? (
            <>
              <div className={styles.item}>
                <span>发货企业：</span>
                {railInfo.fromCompany}
              </div>
              <div className={styles.item}>
                <span>收货企业：</span>
                {railInfo.toCompany}
              </div>
              <div className={styles.item}>
                <span>货品名称：</span>
                {railInfo.goodsType}
              </div>
            </>
          ) : (
            <>
              <div
                className={styles['btn-add']}
                style={{
                  marginTop: 58,
                  marginBottom: 86,
                }}>
                <Button onClick={handleShowChooseRail} block style={{ width: 400 }} ghost>
                  <PlusOutlined />
                  选择专线
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <TableForm submit={handleSubmit} ref={tableRef} poundType={poundType} onClose={onClose} />

      <Drawer title="选择专线" width={664} onClose={() => setVisible(false)} visible={visible}>
        <ChooseRouteModal handleSureChooseRoute={handleRailChange} userId={userId} />
      </Drawer>
    </>
  );
};

export default Supplement;

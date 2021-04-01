import { useState, useEffect } from 'react';
import router from 'next/router';
import Line from '@components/contractManagement/Line';
import styles from './styles.less';
import { Progress, Modal, message, Spin } from 'antd';
import { contract, getPrivateUrl, downLoadFileNoSuffix } from '@api';
import moment from 'moment';
import UpdateTotalWeight from '@components/contractManagement/updateTotalWeight';
import UpdateSendDate from '@components/contractManagement/updateSendDate';
import UpdateEndDate from '@components/contractManagement/updateEndDate';
import { Format, getQuery } from '@utils/common';
import { ChildTitle } from '@components';
import { Permission } from '@store';
const deliveryType = {
  DAY: '吨/天',
  WEEK: '吨/周',
  MONTH: '吨/月',
};

// 合同状态
const contractStatus = {
  1: { name: '未开始', color: '' },
  2: { name: '执行中', color: '#FFB741' },
  3: { name: '已完成', color: '#3D86EF' },
  4: { name: '已超时', color: '#E44040' },
};

const Index = props => {
  const [lineData, setLineData] = useState({});
  const [lineX, setLineX] = useState([]);
  const [otherOption, setotherOption] = useState([]);
  const [showTotalWeight, setShowTotalWeight] = useState(false);
  const [dataInfo, setDataInfo] = useState({});
  const [totalWeight, setTotalWeight] = useState(0);
  const [startLoadTime, setStartLoadTime] = useState('');
  const [lastLoadTime, setLastLoadTime] = useState('');
  const [showSendDate, setShowSendDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [sendDate, setSendDate] = useState('');
  const [endDate, setEndDate] = useState('false');
  const [annexUrl, setAnnexUrl] = useState([]);
  const [loading, setLoading] = useState(false);
  const { permissions, isSuperUser } = Permission.useContainer();
  useEffect(() => {
    setLineDataInfo(moment().format('YYYY-MM-DD'));
    getDetail();
  }, []);

  const getDetail = async () => {
    setLoading(true);
    const { id } = getQuery();
    const params = {
      contract_id: id,
    };

    const res = await contract.contract_detail({ params });

    if (res.status === 0) {
      setDataInfo(res.result);

      setTotalWeight(res.result.totalWeight);
      let annex_url = JSON.parse(res.result.annex_url);

      if (annex_url.name) {
        setAnnexUrl([annex_url]);
      } else {
        setAnnexUrl(annex_url);
      }

      setSendDate(res.result.effectiveDateFrom);
      setEndDate(res.result.effectiveDateTo);
      setLoading(false);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  const downloadFile = async ({ url, name }) => {
    const params = {
      url: [url],
    };
    const res = await getPrivateUrl({ params });

    await downLoadFileNoSuffix(res.result[url], name);
  };

  // 获取折线图数据
  // 设置折线图
  const setLineDataInfo = async (date, key) => {
    const dateString = date;
    const res = await getLineData(dateString);

    const { data, xAxis, otherOption } = formatLineData({ [key]: res.result });
    setLineData(() => []);
    setLineX(() => []);
    // setEmptyChart(res.result.data.length === 0);
    setLineX(() => xAxis);
    setLineData(() => data);
    setotherOption(() => otherOption);
  };
  // 获取折线图数据
  const getLineData = (date = moment().format('YYYY-MM-DD')) => {
    const { id } = getQuery();
    const params = {
      contract_id: id,
    };
    return contract.get_thirty_contract_info({ params });
  };

  // 格式化折线图数据
  const formatLineData = data => {
    if (Object.keys(data).length !== 0) {
      const xAxis = [];
      let result = {};

      Object.keys(data).forEach((key, index) => {
        // 生成x轴坐标
        if (index === 0) {
          xAxis.push(...data[key].map(item => moment(item.time).format('M.D')));
        }
        result['运输量'] = data[key].map(item => (item.total / 1000).toFixed(2));
        result['执行指标'] = data[key].map(item => item.deliveryWeight / 1000);
      });

      return { data: result, xAxis, otherOption };
    }
    return { data: {}, xAxis: [] };
  };

  // 修改货物总量
  const modifyTotalWeight = async value => {
    const { totalWeight } = value;
    const { id } = getQuery();

    const params = {
      id: id,
      totalWeight: totalWeight * 1000,
    };

    const res = await contract.modify_contract({ params });
    if (res.status === 0) {
      message.success('货物总量修改成功');
      setTotalWeight(totalWeight * 1000);
      setShowTotalWeight(false);
      getDetail();
    } else {
      message.error(`货物总量修改失败，原因：${res.detail ? res.detail : res.description}`);
    }
  };
  // 修改生效时间
  const modifySendDate = async value => {
    const { effectiveDateFrom } = value;
    const params = {
      id: getQuery().id,
      effectiveDateFrom: effectiveDateFrom,
    };

    const res = await contract.modify_contract({ params });
    if (res.status === 0) {
      message.success('生效时间修改成功');
      setSendDate(effectiveDateFrom);
      setShowSendDate(false);
    } else {
      message.error(`生效时间修改失败，原因：${res.detail ? res.detail : res.description}`);
    }
  };

  // 修改有效时间
  const modifyEndDate = async value => {
    const { effectiveDateTo } = value;
    const params = {
      id: getQuery().id,
      effectiveDateTo: moment(effectiveDateTo).format('YYYY-MM-DD 23:59:59'),
    };

    const res = await contract.modify_contract({ params });
    if (res.status === 0) {
      message.success('有效时间修改成功');
      setEndDate(moment(effectiveDateTo).format('YYYY-MM-DD 23:59:59'));
      setShowEndDate(false);
    } else {
      message.error(`有效时间修改失败，原因：${res.detail ? res.detail : res.description}`);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.topContent}>
        <div>
          <hearder className={styles.title}>
            <ChildTitle className="hei14" style={{ marginBottom: 8 }}>
              {dataInfo.title}买卖合同-
              {dataInfo.contractType === 1 ? '购买合同' : '销售合同'}
            </ChildTitle>
          </hearder>
          <div className={styles.row}>
            <div className={styles.item}>
              <span className={styles.label}>发货企业：</span>
              {dataInfo.fromAddress || '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>收货企业：</span>
              {dataInfo.toAddress || '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>负责人：</span>
              {dataInfo.principal || '-'}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.item}>
              <span className={styles.label}>货品名称：</span>
              {dataInfo.goodsName || '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>货物总量：</span>
              {`${Format.weight(totalWeight)}吨` || '-'}
              {(isSuperUser || permissions.includes('CONTRACT_MANAGEMENT_OPERATE')) && (
                <span className={styles.edit} onClick={() => setShowTotalWeight(true)}>
                  修改
                </span>
              )}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>提货量：</span>
              {Format.weight(dataInfo.deliveryWeight) || '-'}
              {deliveryType[dataInfo.deliveryType]}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.item}>
              <span className={styles.label}>货物单价(含税)：</span>
              {`${Format.price(dataInfo.unitePrice)}吨/元 ` || '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>货物单价：</span>
              {`${Format.price(dataInfo.uniteTaxPrice)}吨/元 ` || '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>合同金额：</span>
              {`${Format.price(dataInfo.totalValue)}/元 ` || '-'}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.item}>
              <span className={styles.label}>生效时间：</span>
              {sendDate || '-'}
              {(isSuperUser || permissions.includes('CONTRACT_MANAGEMENT_OPERATE')) && (
                <span className={styles.edit} onClick={() => setShowSendDate(true)}>
                  修改
                </span>
              )}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>有效期至：</span>
              {endDate || '-'}
              {(isSuperUser || permissions.includes('CONTRACT_MANAGEMENT_OPERATE')) && (
                <span className={styles.edit} onClick={() => setShowEndDate(true)}>
                  修改
                </span>
              )}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>附件：</span>
              {annexUrl &&
                annexUrl.map((item, key) => {
                  return (
                    <a
                      className={styles.file}
                      key={key}
                      // href={item.url}
                      href="javascript:;"
                      // onClick={() => onClickdownLoadFile(item.url, item.name)}
                      onClick={() => downloadFile({ ...item })}>
                      {item.name || '-'}
                    </a>
                  );
                })}
            </div>
          </div>
        </div>
        <div className={styles.subTitle}>
          <ChildTitle className="hei14" style={{ margin: '16px 0' }}>
            业务执行情况
          </ChildTitle>
        </div>
        <div className={styles.info}>
          <div className={styles.left}>
            <div className={styles.progressText}>执行进度</div>
            <div style={{ width: '100%' }}>
              <div className={styles.percentage}>
                <span className={styles.num}>{dataInfo.percent}%</span>
                <span className={styles.weight}>已执行：{Format.weight(dataInfo.realCount)}吨</span>
              </div>
              <Progress
                percent={dataInfo.percent}
                showInfo={false}
                status="normal"
                strokeColor={dataInfo.status && contractStatus[dataInfo.status].color}
              />
              <div className={styles.rowP}>
                执行天数：<span>{dataInfo.days}天</span>
              </div>
              <div className={styles.rowP}>
                平均执行数量：
                <span>{Format.weight(dataInfo.avage_count)}吨</span>
              </div>
              <div className={styles.rowP}>
                预计完成时间：<span>{dataInfo.estimate_date}</span>
              </div>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.titleLine}>近30天执行趋势</div>
            <Line size={170} data={lineData} xAxis={lineX} showLegend={true} otherOption={otherOption} />
          </div>
        </div>
        {/* 修改货物总量 */}
        <Modal
          title="修改货物总量"
          visible={showTotalWeight}
          destroyOnClose
          onCancel={() => setShowTotalWeight(false)}
          footer={null}>
          <UpdateTotalWeight
            initValue={Format.weight(totalWeight)}
            onSubmit={modifyTotalWeight}
            onClose={() => setShowTotalWeight(false)}
          />
        </Modal>
        {/* 修改生效时间 */}
        <Modal
          title="修改生效时间"
          visible={showSendDate}
          destroyOnClose
          onCancel={() => setShowSendDate(false)}
          footer={null}>
          <UpdateSendDate initValue={sendDate} onSubmit={modifySendDate} onClose={() => setShowSendDate(false)} />
        </Modal>
        {/* 修改有效时间 */}
        <Modal
          title="修改有效时间"
          visible={showEndDate}
          destroyOnClose
          onCancel={() => setShowEndDate(false)}
          footer={null}>
          <UpdateEndDate
            initValue={endDate}
            startLoadTime={sendDate}
            onSubmit={modifyEndDate}
            onClose={() => setShowEndDate(false)}
          />
        </Modal>
      </div>
    </Spin>
  );
};
export default Index;

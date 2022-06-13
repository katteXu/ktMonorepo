import { useState, useEffect } from 'react';
import router from 'next/router';
import Line from '@components/contractManagement/Line';
import styles from './styles.less';
import { Progress, Modal, message, Spin, DatePicker, Input, Button } from 'antd';
import { contract, getPrivateUrl, downLoadFileNoSuffix } from '@api';
import moment from 'moment';
import UpdateTotalWeight from '@components/contractManagement/updateTotalWeight';
import UpdateSendDate from '@components/contractManagement/updateSendDate';
import UpdateEndDate from '@components/contractManagement/updateEndDate';
import { Format, getQuery } from '@utils/common';
import { ChildTitle, Ellipsis } from '@components';
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
  3: { name: '已完成', color: '#477AEF' },
  4: { name: '已超时', color: '#E44040' },
};

const Index = props => {
  const [lineData, setLineData] = useState({});
  const [lineX, setLineX] = useState([]);
  const [otherOption, setotherOption] = useState([]);
  const [showTotalWeight, setShowTotalWeight] = useState(false);
  const [dataInfo, setDataInfo] = useState({});
  const [totalWeight, setTotalWeight] = useState(0);
  const [newTotalWeight, setNewTotalWeight] = useState('');
  const [startLoadTime, setStartLoadTime] = useState('');
  const [lastLoadTime, setLastLoadTime] = useState('');
  const [showSendDate, setShowSendDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [sendDate, setSendDate] = useState('');
  const [newSendDate, setNewSendDate] = useState('');
  const [endDate, setEndDate] = useState('false');
  const [newEndDate, setNewEndDate] = useState('');
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

      setTotalWeight(Format.weight(res.result.totalWeight));
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

  const previewFile = async ({ url }) => {
    const params = {
      url: [url],
    };
    const res = await getPrivateUrl({ params });
    window.open(res.result[url]);
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
  const modifyTotalWeight = async () => {
    const { id } = router.query;

    const params = {
      id: id,
      totalWeight: newTotalWeight ? newTotalWeight * 1000 : totalWeight * 1000,
    };

    const res = await contract.modify_contract({ params });
    if (res.status === 0) {
      message.success('货物总量修改成功');
      // setTotalWeight(newTotalWeight ? newTotalWeight * 1000 : totalWeight * 1000);
      setShowTotalWeight(false);
      getDetail();
    } else {
      message.error(`货物总量修改失败，原因：${res.detail ? res.detail : res.description}`);
    }
  };

  // 修改生效时间
  const modifySendDate = async () => {
    const isTime = moment().format('YYYY-MM-DD') === moment(newSendDate ? newSendDate : sendDate).format('YYYY-MM-DD');

    const params = {
      id: router.query.id,
      effectiveDateFrom: isTime
        ? moment().format('YYYY-MM-DD HH:mm:ss')
        : moment(newSendDate ? newSendDate : sendDate).format('YYYY-MM-DD 00:00:00'),
    };

    const res = await contract.modify_contract({ params });
    if (res.status === 0) {
      message.success('生效时间修改成功');
      setShowSendDate(false);
      getDetail();
    } else {
      message.error(`生效时间修改失败，原因：${res.detail ? res.detail : res.description}`);
    }
  };

  // 修改有效时间
  const modifyEndDate = async () => {
    const params = {
      id: router.query.id,
      effectiveDateTo: moment(newEndDate ? newEndDate : endDate).format('YYYY-MM-DD 23:59:59'),
    };

    const res = await contract.modify_contract({ params });
    if (res.status === 0) {
      message.success('有效时间修改成功');

      setShowEndDate(false);
      getDetail();
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
              <span className={styles.label}>合同编号：</span>
              {dataInfo.contractNo || '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>出卖人：</span>
              {dataInfo.sellUserName || '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>买受人：</span>
              {dataInfo.buyUserName || '-'}
            </div>
            {/* <div className={styles.item}>
              <span className={styles.label}>发货企业：</span>
              {dataInfo.fromAddress || '-'}
            </div> */}
            {/* <div className={styles.item}>
              <span className={styles.label}>发货地址：</span>
              {dataInfo.fromAddressName || '-'}
            </div> */}
          </div>
          <div className={styles.row}>
            <div className={styles.item}>
              <span className={styles.label}>负责人：</span>
              {dataInfo.principal || '-'}
            </div>
            {/* <div className={styles.item}>
              <span className={styles.label}>收货企业：</span>
              {dataInfo.toAddress || '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>收货地址：</span>
              {dataInfo.toAddressName || '-'}
            </div> */}
          </div>
          <div className={styles.row}>
            <div className={styles.item}>
              <span className={styles.label}>货品名称：</span>
              {dataInfo.goodsName || '-'}
            </div>
            <div className={styles.item} style={{ display: 'flex', alignItems: 'center' }}>
              <span className={styles.label}>货物总量：</span>
              {/* {`${Format.weight(totalWeight)}吨` || '-'} */}
              {showTotalWeight ? (
                <Input
                  style={{ width: 120 }}
                  addonAfter={<span style={{ color: '#BFBFBF' }}>吨</span>}
                  value={newTotalWeight != '' ? newTotalWeight : totalWeight}
                  onChange={e => {
                    setNewTotalWeight(e.target.value);
                  }}
                />
              ) : (
                <span>{`${totalWeight}吨` || '-'}</span>
              )}
              {(isSuperUser || permissions.includes('CONTRACT_MANAGEMENT_OPERATE')) &&
                (!showTotalWeight ? (
                  <span className={styles.edit} onClick={() => setShowTotalWeight(true)}>
                    修改
                  </span>
                ) : (
                  <div style={{ display: 'inline' }}>
                    <span style={{ color: '#477AEF', marginLeft: 9, cursor: 'pointer' }} onClick={modifyTotalWeight}>
                      保存
                    </span>
                    <span
                      style={{ marginLeft: 9, cursor: 'pointer', color: '#477AEF' }}
                      onClick={() => {
                        setShowTotalWeight(false);
                        setNewTotalWeight('');
                      }}>
                      取消
                    </span>
                  </div>
                ))}
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
              {showSendDate ? (
                <DatePicker
                  style={{ width: 150 }}
                  // disabledDate={date => date < moment().add(-1, 'day')}
                  placeholder="请选择生效时间"
                  format="YYYY-MM-DD"
                  allowClear={false}
                  value={newSendDate ? moment(newSendDate) : moment(sendDate)}
                  onChange={(date, dateString) => {
                    setNewSendDate(dateString);
                  }}
                />
              ) : (
                <span>{sendDate || '-'}</span>
              )}
              {(isSuperUser || permissions.includes('CONTRACT_MANAGEMENT_OPERATE')) &&
                (!showSendDate ? (
                  <span className={styles.edit} onClick={() => setShowSendDate(true)}>
                    修改
                  </span>
                ) : (
                  <div style={{ display: 'inline' }}>
                    <span style={{ color: '#477AEF', marginLeft: 9, cursor: 'pointer' }} onClick={modifySendDate}>
                      保存
                    </span>
                    <span
                      style={{ marginLeft: 9, cursor: 'pointer', color: '#477AEF' }}
                      onClick={() => {
                        setShowSendDate(false);
                        setNewSendDate('');
                      }}>
                      取消
                    </span>
                  </div>
                ))}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>有效期至：</span>
              {showEndDate ? (
                <DatePicker
                  style={{ width: 150 }}
                  // disabledDate={date => date < moment().add(-1, 'day')}
                  disabledDate={date => date < moment(newSendDate ? newSendDate : sendDate)}
                  format="YYYY-MM-DD"
                  allowClear={false}
                  value={newEndDate ? moment(newEndDate) : moment(endDate)}
                  onChange={(date, dateString) => {
                    setNewEndDate(dateString);
                  }}
                />
              ) : (
                <span>{endDate || '-'}</span>
              )}
              {(isSuperUser || permissions.includes('CONTRACT_MANAGEMENT_OPERATE')) &&
                (!showEndDate ? (
                  <span className={styles.edit} onClick={() => setShowEndDate(true)}>
                    修改
                  </span>
                ) : (
                  <div style={{ display: 'inline' }}>
                    <span style={{ color: '#477AEF', marginLeft: 9, cursor: 'pointer' }} onClick={modifyEndDate}>
                      保存
                    </span>
                    <span
                      style={{ marginLeft: 9, cursor: 'pointer', color: '#477AEF' }}
                      onClick={() => {
                        setShowEndDate(false);
                        setNewEndDate('');
                      }}>
                      取消
                    </span>
                  </div>
                ))}
            </div>
            <div className={styles.item}></div>
          </div>
          <div className={styles.row}>
            <div className={styles.item} style={{ display: 'flex' }}>
              <span className={styles.label}>附件：</span>
              <div>
                {annexUrl &&
                  annexUrl.map(item => {
                    return (
                      <div style={{ display: 'flex', width: '300px', justifyContent: 'space-between' }}>
                        <Ellipsis value={item.name || '-'} width={200} />
                        <div>
                          <Button type="link" size="small" onClick={() => previewFile({ ...item })}>
                            预览
                          </Button>
                          <Button type="link" size="small" onClick={() => downloadFile({ ...item })}>
                            下载
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
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
      </div>
    </Spin>
  );
};
export default Index;

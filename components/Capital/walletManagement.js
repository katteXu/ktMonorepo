import { useState, useEffect, useCallback } from 'react';
import { Content, Prompt, LoadingCarIcon, Image, ChildTitle } from '@components';
import { Line } from '@components/Charts';
import Balance from '@components/Capital/balance';
import RecordTable from '@components/Capital/recordTable';
import { capital, getUserInfo } from '@api';
import { Row, Col, DatePicker, Empty, Modal, message } from 'antd';
import moment from 'moment';
import styles from './finace.less';
import { Format, copyToClipboard } from '@utils/common';
import { User } from '@store';
import * as echarts from 'echarts';

const lineStyle = {
  // 系列级个性化折线样式
  width: 2,
  type: 'solid',
  color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
    {
      offset: 0,
      color: '#007AFF',
    },
    {
      offset: 1,
      color: '#00B2FF',
    },
  ]), //线条渐变色
};

const Capital = props => {
  const { userInfo } = User.useContainer();
  const [loading, setLoading] = useState(false);
  const [lineData, setLineData] = useState({});
  const [lineX, setLineX] = useState([]);
  const [wallet, setWallet] = useState(0);
  const [bankCard, setBankCard] = useState('');
  const [account, setAccount] = useState('');
  const [emptyChart, setEmptyChart] = useState('');
  const [subAccNo, setSubAccNo] = useState('');

  const [visible, setVisible] = useState(false);
  const [generate, setGenerate] = useState(true);
  const [percent, setPercent] = useState(0);
  const [bankInfo, setBankInfo] = useState({});
  const [sumAmount, setSumAmount] = useState(0);
  const [monthPickerVal, setMonthPickerVal] = useState(moment());

  useEffect(() => {
    // 获取持久化数据
    Promise.all([getBank(), getWallet(), getLineData()]).then(([resBank, resUser, resLine]) => {
      const key = moment().format('YYYY-MM');
      const { data, xAxis } = formatLineData({ [key]: resLine.result.data });
      setLineX(xAxis);
      setLineData(data);
      setSumAmount(resLine.result.sumAmount);
      setBankCard(resBank.result);
      setWallet(resUser.result.wallet);
      setAccount(resUser.result.zxChildAccount || null);
      setLoading(false);
    });

    // 3分钟刷新
    const time = setInterval(() => {
      refreshAccount();
    }, 60 * 3 * 1000);

    return () => {
      clearInterval(time);
    };
  }, []);

  // 银行卡信息
  const getBank = () => {
    const { userId } = localStorage;
    const params = {
      id: userId,
    };
    return capital.getUserBankCard({ params });
  };

  // 获取余额
  const getWallet = () => {
    const { userId } = localStorage;
    return getUserInfo({ userId });
  };

  // 获取折线图数据
  const getLineData = (date = moment().format('YYYY-MM-DD')) => {
    const params = {
      date,
    };
    return capital.walletLineChart({ params });
  };

  // 设置折线图
  const setLineDataInfo = async (date, key) => {
    setMonthPickerVal(moment(date));
    const dateString = date.format('YYYY-MM-01');
    const res = await getLineData(dateString);

    const { data, xAxis } = formatLineData({ [key]: res.result.data });
    setLineData(() => []);
    setLineX(() => []);
    setEmptyChart(res.result.data.length === 0);
    setLineX(() => xAxis);
    setLineData(() => data);
    setSumAmount(res.result.sumAmount);
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
        result['运费'] = data[key].map(item => item.sumAmount / 100);
      });
      return { data: result, xAxis };
    }
    return { data: {}, xAxis: [] };
  };

  // 刷新余额
  const refreshAccount = async () => {
    const res = await capital.refreshAccount();
    if (res.status === 0) {
      setWallet(res.result.amount);
    }
  };

  const exclusiveRechargeAccount = async () => {
    if (userInfo.zxb2bFundAccountStatus) {
      await getzxb2bFundAccount(0);
      setVisible(true);
    } else {
      setPercent(10);
      await getzxb2bFundAccount(3000);
      setPercent(100);
    }
  };

  // 生成中信专属账号
  // 最小执行时间 times
  const getzxb2bFundAccount = async times => {
    // 最少3秒返回结果
    const [resdelay, res] = await Promise.all([delay(times), capital.getOrCreateZXFundAccount()]);
    if (res.status === 0) {
      const info = res.result;
      const subAccNo = info.subAccNo.replace(/\s/g, '').replace(/(.{4})/g, '$1 ');
      setBankInfo(info);
      setSubAccNo(subAccNo);
    } else {
      setGenerate(false);
    }
  };

  // 延时执行
  const delay = delayTime => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, delayTime);
    });
  };

  // loading结束回调
  const handleLoadingSuccess = useCallback(() => {
    setVisible(true);
    setPercent(0);
  }, []);

  const handleCopy = () => {
    copyToClipboard({
      text: subAccNo,
      success: () => {
        message.success('复制成功');
      },
    });
  };

  return (
    <>
      <Row gutter={24} style={{ padding: '16px 28px' }}>
        <Col span={9} style={{ padding: 0 }}>
          <div className={styles.bgWallet}>
            <Balance
              wallet={wallet}
              bankCard={bankCard}
              loading={loading}
              exclusiveRechargeAccount={exclusiveRechargeAccount}>
              余额
            </Balance>
          </div>
        </Col>
        <Col span={15} style={{ paddingRight: 0, paddingLeft: 16 }}>
          <div className={styles.rightLine}>
            <div
              style={{
                padding: '12px 24px 8px ',
                lineHeight: '32px',
                fontSize: '16px',
                fontWeight: 'bold',
              }}>
              运费账单
              <DatePicker.MonthPicker
                style={{ float: 'right' }}
                onChange={setLineDataInfo}
                allowClear={false}
                defaultValue={moment()}
                disabledDate={date => date > moment()}
                value={monthPickerVal}
              />
            </div>
            <section style={{ padding: '0px 24px 16px' }}>
              <div className={styles.sumAmount}>
                ￥{Format.price(sumAmount)}
                <span style={{ fontSize: 12, marginLeft: 2 }}>元</span>
              </div>
              {emptyChart ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <Line size={170} data={lineData} xAxis={lineX} showLegend={true} customlineStyle={lineStyle} />
              )}
            </section>
          </div>
        </Col>
      </Row>

      <Content>
        <section>
          <div style={{ marginBottom: 16, fontWeight: 'bold' }}>
            <ChildTitle className="hei14">交易记录</ChildTitle>
          </div>
          <RecordTable
            isServer={props.isServer}
            seatchLine={() => {
              setLineDataInfo(moment(), moment().format('YYYY-MM')), setMonthPickerVal(moment());
              refreshAccount();
            }}
          />
        </section>
      </Content>

      <Modal
        className={styles.modal}
        visible={visible}
        title="专属充值账号"
        onCancel={() => setVisible(false)}
        footer={null}>
        <div>
          {generate ? (
            <div className={styles.bgCard} style={{ backgroundImage: `url(${Image.BgCard})` }}>
              <div className={styles.bank}>
                <img src={bankInfo.url_link} className={styles.cardImg} />
                <span>{bankInfo.account_bank}</span>
              </div>
              <div className={styles.cardNum}>{bankInfo.subAccNm}</div>
              <div className={styles.bankfooter}>
                <span>{subAccNo}</span>
                <div onClick={() => handleCopy()}>复制卡号</div>
              </div>
            </div>
          ) : (
            <div>
              <Prompt value="您还未拥有专属充值账号，快联系客服给您开通吧" type={'info'} />
            </div>
          )}

          <div className={styles.reminder}>
            <div className={styles.remindertitle}>温馨提示：</div>
            <div className={styles.reminderContent}>
              若您要通过网银或柜台进行充值，请您在收款方信息上填写平台提供的账户名称、账号及开户行等相关信息。充值成功后金额将自动转入至您在方向物流的账户余额中该账户为您的专属账号、仅用于该账号充值，不可用于为其他账户或用户充值，请您在汇款前仔细核对以免发生错误。
            </div>
            <div className={styles.reminderBottom}>
              如有疑问请致电客服：<span>400-690-8700</span>
            </div>
          </div>
        </div>
      </Modal>

      <LoadingCarIcon progress={percent} onSuccess={handleLoadingSuccess} />
    </>
  );
};

export default Capital;

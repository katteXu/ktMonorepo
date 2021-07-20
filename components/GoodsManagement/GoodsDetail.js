import { Button, message, Table } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import styles from './goodsDetail.less';
import { Content, ChildTitle } from '@components';
import { Format, getQuery } from '@utils/common';
import router from 'next/router';
import { quality, stock } from '@api';
import { Permission } from '@store';

const stockType = {
  COAL_PRODUCTS: '煤炭及制品',
  STEEL: '钢材',
  WOOD_FACTORY: '木材',
  DAILY_CHEMICAL_PRODUCTS: '日用化工品',
  PETROLEUM_NATURAL_GAS: '石油天然气',
  METALLIC_ORE: '金属矿石',
  OTHER: '其他',
  BUILDING_MATERIAL: '矿建材料',
  CEMENT: '水泥',
  NONMETALLIC_ORE: '非金属矿石',
  PESTICIDE: '化肥及农药',
  SALT: '盐',
  FOODSTUFF: '粮食',
  MECHANICS: '机械、设备、电器',
  LIGHT_INDUSTRIAL: '轻工原料及制品',
  NONFERROUS_METALS: '有色金属',
  PHARMACEUTICAL_PRODUCTS: '轻工医药产品',
  AGRICULTURAL_GOODS: '鲜活农产品',
  COLD_PRODUCTS: '冷藏冷冻货物',
  CAR_PRODUCTS: '商品汽车',
};
const GoodsDetail = ({ rowData = {}, setShowOutModal, setShowInModal, setGetListNow, getListNow }) => {
  const { permissions, isSuperUser } = Permission.useContainer();
  const [currentTab, setCurrentTab] = useState('zhijianInfo');
  const columns = [
    {
      title: '采样编号',
      dataIndex: 'reportId',
      key: 'reportId',
      width: 120,
      render: value => value || '-',
    },
    {
      title: '质检类型',
      dataIndex: 'purchaseOrSale',
      key: 'purchaseOrSale',
      width: 120,
      render: value => (value === 1 ? '采购质检' : '销售质检'),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: value => value || '-',
    },
    {
      title: '质检员',
      dataIndex: 'operator',
      key: 'operator',
      width: 120,
      render: value => value || '-',
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      width: 80,
      align: 'right',
      fixed: 'right',
      render: (value, record, index) => (
        <Button size="small" type="link" key="detail" onClick={() => handleToDetail(record.id)}>
          详情
        </Button>
      ),
    },
  ];
  const columns2 = [
    {
      title: '出入库时间',
      dataIndex: 'changeTime',
      key: 'changeTime',
      render: value => value || '-',
    },
    {
      title: '出入库类型',
      dataIndex: 'dataTypeZn',
      key: 'dataTypeZn',
      render: value => value || '-',
    },
    {
      title: '出入库数量',
      dataIndex: 'formatChangeValue',
      key: 'formatChangeValue',
      align: 'right',
      render: value => value || '-',
    },
  ];

  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
  });

  // 查询条件2
  const [query2, setQuery2] = useState({
    page: 1,
    pageSize: 10,
  });
  const [dataList, setDataList] = useState({});
  const [dataList2, setDataList2] = useState({});

  useEffect(() => {
    getQualidyByGoods({ ...query });
    getStockListByGoods({ ...query2 });
  }, []);

  useEffect(() => {
    if (getListNow) {
      getQualidyByGoods({ ...query });
      getStockListByGoods({ ...query2 });
    }
    setGetListNow(false);
  }, [getListNow]);

  // 获取货品质检化验单
  const getQualidyByGoods = async ({ page, pageSize }) => {
    const { id } = getQuery();
    setLoading(true);
    const params = {
      inventoryId: id,
      page,
      limit: pageSize,
    };
    const res = await quality.getDataListByGoods({ params });
    if (res.status === 0) {
      setDataList(res.result);
    } else {
      message.error(res.detail || res.description);
    }
    setLoading(false);
  };

  // 获取出入库列表
  const getStockListByGoods = async ({ page, pageSize }) => {
    const { id } = getQuery();
    setLoading2(true);
    const params = {
      ilid: id,
      page,
      limit: pageSize,
    };
    const res = await stock.getInventoryLogList({ params });
    if (res.status === 0) {
      setDataList2(res.result);
    } else {
      message.error(res.detail || res.description);
    }
    setLoading2(false);
  };

  // 分页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getQualidyByGoods({ ...query, page, pageSize });
    },
    [dataList]
  );
  // 分页2
  const onChangePage2 = useCallback(
    (page, pageSize) => {
      setQuery2({ ...query2, page, pageSize });
      getStockListByGoods({ ...query2, page, pageSize });
    },
    [dataList2]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getQualidyByGoods({ ...query, page: 1, pageSize });
    },
    [dataList]
  );
  // 切页码2
  const onChangePageSize2 = useCallback(
    (current, pageSize) => {
      setQuery2({ ...query2, page: 1, pageSize });
      getStockListByGoods({ ...query2, page: 1, pageSize });
    },
    [dataList2]
  );

  // 跳转详情
  const handleToDetail = id => {
    router.push(`/productManagement/qualityManagement/detail?id=${id}`);
  };
  return (
    <>
      <Content style={{ backgroundColor: '#f0f2f5' }}>
        <section className={styles.main} style={{ paddingTop: 0 }}>
          <header
            style={{
              padding: ' 7px 16px',
              position: 'relative',
              margin: '0 -16px',
            }}>
            货品信息
            {(isSuperUser || permissions.includes('INVENTORY_OPERATE')) && (
              <div style={{ float: 'right' }}>
                <Button
                  size="default"
                  className={styles.btn}
                  type="link"
                  style={{ marginRight: -8 }}
                  onClick={() => {
                    // router.push('')
                    setShowOutModal(true);
                  }}>
                  新增出库
                </Button>
                <Button
                  type="link"
                  size="default"
                  className={styles.btn}
                  onClick={() => {
                    // router.push('')
                    setShowInModal(true);
                  }}>
                  新增入库
                </Button>
              </div>
            )}
          </header>
          {/* <div className={styles.title}>货品信息</div> */}
          <div className={styles.row} style={{ paddingLeft: 0 }}>
            <div className={styles.col}>
              货物类型：
              <span className={styles['col-data']}>{stockType[rowData.goodsType]}</span>
            </div>
            <div className={styles.col}>
              货品名称：
              <span className={styles['col-data']}>
                {rowData.goodsName}
                {' ' + rowData.addressCompany}
              </span>
            </div>
            <div className={styles.col}>
              成本单价(元/吨)：
              <span className={styles['col-data']}>{rowData.unitPrice}</span>
            </div>
          </div>
          <div className={styles.row} style={{ paddingLeft: 0 }}>
            <div className={styles.col}>
              库存数：
              <span className={styles['col-data']}>{Format.weight(rowData.inventoryValue)}</span>
            </div>
            <div className={styles.col}>
              配煤原料：
              <span className={styles['col-data']}>{rowData.materials}</span>
            </div>
            <div className={styles.col}></div>
          </div>
        </section>
      </Content>
      <Content style={{ backgroundColor: '#f0f2f5' }}>
        <section className={styles.main} style={{ marginTop: 16, paddingTop: 0 }}>
          <header className="tab-header" style={{ padding: '7px 16px', margin: '0 -16px', marginBottom: 16 }}>
            <div
              className={`tab-item ${currentTab === 'zhijianInfo' ? 'active' : ''}`}
              onClick={() => setCurrentTab('zhijianInfo')}>
              质检信息
            </div>
            <div
              className={`tab-item ${currentTab === 'churuku' ? 'active' : ''}`}
              onClick={() => setCurrentTab('churuku')}>
              出入库
            </div>
          </header>
          {currentTab === 'zhijianInfo' ? (
            <>
              <ChildTitle>
                <div className={styles.title}>指标标准</div>
              </ChildTitle>

              <div className={styles.row}>
                {/* 水分 */}
                <div className={styles.col}>
                  水分(% Mad)：
                  <span className={styles['col-data']}>{rowData.standard_mad}</span>
                </div>
                {/* 灰分 */}
                <div className={styles.col}>
                  灰分(% Ad)：
                  <span className={styles['col-data']}>{rowData.standard_ad}</span>
                </div>
                {/* 挥发 */}
                <div className={styles.col}>
                  挥发(% Vdaf)：
                  <span className={styles['col-data']}>{rowData.standard_vdaf}</span>
                </div>
              </div>
              <div className={styles.row}>
                {/* 焦渣特征 */}
                <div className={styles.col}>
                  焦渣特征(1-8 CRC)：
                  <span className={styles['col-data']}>{rowData.standard_crc}</span>
                </div>
                {/* 全硫 */}
                <div className={styles.col}>
                  全硫(% Std)：
                  <span className={styles['col-data']}>{rowData.standard_std}</span>
                </div>
                {/* 固定碳 */}
                <div className={styles.col}>
                  固定碳(% Fcd)：
                  <span className={styles['col-data']}>{rowData.standard_fcd}</span>
                </div>
              </div>
              <div className={styles.row}>
                {/* 回收 */}
                <div className={styles.col}>
                  回收(% r)：
                  <span className={styles['col-data']}>{rowData.standard_r}</span>
                </div>
                {/* 全水分 */}
                <div className={styles.col}>
                  全水分(% Mt)：
                  <span className={styles['col-data']}>{rowData.standard_mt}</span>
                </div>
                {/* 粘结指数 */}
                <div className={styles.col}>
                  粘结指数(GRI)：
                  <span className={styles['col-data']}>{rowData.standard_gri}</span>
                </div>
              </div>
              <div className={styles.row}>
                {/* 胶质层 */}
                <div className={styles.col}>
                  胶质层(Y)：
                  <span className={styles['col-data']}>{rowData.standard_y}</span>
                </div>
                {/* 含矸石 */}
                <div className={styles.col}>
                  含矸石(%)：
                  <span className={styles['col-data']}>{rowData.standard_gangue}</span>
                </div>
                {/* 含中煤 */}
                <div className={styles.col}>
                  含中煤(%)：
                  <span className={styles['col-data']}>{rowData.standard_middle}</span>
                </div>
              </div>
              <div className={styles.row}>
                {/* 含精煤 */}
                <div className={styles.col}>
                  含精煤(%)：
                  <span className={styles['col-data']}>{rowData.standard_coal}</span>
                </div>
                <div className={styles.col}></div>
                <div className={styles.col}></div>
              </div>

              <ChildTitle style={{ marginTop: 16 }}>
                <div className={styles.title}>已关联质检单</div>
              </ChildTitle>

              <div className={styles.table}>
                <Table
                  loading={loading}
                  dataSource={dataList.data}
                  columns={columns}
                  pagination={{
                    onChange: onChangePage, // showSizeChanger: false,
                    pageSize: query.pageSize,
                    current: query.page,
                    total: dataList.count,
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <Table
                loading={loading2}
                dataSource={dataList2.data}
                columns={columns2}
                pagination={{
                  onChange: onChangePage2,
                  // showSizeChanger: true,
                  pageSize: query2.pageSize,
                  current: query2.page,
                  total: dataList2.count,
                }}></Table>
            </>
          )}
        </section>
      </Content>
    </>
  );
};

export default GoodsDetail;

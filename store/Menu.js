import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { getUserPermission } from '@api';
import { User } from '@store';
const MENU_LIST = [
  {
    module: 'home',
    icon: 'desktop',
    name: '概览',
    isSuper: true,
    key: 'home',
  },
  {
    module: 'railWay',
    icon: 'interactionOutlined',
    name: '专线管理',
    key: 'railWay',
    permission: ['ROUTE_MANAGEMENT'],
    children: [
      {
        name: '开票专线',
        key: 'mine',
      },
      {
        name: '过磅专线',
        key: 'pound',
      },
      {
        name: '撮合专线',
        key: 'match',
      },
    ],
  },
  {
    module: 'transportManagement',
    icon: 'calendar',
    name: '运单管理',
    key: 'transportManagement',
    permission: ['ORDER_MANAGEMENT'],
    children: [
      {
        name: '运单列表',
        key: 'transportList',
      },
      {
        name: '专线结算支付',
        key: 'routeList',
      },
    ],
  },
  // {
  //   module: 'stationManagement',
  //   icon: 'robot',
  //   name: '站内管理',
  //   key: 'stationManagement',
  // },
  {
    module: 'contractManagement',
    icon: 'book',
    name: '合同管理',
    key: 'contractManagement',
    permission: ['CONTRACT_MANAGEMENT_READ'],
  },
  {
    module: 'customerManagement',
    icon: 'contacts',
    name: '我的客户',
    key: 'customerManagement',
    permission: ['ROUTE_MANAGEMENT'],
    children: [
      {
        name: '客户管理',
        key: 'company',
      },
      {
        name: '地址管理',
        key: 'address',
      },
      {
        name: '车队长管理',
        key: 'middleMan',
      },
    ],
  },
  {
    module: 'poundManagement',
    icon: 'bar-chart',
    name: '过磅管理',
    key: 'poundManagement',
    children: [
      {
        name: '人工结算',
        key: 'settlment',
      },
      {
        name: '数据报表',
        key: 'poundReport',
        permission: ['POUND_MANAGEMENT'],
      },
      {
        name: '磅单列表',
        key: 'poundRecord',
        permission: ['POUND_MANAGEMENT'],
      },
      {
        name: '设置',
        key: 'poundSetting',
        permission: ['POUND_MANAGEMENT'],
      },
    ],
  },
  {
    module: 'goodsManagement',
    icon: 'goods',
    name: '货品管理',
    key: 'goodsManagement',
    permission: ['GOODS_MANAGEMENT'],
  },
  {
    module: 'inventory',
    icon: 'appstore',
    name: '库存管理',
    key: 'inventory',
    children: [
      {
        name: '库存查询',
        key: 'inventoryQuery',
        permission: ['INVENTORY_SEARCH_OPERATE'],
      },
      {
        name: '实时库存',
        key: 'inventoryStatistical',
        permission: ['INVENTORY_DATA_READ'],
      },
      {
        name: '库存流水',
        key: 'inventoryWater',
        permission: ['INVENTORY_READ'],
      },
      {
        name: '库存盘点',
        key: 'stockTaking',
        permission: ['INVENTORY_CHECK_READ'],
      },
    ],
  },
  {
    module: 'productManagement',
    icon: 'product',
    name: '智慧工厂',
    key: 'productManagement',
    children: [
      // {
      //   module: 'statistical',
      //   icon: 'fundProjectionScreenOutlined',
      //   name: '数据面板',
      //   key: 'statistical',
      //   permission: ['DATA_PANEL_READ'],
      // },
      {
        name: '设备管理',
        key: 'equipmentManagement',
        permission: ['INTELLIGENT_COAL_BLENDING'],
      },
      {
        name: '洗煤列表',
        key: 'coalWashing',
        permission: ['INTELLIGENT_COAL_BLENDING'],
      },
      {
        name: '智能配煤',
        key: 'aiCoalBlending',
        permission: ['INTELLIGENT_COAL_BLENDING'],
      },
      {
        name: '配煤管理',
        key: 'coalBlendingManagement',
        permission: ['COAL_BLENDING_MANAGEMENT'],
      },
      {
        name: '配煤列表',
        key: 'coalBlendingList',
        // permission: ['COAL_BLENDING_LIST'],
      },
      {
        module: 'qualityManagement',
        icon: 'audit',
        name: '质检管理',
        key: 'qualityManagement',
        permission: ['INSPECTION_MANAGEMENT'],
      },
      {
        name: '生产监控',
        key: 'productionMonitoring',
      },
      {
        name: '全景VR',
        key: 'vriframe',
        permission: ['VR_COMPANY'],
      },
    ],
  },
  {
    module: 'finance',
    icon: 'file-done',
    name: '财务中心',
    key: 'finance',
    permission: ['FINANCE_CENTER_READ'],
    children: [
      { name: '账户资金', key: 'fund' },
      { name: '开票信息', key: 'main' },
      { name: '返税确认', key: 'taxConfirm', permission: ['FINANCE_TAX_CONFIRM'] },
    ],
  },
  {
    module: 'accountManagement',
    icon: 'solution',
    name: '账号管理',
    key: 'accountManagement/main',
    permission: ['ACCOUNT_MANAGEMENT'],
  },
];

// 代理商菜单
const AGENT_MENU_LIST = [
  {
    module: 'agent',
    icon: 'folder',
    name: '运费汇总',
    key: 'agent/transportAll',
  },
  {
    module: 'agent',
    icon: 'solution',
    name: '运费明细',
    key: 'agent/transportStatistics',
  },
  {
    module: 'agent',
    icon: 'user',
    name: '我的货主',
    key: 'agent/myShipper',
  },
];

// 个性化菜单
const PERSONALIZE_MENU_LIST = [
  {
    module: 'transportLine',
    icon: 'audit',
    name: '车辆轨迹',
    key: 'transportLine',
    personalize: ['18567382386'],
    children: [
      {
        name: '车辆轨迹',
        key: 'truckLine',
      },
      {
        name: '计费账单',
        key: 'billingBills',
      },
      {
        name: '查询记录',
        key: 'searchRecord',
      },
    ],
  },
];

const useMenu = () => {
  const [menuList, setMenuList] = useState([]);
  const [userMode, setUserMode] = useState(() => {
    if (typeof sessionStorage === 'undefined') {
      return 'agent';
    } else if (sessionStorage.getItem('isAgent') === '0') {
      return 'normal';
    } else {
      sessionStorage.setItem('isAgent', 1);
      return 'agent';
    }
  });
  const { userInfo, personalizeMenu } = User.useContainer();
  useEffect(() => {
    if (userInfo.id) {
      getData();
    }
  }, [userInfo]);

  const getData = async () => {
    const res = await getUserPermission();

    // 是否代理商模式
    const isAgentMode =
      userInfo.isAgent &&
      (sessionStorage.getItem('isAgent') === '1' || sessionStorage.getItem('isAgent') === undefined);
    if (res.status === 0) {
      const { is_boss, permissions } = res.result;

      /**
       * 判断顺序
       * 1. 特殊账号
       * 2. 主账号 -> 代理商
       * 3. 子账号
       */
      if (personalizeMenu) {
        let menu = PERSONALIZE_MENU_LIST.filter(item => personalizeMenu.includes(item.module));
        setMenuList(menu);
        return;
      }
      let menu = is_boss
        ? isAgentMode
          ? AGENT_MENU_LIST
          : MENU_LIST
        : MENU_LIST.filter(item => {
            // 权限配置
            if (item.permission) {
              return permissions.find(value => item.permission.includes(value));
            }
            // 只对主账号显示
            if (item.isSuper) {
              return is_boss;
            }
            // 过滤子模块
            if (item.children) {
              item.children = item.children.filter(citem => {
                if (citem.permission) {
                  return permissions.find(value => citem.permission.includes(value));
                }
                return true;
              });
            }

            return true;
          });
      setMenuList(menu);
    }
  };

  useEffect(() => {
    // 如果是代理商
    if (userInfo.isAgent === 1 && userInfo.is_boss) {
      if (userMode === 'normal') {
        setMenuList([...MENU_LIST]);
      } else {
        setMenuList([...AGENT_MENU_LIST]);
      }
    }
  }, [userMode]);

  return { menuList, userMode, setUserMode };
};

export default createContainer(useMenu);

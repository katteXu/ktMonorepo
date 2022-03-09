import { Drawer } from 'antd';

const Index = props => {
  // 切换展开
  const toggleShow = visible => {
    if (visible) {
      // 展开完成
    } else {
      // 关闭完成
      props.afterClose && props.afterClose();
    }
  };
  return (
    <>
      <Drawer
        className={props.className}
        title={props.title}
        placement="right"
        width={props.width || '1280'}
        onClose={() => props.onClose()}
        visible={props.showDrawer}
        afterVisibleChange={toggleShow}
        push={false}>
        {props.children}
      </Drawer>
    </>
  );
};
export default Index;

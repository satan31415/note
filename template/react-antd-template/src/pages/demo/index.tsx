import React, {useState} from "react";
import {Pagination, PaginationProps} from "antd";
import { QRCode, Space, theme } from 'antd';


const DemoPage: React.FC = () => {
  const { useToken } = theme;

  const [current, setCurrent] = useState(3);
  const { token } = useToken();

  const onChange: PaginationProps['onChange'] = (page) => {
    console.log(page);
    setCurrent(page);
  };
  return (
    <>
      <div>这是demo页面</div>
      <Pagination current={current} onChange={onChange} total={50} />

      <QRCode
        value="https://ant.design/"
        color={token.colorInfoText}
        bgColor={token.colorBgLayout}
      />
    </>
  )
}

export default DemoPage

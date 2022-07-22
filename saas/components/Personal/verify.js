/** @format */
import { useState, useEffect } from 'react';
import { Content, Image } from '@components';
import { useTokenImage } from '@components/Hooks';
import { User } from '@store';
import s from './personal.less';

const Verify = props => {
  const { userInfo, loading } = User.useContainer();
  const {
    images: [idCardFrontPic, idCardBackPic, handheldIdcardPic, businessLicensePic, accountPermitPic],
    buildUrl,
  } = useTokenImage(5);

  useEffect(() => {
    if (userInfo.id) {
      buildUrl([
        userInfo.idCardFrontPic,
        userInfo.idCardBackPic,
        userInfo.handheldIdcardPic,
        userInfo.businessLicensePic,
        userInfo.accountPermitPic,
      ]);
    }
  }, [loading]);

  return (
    <Content style={{ minHeight: 557 }}>
      <section className={s.verifyContent}>
        <div className={s.line}>
          <ul className={s.information}>
            <li>
              <span className={s.title}>真实姓名：</span>
              {userInfo.name}
            </li>
            <li>
              <span className={s.title}>身份证号：</span>
              {userInfo.idCardNumber}
            </li>
          </ul>
          <dl className={s.icon}>
            <dt>
              <img src={idCardFrontPic || Image.NoUrl} />
            </dt>
            <dd className={s.picText}>法人身份证正面</dd>
          </dl>
          <dl className={s.icon}>
            <dt>
              <img src={idCardBackPic || Image.NoUrl} />
            </dt>
            <dd className={s.picText}>法人身份证反面</dd>
          </dl>
          <dl className={s.icon}>
            <dt>
              <img src={handheldIdcardPic || Image.NoUrl} />
            </dt>
            <dd className={s.picText}>法人手持身份证信息面</dd>
          </dl>
        </div>
        <div className={s.line} style={{ border: 0, marginBottom: 0 }}>
          <ul className={s.information}>
            <li>
              <span className={s.title}>营业执照：</span>
              {userInfo.businessLicenseNum}
            </li>
            <li>
              <span className={s.title}>企业名称：</span>
              {userInfo.companyName}
            </li>
          </ul>
          <dl className={s.icon}>
            <dt>
              <img src={businessLicensePic || Image.NoUrl} />
            </dt>
            <dd className={s.picText}>营业执照</dd>
          </dl>
          <dl className={s.icon}>
            <dt>
              <img src={accountPermitPic || Image.NoUrl} />
            </dt>
            <dd className={s.picText}>开户许可证</dd>
          </dl>
        </div>
      </section>
    </Content>
  );
};

export default Verify;

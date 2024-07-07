import React,{useEffect, useState} from 'react'
import { Billing } from '../../types';
import * as Yup from 'yup';
import { Formik, Form, useFormikContext, FieldArray,Field, ErrorMessage, FormikProps,FieldArrayRenderProps, FieldProps } from 'formik';
import { CustomTextInput, CustomLongTextInput } from './common/inputs';
import store from '../../../store/store';
import NextButton from './nextbutton';
import BackButton from './backbutton';
import {axiosSecureAPI} from '../../../axios';
import Result from '../promotionform/result';
import { set } from 'react-hook-form';
import Warning from '../common/warning';
type Props = {
  next : () => void;
  prev : () => void;
  currentIndex : number;
}


const initialValues : Billing = {
  entranceFee: 0,
  bankName: '',
  account: '',
  accountHolder: '',
  refundInfo: ''
}

type CheckProps = {
  changeIsValid: (arg:boolean) => void;
}

const validationSchema = Yup.object().shape({
  entranceFee: Yup.number().required('필수항목입니다.'),
  bankName: Yup.string().required('필수항목입니다.'),
  account: Yup.string().required('필수항목입니다.'),
  accountHolder: Yup.string().required('필수항목입니다.'),
  refundInfo: Yup.string().required('필수항목입니다.'),
})


const CheckIsFilled = (props:CheckProps) => {
  const { values, submitForm } = useFormikContext<Billing>();

  const {changeIsValid} = props;
  useEffect(() => {
    const allFieldsFilled = Object.values(values).every(value => value !== '');
    if (allFieldsFilled) {
      changeIsValid(true);
    }
    else{ 
      changeIsValid(false);
    }
  }, [values, submitForm])
  return null;
}

const Step3 = (props: Props) => {
  const {useCreatePromotionStore} = store;
  const {updateData, getFullPromotionData} = useCreatePromotionStore();
  const {next,currentIndex,prev} = props;
  const [isValid,setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const changeIsValid = (value : boolean) => {
    setIsValid(value)
  }
 
  const [initialVal, setInitialVal] = useState<Billing>(getFullPromotionData().step3.billing);
  return (
    <div className={`relative w-full bg-system-background
       `}>
      <div className={`absolute top-0 w-full bg-system-white p-4
        ${submitSuccess ? 'invisible h-10px' : 'visible'}`}>
        <BackButton prev={prev}/>
        <Formik
          initialValues={initialVal}
          validationSchema={validationSchema}
          onSubmit={
            async (values, {setSubmitting}) => {
              setTimeout(() => {
                setSubmitting(false);
              }, 400);
              
              updateData({ step3 : {billing :values}})
              next();
            }
          }>

          <Form>
            <CustomTextInput label='티켓 가격을 알려주세요' name='entranceFee' type='number' placeholder='숫자만 입력해주세요' />
            <CustomTextInput label='은행명을 알려주세요' name='bankName' type='text' placeholder='은행명 ex) 카카오뱅크' />
            <CustomTextInput label='입금받을 계좌번호를 알려주세요' name='account' type='text' placeholder='계좌번호' />
            <CustomTextInput label='예금주를 알려주세요' name='accountHolder' type='text' placeholder='예금주 이름' />
            <CustomLongTextInput label='환불 정보를 입력해주세요' name='refundInfo' type='text' placeholder='환불 조건, 환불 문의 연락처를 입력해주세요' />
            <Warning/>
            <CheckIsFilled changeIsValid={changeIsValid}/>
            <NextButton isValid={isValid} currentIndex={currentIndex}/>
            
          </Form>
          
        </Formik>
        
      </div>
      
    </div>)
}

export default Step3
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker'
import { Input, InputProps } from '@pancakeswap/uikit'

import 'react-datepicker/dist/react-datepicker.css'

export interface DatePickerProps extends ReactDatePickerProps {
  inputProps?: InputProps
}

const DatePickerComponent = ReactDatePicker as any;

const DatePicker: React.FC<React.PropsWithChildren<DatePickerProps>> = ({ inputProps = {}, ...props }) => {
  return (
    <DatePickerComponent customInput={<Input {...inputProps} />} portalId="reactDatePicker" dateFormat="PPP" {...props} />
  )
}

export default DatePicker

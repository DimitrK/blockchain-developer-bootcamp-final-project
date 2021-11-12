import React, {useState, useCallback, useMemo} from 'react';
import AbiMethodSelect from '@/views/etherscan/methodSelect';
import {Typography, Space, Form, Input, Empty} from 'antd';
import {useEtherscanAbi} from '@/shared/providers/etherscanAbi';
import {useFormContext, useController} from 'react-hook-form';
import {$reactHookForm} from './symbols';

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 6}
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 14}
  }
};

export const ControlledFormInput = ({
  as: Kind = Input,
  name,
  required: _required,
  validate = {},
  error: _error,
  ...props
}) => {
  const {control} = useFormContext();
  const required = !!_required || !!props.inputProps?.required;
  const {
    field: {onChange, value},
    fieldState: {error}
  } = useController({
    // ...Kind[$reactHookForm],
    // ...props,
    // ...props.inputProps,
    control,
    name: name || props.inputProps?.name,
    required,
    rules: {
      ...Kind[$reactHookForm]?.rules,
      required: required,
      validate: {
        ...Kind[$reactHookForm]?.rules?.validate,
        ...validate,
        isError: value => !_error || _error,
      }
    }
  });

  const inputProps = useMemo(
    () => ({
      ...props.inputProps,
      value,
      onChange: (e) => {
        if (e.target) {
          onChange(e);
        } else {
          onChange({target: {value: e, name}});
        }
        props?.inputProps?.onChange?.(e);
      }
    }),
    [value, onChange, props.inputProps, name]
  );

  return <FormInput {...props} as={Kind} required={required} name={name} error={error} inputProps={inputProps} />;
};

const FormInput = ({as: Kind = Input, required, loading, validateStatus, inputKey, error, inputProps = {}, ...props}) => {
  const isRequired = required || inputProps.required;
  // console.log({inputProps});
  return (
    <Form.Item
      {...formItemLayout}
      {...props}
      required={isRequired}
      hasFeedback={loading || error || inputProps.value}
      validateStatus={validateStatus ? validateStatus : loading ? 'validating' : error ? 'error' : 'success'}
      help={error?.message}
    >
      <Kind {...inputProps} value={inputProps.value} key={inputKey} required={isRequired} />
    </Form.Item>
  );
};

export default FormInput;

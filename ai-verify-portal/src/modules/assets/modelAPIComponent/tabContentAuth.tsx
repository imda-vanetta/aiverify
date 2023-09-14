import { SelectInput } from 'src/components/selectInput';
import { optionsAuthMethods } from './selectOptions';
import { useFormikContext } from 'formik';
import { AuthType, ModelApiFormModel } from './types';
import { TextInput } from 'src/components/textInput';
import { useEffect } from 'react';

const authTypeFieldName = 'modelAPI.authType';
const authTypeConfigFieldName = 'modelAPI.authTypeConfig';

function TabContentAuth({ disabled = false }: { disabled?: boolean }) {
  const { values, errors, touched, setFieldValue, handleChange } =
    useFormikContext<ModelApiFormModel>();

  const fieldErrors = errors.modelAPI?.authTypeConfig;
  const touchedFields = touched.modelAPI?.authTypeConfig;

  useEffect(() => {
    setFieldValue(
      `${authTypeConfigFieldName}.authType`, // This is duplicated under authTypeConfig only for Yup validation field dependencies
      values.modelAPI.authType
    );
  }, [values.modelAPI.authType]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}>
      <SelectInput<AuthType>
        disabled={disabled}
        width={200}
        label="Authentication Type"
        name={authTypeFieldName}
        options={optionsAuthMethods}
        onSyntheticChange={handleChange}
        value={values.modelAPI.authType}
      />

      {values.modelAPI.authType === AuthType.BEARER_TOKEN ? (
        <div style={{ flexGrow: 1 }}>
          <TextInput
            disabled={disabled}
            label="Token"
            name={`${authTypeConfigFieldName}.token`}
            value={values.modelAPI.authTypeConfig.token}
            onChange={handleChange}
            style={{ width: 560 }}
            error={
              Boolean(fieldErrors?.token && touchedFields?.token)
                ? fieldErrors?.token
                : undefined
            }
          />
        </div>
      ) : null}
      {values.modelAPI.authType === AuthType.BASIC ? (
        <div style={{ display: 'flex' }}>
          <TextInput
            disabled={disabled}
            label="Username"
            name={`${authTypeConfigFieldName}.username`}
            value={values.modelAPI.authTypeConfig.username}
            onChange={handleChange}
            style={{
              marginRight: 8,
              width: 300,
            }}
            error={
              Boolean(fieldErrors?.username && touchedFields?.username)
                ? fieldErrors?.username
                : undefined
            }
          />
          <TextInput
            disabled={disabled}
            label="Password"
            name={`${authTypeConfigFieldName}.password`}
            value={values.modelAPI.authTypeConfig.password}
            onChange={handleChange}
            style={{ width: 300 }}
            error={
              Boolean(fieldErrors?.password && touchedFields?.password)
                ? fieldErrors?.password
                : undefined
            }
          />
        </div>
      ) : null}
    </div>
  );
}

export { TabContentAuth };
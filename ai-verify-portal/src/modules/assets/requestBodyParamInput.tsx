import { IconButton } from 'src/components/iconButton';
import { TextInput } from 'src/components/textInput';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import styles from './styles/newModelApiConfig.module.css';
import { ChangeEvent } from 'react';
import { SelectInput } from 'src/components/selectInput';
import { optionsOpenApiDataTypes } from './selectOptions';
import { BodyParam, OpenApiDataTypes } from './types';

type RequestBodyParameterInputProps = {
  value: BodyParam;
  showAddBtn?: boolean;
  onChange: (value: BodyParam) => void;
  onAddClick?: () => void;
  onDeleteClick?: (param: BodyParam) => void;
};

function RequestBodyParamsHeading() {
  return (
    <div style={{ display: 'flex', marginBottom: 4 }}>
      <div className={styles.headingName}>Property Name</div>
      <div className={styles.headingVal}>Data Type</div>
    </div>
  );
}

function RequestBodyParameterInput(props: RequestBodyParameterInputProps) {
  const {
    value,
    showAddBtn = false,
    onChange,
    onAddClick,
    onDeleteClick,
  } = props;
  const disableAddBtn = value.field.trim() === '' || value.type.trim() === '';

  function handleRemoveBtnClick(param: BodyParam) {
    return () => onDeleteClick && onDeleteClick(param);
  }

  function handleKeyChange(e: ChangeEvent<HTMLInputElement>) {
    const updatedParam: BodyParam = { ...value, field: e.target.value };
    onChange(updatedParam);
  }

  function handleTypeChange(val: OpenApiDataTypes) {
    const updatedParam = { ...value, type: val };
    onChange(updatedParam);
  }

  return (
    <div className={styles.keyValRow}>
      <div className={styles.keyValCol}>
        <TextInput
          value={value.field}
          name="paramName"
          onChange={handleKeyChange}
          maxLength={100}
          style={{ marginBottom: 0 }}
        />
      </div>
      <div className={styles.keyValCol}>
        <SelectInput<OpenApiDataTypes>
          name="propDataType"
          options={optionsOpenApiDataTypes}
          onChange={handleTypeChange}
          value={value.type}
          style={{ marginBottom: 0 }}
        />
      </div>
      {showAddBtn ? (
        <div className={styles.iconContainer}>
          <IconButton
            iconComponent={AddIcon}
            onClick={onAddClick}
            disabled={disableAddBtn}>
            <div
              style={{
                color: '#676767',
                fontSize: 15,
                margin: '0 6px',
              }}>
              Add
            </div>
          </IconButton>
        </div>
      ) : (
        <div className={styles.delIconContainer}>
          <IconButton
            iconComponent={CloseIcon}
            noOutline
            onClick={handleRemoveBtnClick(value)}
          />
        </div>
      )}
    </div>
  );
}

export { RequestBodyParameterInput, RequestBodyParamsHeading };
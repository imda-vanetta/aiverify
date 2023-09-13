import AddIcon from '@mui/icons-material/Add';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { GlobalVariable } from 'src/types/projectTemplate.interface';
import CloseIcon from '@mui/icons-material/Close';
import produce from 'immer';
import styles from './styles/rightpanel.module.css';
import clsx from 'clsx';

type GlobalVar = GlobalVariable;

type GlobalVarsProps = {
  variables: GlobalVar[];
  onAddClick: (variables: GlobalVar) => void;
  onRemoveClick: (variables: GlobalVar) => void;
};

type VariableRowProps = {
  globalVariable: GlobalVar;
  editable?: boolean;
  onEditClick: () => void;
  onEditConfirm: () => void;
  onKeyChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setEditGlobalVar: React.Dispatch<React.SetStateAction<GlobalVariable>>;
  onRemoveBtnClick: (globalVar: GlobalVar) => void;
  editedKey?: string;
  editedValue?: string;
  editModeGlobalVar?: GlobalVariable;
};

const newVar = { key: '', value: '' };

function VariableRow(props: VariableRowProps) {
  const {
    globalVariable,
    onRemoveBtnClick,
    onEditClick,
    onEditConfirm,
    editable = true,
    onKeyChange,
    onValueChange,
    setEditGlobalVar,
    editModeGlobalVar,
  } = props;
  const [showRemoveBtn, setShowRemoveBtn] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  function handleVarMouseOver() {
    setShowRemoveBtn(true);
  }

  function handleVarMouseLeave() {
    setShowRemoveBtn(false);
  }

  function handleRemoveBtnClick() {
    if (typeof onRemoveBtnClick === 'function') {
      onRemoveBtnClick(globalVariable);
    }
  }

  function handleVarClick() {
    if (!editable) return;
    setIsEditMode(true);
    setEditGlobalVar({ ...globalVariable });
    if (onEditClick) onEditClick();
  }

  function handeEditConfirm() {
    setIsEditMode(false);
    if (onEditConfirm) onEditConfirm();
  }

  function handleEditKeyChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditGlobalVar(
      produce((draft) => {
        draft.key = e.target.value;
      })
    );
  }

  function handleEditValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditGlobalVar(
      produce((draft) => {
        draft.value = e.target.value;
      })
    );
  }

  return !isEditMode ? (
    <div
      id={`varkey-${globalVariable.key}`}
      className={styles.gVarsRow}
      onMouseOver={handleVarMouseOver}
      onMouseLeave={handleVarMouseLeave}
      onClick={handleVarClick}>
      <div className={styles.gVarsCol}>{globalVariable.key}</div>
      <div className={styles.gVarsCol}>{globalVariable.value}</div>
      <div className={styles.gVarsDelCol} onClick={handleRemoveBtnClick}>
        {showRemoveBtn ? (
          <CloseIcon
            className={styles.gVarsRemoveBtn}
            fontSize="small"
            style={{ color: '#676767' }}
          />
        ) : null}
      </div>
    </div>
  ) : (
    <div className={clsx(styles.gVarsInputRow)}>
      <div className={styles.gVarsInputCol}>
        <input
          type="text"
          value={editModeGlobalVar && editModeGlobalVar.key}
          onChange={handleEditKeyChange}
        />
      </div>
      <div className={styles.gVarsInputCol}>
        <input
          type="text"
          value={editModeGlobalVar && editModeGlobalVar.value}
          onChange={handleEditValueChange}
        />
      </div>
      <button className={styles.gVarsAddBtn} onClick={handeEditConfirm}>
        <AddIcon fontSize="small" style={{ color: '#676767' }} />
      </button>
    </div>
  );
}

const GlobalVars = forwardRef<HTMLInputElement, GlobalVarsProps>(
  function GlobalVars(props: GlobalVarsProps, keyInputRef) {
    const { variables, onAddClick, onRemoveClick } = props;
    const [newGlobalVar, setNewGlobalVar] = useState<GlobalVar>(newVar);
    const [disableAddBtn, setDisableAddBtn] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [editGlobalVar, setEditGlobalVar] = useState<GlobalVar>(newVar);
    const { key, value } = newGlobalVar;

    function handleAddClick() {
      if (typeof onAddClick === 'function') {
        onAddClick(newGlobalVar);
      }
      setNewGlobalVar(newVar);
    }

    function handleKeyChange(e: React.ChangeEvent<HTMLInputElement>) {
      setNewGlobalVar(
        produce((draft) => {
          draft.key = e.target.value;
        })
      );
    }

    function handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
      setNewGlobalVar(
        produce((draft) => {
          draft.value = e.target.value;
        })
      );
    }

    function handleEnterKey(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Enter') {
        if (key && value) {
          if (variables.find((gvar) => gvar.key === key) !== undefined) {
            return;
          }
          if (typeof onAddClick === 'function') {
            onAddClick(newGlobalVar);
          }
          setNewGlobalVar(newVar);
        }
      }
    }

    function handeOnGlobalVarEdit() {
      setIsEditing(true);
    }

    function handleOnGlobalVarEditConfirm() {
      setIsEditing(false);
    }

    useEffect(() => {
      if (variables.find((gvar) => gvar.key === key) !== undefined) {
        setDisableAddBtn(true);
        return;
      }

      if (key === '' || value === '') {
        setDisableAddBtn(true);
        return;
      }

      setDisableAddBtn(false);
    }, [key, value, variables]);

    useEffect(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo(
          0,
          scrollContainerRef.current.scrollHeight
        );
      }
    }, [variables]);

    useEffect(() => {
      console.log(editGlobalVar);
    }, [editGlobalVar]);

    return (
      <div className={styles.gVarsContainer}>
        <div className={clsx(styles.gVarsRow, styles.gVarsRow_padRight)}>
          <div className={styles.gVarsHeading}>Name</div>
          <div className={styles.gVarsHeading}>Value</div>
          <div className={styles.gVarsDelCol}></div>
        </div>
        <div className={styles.gVarsScrollContainer} ref={scrollContainerRef}>
          {variables.map((globalVar) => (
            <VariableRow
              editable={!isEditing}
              key={globalVar.key}
              globalVariable={globalVar}
              onRemoveBtnClick={onRemoveClick}
              onEditClick={handeOnGlobalVarEdit}
              onEditConfirm={handleOnGlobalVarEditConfirm}
              setEditGlobalVar={setEditGlobalVar}
              editModeGlobalVar={editGlobalVar}
            />
          ))}
        </div>
        <div className={clsx(styles.gVarsInputRow, styles.gVarsRow_padRight)}>
          <div className={styles.gVarsInputCol}>
            <input
              disabled={isEditing}
              type="text"
              ref={keyInputRef}
              value={key}
              onKeyUp={handleEnterKey}
              onChange={handleKeyChange}
            />
          </div>
          <div className={styles.gVarsInputCol}>
            <input
              disabled={isEditing}
              type="text"
              value={value}
              onKeyUp={handleEnterKey}
              onChange={handleValueChange}
            />
          </div>
          <button
            className={styles.gVarsAddBtn}
            disabled={disableAddBtn}
            onClick={handleAddClick}>
            <AddIcon fontSize="small" style={{ color: '#676767' }} />
          </button>
        </div>
      </div>
    );
  }
);

export { GlobalVars };
export type { GlobalVar };

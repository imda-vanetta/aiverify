import styles from './styles/newModelApiConfig.module.css';
import { useEffect, useRef, useState } from 'react';
import { DragDropContext, DragUpdate } from 'react-beautiful-dnd';
import {
  AuthType,
  ModelApiFormModel,
  ModelApiGQLModel,
  RequestMethod,
  SaveResult,
  URLParamType,
} from './types';
import { Formik, Form, FieldArrayRenderProps, FormikErrors } from 'formik';
import { ModelApiLeftSection } from './leftSection';
import { Tab, TabButtonsGroup } from './tabButtons';
import { TabContentURLParams } from './tabContentUrlParams';
import { TabContentRequestBody } from './tabContentRequestBody';
import { TabContentResponse } from './tabContentResponse';
import { TabContentAdditionalHeaders } from './tabContentHeaders';
import { TabContentAuth } from './tabContentAuth';
import { useMutation } from '@apollo/client';
import {
  GQL_CREATE_MODELAPI,
  GQL_DELETE_MODELAPI,
  GQL_UPDATE_MODELAPI,
  GqlCreateModelAPIConfigResult,
  GqlDeleteModelAPIConfigResult,
  GqlUpdateModelAPIConfigResult,
} from './gql';
import { TabContentConnection } from './tabContentConnection';
import { ModalResult } from './modalResult';
import { ErrorWithMessage, toErrorWithMessage } from 'src/lib/errorUtils';
import { AlertType, StandardAlert } from 'src/components/standardAlerts';
import { useRouter } from 'next/router';
import { transformFormValuesToGraphModel } from './utils/modelApiUtils';
import { defaultFormValues } from './constants';
import { ModelAPIFormValidationSchema } from './validationSchema';
import { MinimalHeader } from 'src/modules/home/header';
import ConfirmationDialog from 'src/components/confirmationDialog';
import { AlertBoxSize } from 'src/components/alertBox';
import { PageLevelErrorAlert } from 'src/components/pageLeverlErrorAlert';
import { PresetHelper, PresetHelpItem } from './presetHelper';
import { PresetHelperProvider } from './providers/presetHelperProvider';
import { MethodUrlInput } from './methodUrlInput';

type FormikSetFieldvalueFn = (
  field: string,
  value: RequestMethod | AuthType | URLParamType,
  shouldValidate?: boolean | undefined
) => Promise<void | FormikErrors<ModelApiFormModel>>;

/*
  This id is only used for react component `key` props for the list of urlparams and request body property fields rendered.
  Do not use it for any other purposes.
 */
function initReactKeyIdGenerator() {
  let count = 0;
  return () => `input${Date.now()}${count++}`;
}

export const getInputReactKeyId = initReactKeyIdGenerator();

export type NewModelApiConfigModuleProps = {
  id?: string;
  disabled?: boolean;
  formValues?: ModelApiFormModel;
  entryPoint?: string;
  currentProjectId?: string;
};

function NewModelApiConfigModule(props: NewModelApiConfigModuleProps) {
  const {
    id,
    formValues,
    disabled = false,
    entryPoint,
    currentProjectId,
  } = props;
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (formValues) {
      return formValues.modelAPI.method === RequestMethod.POST
        ? Tab.REQUEST_BODY
        : Tab.URL_PARAMS;
    }
    return Tab.REQUEST_BODY;
  });
  const [showPageLevelAlert, setShowPageLevelAlert] = useState(false);
  const [showPresetHelper, setShowPresetHelper] = useState(false);
  const [showHelperBtn, setShowHelperBtn] = useState(() => id == undefined);
  const [PresetHelpItems, setPresetHelpItems] = useState<PresetHelpItem[]>([]);
  const [saveResult, setSaveResult] = useState<ErrorWithMessage | SaveResult>();
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [useVisibleTabsList, setUseVisibleTabsList] = useState(false);
  const paramsFormikArrayHelpersRef = useRef<FieldArrayRenderProps>();
  const [addNewModelAPIConfig] =
    useMutation<GqlCreateModelAPIConfigResult>(GQL_CREATE_MODELAPI);
  const [updateModelAPIConfig] =
    useMutation<GqlUpdateModelAPIConfigResult>(GQL_UPDATE_MODELAPI);
  const [deleteModelAPIConfig] =
    useMutation<GqlDeleteModelAPIConfigResult>(GQL_DELETE_MODELAPI);
  const router = useRouter();
  const initialFormValues = formValues || defaultFormValues;
  let visibleTabs: Tab[] = [];

  if (PresetHelpItems.indexOf(PresetHelpItem.GET) > -1) {
    visibleTabs.push(Tab.URL_PARAMS);
  }
  if (PresetHelpItems.indexOf(PresetHelpItem.POST) > -1) {
    visibleTabs.push(Tab.REQUEST_BODY);
  }
  if (PresetHelpItems.indexOf(PresetHelpItem.HEADERS) > -1) {
    visibleTabs.push(Tab.HEADERS);
  }
  if (
    PresetHelpItems.indexOf(PresetHelpItem.BASIC_AUTH) > -1 ||
    PresetHelpItems.indexOf(PresetHelpItem.AUTH_TOKEN) > -1
  ) {
    visibleTabs.push(Tab.AUTHENTICATION);
  }

  if (
    !showPresetHelper ||
    PresetHelpItems.length === 0 ||
    !useVisibleTabsList
  ) {
    visibleTabs = [
      Tab.URL_PARAMS,
      Tab.REQUEST_BODY,
      Tab.RESPONSE,
      Tab.HEADERS,
      Tab.AUTHENTICATION,
      Tab.OTHERS,
    ];
  }

  let modalResultTitle = '';
  let modalResultHeading = '';

  if (id === undefined) {
    modalResultTitle = 'Create New Model API Config';
    modalResultHeading = 'New API Configuration created';
  } else {
    if (saveResult && 'id' in saveResult) {
      if (saveResult.mode === 'new') {
        modalResultTitle = 'Create New Model API Config';
        modalResultHeading = 'New API Configuration created';
      } else if (saveResult.mode === 'update') {
        modalResultTitle = 'Update Model API Config';
        modalResultHeading = 'API Configuration Saved';
      } else {
        modalResultTitle = 'Delete Model API Config';
        modalResultHeading = 'API Configuration Deleted';
      }
    }
  }

  async function saveNewApiConfig(values: ModelApiFormModel) {
    const gqlModelAPIInput: ModelApiGQLModel =
      transformFormValuesToGraphModel(values);

    try {
      const result = await addNewModelAPIConfig({
        variables: { model: gqlModelAPIInput },
      });
      if (result.data && result.data.createModelAPI.id) {
        setSaveResult({ ...result.data.createModelAPI, mode: 'new' });
        setSaveInProgress(false);
      }
    } catch (err) {
      setSaveResult(toErrorWithMessage(err));
      setSaveInProgress(false);
    }
  }

  async function updateApiConfig(
    modelFileId: string,
    values: ModelApiFormModel
  ) {
    const gqlModelAPIInput: ModelApiGQLModel =
      transformFormValuesToGraphModel(values);

    try {
      const result = await updateModelAPIConfig({
        variables: { modelFileId, model: gqlModelAPIInput },
      });
      if (result.data && result.data.updateModelAPI.id) {
        setSaveResult({ ...result.data.updateModelAPI, mode: 'update' });
        setSaveInProgress(false);
      }
    } catch (err) {
      setSaveResult(toErrorWithMessage(err));
      setSaveInProgress(false);
    }
  }

  async function deleteApiConfig(deleteModelFileId: string) {
    try {
      const result = await deleteModelAPIConfig({
        variables: { deleteModelFileId },
      });
      if (result.data && result.data.deleteModelFile) {
        setSaveResult({ id: result.data.deleteModelFile, mode: 'delete' });
        setShowConfirmation(false);
        setSaveInProgress(false);
      }
    } catch (err) {
      setSaveResult(toErrorWithMessage(err));
      setShowConfirmation(false);
      setSaveInProgress(false);
    }
  }

  function handleConfirmation(confirm: boolean) {
    if (!confirm) {
      setShowConfirmation(false);
      return;
    }
    if (id == undefined) {
      return;
    }
    deleteApiConfig(id);
  }

  function handleFormSubmit(values: ModelApiFormModel) {
    setSaveInProgress(true);
    setIsDisabled(true);
    if (id != undefined) {
      updateApiConfig(id, values);
    } else {
      saveNewApiConfig(values);
    }
  }

  function handleBackClick() {
    if (entryPoint === 'selectModel') {
      if (!currentProjectId) {
        router.back();
      } else {
        router.push({
          pathname: `/project/${currentProjectId}`,
          query: { step: '4' },
        });
      }
    } else {
      router.push('/assets/models');
    }
  }

  function handleCloseAlertClick() {
    setShowPageLevelAlert(false);
  }

  function handleTabClick(tab: Tab) {
    return setActiveTab(tab);
  }

  function handleCloseResultClick() {
    if (saveResult && 'id' in saveResult) {
      if (saveResult.mode === 'new') {
        router.push(`/assets/modelApiConfig/${saveResult.id}`);
      } else if (saveResult.mode === 'delete') {
        router.push('/assets/models');
      }
      setSaveResult(undefined);
      return;
    }
    setSaveResult(undefined);
  }

  function handleRequestMethodChange(val: RequestMethod) {
    if (
      activeTab !== Tab.AUTHENTICATION &&
      activeTab !== Tab.RESPONSE &&
      activeTab !== Tab.HEADERS &&
      activeTab !== Tab.OTHERS
    ) {
      setActiveTab(
        val === RequestMethod.GET ? Tab.URL_PARAMS : Tab.REQUEST_BODY
      );
    }
  }

  function handleDrop(droppedItem: DragUpdate) {
    if (!droppedItem.destination) return;
    if (paramsFormikArrayHelpersRef.current)
      paramsFormikArrayHelpersRef.current.move(
        droppedItem.source.index,
        droppedItem.destination.index
      );
  }

  function handleGuidelineSelected(setFieldValue: FormikSetFieldvalueFn) {
    return (types: PresetHelpItem[]) => {
      if (types.indexOf(PresetHelpItem.GET) > -1) {
        setFieldValue('modelAPI.method', RequestMethod.GET);
        if (types.indexOf(PresetHelpItem.QUERY) > -1) {
          setFieldValue('modelAPI.parameters.paramType', URLParamType.QUERY);
        } else if (types.indexOf(PresetHelpItem.PATH)) {
          setFieldValue('modelAPI.parameters.paramType', URLParamType.PATH);
        }
        handleRequestMethodChange(RequestMethod.GET);
      } else if (types.indexOf(PresetHelpItem.POST) > -1) {
        setFieldValue('modelAPI.method', RequestMethod.POST);
        handleRequestMethodChange(RequestMethod.POST);
      }

      if (types.indexOf(PresetHelpItem.BASIC_AUTH) > -1) {
        setFieldValue('modelAPI.authType', AuthType.BASIC);
      } else if (types.indexOf(PresetHelpItem.AUTH_TOKEN) > -1) {
        setFieldValue('modelAPI.authType', AuthType.BEARER_TOKEN);
      } else if (types.indexOf(PresetHelpItem.NO_AUTH) > -1) {
        setFieldValue('modelAPI.authType', AuthType.NO_AUTH);
        if (types.indexOf(PresetHelpItem.GET) > -1) {
          setActiveTab(Tab.URL_PARAMS);
        } else if (types.indexOf(PresetHelpItem.POST) > -1) {
          setActiveTab(Tab.REQUEST_BODY);
        }
      }

      if (PresetHelpItems.length === 0) {
        handleGuideToggleAllTabs(true);
      }
      setPresetHelpItems([...types]);
    };
  }

  function handleNeedHelpClick() {
    setShowPresetHelper(true);
    setShowHelperBtn(false);
  }

  function handleCloseGuidelinesClick() {
    setShowPresetHelper(false);
    setShowHelperBtn(true);
  }

  function handleGuideToggleAllTabs(useVisibleTabsList: boolean) {
    setUseVisibleTabsList(useVisibleTabsList);
  }

  useEffect(() => {
    setIsDisabled(disabled);
  }, [disabled]);

  return (
    <div>
      <DragDropContext onDragEnd={handleDrop}>
        <MinimalHeader />
        <div className="layoutContentArea">
          <div className="scrollContainer">
            <div className="mainContainer">
              <div className={styles.container__limits}>
                <div className={styles.layout}>
                  <Formik
                    initialValues={initialFormValues}
                    validationSchema={ModelAPIFormValidationSchema}
                    onSubmit={handleFormSubmit}>
                    {({ values, setFieldValue, errors, touched }) => {
                      return (
                        <PresetHelperProvider>
                          <Form>
                            <div style={{ marginBottom: '25px' }}>
                              <h3 className="screenHeading">
                                {id !== undefined
                                  ? 'Update API Configuration'
                                  : 'Create API Configuration'}
                              </h3>
                              <p className="headingDescription">
                                {id !== undefined
                                  ? 'Update API configuration needed to connect to the AI model server'
                                  : 'Create a new API configuration needed to connect to the AI model server'}
                              </p>
                            </div>
                            <div className={styles.pageLevelError}>
                              {showPageLevelAlert &&
                              Object.keys(errors).length &&
                              Object.keys(touched).length ? (
                                <PageLevelErrorAlert
                                  headingText="Field-level errors"
                                  content="Please ensure all the necessary inputs are
                                valid"
                                  disableCloseIcon={false}
                                  onCloseIconClick={handleCloseAlertClick}
                                />
                              ) : null}
                              {showPresetHelper && !showPageLevelAlert ? (
                                <PresetHelper
                                  onSelect={handleGuidelineSelected(
                                    setFieldValue
                                  )}
                                  onCloseIconClick={handleCloseGuidelinesClick}
                                  onToggleAllTabsClick={
                                    handleGuideToggleAllTabs
                                  }
                                />
                              ) : null}
                            </div>
                            {showHelperBtn ? (
                              <div className={styles.needHelpRow}>
                                <button
                                  type="button"
                                  style={{ textTransform: 'none', padding: 0 }}
                                  className="aivBase-button aivBase-button--link aivBase-button--small"
                                  onClick={handleNeedHelpClick}>
                                  Need Help?
                                </button>
                              </div>
                            ) : null}
                            <div className={styles.apiConfigForm}>
                              <div className={styles.leftSection}>
                                <ModelApiLeftSection disabled={isDisabled} />
                              </div>
                              <div className={styles.vDivider} />
                              <div className={styles.rightSection}>
                                <MethodUrlInput
                                  disabled={isDisabled}
                                  onRequestMethodChange={
                                    handleRequestMethodChange
                                  }
                                />
                                <div className={styles.tabs}>
                                  <div className={styles.tabsHeading}>
                                    HTTP Request and Connection Settings
                                  </div>
                                  <TabButtonsGroup
                                    visibleTabs={visibleTabs}
                                    onTabClick={handleTabClick}
                                    activeTab={activeTab}
                                  />
                                  <div className={styles.tabsDivider} />
                                  <div className={styles.tabContent}>
                                    {values.modelAPI.method ===
                                      RequestMethod.GET &&
                                    activeTab === Tab.URL_PARAMS ? (
                                      <TabContentURLParams
                                        ref={paramsFormikArrayHelpersRef}
                                        disabled={isDisabled}
                                      />
                                    ) : null}

                                    {activeTab === Tab.REQUEST_BODY ? (
                                      <TabContentRequestBody
                                        disabled={isDisabled}
                                      />
                                    ) : null}

                                    {activeTab === Tab.HEADERS ? (
                                      <TabContentAdditionalHeaders
                                        disabled={isDisabled}
                                      />
                                    ) : null}

                                    {activeTab === Tab.RESPONSE ? (
                                      <TabContentResponse
                                        disabled={isDisabled}
                                      />
                                    ) : null}

                                    {activeTab === Tab.AUTHENTICATION ? (
                                      <TabContentAuth disabled={isDisabled} />
                                    ) : null}

                                    {activeTab === Tab.OTHERS ? (
                                      <TabContentConnection
                                        disabled={isDisabled}
                                      />
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className={styles.buttons}>
                              <button
                                type="button"
                                style={{ width: 180 }}
                                className="aivBase-button aivBase-button--secondary aivBase-button--medum"
                                onClick={handleBackClick}>
                                {entryPoint === 'selectModel'
                                  ? 'Back to Project'
                                  : 'Back to AI Models'}
                              </button>
                              <div>
                                {isDisabled && id !== undefined ? (
                                  <button
                                    type="button"
                                    style={{ width: 100 }}
                                    className="aivBase-button aivBase-button--outlined aivBase-button--medium"
                                    onClick={() => {
                                      setIsDisabled(true);
                                      setShowConfirmation(true);
                                    }}>
                                    Delete
                                  </button>
                                ) : null}
                                {isDisabled && id !== undefined ? (
                                  <button
                                    type="button"
                                    style={{ width: 100 }}
                                    className="aivBase-button aivBase-button--primary aivBase-button--medium"
                                    onClick={() => setIsDisabled(false)}>
                                    Edit
                                  </button>
                                ) : null}
                                {!isDisabled && id !== undefined ? (
                                  <button
                                    type="button"
                                    style={{ width: 140 }}
                                    className="aivBase-button aivBase-button--secondary aivBase-button--medium"
                                    onClick={() => setIsDisabled(true)}>
                                    Cancel Edit
                                  </button>
                                ) : null}
                                {!isDisabled ? (
                                  <button
                                    disabled={saveInProgress}
                                    type="submit"
                                    style={{ width: 100, marginRight: 0 }}
                                    className="aivBase-button aivBase-button--primary aivBase-button--medium"
                                    onClick={() => {
                                      setShowPageLevelAlert(true);
                                    }}>
                                    Save
                                  </button>
                                ) : null}
                              </div>
                            </div>
                            {showConfirmation ? (
                              <ConfirmationDialog
                                renderInPortal
                                disablePrimaryBtn={saveInProgress}
                                size={AlertBoxSize.MEDIUM}
                                title="Delete Model API Config"
                                onClose={handleConfirmation}>
                                <StandardAlert
                                  disableCloseIcon
                                  alertType={AlertType.WARNING}
                                  headingText="Confirm Delete"
                                  style={{ border: 'none' }}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      fontSize: 14,
                                    }}>
                                    <div>
                                      Are you sure you want to delete this
                                      configuration?
                                    </div>
                                    <div style={{ marginTop: 5 }}>
                                      ID:&nbsp;
                                      <span style={{ fontWeight: 800 }}>
                                        {id}
                                      </span>
                                    </div>
                                    <div>
                                      Config Name:&nbsp;
                                      <span style={{ fontWeight: 800 }}>
                                        {values.name}
                                      </span>
                                    </div>
                                    <div>
                                      Model Type:&nbsp;
                                      <span style={{ fontWeight: 800 }}>
                                        {values.modelType}
                                      </span>
                                    </div>
                                  </div>
                                </StandardAlert>
                              </ConfirmationDialog>
                            ) : null}
                          </Form>
                        </PresetHelperProvider>
                      );
                    }}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DragDropContext>
      {saveResult ? (
        <ModalResult
          title={modalResultTitle}
          onCloseClick={handleCloseResultClick}
          onOkClick={handleCloseResultClick}>
          <div>
            {'id' in saveResult ? (
              <StandardAlert
                disableCloseIcon
                alertType={AlertType.SUCCESS}
                headingText={modalResultHeading}
                style={{ border: 'none' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: 14,
                  }}>
                  <div style={{ marginTop: 5 }}>
                    ID:&nbsp;
                    <span style={{ fontWeight: 800 }}>{saveResult.id}</span>
                  </div>
                  {saveResult.name !== undefined ? (
                    <div>
                      Config Name:&nbsp;
                      <span style={{ fontWeight: 800 }}>{saveResult.name}</span>
                    </div>
                  ) : null}
                  {saveResult.modelType !== undefined ? (
                    <div>
                      Model Type:&nbsp;
                      <span style={{ fontWeight: 800 }}>
                        {saveResult.modelType}
                      </span>
                    </div>
                  ) : null}
                </div>
              </StandardAlert>
            ) : (
              <StandardAlert
                disableCloseIcon
                alertType={AlertType.ERROR}
                headingText="Check configuration"
                style={{ border: 'none' }}>
                <div style={{ display: 'flex', fontSize: 14 }}>
                  <div>{saveResult.message}</div>
                </div>
              </StandardAlert>
            )}
          </div>
        </ModalResult>
      ) : null}
    </div>
  );
}

export { NewModelApiConfigModule };

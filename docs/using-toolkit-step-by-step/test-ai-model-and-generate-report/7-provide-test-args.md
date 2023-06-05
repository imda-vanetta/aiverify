The _AI Verify Summary Report Template for Classification Models_ requires **Fairness** (Fairness Metrics Toolbox for Classification), **Robustness** (Robustness Toolbox) and **Explainability** (SHAP Toolbox) tests to be run. These tests require configuration of some test arguments in addition to the Datasets and AI Model files uploaded. For more information on these tests [(see References > List of AI Verify Plugins)](#).

![test-args](../../res/test-ai-model-generate-report/input-block-3.png)

Click on **‘Open’** for Fairness Metrics Toolbox for Classification. Provide the test argument:

| Test Argument                           | Description                                                              | Value | 
| --------------------------------------- | ------------------------------------------------------------------------ | ----- |
| **(required) Sensitive Feature Names:** | This is the column name of the sensitive feature in the testing dataset. | gender, race |

If there are more than one sensitive feature, click on ‘+’.

Click on **‘Ok’**.

![sensitive-feature](../../res/test-ai-model-generate-report/fmt.png)

Click on **‘Open’** for Robustness Toolbox.

Provide the test arguments:

| Test Argument                                    | Description                                                                                                                                                                       | Value |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| **Annotated ground truth path\***                | This is the path to the annotated ground truth file for image datasets. [(See Getting Started > Preparation of Input Files)](../../getting-started/preparation-of-input-files.md) | Select the path to testing dataset |
| **Name of column containing image file names\*** | This is the column name in the annotated ground truth file for image datasets that contains the image file names.                                                                 | file_name |

_\*This argument is required only if you are testing an image dataset. For tabular datasets like the one used in this tutorial, it can be left blank._

Click on **‘Ok’**.

![robustness-toolbox](../../res/test-ai-model-generate-report/rt.png)

Click on **‘Open’** for SHAP Toolbox.

Provide the test arguments:

| Test Argument                             | Description                                                                                                                                                                             | Value | 
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -----|
| **(required) Type of Explainability**     | This is the type of explainability test to be run.                                                                                                                                      | Select "global" |
| **(required) Path of the Background**     | This is the path to the background dataset to be used to create permutations. [(See Getting Started > Preparation of Input Files)](../../getting-started/preparation-of-input-files.md) | Select the path to testing dataset |
| **(required) Size of the Background\***   | This is the number of data points from the background dataset to be sampled. Enter 0 to skip sampling and use the entire dataset.                                                       | 100 |
| **(required) Type of the Test Dataset\*** | This is the number of data points from the test dataset to be sampled. Enter 0 to skip sampling and use the entire dataset.                                                             | 100 |

_\*Recommended number of test data points is 100, selecting a larger sample will require a longer computation time._

Click on **'Ok'**.

![shap-toolbox](../../res/test-ai-model-generate-report/shap.png)

The completion of required *Test Arguments* can be tracked in the progress accordion. Tests with invalid arguments will not be able to run.

![invalid-arg](../../res/test-ai-model-generate-report/input-block-4.png)
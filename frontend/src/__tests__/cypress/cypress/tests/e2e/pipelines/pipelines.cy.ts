import { createOpenShiftProject, deleteOpenShiftProject } from '~/__tests__/cypress/cypress/utils/oc_commands/project';
import { createDataConnection } from '~/__tests__/cypress/cypress/utils/oc_commands/dataConnection';
import { createDSPASecret, createDSPA } from '~/__tests__/cypress/cypress/utils/oc_commands/dspa';
import { replacePlaceholdersInYaml } from '~/__tests__/cypress/cypress/utils/yaml_files';
import { ADMIN_USER } from '~/__tests__/cypress/cypress/utils/e2eUsers';
import { AWS_BUCKETS } from '~/__tests__/cypress/cypress/utils/s3Buckets';

import { projectListPage, projectDetails } from '~/__tests__/cypress/cypress/pages/projects';
import { pipelineImportModal } from '~/__tests__/cypress/cypress/pages/pipelines/pipelineImportModal';
import { createRunPage } from '~/__tests__/cypress/cypress/pages/pipelines/createRunPage';
import {
  pipelineDetails,
  pipelineRunDetails,
} from '~/__tests__/cypress/cypress/pages/pipelines/topology';

const projectName = 'test-pipelines-prj';
const dspaSecretName = 'dashboard-dspa-secret';
const testPipelineName = 'test-pipelines-pipeline';
const testRunName = 'test-pipelines-run';

describe('An admin user can import and run a pipeline', { testIsolation: false }, () => {
  before(() => {
    // Provision a Project
    createOpenShiftProject(projectName);

    // Create a pipeline compatible Data Connection
    const dataConnectionReplacements = {
      NAMESPACE: projectName,
      AWS_ACCESS_KEY_ID: Buffer.from(AWS_BUCKETS.AWS_ACCESS_KEY_ID).toString('base64'),
      AWS_DEFAULT_REGION: Buffer.from(AWS_BUCKETS.BUCKET_2.REGION).toString('base64'),
      AWS_S3_BUCKET: Buffer.from(AWS_BUCKETS.BUCKET_2.NAME).toString('base64'),
      AWS_S3_ENDPOINT: Buffer.from(AWS_BUCKETS.BUCKET_2.ENDPOINT).toString('base64'),
      AWS_SECRET_ACCESS_KEY: Buffer.from(AWS_BUCKETS.AWS_SECRET_ACCESS_KEY).toString('base64'),
    };
    createDataConnection(dataConnectionReplacements);

    // Configure Pipeline server: Create DSPA Secret
    const dspaSecretReplacements = {
      DSPA_SECRET_NAME: dspaSecretName,
      NAMESPACE: projectName,
      AWS_ACCESS_KEY_ID: Buffer.from(AWS_BUCKETS.AWS_ACCESS_KEY_ID).toString('base64'),
      AWS_SECRET_ACCESS_KEY: Buffer.from(AWS_BUCKETS.AWS_SECRET_ACCESS_KEY).toString('base64'),
    };
    createDSPASecret(dspaSecretReplacements);

    // Configure Pipeline server: Create DSPA
    const dspaReplacements = {
      DSPA_SECRET_NAME: dspaSecretName,
      NAMESPACE: projectName,
      AWS_S3_BUCKET: AWS_BUCKETS.BUCKET_2.NAME
    };
    createDSPA(dspaReplacements);

    
    
    // cy.fixture('resources/yaml/data_connection.yml').then((yamlContent) => {
    //   const modifiedYamlContent = replacePlaceholdersInYaml(
    //     yamlContent,
    //     dataConnectionReplacements,
    //   );
    //   applyOpenShiftYaml(modifiedYamlContent).then((result) => {
    //     expect(result.code).to.eq(0);
    //   });
    // });

    // // Configure Pipeline server: Create DSPA Secret
    // const dspaSecretReplacements = {
    //   DSPA_SECRET_NAME: dspaSecretName,
    //   NAMESPACE: projectName,
    //   AWS_ACCESS_KEY_ID: Buffer.from(AWS_BUCKETS.AWS_ACCESS_KEY_ID).toString('base64'),
    //   AWS_SECRET_ACCESS_KEY: Buffer.from(AWS_BUCKETS.AWS_SECRET_ACCESS_KEY).toString('base64'),
    // };
    // cy.fixture('resources/yaml/dspa_secret.yml').then((yamlContent) => {
    //   const modifiedYamlContent = replacePlaceholdersInYaml(yamlContent, dspaSecretReplacements);
    //   applyOpenShiftYaml(modifiedYamlContent).then((result) => {
    //     expect(result.code).to.eq(0);
    //   });
    // });

    // // Configure Pipeline server: Create DSPA
    // const dspaReplacements = {
    //   DSPA_SECRET_NAME: dspaSecretName,
    //   NAMESPACE: projectName,
    //   AWS_S3_BUCKET: AWS_BUCKETS.BUCKET_2.NAME,
    // };
    // cy.fixture('resources/yaml/dspa.yml').then((yamlContent) => {
    //   const modifiedYamlContent = replacePlaceholdersInYaml(yamlContent, dspaReplacements);
    //   applyOpenShiftYaml(modifiedYamlContent).then((result) => {
    //     expect(result.code).to.eq(0);
    //   });
    // });
  });

  after(() => {
    // Delete provisioned Project
    deleteOpenShiftProject(projectName);
  });

  it('An admin User can Import and Run a Pipeline', () => {

    // Login as an admin
    cy.visitWithLogin('/', ADMIN_USER);

    /**
     * Import Pipeline by URL from Project Details view
     */
    projectListPage.navigate();

    // Open the project
    projectListPage.findProjectLink(projectName).click();
    
    // Increasing the timeout to ~3mins so the DSPA can be loaded
    projectDetails.findImportPipelineButton(180000).click();

    // Fill tue Import Pipeline modal
    pipelineImportModal.findPipelineNameInput().type(testPipelineName);
    pipelineImportModal.findPipelineDescriptionInput().type('Pipeline Description');
    pipelineImportModal.findImportPipelineRadio().click();
    pipelineImportModal
      .findPipelineUrlInput()
      .type(
        'https://raw.githubusercontent.com/red-hat-data-services/ods-ci/master/ods_ci/tests/Resources/Files/pipeline-samples/v2/flip_coin_compiled.yaml',
      );
    pipelineImportModal.submit();

    //Verify that we are at the details page of the pipeline by checking the title
    pipelineDetails.findPageTitle().should('have.text', testPipelineName);

    /**
     * Run the Pipeline using the Actions button in the pipeline detail view
     */

    pipelineDetails.selectActionDropdownItem('Create run');

    //Fill the Create run fields
    createRunPage.findExperimentSelect().click();
    createRunPage.selectExperimentByName('Default');
    createRunPage.fillName(testRunName);
    createRunPage.fillDescription('Run Description');
    createRunPage.findSubmitButton().click();

    //Redirected to the Graph view of the created run
    pipelineRunDetails.expectStatusLabelToBe('Succeeded');
  });
});

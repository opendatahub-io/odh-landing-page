import { deleteOpenShiftProject } from '~/__tests__/cypress/cypress/utils/oc_commands/project';
import { HTPASSWD_CLUSTER_ADMIN_USER } from '~/__tests__/cypress/cypress/utils/e2eUsers';
import { projectListPage, projectDetails } from '~/__tests__/cypress/cypress/pages/projects';
import { pipelineImportModal } from '~/__tests__/cypress/cypress/pages/pipelines/pipelineImportModal';
import { createRunPage } from '~/__tests__/cypress/cypress/pages/pipelines/createRunPage';
import { pipelineRunsGlobal } from '~/__tests__/cypress/cypress/pages/pipelines/pipelineRunsGlobal';
import {
  pipelineDetails,
  pipelineRunDetails,
} from '~/__tests__/cypress/cypress/pages/pipelines/topology';
import { provisionProjectForPipelines } from '~/__tests__/cypress/cypress/utils/pipelines';
import { getIrisPipelinePath } from '../../../utils/fileImportUtils';

const projectName = 'test-pipelines-prj';
const dspaSecretName = 'dashboard-dspa-secret';
const testPipelineName = 'test-pipelines-pipeline';
const testPipelineIrisName = 'test-iris-pipeline';
const testRunName = 'test-pipelines-run';

describe('An admin user can import and run a pipeline', { testIsolation: false }, () => {
  // before(() => {
  //   // Create a Project for pipelines
  //   provisionProjectForPipelines(projectName, dspaSecretName);
  // });

  // after(() => {
  //   // Delete provisioned Project
  //   deleteOpenShiftProject(projectName);
  // });

  it.skip('An admin User can Import and Run a Pipeline', () => {
    cy.step('Navigate to DSP ${projectName}');
    cy.visitWithLogin('/', HTPASSWD_CLUSTER_ADMIN_USER);
    projectListPage.navigate();
    projectListPage.filterProjectByName(projectName);
    projectListPage.findProjectLink(projectName).click();

    cy.step('Import a pipeline by URL');
    // Increasing the timeout to ~3mins so the DSPA can be loaded
    projectDetails.findImportPipelineButton(180000).click();
    // Fill the Import Pipeline modal
    pipelineImportModal.findPipelineNameInput().type(testPipelineName);
    pipelineImportModal.findPipelineDescriptionInput().type('Pipeline Description');
    pipelineImportModal.findImportPipelineRadio().click();
    pipelineImportModal
      .findPipelineUrlInput()
      .type(
        'https://raw.githubusercontent.com/opendatahub-io/odh-dashboard/refs/heads/main/frontend/src/__tests__/resources/pipelines_samples/dummy_pipeline_compiled.yaml',
      );
    pipelineImportModal.submit();

    // Verify that we are at the details page of the pipeline by checking the title
    // It can take a little longer to load
    pipelineDetails.findPageTitle(60000).should('have.text', testPipelineName);

    cy.step('Run the pipeline from the Actions button in the pipeline detail view');
    pipelineDetails.selectActionDropdownItem('Create run');
    createRunPage.experimentSelect.findToggleButton().click();
    createRunPage.selectExperimentByName('Default');
    createRunPage.fillName(testRunName);
    createRunPage.fillDescription('Run Description');
    createRunPage.findSubmitButton().click();

    cy.step('Expect the run to Succeed');
    //Redirected to the Graph view of the created run
    pipelineRunDetails.expectStatusLabelToBe('Succeeded', 180000);
  });

  it('Verify User Can Create, Run and Delete A DS Pipeline From DS Project Details Page Using Custom Pip Mirror', () => {
    cy.step('Navigate to DSP ${projectName}');
    cy.visitWithLogin('/', HTPASSWD_CLUSTER_ADMIN_USER);
    projectListPage.navigate();
    projectListPage.filterProjectByName(projectName);
    projectListPage.findProjectLink(projectName).click();

    cy.step('Import a pipeline from a yaml local file');
    // Increasing the timeout to ~3mins so the DSPA can be loaded
    projectDetails.findImportPipelineButton(180000).click();
    // Fill the Import Pipeline modal
    pipelineImportModal.findPipelineNameInput().type(testPipelineIrisName);
    pipelineImportModal.findUploadPipelineRadio().click();
    pipelineImportModal.uploadPipelineYaml(getIrisPipelinePath());
    pipelineImportModal.submit();

    // Verify that we are at the details page of the pipeline by checking the title
    // It can take a little longer to load
    pipelineDetails.findPageTitle(60000).should('have.text', testPipelineIrisName);

    cy.step('Create a ${testPipelineIrisName} pipeline run from the Runs view');
    pipelineRunsGlobal.navigate();
    pipelineRunsGlobal.findCreateRunButton().click();

    // cy.step('Run the pipeline from the Actions button in the pipeline detail view');
    // pipelineDetails.selectActionDropdownItem('Create run');
    // //Fill the Create run fields
    // createRunPage.experimentSelect.findToggleButton().click();
    // createRunPage.selectExperimentByName('Defsault');
    // createRunPage.fillName(testRunName);
    // createRunPage.fillDescription('Run Description');
    // createRunPage.findSubmitButton().click();

    // cy.step('Expect the run to Succeed');
    // //Redirected to the Graph view of the created run
    // pipelineRunDetails.expectStatusLabelToBe('Succeeded', 180000);
  });
});

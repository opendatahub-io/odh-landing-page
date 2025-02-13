import { mockDashboardConfig, mockDscStatus } from '~/__mocks__';
import { modelDetailsPage } from '~/__tests__/cypress/cypress/pages/modelDetailsPage';
/* eslint-disable no-restricted-syntax */
import { ConfigMapModel } from '~/api/models';
import type { ConfigMapKind } from '~/k8sTypes';
import { mockConfigMap } from '~/__mocks__/mockConfigMap';
import { mockModelCatalogSource } from '~/__mocks__/mockModelCatalogSource';

const mockModelCatalogConfigMap = (): ConfigMapKind =>
  mockConfigMap({
    name: 'model-catalog-source-redhat',
    namespace: 'opendatahub',
    data: {
      modelCatalogSource: JSON.stringify(mockModelCatalogSource({})),
    },
  });

const initIntercepts = () => {
  cy.interceptOdh(
    'GET /api/dsc/status',
    mockDscStatus({
      installedComponents: {
        'model-registry-operator': true,
      },
    }),
  );

  cy.interceptOdh(
    'GET /api/config',
    mockDashboardConfig({
      disableModelCatalog: false,
    }),
  );

  cy.interceptK8s(
    {
      model: ConfigMapModel,
      ns: 'opendatahub',
      name: 'model-catalog-source-redhat',
    },
    mockModelCatalogConfigMap(),
  );
};

describe('Model details page', () => {
  beforeEach(() => {
    initIntercepts();
  });
  it('Model details page', () => {
    modelDetailsPage.visit();
    modelDetailsPage.findRegisterModelButton().should('be.enabled');
    modelDetailsPage
      .findLongDescription()
      .should(
        'have.text',
        'Granite-8B-Code-Instruct is a 8B parameter model fine tuned from\n    Granite-8B-Code-Base on a combination of permissively licensed instruction\n    data to enhance instruction following capabilities including logical\n    reasoning and problem-solving skills.',
      );
    modelDetailsPage.findModelVersion().should('have.text', 'Version1.3-1732870892');
    modelDetailsPage.findModelLicense().should('have.text', 'Licenseapache-2.0');
    modelDetailsPage.findModelProvider().should('have.text', 'ProviderIBM');
    modelDetailsPage
      .findModelSourceImageLocation()
      .should(
        'have.text',
        'oci://registry.redhat.io/rhelai1/granite-8b-code-instruct:1.3-1732870892',
      );
  });
});

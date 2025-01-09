import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as _ from 'lodash-es';
import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { useWatchComponents } from '~/utilities/useWatchComponents';
import ApplicationsPage from '~/pages/ApplicationsPage';
import { OdhApplication } from '~/types';
import { useQueryParams } from '~/utilities/useQueryParams';
import { removeQueryArgument, setQueryArgument } from '~/utilities/router';
import { ODH_PRODUCT_NAME } from '~/utilities/const';
import { useAppContext } from '~/app/AppContext';
import TitleWithIcon from '~/concepts/design/TitleWithIcon';
import { ProjectObjectType } from '~/concepts/design/utils';
import ExploreApplicationsList from '~/pages/exploreApplication/ExploreApplicationsList';
import GetStartedPanel from './GetStartedPanel';

import './ExploreApplications.scss';

const description = `Add optional applications to your ${ODH_PRODUCT_NAME} instance.`;
const disabledDescription = `View optional applications for your ${ODH_PRODUCT_NAME} instance. Contact an administrator to install these applications.`;

type ExploreApplicationsInnerProps = {
  loaded: boolean;
  isEmpty: boolean;
  loadError?: Error;
  exploreComponents: OdhApplication[];
  selectedComponent?: OdhApplication;
  updateSelection: (selectedId?: string | null) => void;
};

const ExploreApplicationsInner: React.FC<ExploreApplicationsInnerProps> = React.memo(
  ({ loaded, isEmpty, loadError, exploreComponents, selectedComponent, updateSelection }) => {
    const { dashboardConfig } = useAppContext();
    const { disableInfo } = dashboardConfig.spec.dashboardConfig;
    const [enableApp, setEnableApp] = React.useState<OdhApplication>();

    return (
      <Drawer
        data-testid="explore-applications"
        isExpanded={!disableInfo && !!selectedComponent}
        isInline
      >
        <DrawerContent
          panelContent={
            <GetStartedPanel
              onClose={() => updateSelection()}
              selectedApp={selectedComponent}
              onEnable={() => setEnableApp(selectedComponent)}
            />
          }
        >
          <DrawerContentBody className="odh-explore-applications__drawer-body-content">
            <ApplicationsPage
              title={
                <TitleWithIcon title="Explore" objectType={ProjectObjectType.exploreApplications} />
              }
              description={disableInfo ? disabledDescription : description}
              loaded={loaded}
              empty={isEmpty}
              loadError={loadError}
            >
              <ExploreApplicationsList
                exploreComponents={exploreComponents}
                updateSelection={updateSelection}
                selectedComponent={selectedComponent}
                enableApp={enableApp}
                setEnableApp={setEnableApp}
              />
            </ApplicationsPage>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    );
  },
);
ExploreApplicationsInner.displayName = 'ExploreApplicationsInner';

const ExploreApplications: React.FC = () => {
  const { components, loaded, loadError } = useWatchComponents(false);
  const navigate = useNavigate();
  const queryParams = useQueryParams();
  const selectedId = queryParams.get('selectId');
  const [selectedComponent, setSelectedComponent] = React.useState<OdhApplication>();
  const isEmpty = components.length === 0;

  const updateSelection = React.useCallback(
    (currentSelectedId?: string | null): void => {
      const selection = components.find(
        (c) => c.metadata.name && c.metadata.name === currentSelectedId,
      );
      if (currentSelectedId && selection) {
        setQueryArgument(navigate, 'selectId', currentSelectedId);
        setSelectedComponent(selection);
        return;
      }

      setSelectedComponent(undefined);
      removeQueryArgument(navigate, 'selectId');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [components],
  );

  const exploreComponents = React.useMemo<OdhApplication[]>(
    () =>
      _.cloneDeep(components)
        .filter((component) => !component.spec.hidden)
        .toSorted((a, b) => a.spec.displayName.localeCompare(b.spec.displayName)),
    [components],
  );

  React.useEffect(() => {
    if (components.length > 0) {
      updateSelection(selectedId);
    }
  }, [updateSelection, selectedId, components]);

  return (
    <ExploreApplicationsInner
      loaded={loaded}
      isEmpty={isEmpty}
      loadError={loadError}
      exploreComponents={exploreComponents}
      selectedComponent={selectedComponent}
      updateSelection={updateSelection}
    />
  );
};

export default ExploreApplications;

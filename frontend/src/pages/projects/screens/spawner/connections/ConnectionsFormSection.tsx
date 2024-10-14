import React from 'react';
import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  FormSection,
  Tooltip,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { SortableData, Table } from '~/components/table';
import { createSecret, replaceSecret } from '~/api';
import { NotebookKind, ProjectKind } from '~/k8sTypes';
import { getDisplayNameFromK8sResource } from '~/concepts/k8s/utils';
import { Connection } from '~/concepts/connectionTypes/types';
import { useWatchConnectionTypes } from '~/utilities/useWatchConnectionTypes';
import { useNotebooksStates } from '~/pages/projects/notebook/useNotebooksStates';
import { SpawnerPageSectionTitles } from '~/pages/projects/screens/spawner/const';
import { SpawnerPageSectionID } from '~/pages/projects/screens/spawner/types';
import { ManageConnectionModal } from '~/pages/projects/screens/detail/connections/ManageConnectionsModal';
import ConnectionsTableRow from '~/pages/projects/screens/detail/connections/ConnectionsTableRow';
import { SelectConnectionsModal } from './SelectConnectionsModal';
import { connectionEnvVarConflicts, DuplicateEnvVarWarning } from './DuplicateEnvVarsWarning';
import { DetachConnectionModal } from './DetachConnectionModal';

const columns: SortableData<Connection>[] = [
  {
    field: 'name',
    label: 'Name',
    sortable: (a, b) =>
      getDisplayNameFromK8sResource(a).localeCompare(getDisplayNameFromK8sResource(b)),
  },
  {
    field: 'type',
    label: 'Type',
    sortable: (a, b) =>
      a.metadata.annotations['opendatahub.io/connection-type'].localeCompare(
        b.metadata.annotations['opendatahub.io/connection-type'],
      ),
  },
  {
    field: 'kebab',
    label: '',
    sortable: false,
  },
];

type Props = {
  project: ProjectKind;
  projectConnections: Connection[];
  refreshProjectConnections: () => void;
  notebook?: NotebookKind;
  notebookDisplayName: string;
  selectedConnections: Connection[];
  setSelectedConnections: (connections: Connection[]) => void;
};

export const ConnectionsFormSection: React.FC<Props> = ({
  project,
  projectConnections,
  refreshProjectConnections,
  notebook,
  notebookDisplayName,
  selectedConnections,
  setSelectedConnections,
}) => {
  const [connectionTypes] = useWatchConnectionTypes();

  const [initialNumberConnections] = React.useState(selectedConnections.length);
  const notebookArray = React.useMemo(() => (notebook ? [notebook] : []), [notebook]);
  const [notebookStates] = useNotebooksStates(
    notebookArray,
    notebook?.metadata.namespace || '',
    initialNumberConnections > 0,
  );
  const isRunning = React.useMemo(
    () =>
      !!notebookStates.find((n) => n.notebook.metadata.name === notebook?.metadata.name)?.isRunning,
    [notebookStates, notebook],
  );

  const unselectedConnections = React.useMemo(
    () =>
      projectConnections.filter(
        (pc) => !selectedConnections.find((sc) => pc.metadata.name === sc.metadata.name),
      ),
    [projectConnections, selectedConnections],
  );

  const [showAttachConnectionsModal, setShowAttachConnectionsModal] = React.useState(false);
  const [detachConnectionModal, setDetachConnectionModal] = React.useState<Connection>();
  const [manageConnectionModal, setManageConnectionModal] = React.useState<{
    connection?: Connection;
    isEdit?: boolean;
  }>();

  const envVarConflicts = React.useMemo(
    () => connectionEnvVarConflicts(selectedConnections),
    [selectedConnections],
  );

  return (
    <FormSection
      title={
        <>
          {SpawnerPageSectionTitles[SpawnerPageSectionID.CONNECTIONS]}{' '}
          <Tooltip
            content="No existing connections available"
            trigger={unselectedConnections.length === 0 ? 'mouseenter focus' : 'manual'}
          >
            <Button
              data-testid="attach-existing-connection-button"
              variant="secondary"
              isAriaDisabled={unselectedConnections.length === 0}
              onClick={() => setShowAttachConnectionsModal(true)}
            >
              Attach existing connections
            </Button>
          </Tooltip>{' '}
          <Button
            data-testid="create-connection-button"
            variant="secondary"
            onClick={() => setManageConnectionModal({ connection: undefined, isEdit: false })}
          >
            Create connection
          </Button>
        </>
      }
      id={SpawnerPageSectionID.CONNECTIONS}
      aria-label={SpawnerPageSectionTitles[SpawnerPageSectionID.CONNECTIONS]}
    >
      {envVarConflicts.length > 0 && <DuplicateEnvVarWarning envVarConflicts={envVarConflicts} />}
      {selectedConnections.length > 0 ? (
        <Table
          data={selectedConnections}
          data-testid="connections-table"
          columns={columns}
          rowRenderer={(connection) => (
            <ConnectionsTableRow
              key={connection.metadata.name}
              obj={connection}
              connectionTypes={connectionTypes}
              kebabActions={[
                {
                  title: 'Edit',
                  onClick: () => {
                    setManageConnectionModal({ connection, isEdit: true });
                  },
                },
                {
                  title: 'Detach',
                  onClick: () => {
                    setDetachConnectionModal(connection);
                  },
                },
              ]}
              showCompatibilityCell={false}
              showConnectedResourcesCell={false}
              showWarningIcon={
                !!envVarConflicts.find(
                  (conflict) =>
                    conflict.firstConnection === getDisplayNameFromK8sResource(connection) ||
                    conflict.secondConnection === getDisplayNameFromK8sResource(connection),
                )
              }
            />
          )}
          isStriped
        />
      ) : (
        <Bullseye>
          <EmptyState>
            <EmptyStateHeader
              icon={<EmptyStateIcon icon={PlusCircleIcon} />}
              titleText="No connections"
              headingLevel="h2"
            />
            <EmptyStateBody>
              Connections enable you to store and retrieve information that typically should not be
              stored in code. For example, you can store details (including credentials) for object
              storage, databases, and more. You can then attach the connections to artifacts in your
              project, such as workbenches and model servers.
            </EmptyStateBody>
          </EmptyState>
        </Bullseye>
      )}
      {showAttachConnectionsModal && (
        <SelectConnectionsModal
          connectionTypes={connectionTypes}
          connectionsToList={unselectedConnections}
          onSave={(connections) => {
            setSelectedConnections([...selectedConnections, ...connections]);
            setShowAttachConnectionsModal(false);
          }}
          onClose={() => setShowAttachConnectionsModal(false)}
        />
      )}
      {detachConnectionModal && (
        <DetachConnectionModal
          connection={detachConnectionModal}
          isRunning={isRunning}
          notebookDisplayName={notebookDisplayName}
          onDetach={() => {
            setSelectedConnections(
              selectedConnections.filter(
                (c) => c.metadata.name !== detachConnectionModal.metadata.name,
              ),
            );
            setDetachConnectionModal(undefined);
          }}
          onClose={() => setDetachConnectionModal(undefined)}
        />
      )}
      {manageConnectionModal && (
        <ManageConnectionModal
          connection={manageConnectionModal.connection}
          connectionTypes={connectionTypes}
          project={project}
          onClose={(refresh) => {
            setManageConnectionModal(undefined);
            if (refresh) {
              refreshProjectConnections();
            }
          }}
          onSubmit={(connection: Connection) => {
            if (manageConnectionModal.isEdit) {
              return replaceSecret(connection);
            }
            setSelectedConnections([...selectedConnections, connection]);
            return createSecret(connection);
          }}
          isEdit={manageConnectionModal.isEdit}
        />
      )}
    </FormSection>
  );
};

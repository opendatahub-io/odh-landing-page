import React from 'react';
import { render, screen } from '@testing-library/react';
import ConnectionsTable from '~/pages/projects/screens/detail/connections/ConnectionsTable';
import { mockConnectionTypeConfigMapObj } from '~/__mocks__/mockConnectionType';
import { mockConnection } from '~/__mocks__/mockConnection';
import { mockNotebookK8sResource } from '~/__mocks__/mockNotebookK8sResource';
import { useRelatedNotebooks } from '~/pages/projects/notebook/useRelatedNotebooks';

jest.mock('~/pages/projects/notebook/useRelatedNotebooks', () => ({
  ...jest.requireActual('~/pages/projects/notebook/useRelatedNotebooks'),
  useRelatedNotebooks: jest.fn(),
}));

const useRelatedNotebooksMock = useRelatedNotebooks as jest.Mock;

describe('ConnectionsTable', () => {
  beforeEach(() => {
    useRelatedNotebooksMock.mockReturnValue({ notebooks: [], loaded: true });
  });

  it('should render table', () => {
    const connection = mockConnection({ displayName: 'connection1', description: 'desc1' });
    render(
      <ConnectionsTable
        namespace={connection.metadata.namespace}
        connections={[connection]}
        refreshConnections={() => undefined}
        setManageConnectionModal={() => undefined}
      />,
    );

    expect(screen.getByTestId('connection-table')).toBeTruthy();
    expect(screen.getByText('connection1')).toBeTruthy();
    expect(screen.getByText('desc1')).toBeTruthy();
    expect(screen.getByText('s3')).toBeTruthy();
  });

  it('should show display name of connection type if available', () => {
    const connection = mockConnection({ displayName: 'connection1', description: 'desc1' });
    render(
      <ConnectionsTable
        namespace={connection.metadata.namespace}
        connections={[connection]}
        connectionTypes={[
          mockConnectionTypeConfigMapObj({ name: 's3', displayName: 'S3 Buckets' }),
        ]}
        refreshConnections={() => undefined}
        setManageConnectionModal={() => undefined}
      />,
    );

    expect(screen.getByTestId('connection-table')).toBeTruthy();
    expect(screen.getByText('connection1')).toBeTruthy();
    expect(screen.getByText('desc1')).toBeTruthy();
    expect(screen.queryByText('s3')).toBeFalsy();
    expect(screen.getByText('S3 Buckets')).toBeTruthy();
  });

  it('should show connected resources', () => {
    useRelatedNotebooksMock.mockReturnValue({
      notebooks: [mockNotebookK8sResource({ displayName: 'Connected notebook' })],
      loaded: true,
    });

    const connection = mockConnection({ displayName: 'connection1', description: 'desc1' });
    render(
      <ConnectionsTable
        namespace={connection.metadata.namespace}
        connections={[connection]}
        connectionTypes={[
          mockConnectionTypeConfigMapObj({ name: 's3', displayName: 'S3 Buckets' }),
        ]}
        refreshConnections={() => undefined}
        setManageConnectionModal={() => undefined}
      />,
    );

    expect(screen.getByTestId('connection-table')).toBeTruthy();
    expect(screen.getByText('connection1')).toBeTruthy();
    expect(screen.getByText('desc1')).toBeTruthy();
    expect(screen.queryByText('s3')).toBeFalsy();
    expect(screen.getByText('S3 Buckets')).toBeTruthy();
    expect(screen.getByText('Connected notebook')).toBeTruthy();
  });
});

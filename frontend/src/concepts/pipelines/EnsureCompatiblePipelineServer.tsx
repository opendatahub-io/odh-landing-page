import * as React from 'react';
import {
  EmptyState,
  EmptyStateVariant,
  Bullseye,
  Spinner,
  EmptyStateHeader,
  EmptyStateBody,
  EmptyStateIcon,
  ButtonVariant,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import ExternalLink from '~/components/ExternalLink';
import NoPipelineServer from '~/concepts/pipelines/NoPipelineServer';
import { ODH_PRODUCT_NAME } from '~/utilities/const';
import { DeleteServerModal, usePipelinesAPI } from './context';

const DOCS_LINK =
  'https://docs.redhat.com/en/documentation/red_hat_openshift_ai_self-managed/2.13/html/release_notes/support-removals_relnotes';

type EnsureCompatiblePipelineServerProps = {
  children: React.ReactNode;
};

const EnsureCompatiblePipelineServer: React.FC<EnsureCompatiblePipelineServerProps> = ({
  children,
}) => {
  const { pipelinesServer } = usePipelinesAPI();
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (pipelinesServer.initializing) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  if (!pipelinesServer.installed) {
    return <NoPipelineServer variant={ButtonVariant.primary} />;
  }

  if (!pipelinesServer.compatible) {
    return (
      <>
        <Bullseye data-testid="incompatible-pipelines-server">
          <EmptyState variant={EmptyStateVariant.lg}>
            <EmptyStateHeader
              data-testid="incompatible-pipelines-server-title"
              titleText="Unsupported pipeline and pipeline server version"
              icon={
                <EmptyStateIcon
                  color="var(--pf-v5-global--warning-color--100)"
                  icon={ExclamationTriangleIcon}
                />
              }
            />
            <EmptyStateBody>
              <p>
                This project contains v1 pipeline resources, which are no longer supported or
                managed by {ODH_PRODUCT_NAME}. To proceed, back up your pipelines data, delete the
                pipeline server, then create a new one. Alternatively, create a new project and
                pipeline server. <ExternalLink text="View the documentation" to={DOCS_LINK} /> to
                learn more about the migration process, server deletion, supported versions, and
                data recovery.
              </p>
            </EmptyStateBody>
          </EmptyState>
        </Bullseye>
        {isDeleting ? <DeleteServerModal onClose={() => setIsDeleting(false)} /> : null}
      </>
    );
  }

  return <>{children}</>;
};

export default EnsureCompatiblePipelineServer;

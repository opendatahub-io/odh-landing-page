import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  PageSection,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

const EmptyConnectionTypes: React.FC = () => (
  <PageSection isFilled>
    <EmptyState variant={EmptyStateVariant.full} data-testid="connection-types-empty-state">
      <EmptyStateHeader
        titleText="No connection types found."
        icon={<EmptyStateIcon icon={PlusCircleIcon} />}
        headingLevel="h1"
      />
      <EmptyStateBody>To get started create a connection type.</EmptyStateBody>
      <EmptyStateFooter>
        <Button
          data-testid="add-connection-type"
          variant="primary"
          component={(props) => <Link {...props} to="/connectionTypes/create" />}
        >
          Create connection type
        </Button>
      </EmptyStateFooter>
    </EmptyState>
  </PageSection>
);

export default EmptyConnectionTypes;

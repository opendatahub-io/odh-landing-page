import * as React from 'react';
import { Button } from '@patternfly/react-core';
import EmptyDetailsList from './EmptyDetailsList';
import DetailsSection from './DetailsSection';
import { ProjectSectionID } from './types';
import { ProjectSectionTitles } from './const';
import AddStorageModal from 'pages/projects/modals/addStorageModal/AddStorageModal';

const StorageList: React.FC = () => {
  const [isOpen, setOpen] = React.useState<boolean>(false);
  return (
    <DetailsSection
      id={ProjectSectionID.STORAGE}
      title={ProjectSectionTitles[ProjectSectionID.STORAGE]}
      actions={[
        <Button
          onClick={() => setOpen(true)}
          key={`action-${ProjectSectionID.STORAGE}`}
          variant="secondary"
        >
          Add storage
        </Button>,
      ]}
    >
      <EmptyDetailsList
        title="No storage"
        description="Choose existing, or add new on cluster storage."
      />
      <AddStorageModal isOpen={isOpen} onClose={() => setOpen(false)} />
    </DetailsSection>
  );
};

export default StorageList;

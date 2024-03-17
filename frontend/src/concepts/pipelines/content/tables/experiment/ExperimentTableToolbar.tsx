import * as React from 'react';
import { Button, TextInput, ToolbarItem } from '@patternfly/react-core';
import PipelineFilterBar from '~/concepts/pipelines/content/tables/PipelineFilterBar';
import { FilterOptions } from '~/concepts/pipelines/content/tables/usePipelineFilter';
import DashboardDatePicker from '~/components/DashboardDatePicker';
import SimpleMenuActions from '~/components/SimpleMenuActions';
import CreateExperimentButton from '~/concepts/pipelines/content/experiment/CreateExperimentButton';

const options = {
  [FilterOptions.NAME]: 'Experiment',
  [FilterOptions.CREATED_AT]: 'Created',
};

export type FilterProps = Pick<
  React.ComponentProps<typeof PipelineFilterBar>,
  'filterData' | 'onFilterUpdate' | 'onClearFilters'
>;

type ExperimentTableToolbarProps = FilterProps & {
  children: React.ReactElement<typeof ToolbarItem> | React.ReactElement<typeof ToolbarItem>[];
};

export const ExperimentTableToolbar: React.FC<ExperimentTableToolbarProps> = ({
  children,
  ...toolbarProps
}) => (
  <PipelineFilterBar<keyof typeof options>
    {...toolbarProps}
    filterOptions={options}
    filterOptionRenders={{
      [FilterOptions.NAME]: ({ onChange, ...props }) => (
        <TextInput
          {...props}
          aria-label="Search for a experiment name"
          placeholder="Experiment name"
          onChange={(_event, value) => onChange(value)}
        />
      ),
      [FilterOptions.CREATED_AT]: ({ onChange, ...props }) => (
        <DashboardDatePicker
          {...props}
          hideError
          aria-label="Select a start date"
          onChange={(_, value, date) => {
            if (date || !value) {
              onChange(value);
            }
          }}
        />
      ),
    }}
  >
    {children}
  </PipelineFilterBar>
);

type ActiveExperimentTableToolbarProps = {
  archiveAllEnabled: boolean;
  onArchiveAll: () => void;
};

export const ActiveExperimentTableToolbar: React.FC<ActiveExperimentTableToolbarProps> = ({
  archiveAllEnabled,
  onArchiveAll,
}) => (
  <>
    <ToolbarItem>
      <CreateExperimentButton />
    </ToolbarItem>
    <ToolbarItem>
      <SimpleMenuActions
        dropdownItems={[
          {
            key: 'archive',
            label: 'Archive',
            onClick: onArchiveAll,
            isDisabled: !archiveAllEnabled,
            tooltip: 'Select one or more experiments to archive.',
          },
        ]}
      />
    </ToolbarItem>
  </>
);

type ArchivedExperimentTableToolbarProps = {
  restoreAllEnabled: boolean;
  onRestoreAll: () => void;
};

export const ArchivedExperimentTableToolbar: React.FC<ArchivedExperimentTableToolbarProps> = ({
  restoreAllEnabled,
  onRestoreAll,
}) => (
  <ToolbarItem>
    <Button variant="primary" isDisabled={!restoreAllEnabled} onClick={onRestoreAll}>
      Restore
    </Button>
  </ToolbarItem>
);

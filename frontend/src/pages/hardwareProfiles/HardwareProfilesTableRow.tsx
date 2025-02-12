import * as React from 'react';
import {
  Button,
  Divider,
  Icon,
  Popover,
  Stack,
  StackItem,
  Timestamp,
  TimestampTooltipVariant,
  Truncate,
} from '@patternfly/react-core';
import { ActionsColumn, ExpandableRowContent, Tbody, Td, Tr } from '@patternfly/react-table';
import { useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { relativeTime } from '~/utilities/time';
import { TableRowTitleDescription } from '~/components/table';
import HardwareProfileEnableToggle from '~/pages/hardwareProfiles/HardwareProfileEnableToggle';
import { HardwareProfileKind } from '~/k8sTypes';
import NodeResourceTable from '~/pages/hardwareProfiles/nodeResource/NodeResourceTable';
import NodeSelectorTable from '~/pages/hardwareProfiles/nodeSelector/NodeSelectorTable';
import TolerationTable from '~/pages/hardwareProfiles/toleration/TolerationTable';
import { hardwareProfileWarning, isHardwareProfileOOTB } from '~/pages/hardwareProfiles/utils';
import { updateHardwareProfile } from '~/api';
import { useDashboardNamespace } from '~/redux/selectors';
import { DEFAULT_HARDWARE_PROFILE_SPEC } from './const';

type HardwareProfilesTableRowProps = {
  rowIndex: number;
  hardwareProfile: HardwareProfileKind;
  handleDelete: (cr: HardwareProfileKind) => void;
};

const HardwareProfilesTableRow: React.FC<HardwareProfilesTableRowProps> = ({
  hardwareProfile,
  rowIndex,
  handleDelete,
}) => {
  const modifiedDate = hardwareProfile.metadata.annotations?.['opendatahub.io/modified-date'];
  const [isExpanded, setExpanded] = React.useState(false);
  const navigate = useNavigate();
  const { dashboardNamespace } = useDashboardNamespace();
  const hardwareProfileWarningMessage = hardwareProfileWarning(hardwareProfile);

  return (
    <Tbody isExpanded={isExpanded}>
      <Tr>
        <Td
          expand={{
            rowIndex,
            expandId: 'hardware-profile-table-row-item',
            isExpanded,
            onToggle: () => setExpanded(!isExpanded),
          }}
        />
        <Td dataLabel="Name">
          <TableRowTitleDescription
            title={<Truncate content={hardwareProfile.spec.displayName} />}
            description={hardwareProfile.spec.description}
            resource={hardwareProfile}
            truncateDescriptionLines={2}
            wrapResourceTitle={false}
            titleIcon={
              typeof hardwareProfileWarningMessage !== 'undefined' && (
                <Popover
                  hasAutoWidth
                  headerIcon={
                    <Icon status="warning">
                      <ExclamationTriangleIcon />
                    </Icon>
                  }
                  headerContent={hardwareProfileWarningMessage.title}
                  bodyContent={(hide) => (
                    <>
                      <div>{hardwareProfileWarningMessage.message}</div>
                      {isHardwareProfileOOTB(hardwareProfile) && (
                        <Button
                          variant="link"
                          component="a"
                          onClick={async () => {
                            await updateHardwareProfile(
                              {
                                ...DEFAULT_HARDWARE_PROFILE_SPEC,
                                displayName: hardwareProfile.spec.displayName,
                                description: hardwareProfile.spec.description,
                              },
                              hardwareProfile,
                              dashboardNamespace,
                            );
                            hide();
                          }}
                          data-testid="restore-default-hardware-profile"
                        >
                          Restore default hardware profile
                        </Button>
                      )}
                    </>
                  )}
                >
                  <Icon status="warning" data-testid="icon-warning">
                    <ExclamationTriangleIcon />
                  </Icon>
                </Popover>
              )
            }
          />
        </Td>
        <Td dataLabel="Enabled">
          <HardwareProfileEnableToggle hardwareProfile={hardwareProfile} />
        </Td>
        <Td dataLabel="Last modified">
          {modifiedDate && !Number.isNaN(new Date(modifiedDate).getTime()) ? (
            <Timestamp
              date={new Date(modifiedDate)}
              tooltip={{
                variant: TimestampTooltipVariant.default,
              }}
            >
              {relativeTime(Date.now(), new Date(modifiedDate).getTime())}
            </Timestamp>
          ) : (
            '--'
          )}
        </Td>
        <Td isActionCell>
          <ActionsColumn
            items={[
              ...(isHardwareProfileOOTB(hardwareProfile)
                ? []
                : [
                    {
                      title: 'Edit',
                      onClick: () =>
                        navigate(`/hardwareProfiles/edit/${hardwareProfile.metadata.name}`),
                    },
                  ]),
              {
                title: 'Duplicate',
                onClick: () =>
                  navigate(`/hardwareProfiles/duplicate/${hardwareProfile.metadata.name}`),
              },
              ...(isHardwareProfileOOTB(hardwareProfile)
                ? []
                : [
                    { isSeparator: true },
                    {
                      title: 'Delete',
                      onClick: () => handleDelete(hardwareProfile),
                    },
                  ]),
            ]}
          />
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td />
        <Td dataLabel="Other information" colSpan={4}>
          <ExpandableRowContent>
            <Stack hasGutter>
              {hardwareProfile.spec.identifiers &&
                hardwareProfile.spec.identifiers.length !== 0 && (
                  <StackItem>
                    <p className="pf-v6-u-font-weight-bold">Node resources</p>
                    <NodeResourceTable nodeResources={hardwareProfile.spec.identifiers} />
                    <Divider />
                  </StackItem>
                )}
              {hardwareProfile.spec.nodeSelectors &&
                hardwareProfile.spec.nodeSelectors.length !== 0 && (
                  <StackItem>
                    <p className="pf-v6-u-font-weight-bold">Node selectors</p>
                    <NodeSelectorTable nodeSelectors={hardwareProfile.spec.nodeSelectors} />
                    <Divider />
                  </StackItem>
                )}
              {hardwareProfile.spec.tolerations &&
                hardwareProfile.spec.tolerations.length !== 0 && (
                  <StackItem>
                    <p className="pf-v6-u-font-weight-bold">Tolerations</p>
                    <TolerationTable tolerations={hardwareProfile.spec.tolerations} />
                    <Divider />
                  </StackItem>
                )}
            </Stack>
          </ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default HardwareProfilesTableRow;

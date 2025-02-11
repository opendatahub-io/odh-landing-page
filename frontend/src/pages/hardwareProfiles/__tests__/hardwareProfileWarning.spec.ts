import { mockHardwareProfile } from '~/__mocks__/mockHardwareProfile';
import { IdentifierResourceType } from '~/types';
import { hardwareProfileWarning } from '~/pages/hardwareProfiles/utils';

jest.mock('@openshift/dynamic-plugin-sdk-utils', () => ({
  k8sListResource: jest.fn(),
}));

describe('hardwareProfileWarning', () => {
  it('should generate warnings for min being larger than max', () => {
    const hardwareProfileMock = mockHardwareProfile({
      uid: 'test-2',
      enabled: false,
      identifiers: [
        {
          displayName: 'Memory',
          identifier: 'memory',
          resourceType: IdentifierResourceType.MEMORY,
          minCount: '10Gi',
          maxCount: '5Gi',
          defaultCount: '2Gi',
        },
        {
          displayName: 'CPU',
          identifier: 'cpu',
          resourceType: IdentifierResourceType.CPU,
          minCount: '1',
          maxCount: '2',
          defaultCount: '1',
        },
      ],
    });
    const hardwareProfilesResult = hardwareProfileWarning(hardwareProfileMock);
    expect(hardwareProfilesResult).toStrictEqual({
      message: `Minimum allowed ${IdentifierResourceType.MEMORY} cannot exceed maximum allowed Memory. Edit the profile to make the profile valid.`,
      title: 'Invalid hardware profile',
    });
  });

  it('should generate warnings for negative min value', () => {
    const hardwareProfileMock = mockHardwareProfile({
      uid: 'test-3',
      enabled: false,
      identifiers: [
        {
          displayName: 'Memory',
          identifier: 'memory',
          resourceType: IdentifierResourceType.MEMORY,
          minCount: '2Gi',
          maxCount: '5Gi',
          defaultCount: '2Gi',
        },
        {
          displayName: 'CPU',
          identifier: 'cpu',
          resourceType: IdentifierResourceType.CPU,
          minCount: '-1',
          maxCount: '2',
          defaultCount: '1',
        },
      ],
    });
    const hardwareProfilesResult = hardwareProfileWarning(hardwareProfileMock);
    expect(hardwareProfilesResult).toStrictEqual({
      message: `Minimum allowed ${IdentifierResourceType.CPU} cannot be negative. Edit the profile to make the profile valid.`,
      title: 'Invalid hardware profile',
    });
  });

  it('should generate warnings for negative max value', () => {
    const hardwareProfileMock = mockHardwareProfile({
      uid: 'test-4',
      enabled: false,
      identifiers: [
        {
          displayName: 'Memory',
          identifier: 'memory',
          resourceType: IdentifierResourceType.MEMORY,
          minCount: '2Gi',
          maxCount: '5Gi',
          defaultCount: '2Gi',
        },
        {
          displayName: 'CPU',
          identifier: 'cpu',
          resourceType: IdentifierResourceType.CPU,
          minCount: '1',
          maxCount: '-2',
          defaultCount: '1',
        },
      ],
    });
    const hardwareProfilesResult = hardwareProfileWarning(hardwareProfileMock);
    expect(hardwareProfilesResult).toStrictEqual({
      message: `Maximum allowed ${IdentifierResourceType.CPU} cannot be negative. Edit the profile to make the profile valid.`,
      title: 'Invalid hardware profile',
    });
  });

  it('should generate warnings for negative default count', () => {
    const hardwareProfileMock = mockHardwareProfile({
      uid: 'test-4',
      enabled: false,
      identifiers: [
        {
          displayName: 'Memory',
          identifier: 'memory',
          resourceType: IdentifierResourceType.MEMORY,
          minCount: '2Gi',
          maxCount: '5Gi',
          defaultCount: '-2Gi',
        },
        {
          displayName: 'CPU',
          identifier: 'cpu',
          resourceType: IdentifierResourceType.CPU,
          minCount: '1',
          maxCount: '2',
          defaultCount: '1',
        },
      ],
    });
    const hardwareProfilesResult = hardwareProfileWarning(hardwareProfileMock);
    expect(hardwareProfilesResult).toStrictEqual({
      message: `Default count for ${IdentifierResourceType.MEMORY} cannot be negative. Edit the profile to make the profile valid.`,
      title: 'Invalid hardware profile',
    });
  });

  it('should generate warnings for invalid identifier counts', () => {
    const hardwareProfileMock = mockHardwareProfile({
      uid: 'test-5',
      labels: {
        'opendatahub.io/ootb': 'true',
      },
      enabled: false,
      identifiers: [
        {
          displayName: 'Memory',
          identifier: 'memory',
          resourceType: IdentifierResourceType.MEMORY,
          minCount: 'Gi',
          maxCount: '5Gi',
          defaultCount: '2Gi',
        },
        {
          displayName: 'CPU',
          identifier: 'cpu',
          resourceType: IdentifierResourceType.CPU,
          minCount: '1',
          maxCount: '2',
          defaultCount: '1',
        },
      ],
    });
    const hardwareProfilesResult = hardwareProfileWarning(hardwareProfileMock);
    expect(hardwareProfilesResult).toStrictEqual({
      message: `The resource count for ${IdentifierResourceType.MEMORY} has an invalid unit. Select the restore button to restore the Default profile to its initial state.`,
      title: 'Invalid default hardware profile',
    });
  });

  it('should generate warnings for a default profile without resources', () => {
    const hardwareProfileMock = mockHardwareProfile({
      uid: 'test-6',
      enabled: false,
      labels: {
        'opendatahub.io/ootb': 'true',
      },
      identifiers: [],
    });
    const hardwareProfilesResult = hardwareProfileWarning(hardwareProfileMock);
    expect(hardwareProfilesResult).toStrictEqual({
      message:
        'Omitting CPU or Memory resources is not recommended. Select the restore button to restore the Default profile to its initial state.',
      title: 'Incomplete default hardware profile',
    });
  });

  it('should generate warnings for default value outside of min/max range', () => {
    const hardwareProfileMock = mockHardwareProfile({
      uid: 'test-7',
      enabled: false,
      identifiers: [
        {
          displayName: 'Memory',
          identifier: 'memory',
          resourceType: IdentifierResourceType.MEMORY,
          minCount: '0Gi',
          maxCount: '5Gi',
          defaultCount: '6Gi',
        },
        {
          displayName: 'CPU',
          identifier: 'cpu',
          resourceType: IdentifierResourceType.CPU,
          minCount: '5',
          maxCount: '10',
          defaultCount: '5',
        },
      ],
    });
    const hardwareProfilesResult = hardwareProfileWarning(hardwareProfileMock);
    expect(hardwareProfilesResult).toStrictEqual({
      message: `The default count for ${IdentifierResourceType.MEMORY} must be between the minimum allowed ${IdentifierResourceType.MEMORY} and maximum allowed ${IdentifierResourceType.MEMORY}. Edit the profile to make the profile valid.`,
      title: 'Invalid hardware profile',
    });
  });

  it('should generate warnings for a default profile outside of min/max range', () => {
    const hardwareProfileMock = mockHardwareProfile({
      uid: 'test-8',
      enabled: false,
      labels: {
        'opendatahub.io/ootb': 'true',
      },
      identifiers: [
        {
          displayName: 'Memory',
          identifier: 'memory',
          resourceType: IdentifierResourceType.MEMORY,
          minCount: '0Gi',
          maxCount: '5Gi',
          defaultCount: '2Gi',
        },
        {
          displayName: 'CPU',
          identifier: 'cpu',
          resourceType: IdentifierResourceType.CPU,
          minCount: '5',
          maxCount: '10',
          defaultCount: '11',
        },
      ],
    });
    const hardwareProfilesResult = hardwareProfileWarning(hardwareProfileMock);
    expect(hardwareProfilesResult).toStrictEqual({
      message: `The default count for ${IdentifierResourceType.CPU} must be between the minimum allowed ${IdentifierResourceType.CPU} and maximum allowed ${IdentifierResourceType.CPU}. Select the restore button to restore the Default profile to its initial state.`,
      title: 'Invalid default hardware profile',
    });
  });

  it('should generate warnings for decimal minimum count', () => {
    const hardwareProfileMock = mockHardwareProfile({
      uid: 'test-8',
      enabled: false,
      labels: {
        'opendatahub.io/ootb': 'true',
      },
      identifiers: [
        {
          displayName: 'Memory',
          identifier: 'memory',
          resourceType: IdentifierResourceType.MEMORY,
          minCount: '0.239879842Gi',
          maxCount: '5Gi',
          defaultCount: '2Gi',
        },
        {
          displayName: 'CPU',
          identifier: 'cpu',
          resourceType: IdentifierResourceType.CPU,
          minCount: '5',
          maxCount: '10',
          defaultCount: '6',
        },
      ],
    });
    const hardwareProfilesResult = hardwareProfileWarning(hardwareProfileMock);
    expect(hardwareProfilesResult).toStrictEqual({
      message: `Minimum count for ${IdentifierResourceType.MEMORY} cannot be a decimal. Select the restore button to restore the Default profile to its initial state.`,
      title: 'Invalid default hardware profile',
    });
  });

  it('should generate warnings for decimal maximum count', () => {
    const hardwareProfileMock = mockHardwareProfile({
      uid: 'test-8',
      enabled: false,
      identifiers: [
        {
          displayName: 'Memory',
          identifier: 'memory',
          resourceType: IdentifierResourceType.MEMORY,
          minCount: '0Gi',
          maxCount: '5.991Gi',
          defaultCount: '2Gi',
        },
        {
          displayName: 'CPU',
          identifier: 'cpu',
          resourceType: IdentifierResourceType.CPU,
          minCount: '5',
          maxCount: '10',
          defaultCount: '6',
        },
      ],
    });
    const hardwareProfilesResult = hardwareProfileWarning(hardwareProfileMock);
    expect(hardwareProfilesResult).toStrictEqual({
      message: `Maximum count for ${IdentifierResourceType.MEMORY} cannot be a decimal. Edit the profile to make the profile valid.`,
      title: 'Invalid hardware profile',
    });
  });

  it('should generate warnings for decimal default count', () => {
    const hardwareProfileMock = mockHardwareProfile({
      uid: 'test-8',
      enabled: false,
      identifiers: [
        {
          displayName: 'Memory',
          identifier: 'memory',
          resourceType: IdentifierResourceType.MEMORY,
          minCount: '0Gi',
          maxCount: '5Gi',
          defaultCount: '2.2384092380Gi',
        },
        {
          displayName: 'CPU',
          identifier: 'cpu',
          resourceType: IdentifierResourceType.CPU,
          minCount: '5',
          maxCount: '10',
          defaultCount: '6',
        },
      ],
    });
    const hardwareProfilesResult = hardwareProfileWarning(hardwareProfileMock);
    expect(hardwareProfilesResult).toStrictEqual({
      message: `Default count for ${IdentifierResourceType.MEMORY} cannot be a decimal. Edit the profile to make the profile valid.`,
      title: 'Invalid hardware profile',
    });
  });
});

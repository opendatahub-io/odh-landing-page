import { HardwareProfileKind } from '~/k8sTypes';
import { determineUnit, splitValueUnit } from '~/utilities/valueUnits';
import { Identifier, WarningNotification } from '~/types';
import { hasCPUandMemory } from './manage/ManageNodeResourceSection';
import {
  HARDWARE_PROFILES_DEFAULT_WARNING_MESSAGE,
  HARDWARE_PROFILES_MISSING_CPU_MEMORY_MESSAGE,
} from './nodeResource/const';

export enum HardwareProfileBannerWarningTitles {
  ALL_INVALID = 'All hardware profiles are invalid',
  ALL_DISABLED = 'All hardware profiles are disabled',
  SOME_INVALID = 'One or more hardware profiles are invalid',
  ALL_INCOMPLETE = 'All hardware profiles are incomplete',
  SOME_INCOMPLETE = 'One or more hardware profiles are incomplete',
}

export const isHardwareProfileOOTB = (hardwareProfile: HardwareProfileKind): boolean =>
  hardwareProfile.metadata.labels?.['opendatahub.io/ootb'] === 'true';

export const generateWarningTitle = (
  hasEnabled: boolean,
  allInvalid: boolean,
  hasInvalid: boolean,
  allIncomplete: boolean,
): string => {
  if (allInvalid) {
    return HardwareProfileBannerWarningTitles.ALL_INVALID;
  }
  if (!hasEnabled) {
    return HardwareProfileBannerWarningTitles.ALL_DISABLED;
  }
  if (hasInvalid) {
    return HardwareProfileBannerWarningTitles.SOME_INVALID;
  }
  if (allIncomplete) {
    return HardwareProfileBannerWarningTitles.ALL_INCOMPLETE;
  }
  return HardwareProfileBannerWarningTitles.SOME_INCOMPLETE;
};

export const generateWarningMessage = (
  hasEnabled: boolean,
  allInvalid: boolean,
  hasInvalid: boolean,
  allIncomplete: boolean,
): string => {
  if (allInvalid) {
    return 'You must have at least one valid hardware profile enabled for users to create workbenches or deploy models. Take the appropriate actions below to re-validate your profiles.';
  }
  if (!hasEnabled) {
    return 'You must have at least one hardware profile enabled for users to create workbenches or deploy models. Enable one or more profiles in the table below.';
  }
  if (hasInvalid) {
    return 'One or more of your defined hardware profiles are invalid. Take the appropriate actions below to revalidate your profiles.';
  }
  if (allIncomplete) {
    return 'All of your defined hardware profiles are missing either CPU or Memory. This is not recommended.';
  }
  return 'One or more of your defined hardware profiles are missing either CPU or Memory. This is not recommended.';
};

export const generateWarningForHardwareProfiles = (
  hardwareProfiles: HardwareProfileKind[],
): WarningNotification | undefined => {
  const hasInvalid = hardwareProfiles.some((profile) => {
    const warning = hardwareProfileWarning(profile);
    return (
      typeof warning !== 'undefined' &&
      !warning.message.includes(HARDWARE_PROFILES_MISSING_CPU_MEMORY_MESSAGE)
    );
  });
  const hasEnabled = hardwareProfiles.some((profile) => profile.spec.enabled);
  const allInvalid = hardwareProfiles.every((profile) => {
    const warning = hardwareProfileWarning(profile);
    return (
      typeof warning !== 'undefined' &&
      !warning.message.includes(HARDWARE_PROFILES_MISSING_CPU_MEMORY_MESSAGE)
    );
  });
  const allIncomplete = hardwareProfiles.every((profile) => {
    const warning = hardwareProfileWarning(profile);
    return (
      typeof warning !== 'undefined' &&
      warning.message.includes(HARDWARE_PROFILES_MISSING_CPU_MEMORY_MESSAGE)
    );
  });
  const hasInvalidIncludingIncompleteProfiles = hardwareProfiles.some(
    (profile) => typeof hardwareProfileWarning(profile) !== 'undefined',
  );
  if (hardwareProfiles.length === 0 || (!hasInvalidIncludingIncompleteProfiles && hasEnabled)) {
    return undefined;
  }
  return {
    title: generateWarningTitle(hasEnabled, allInvalid, hasInvalid, allIncomplete),
    message: generateWarningMessage(hasEnabled, allInvalid, hasInvalid, allIncomplete),
  };
};

export const isHardwareProfileIdentifierValid = (identifier: Identifier): boolean => {
  try {
    if (
      identifier.minCount.toString().at(0) === '-' ||
      identifier.maxCount.toString().at(0) === '-' ||
      identifier.defaultCount.toString().at(0) === '-'
    ) {
      return false;
    }
    const [minCount] = splitValueUnit(
      identifier.minCount.toString(),
      determineUnit(identifier),
      true,
    );
    const [maxCount] = splitValueUnit(
      identifier.maxCount.toString(),
      determineUnit(identifier),
      true,
    );
    const [defaultCount] = splitValueUnit(
      identifier.defaultCount.toString(),
      determineUnit(identifier),
      true,
    );
    if (
      !Number.isInteger(minCount) ||
      !Number.isInteger(maxCount) ||
      !Number.isInteger(defaultCount) ||
      minCount > maxCount ||
      defaultCount < minCount ||
      defaultCount > maxCount
    ) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};

export const hardwareProfileWarning = (
  hardwareProfile: HardwareProfileKind,
): WarningNotification | undefined => {
  const identifiers = hardwareProfile.spec.identifiers ?? [];
  let parentWarningMessage = '';
  const isDefaultProfile = isHardwareProfileOOTB(hardwareProfile);
  if (!hasCPUandMemory(identifiers)) {
    parentWarningMessage = HARDWARE_PROFILES_MISSING_CPU_MEMORY_MESSAGE;
  }
  for (const identifier of identifiers) {
    try {
      if (identifier.minCount.toString().at(0) === '-') {
        parentWarningMessage = `Minimum allowed ${
          identifier.resourceType ?? identifier.displayName
        } cannot be negative.`;
        continue;
      }
      if (identifier.maxCount.toString().at(0) === '-') {
        parentWarningMessage = `Maximum allowed ${
          identifier.resourceType ?? identifier.displayName
        } cannot be negative.`;
        continue;
      }
      if (identifier.defaultCount.toString().at(0) === '-') {
        parentWarningMessage = `Default count for ${
          identifier.resourceType ?? identifier.displayName
        } cannot be negative.`;
        continue;
      }
      const [minCount] = splitValueUnit(
        identifier.minCount.toString(),
        determineUnit(identifier),
        true,
      );
      const [maxCount] = splitValueUnit(
        identifier.maxCount.toString(),
        determineUnit(identifier),
        true,
      );
      const [defaultCount] = splitValueUnit(
        identifier.defaultCount.toString(),
        determineUnit(identifier),
        true,
      );
      if (!Number.isInteger(minCount)) {
        parentWarningMessage = `Minimum count for ${
          identifier.resourceType ?? identifier.displayName
        } cannot be a decimal.`;
      }
      if (!Number.isInteger(maxCount)) {
        parentWarningMessage = `Maximum count for ${
          identifier.resourceType ?? identifier.displayName
        } cannot be a decimal.`;
      }
      if (!Number.isInteger(defaultCount)) {
        parentWarningMessage = `Default count for ${
          identifier.resourceType ?? identifier.displayName
        } cannot be a decimal.`;
      }
      if (minCount > maxCount) {
        parentWarningMessage = `Minimum allowed ${
          identifier.resourceType ?? identifier.displayName
        } cannot exceed maximum allowed ${identifier.resourceType ?? identifier.displayName}.`;
      } else if (defaultCount < minCount || defaultCount > maxCount) {
        parentWarningMessage = `The default count for ${
          identifier.resourceType ?? identifier.displayName
        } must be between the minimum allowed ${
          identifier.resourceType ?? identifier.displayName
        } and maximum allowed ${identifier.resourceType ?? identifier.displayName}.`;
      }
    } catch (e) {
      parentWarningMessage = `The resource count for ${
        identifier.resourceType ?? identifier.displayName
      } has an invalid unit.`;
    }
  }

  return parentWarningMessage
    ? {
        title: `${!hasCPUandMemory(identifiers) ? 'Incomplete' : 'Invalid'} ${
          isDefaultProfile === true ? 'default hardware' : 'hardware'
        } profile`,
        message: `${parentWarningMessage} ${
          isDefaultProfile
            ? HARDWARE_PROFILES_DEFAULT_WARNING_MESSAGE
            : 'Edit the profile to make the profile valid.'
        }`,
      }
    : undefined;
};

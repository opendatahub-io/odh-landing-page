import { QueryParams } from '@openshift/dynamic-plugin-sdk-utils';
import { K8sAPIOptions } from 'k8sTypes';

export const mergeK8sQueryParams = (opts: K8sAPIOptions = {}): QueryParams => {
  return {
    ...(opts.dryRun && { dryRun: 'All' }),
  };
};

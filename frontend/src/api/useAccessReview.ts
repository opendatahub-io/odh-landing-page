import { k8sCreateResource } from '@openshift/dynamic-plugin-sdk-utils';
import * as React from 'react';
import { ProjectModel, SelfSubjectAccessReviewModel } from '~/api/models';
import { AccessReviewResourceAttributes, SelfSubjectAccessReviewKind } from '~/k8sTypes';

export const checkAccess = ({
  group,
  resource,
  subresource,
  verb,
  name,
  namespace,
}: Required<AccessReviewResourceAttributes>): Promise<[allowed: boolean, loaded: boolean]> => {
  // Projects are a special case. `namespace` must be set to the project name
  // even though it's a cluster-scoped resource.
  const reviewNamespace =
    group === ProjectModel.apiGroup && resource === ProjectModel.plural ? name : namespace;
  const selfSubjectAccessReview: SelfSubjectAccessReviewKind = {
    apiVersion: 'authorization.k8s.io/v1',
    kind: 'SelfSubjectAccessReview',
    spec: {
      resourceAttributes: {
        group,
        resource,
        subresource,
        verb,
        name,
        namespace: reviewNamespace,
      },
    },
  };
  return (
    k8sCreateResource<SelfSubjectAccessReviewKind>({
      model: SelfSubjectAccessReviewModel,
      resource: selfSubjectAccessReview,
    })
      // TODO: TypeScript doesn't realize this can be inferred as this type and thinks it is boolean[]
      .then((result): [allowed: boolean, loaded: boolean] => [
        result.status ? result.status.allowed : true,
        true,
      ])
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.warn('SelfSubjectAccessReview failed', e);
        return [true, true]; // if it critically fails, don't block SSAR checks; let it fail/succeed on future calls
      })
  );
};

export const useAccessReview = (
  resourceAttributes: AccessReviewResourceAttributes,
  shouldRunCheck = true,
): [boolean, boolean] => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isAllowed, setAllowed] = React.useState(false);

  const {
    group = '',
    resource = '',
    subresource = '',
    verb,
    name = '',
    namespace = '',
  } = resourceAttributes;

  React.useEffect(() => {
    if (shouldRunCheck) {
      checkAccess({ group, resource, subresource, verb, name, namespace }).then(
        ([allowed, loaded]) => {
          setAllowed(allowed);
          setIsLoaded(loaded);
        },
      );
    }
  }, [group, name, namespace, resource, subresource, verb, shouldRunCheck]);

  return [isAllowed, isLoaded];
};

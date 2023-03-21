import { ProjectKind } from "~/k8sTypes";

export const mockProjectK8sResource = (
  username: string,
  displayName: string,
  description: string = "",
  k8sName: string,
  enableModelMesh: boolean = true
): ProjectKind => ({
  kind: 'Project',
  apiVersion: 'project.openshift.io/v1',
  metadata: {
    name: k8sName,
    creationTimestamp: '2023-02-14T21:43:59Z',
    labels: {
      'kubernetes.io/metadata.name': k8sName,
      'modelmesh-enabled': enableModelMesh ? 'true' : "false",
      'opendatahub.io/dashboard': 'true',
    },
    annotations: {
      'openshift.io/description': description,
      'openshift.io/display-name': displayName,
      'openshift.io/requester': username,
    },
  },
  status: {
    phase: "Active",
  },
})
/*
 * Common types, should be kept up to date with backend types
 */

export type DashboardConfig = {
  enablement: boolean;
  disableInfo: boolean;
  disableSupport: boolean;
};

export type ClusterSettings = {
  pvcSize: number | string;
  cullerTimeout: number;
};

export type NotebookSize = {
  name: string;
  description?: string;
  resources?: {
    limits?: {
      cpu?: string;
      memory?: string;
      'nvidia.com/gpu'?: number;
    };
    requests?: {
      cpu?: string;
      memory?: string;
    };
  };
};

export type OdhConfig = {
  apiVersion?: string;
  kind?: string;
  metadata: {
    name: string;
    annotations?: { [key: string]: string };
  };
  spec: {
    notebookSizes: NotebookSize[];
  };
};

export type OdhApplication = {
  metadata: {
    name: string;
    annotations?: { [key: string]: string };
  };
  spec: {
    displayName: string;
    provider: string;
    description: string;
    route?: string | null;
    routeNamespace?: string | null;
    routeSuffix?: string | null;
    serviceName?: string | null;
    endpoint?: string | null;
    link?: string | null;
    img: string;
    docsLink: string;
    getStartedLink: string;
    category?: string;
    support?: string;
    quickStart: string | null;
    comingSoon?: boolean | null;
    beta?: boolean | null;
    betaTitle?: string | null;
    betaText?: string | null;
    shownOnEnabledPage: boolean | null;
    isEnabled: boolean | null;
    kfdefApplications?: string[];
    csvName?: string;
    enable?: {
      title: string;
      actionLabel: string;
      description?: string;
      linkPreface?: string;
      link?: string;
      variables?: { [key: string]: string };
      variableDisplayText?: { [key: string]: string };
      variableHelpText?: { [key: string]: string };
      validationSecret: string;
      validationJob: string;
      validationConfigMap?: string;
    };
    featureFlag?: string;
  };
};

export enum OdhDocumentType {
  Documentation = 'documentation',
  HowTo = 'how-to',
  QuickStart = 'quickstart',
  Tutorial = 'tutorial',
}

export type OdhDocument = {
  metadata: {
    name: string;
    type: string;
    annotations?: { [key: string]: string };
  };
  spec: {
    displayName: string;
    appName?: string;
    appDisplayName?: string; // Only set on UI side in resources section
    appEnabled?: boolean; // Only set on UI side in resources section
    provider?: string;
    description: string;
    url: string;
    img?: string;
    icon?: string;
    durationMinutes?: number;
    featureFlag?: string;
  };
};

export type OdhGettingStarted = {
  appName: string;
  markdown: string;
};

export enum BUILD_PHASE {
  none = 'Not started',
  new = 'New',
  running = 'Running',
  pending = 'Pending',
  complete = 'Complete',
  failed = 'Failed',
  cancelled = 'Cancelled',
}

export type BuildStatus = {
  name: string;
  status: BUILD_PHASE;
  timestamp: string;
};

export type ImageSoftwareType = {
  name: string;
  version?: string;
};

export type ImageTagType = {
  content?: {
    software: ImageSoftwareType[];
    dependencies: ImageSoftwareType[];
  };
  name: string;
  recommended: boolean;
  default: boolean | undefined;
  build_status: string | null;
};

export type ImageType = {
  description: string | null;
  url: string | null;
  display_name: string;
  name: string;
  order: number;
  tags?: ImageTagType[];
};

export type SizeDescription = {
  name: string;
  resources: {
    limits: {
      cpu: number;
      memory: string;
    };
    requests: {
      cpu: number;
      memory: string;
    };
  };
  schedulable?: boolean;
};

export type EnvVarType = {
  name: string;
  type: string;
  value: string | number;
};

export type EnvVarCategoryType = {
  name: string;
  variables: [
    {
      name: string;
      type: string;
    },
  ];
};

export type VariableRow = {
  variableType: string;
  variables: EnvVarType[];
  errors: { [key: string]: string };
};

export enum DATA_SOURCE {
  objectStorage = 'object',
  database = 'database',
  starburst = 'starburst',
}

export enum CONNECTED_MODEL {
  persistentVolume = 'pv',
  s3 = 's3',
}

export type Project = {
  kind: string;
  apiVersion: string;
  metadata: {
    name: string;
    creationTimestamp: string;
    labels?: { [key: string]: string };
    annotations?: { [key: string]: string };
  };
  status: {
    phase: string;
  };
};

export type ProjectList = {
  metadata: Record<string, any>;
  items: Project[];
};

export type Notebook = {
  apiVersion?: string;
  kind?: string;
  metadata: {
    name: string;
    namespace: string;
    uid?: string;
    labels?: { [key: string]: string };
    annotations?: { [key: string]: string };
  };
  spec: {
    template: {
      spec: {
        containers?: Container[];
        volumes?: Volume[];
      };
    };
  };
  status?: Record<string, any>;
};

export type NotebookList = {
  apiVersion?: string;
  kind?: string;
  metadata: Record<string, any>;
  items: Notebook[];
};

export type ImageStreamAndTag = {
  imageStream?: ImageStream;
  tag?: ImageStreamTag;
};

// ImageStreamTag type when included in an ImageStream
// Fetching an ImageStreamTag directly has a different structure
export type ImageStreamTag = {
  name: string;
  labels?: { [key: string]: string };
  annotations?: { [key: string]: string };
  from: {
    kind: string;
    name: string;
  };
};

export type ImageStreamStatusTagItem = {
  created: string;
  dockerImageReference: string;
  image: string;
  generetion: number;
};

export type ImageStreamStatusTag = {
  tag: string;
  items: ImageStreamStatusTagItem[];
};

export type ImageStreamStatus = {
  dockerImageRepository?: string;
  publicDockerImageRepository?: string;
  tags?: ImageStreamStatusTag[];
};

export type ImageStream = {
  apiVersion?: string;
  kind?: string;
  metadata: {
    name: string;
    namespace: string;
    labels?: { [key: string]: string };
    annotations?: { [key: string]: string };
  };
  spec?: {
    lookupPolicy?: {
      local: boolean;
    };
    tags?: ImageStreamTag[];
  };
  status?: ImageStreamStatus;
};

export type ImageStreamList = {
  apiVersion?: string;
  kind?: string;
  metadata: Record<string, unknown>;
  items: ImageStream[];
};

export type Probe = {
  initialDelaySeconds?: number;
  periodSeconds?: number;
  timeoutSeconds?: number;
  successThreshold?: number;
  failureThreshold?: number;
  httpGet?: {
    path?: string;
    port?: number | string;
    httpHeaders?: { [key: string]: string };
  };
  tcpSocket?: {
    port: number;
  };
};

export type Container = {
  name: string;
  image: string;
  imagePullPolicy?: string;
  env?: { name: string; value: string }[];
  args?: string[];
  volumeMounts: VolumeMount[];
  resources: {
    limits?: {
      cpu: string;
      memory: string;
    };
    requests?: {
      cpu: string;
      memory: string;
    };
  };
  livenessProbe?: Probe;
  readinessProbe?: Probe;
  terminationMessagePath?: string;
};

export type StorageClass = {
  apiVersion?: string;
  kind?: string;
  metadata: {
    name: string;
    annotations?: { [key: string]: string };
  };
  provisioner: string;
  parameters: {
    encrypted: string;
    type: string;
  };
  reclaimPolicy: string;
  allowVolumeExpansion: boolean;
  volumeBindingMode: string;
};

export type StorageClassList = {
  apiVersion?: string;
  kind?: string;
  metadata: Record<string, unknown>;
  items: StorageClass[];
};

export type VolumeMount = { mountPath: string; name: string };

export type Volume = {
  name: string;
  emptyDir?: Record<string, any>;
  persistentVolumeClaim?: {
    claimName: string;
  };
};

export type PersistentVolumeClaim = {
  apiVersion?: string;
  kind?: string;
  metadata: {
    name: string;
    namespace?: string;
    annotations?: { [key: string]: string };
  };
  spec: {
    accessModes: string[];
    resources: {
      requests: {
        storage: string;
      };
    };
    storageClassName?: string;
    volumeMode: 'Filesystem' | 'Block';
  };
  status?: Record<string, any>;
};

export type PersistentVolumeClaimList = {
  apiVersion?: string;
  kind?: string;
  metadata: Record<string, unknown>;
  items: PersistentVolumeClaim[];
};

export type Secret = {
  apiVersion?: string;
  kind?: string;
  metadata: {
    name: string;
    namespace?: string;
    labels?: { [key: string]: string };
    annotations?: { [key: string]: string };
  };
  type: string;
  stringData?: { [key: string]: string };
  data?: { [key: string]: string };
};

export type SecretList = {
  apiVersion?: string;
  kind?: string;
  metadata: Record<string, unknown>;
  items: Secret[];
};

export enum PermissionType {
  Edit = 'Edit',
  View = 'Read only',
}

export type StatefulSet = {
  apiVersion?: string;
  kind?: string;
  metadata: {
    creationTimestamp: string;
    name: string;
    namespace: string;
    ownerReferences: [
      {
        apiVersion: string;
        blockOwnerDeletion: true;
        controller: true;
        kind: string;
        name: string;
        uid: string;
      },
    ];
  };
  spec: {
    podManagementPolicy: string;
    replicas: number;
    revisionHistoryLimit: number;
    selector: {
      matchLabels: {
        statefulset: string;
      };
    };
    serviceName: string;
    template: {
      metadata: {
        creationTimestamp: null;
        labels?: { [key: string]: string };
      };
      spec: {
        containers: Container[];
        dnsPolicy: string;
        restartPolicy: string;
        schedulerName: string;
        terminationGracePeriodSeconds: number;
        volumes: Volume[];
      };
    };
    updateStrategy: {
      rollingUpdate: {
        partition: 0;
      };
      type: string;
    };
  };
  status?: Record<string, unknown>;
};

export type StatefulSetList = {
  apiVersion?: string;
  kind?: string;
  metadata: Record<string, unknown>;
  items: StatefulSet[];
};

export type Predictor = {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
    labels?: { [key: string]: string };
    annotations?: { [key: string]: string };
    creationTimestamp?: string;
  };
  spec: {
    modelType: {
      name: string;
    };
    path: string;
    storage: {
      s3: {
        secretKey: string;
      };
    };
  };
  status?: Record<string, any>;
};

export type PredictorList = {
  apiVersion?: string;
  kind?: string;
  metadata: Record<string, unknown>;
  items: Predictor[];
};

export type ServingRuntime = {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
    labels?: { [key: string]: string };
    annotations?: { [key: string]: string };
  };
  spec: {
    builtInAdapter: {
      memBufferBytes: number;
      modelLoadingTimeoutMillis: number;
      runtimeManagementPort: number;
      serverType: string;
    };
    containers: Container[];
    grpcDataEndpoint: string;
    grpcEndpoint: string;
    multiModel: boolean;
    supportedModelFormats: {
      autoSelect: boolean;
      name: string;
      version: string;
    }[];
  };
};

export type ServingRuntimeList = {
  apiVersion?: string;
  kind?: string;
  metadata: Record<string, unknown>;
  items: ServingRuntime[];
};

export type OpenShiftRoute = {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
    labels?: { [key: string]: string };
    annotations?: { [key: string]: string };
  };
  spec: {
    host: string;
    port: {
      targetPort: string;
    };
    to: {
      kind: string;
      name: string;
      weight: number;
    };
    tls: {
      termination: string;
      insecureEdgeTerminationPolicy: string;
    };
    wildcardPolicy: string;
  };
};

export enum ProjectsTableFilter {
  Name = 'Name',
  User = 'User',
  WorkspaceName = 'Workspace name',
  Status = 'Status',
  Created = 'Created',
  ServingStatus = 'Serving status',
}

export type FilterSelectOptionType = {
  filter: ProjectsTableFilter;
  toString: () => string;
  compareTo: (value: FilterSelectOptionType) => boolean;
};

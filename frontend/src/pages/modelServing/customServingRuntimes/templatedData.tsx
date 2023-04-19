import { SortableData } from '~/utilities/useTableColumnSort';
import { TemplateKind } from '~/k8sTypes';

export const columns: SortableData<TemplateKind>[] = [
  {
    field: 'name',
    label: 'Name',
    sortable: false,
  },
  {
    field: 'enabled',
    label: 'Enabled',
    sortable: false,
  },
  {
    field: 'models-deployed',
    label: 'Models Deployed',
    sortable: false,
  },
  {
    field: 'kebab',
    label: '',
    sortable: false,
  },
];

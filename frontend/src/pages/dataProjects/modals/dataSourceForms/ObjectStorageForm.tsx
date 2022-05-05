import * as React from 'react';
import {
  Button,
  FormGroup,
  InputGroup,
  Select,
  SelectOption,
  SelectVariant,
  TextInput,
  TextInputTypes,
} from '@patternfly/react-core';
import { Notebook, NotebookList } from 'types';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

type ObjectStorageFormProps = {
  notebookList: NotebookList | undefined;
  setInfo: (info) => void;
};

const ObjectStorageForm: React.FC<ObjectStorageFormProps> = React.memo(
  ({ notebookList, setInfo }) => {
    const [secretName, setSecretName] = React.useState<string>('');
    const [endpointUrl, setEndpointUrl] = React.useState<string>('');
    const [accessKeyId, setAccessKeyId] = React.useState<string>('');
    const [secretAccessKey, setSecretAccessKey] = React.useState<string>('');
    const [defaultBucket, setDefaultBucket] = React.useState<string>('');
    const [region, setRegion] = React.useState<string>('');
    const [isNotebookSelectOpen, setIsNotebookSelectOpen] = React.useState(false);
    const [selectedNotebook, setSelectedNotebook] = React.useState<Notebook | undefined>(undefined);
    const [showAccessKeyId, setShowAccessKeyId] = React.useState<boolean>(false);
    const [showSecretAccessKey, setShowSecretAccessKey] = React.useState<boolean>(false);

    React.useEffect(() => {
      setInfo({
        secretName,
        endpointUrl,
        accessKeyId,
        secretAccessKey,
        defaultBucket,
        region,
        selectedNotebook,
      });
    }, [
      secretName,
      endpointUrl,
      accessKeyId,
      secretAccessKey,
      defaultBucket,
      region,
      selectedNotebook,
      setInfo,
    ]);

    let notebookSelectOptions = [<SelectOption key={0} value="None" />];
    if (notebookList?.items?.length) {
      notebookSelectOptions = notebookSelectOptions.concat(
        notebookList?.items?.map((notebook, index) => (
          <SelectOption key={index + 1} value={notebook.metadata.name} />
        )),
      );
    }

    const handleNotebookSelection = (e, value, isPlaceholder) => {
      if (value === 'None') {
        setSelectedNotebook(undefined);
      } else {
        const selected = notebookList?.items.find((nb) => nb.metadata.name === value);
        setSelectedNotebook(selected);
      }
      setIsNotebookSelectOpen(false);
    };

    return (
      <>
        <FormGroup fieldId="secret-name" label="Secret Name">
          <TextInput
            id="secret-name-input"
            name="secret-name-input"
            value={secretName}
            onChange={(value) => setSecretName(value)}
          />
        </FormGroup>
        <FormGroup fieldId="endpoint-url" label="Endpoint URL">
          <TextInput
            id="endpoint-url-input"
            name="endpoint-url-input"
            value={endpointUrl}
            onChange={(value) => setEndpointUrl(value)}
          />
        </FormGroup>
        <FormGroup fieldId="access-key-id" label="Access Key ID">
          <InputGroup>
            <TextInput
              id="access-key-id-input"
              type={showAccessKeyId ? TextInputTypes.text : TextInputTypes.password}
              name="access-key-id-input"
              value={accessKeyId}
              onChange={(value) => setAccessKeyId(value)}
            />
            <Button variant="control" onClick={() => setShowAccessKeyId(!showAccessKeyId)}>
              {showAccessKeyId ? <EyeSlashIcon /> : <EyeIcon />}
            </Button>
          </InputGroup>
        </FormGroup>
        <FormGroup fieldId="access-key" label="Secret Access Key">
          <InputGroup>
            <TextInput
              id="secret-access-key-input"
              type={showSecretAccessKey ? TextInputTypes.text : TextInputTypes.password}
              name="secret-access-key-input"
              value={secretAccessKey}
              onChange={(value) => setSecretAccessKey(value)}
            />
            <Button variant="control" onClick={() => setShowSecretAccessKey(!showSecretAccessKey)}>
              {showSecretAccessKey ? <EyeSlashIcon /> : <EyeIcon />}
            </Button>
          </InputGroup>
        </FormGroup>
        <FormGroup fieldId="default-bucket" label="Default Bucket">
          <TextInput
            id="default-bucket-input"
            name="default-bucket-input"
            value={defaultBucket}
            onChange={(value) => setDefaultBucket(value)}
          />
        </FormGroup>
        <FormGroup fieldId="region" label="Region">
          <TextInput
            id="region-input"
            name="region-input"
            value={region}
            onChange={(value) => setRegion(value)}
          />
        </FormGroup>
        <FormGroup label="Notebook" fieldId="storage-connection">
          <Select
            variant={SelectVariant.single}
            aria-label="Select Notebook"
            onToggle={() => setIsNotebookSelectOpen(!isNotebookSelectOpen)}
            onSelect={handleNotebookSelection}
            selections={selectedNotebook?.metadata.name || 'None'}
            isOpen={isNotebookSelectOpen}
            label="Workspace"
          >
            {notebookSelectOptions}
          </Select>
        </FormGroup>
      </>
    );
  },
);

ObjectStorageForm.displayName = 'ObjectStorageForm';

export default ObjectStorageForm;

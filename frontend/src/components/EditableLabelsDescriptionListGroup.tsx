import React, { useState } from 'react';
import { Label, LabelGroup, Alert, AlertVariant, Button } from '@patternfly/react-core';
import DashboardDescriptionListGroup from './DashboardDescriptionListGroup';

interface EditableLabelsProps {
  labels: string[];
  onLabelsChange: (labels: string[]) => Promise<void>;
  isArchive?: boolean;
  title?: string;
  contentWhenEmpty?: string;
  allExistingKeys: string[];
}

export const EditableLabelsDescriptionListGroup: React.FC<EditableLabelsProps> = ({
  title = 'Labels',
  contentWhenEmpty = 'No labels',
  labels,
  onLabelsChange,
  isArchive,
  allExistingKeys,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingEdits, setIsSavingEdits] = useState(false);
  const [unsavedLabels, setUnsavedLabels] = useState(labels);

  const validateLabels = (labelsList: string[]): string[] => {
    const errors: string[] = [];

    const duplicatesMap = new Map<string, number>();
    labelsList.forEach((label) => {
      duplicatesMap.set(label, (duplicatesMap.get(label) || 0) + 1);
    });

    const duplicateLabels: string[] = [];
    duplicatesMap.forEach((count, label) => {
      if (count > 1) {
        duplicateLabels.push(label);
      }
    });

    if (duplicateLabels.length > 0) {
      if (duplicateLabels.length === 1) {
        errors.push(
          `**${duplicateLabels[0]}** already exists. Ensure that each label is unique and does not match any existing property key.`,
        );
      } else {
        const lastLabel = duplicateLabels.pop();
        const formattedLabels = duplicateLabels.map((label) => `**${label}**`).join(', ');
        errors.push(
          `${formattedLabels} and **${lastLabel}** already exist. Ensure that each label is unique and does not match any existing property key.`,
        );
      }
    }

    labelsList.forEach((label) => {
      if (!labelsList.includes(label) && allExistingKeys.includes(label)) {
        errors.push(
          `**${label}** already exists. Use a unique name that doesn't match any existing key or property`,
        );
      }
      if (label.length > 63) {
        errors.push(`**${label}** exceeds 63 characters`);
      }
    });

    return errors;
  };

  const handleEditComplete = (
    _event: MouseEvent | KeyboardEvent,
    newText: string,
    currentLabel?: string,
  ) => {
    if (!newText) {
      return;
    }

    setUnsavedLabels((prev) => {
      if (currentLabel) {
        const index = prev.indexOf(currentLabel);
        if (index === -1) {
          return [...prev, newText];
        }

        const newLabels = [...prev];
        newLabels[index] = newText;
        return newLabels;
      }
      return [...prev, newText];
    });
  };

  const removeUnsavedLabel = (text: string) => {
    if (isSavingEdits) {
      return;
    }
    setUnsavedLabels(unsavedLabels.filter((label) => label !== text));
  };

  const addNewLabel = () => {
    if (isSavingEdits) {
      return;
    }
    const baseLabel = 'New Label';
    let counter = 1;
    let newLabel = baseLabel;

    while (unsavedLabels.includes(newLabel)) {
      newLabel = `${baseLabel} ${counter}`;
      counter++;
    }

    setUnsavedLabels((prev) => [...prev, newLabel]);
  };

  const labelErrors = validateLabels(unsavedLabels);

  const shouldBeRed = (label: string, index: number): boolean => {
    const firstIndex = unsavedLabels.findIndex((l) => l === label);

    if (firstIndex !== index) {
      return true;
    }

    return labelErrors.some(
      (error) => error.includes(`"${label}"`) && !error.includes('appears multiple times'),
    );
  };

  // Add a ref for the alert
  const alertRef = React.useRef<HTMLDivElement>(null);

  return (
    <DashboardDescriptionListGroup
      editButtonTestId="editable-labels-group-edit"
      saveButtonTestId="editable-labels-group-save"
      title={title}
      isEmpty={labels.length === 0}
      contentWhenEmpty={contentWhenEmpty}
      isEditable={!isArchive}
      isEditing={isEditing}
      isSavingEdits={isSavingEdits}
      contentWhenEditing={
        <>
          <LabelGroup
            data-testid="editable-label-group"
            isEditable={!isSavingEdits}
            numLabels={10}
            expandedText="Show Less"
            collapsedText="Show More"
          >
            {unsavedLabels.map((label, index) => (
              <Label
                data-testid={`editable-label-${label}`}
                key={label + index}
                color={shouldBeRed(label, index) ? 'red' : 'blue'}
                isEditable={!isSavingEdits}
                onClose={() => removeUnsavedLabel(label)}
                closeBtnProps={{
                  isDisabled: isSavingEdits,
                  'data-testid': `remove-label-${label}`,
                }}
                onEditComplete={(event, newText) => handleEditComplete(event, newText, label)}
                editableProps={{
                  defaultValue: label,
                  'aria-label': 'Edit label',
                  'data-testid': `edit-label-input-${label}`,
                }}
              >
                {label}
              </Label>
            ))}
            <Button
              data-testid="add-label-button"
              variant="plain"
              className="pf-v5-c-label pf-m-outline"
              onClick={addNewLabel}
              isDisabled={isSavingEdits}
              style={{
                border: '2px solid #d2d2d2',
                color: '#0066CC',
                backgroundColor: 'transparent',
              }}
            >
              Add label
            </Button>
          </LabelGroup>
          {labelErrors.length > 0 && (
            <Alert
              ref={alertRef}
              data-testid="label-error-alert"
              variant={AlertVariant.danger}
              isInline
              title="Label validation errors:"
              aria-live="polite"
              isPlain
              tabIndex={-1}
              style={{ marginTop: '16px' }}
            >
              <ul>
                {labelErrors.map((error, index) => (
                  <li key={index}>
                    {error
                      .split('**')
                      .map((part, i) => (i % 2 === 0 ? part : <strong key={i}>{part}</strong>))}
                  </li>
                ))}
              </ul>
            </Alert>
          )}
        </>
      }
      onEditClick={() => {
        setUnsavedLabels(labels);
        setIsEditing(true);
      }}
      onSaveEditsClick={async () => {
        if (labelErrors.length > 0) {
          return;
        }
        setIsSavingEdits(true);
        try {
          await onLabelsChange(unsavedLabels);
        } finally {
          setIsSavingEdits(false);
          setIsEditing(false);
        }
      }}
      onDiscardEditsClick={() => {
        setUnsavedLabels(labels);
        setIsEditing(false);
      }}
    >
      <LabelGroup data-testid="display-label-group">
        {labels.map((label) => (
          <Label key={label} color="blue" data-testid="label">
            {label}
          </Label>
        ))}
      </LabelGroup>
    </DashboardDescriptionListGroup>
  );
};

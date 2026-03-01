import React, { useState } from 'react';
import {
  TextInput,
  NumberInput,
  EmailInput,
  DatePicker,
  TextArea,
  Dropdown,
  MultiSelect,
  Checkbox,
  Radio,
} from './index';

/**
 * Demo component showing all field types
 * This is for demonstration purposes only
 */
export const FieldDemo: React.FC = () => {
  const [textValue, setTextValue] = useState('');
  const [numberValue, setNumberValue] = useState<number | string>('');
  const [emailValue, setEmailValue] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [textAreaValue, setTextAreaValue] = useState('');
  const [dropdownValue, setDropdownValue] = useState('');
  const [multiSelectValue, setMultiSelectValue] = useState<string[]>([]);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState('');

  const dropdownOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const radioOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'maybe', label: 'Maybe' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Field Components Demo</h1>

      <TextInput
        value={textValue}
        onChange={setTextValue}
        label="Text Input"
        placeholder="Enter text..."
        required
      />

      <NumberInput
        value={numberValue}
        onChange={setNumberValue}
        label="Number Input"
        placeholder="Enter a number..."
        error={numberValue && Number(numberValue) < 0 ? 'Must be positive' : undefined}
      />

      <EmailInput
        value={emailValue}
        onChange={setEmailValue}
        label="Email Input"
        placeholder="your@email.com"
        required
      />

      <DatePicker
        value={dateValue}
        onChange={setDateValue}
        label="Date Picker"
      />

      <TextArea
        value={textAreaValue}
        onChange={setTextAreaValue}
        label="Text Area"
        placeholder="Enter multiple lines..."
        rows={3}
      />

      <Dropdown
        value={dropdownValue}
        onChange={setDropdownValue}
        label="Dropdown"
        placeholder="Select an option..."
        options={dropdownOptions}
        required
      />

      <MultiSelect
        value={multiSelectValue}
        onChange={setMultiSelectValue}
        label="Multi Select"
        placeholder="Select multiple options"
        options={dropdownOptions}
      />

      <Checkbox
        value={checkboxValue}
        onChange={setCheckboxValue}
        label="I agree to the terms and conditions"
        required
      />

      <Radio
        value={radioValue}
        onChange={setRadioValue}
        label="Radio Buttons"
        options={radioOptions}
        required
      />
    </div>
  );
};

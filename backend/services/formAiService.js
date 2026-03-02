const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const VALID_FIELD_TYPES = ['text', 'textarea', 'number', 'email', 'date', 'dropdown', 'multiselect', 'checkbox', 'radio', 'file'];

const SYSTEM_PROMPT = `You are a form schema generator. Given a user's description, output a JSON array of form fields only. No markdown, no explanation, only the raw JSON array.

Each field must have this shape (use only these types: text, textarea, number, email, date, dropdown, multiselect, checkbox, radio, file):
{
  "type": "<FieldType>",
  "label": "Human readable label",
  "placeholder": "optional placeholder",
  "required": true or false,
  "options": [{"id": "opt1", "value": "v1", "label": "Option 1"}]  // only for dropdown, radio, multiselect
}

Do NOT include: id, position, width, validation, conditionalLogic - the backend will add those.
For dropdown/radio/multiselect always include an "options" array with id, value, label for each option.
Output nothing but the JSON array.`;

/**
 * Call Groq API and return normalized field definitions for the form builder.
 * @param {string} userPrompt - e.g. "Contact form with name, email, and message"
 * @returns {{ fields: Array, suggestedName?: string }}
 */
export async function generateFormFields(userPrompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set');
  }

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt.trim() || 'A simple contact form with name, email and message.' },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Groq API error:', response.status, err);
    throw new Error(`AI service error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('No response from AI');
  }

  // Strip markdown code block if present
  let raw = content;
  const codeMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) raw = codeMatch[1].trim();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error('AI JSON parse error:', raw);
    throw new Error('AI returned invalid JSON');
  }

  const array = Array.isArray(parsed) ? parsed : [parsed];
  const suggestedName = suggestFormName(userPrompt);

  const fields = array.map((item, index) => normalizeField(item, index));
  return { fields, suggestedName };
}

function suggestFormName(prompt) {
  const t = prompt.trim();
  if (!t) return 'Untitled Form';
  // First 40 chars, capitalize, no trailing period
  const name = t.slice(0, 40).replace(/\s+$/, '').replace(/\.$/, '');
  return name.charAt(0).toUpperCase() + name.slice(1) || 'Untitled Form';
}

function normalizeField(item, index) {
  const type = VALID_FIELD_TYPES.includes(item.type) ? item.type : 'text';
  const id = `field-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`;
  const options = Array.isArray(item.options)
    ? item.options.map((o, i) => ({
        id: o.id || `opt-${i}`,
        value: o.value ?? o.label ?? String(i),
        label: o.label ?? o.value ?? String(i),
      }))
    : undefined;

  return {
    id,
    type,
    label: typeof item.label === 'string' ? item.label : `Field ${index + 1}`,
    placeholder: typeof item.placeholder === 'string' ? item.placeholder : '',
    defaultValue: item.defaultValue ?? '',
    required: Boolean(item.required),
    validation: Array.isArray(item.validation) ? item.validation : [],
    conditionalLogic: Array.isArray(item.conditionalLogic) ? item.conditionalLogic : [],
    position: { x: 0, y: index * 100 },
    width: 100,
    ...(options && options.length && { options }),
    ...(type === 'file' && item.accept && { accept: item.accept }),
  };
}

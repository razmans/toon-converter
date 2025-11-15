# TOON Converter

A TypeScript library for bidirectional conversion between JSON, TOON, and XML formats.

## What is TOON Format?

TOON stands for Token Oriented Object Notation, is a compact, tabular data format that represents arrays of objects in a human-readable way that would be best suited for LLM because it reduces token usage by up to 30%. Rather than sending over a JSON or an XML, using TOON would significantly reduce token usage because it has been optimized. Example TOON data:

```
users[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user
```

## Installation

```bash
npm install @razmans/toon-converter
```

## Features

- ✅ **JSON ↔ TOON** - Convert between JSON objects and TOON format
- ✅ **XML ↔ TOON** - Convert between XML and TOON format
- ✅ **Type Safety** - Full TypeScript support with proper types
- ✅ **Type Inference** - Automatically parses strings, numbers, booleans, and nested objects
- ✅ **Zero Configuration** - Works out of the box
- ✅ **Lightweight** - Minimal dependencies

## Usage

### Import

```typescript
import { ToonConverter } from '@razmans/toon-converter';
```

### JSON to TOON

Convert JSON objects with arrays to TOON format:

```typescript
const jsonData = {
  users: [
    { id: 1, name: "Alice", role: "admin" },
    { id: 2, name: "Bob", role: "user" }
  ]
};

const toonString = ToonConverter.jsonConvertToToonStyle(jsonData);
console.log(toonString);
```

**Output:**
```
users[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user
```

### TOON to JSON

Parse TOON format back to JSON:

```typescript
const toonData = `users[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user`;

const jsonObject = ToonConverter.toonToJsonConvert(toonData);
console.log(jsonObject);
```

**Output:**
```json
{
  "users": [
    { "id": 1, "name": "Alice", "role": "admin" },
    { "id": 2, "name": "Bob", "role": "user" }
  ]
}
```

### XML to TOON

Convert XML documents to TOON format:

```typescript
const xmlData = `
<root>
  <user id="1" name="Alice" role="admin"/>
  <user id="2" name="Bob" role="user"/>
</root>`;

const toonFromXml = ToonConverter.xmlToToonConvert(xmlData);
console.log(toonFromXml);
```

**Output:**
```
user[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user
```

### TOON to XML

Convert TOON format to XML:

```typescript
const toonData = `users[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user`;

const xmlString = ToonConverter.toonToXMLConvert(toonData);
console.log(xmlString);
```

**Output:**
```xml
<root>
  <users id="1" name="Alice" role="admin"/>
  <users id="2" name="Bob" role="user"/>
</root>
```

## API Reference

### `ToonConverter.jsonConvertToToonStyle(data: JsonObject): string`

Converts a JSON object containing arrays to TOON format.

**Parameters:**
- `data`: JSON object where values are arrays of objects

**Returns:** TOON formatted string

---

### `ToonConverter.toonToJsonConvert(toonData: string): JsonObject`

Parses TOON format string to JSON object.

**Parameters:**
- `toonData`: TOON formatted string

**Returns:** JSON object with parsed data

**Features:**
- Automatically infers types (numbers, booleans, strings)
- Handles null/empty values
- Supports nested objects (as JSON strings)

---

### `ToonConverter.xmlToToonConvert(xml: string): string`

Converts XML string to TOON format.

**Parameters:**
- `xml`: Valid XML string

**Returns:** TOON formatted string

**Throws:** Error if XML is invalid

---

### `ToonConverter.toonToXMLConvert(toonData: string): string`

Converts TOON format to XML string.

**Parameters:**
- `toonData`: TOON formatted string

**Returns:** XML string with root element

---

## Advanced Examples

### Multiple Arrays

```typescript
const data = {
  users: [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" }
  ],
  products: [
    { sku: "ABC123", price: 29.99 }
  ]
};

const toon = ToonConverter.jsonConvertToToonStyle(data);
```

**Output:**
```
users[2]{id,name}:
  1,Alice
  2,Bob

products[1]{sku,price}:
  ABC123,29.99
```

### Type Inference

TOON parser automatically converts values to appropriate types:

```typescript
const toon = `items[2]{id,active,score,name}:
  1,true,95.5,Item1
  2,false,87.3,Item2`;

const json = ToonConverter.toonToJsonConvert(toon);
// Returns:
// {
//   items: [
//     { id: 1, active: true, score: 95.5, name: "Item1" },
//     { id: 2, active: false, score: 87.3, name: "Item2" }
//   ]
// }
```

### Nested Objects

```typescript
const data = {
  records: [
    { id: 1, metadata: { x: 10, y: 20 } },
    { id: 2, metadata: { x: 30, y: 40 } }
  ]
};

const toon = ToonConverter.jsonConvertToToonStyle(data);
// Nested objects are serialized as JSON strings in TOON format
```

### Null/Empty Values

```typescript
const data = {
  entries: [
    { id: 1, value: "test", optional: null },
    { id: 2, value: null, optional: "data" }
  ]
};

const toon = ToonConverter.jsonConvertToToonStyle(data);
// Null values are represented as empty strings in TOON format
```

## TOON Format Specification

The TOON format follows this structure:

```
arrayName[count]{key1,key2,key3}:
  value1,value2,value3
  value4,value5,value6
```

**Components:**
- `arrayName`: Name of the array/collection
- `[count]`: Number of items in the array
- `{key1,key2,key3}`: Comma-separated list of keys/columns
- `:` : Header delimiter
- Data rows: Each row contains comma-separated values aligned with keys

**Multiple arrays** are separated by blank lines.

## TypeScript Types

```typescript
import { JsonObject, JsonArray, JsonValue } from 'toon-converter';

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
```

## Error Handling

```typescript
try {
  const invalidXml = '<root><unclosed>';
  const toon = ToonConverter.xmlToToonConvert(invalidXml);
} catch (error) {
  console.error('Invalid XML:', error.message);
}
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Repository

[https://github.com/razmans/toon-converter](https://github.com/razmans/toon-converter)

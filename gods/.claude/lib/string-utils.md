# String Utilities for BACO

Common string transformation utilities used throughout BACO for consistent naming conventions.

## Transformation Functions

```typescript
// Convert to camelCase: "user name" -> "userName"
export function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
}

// Convert to PascalCase: "user name" -> "UserName"
export function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

// Convert to snake_case: "userName" -> "user_name"
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/_$/, '');
}

// Convert to kebab-case: "userName" -> "user-name"
export function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/-$/, '');
}

// Convert to CONSTANT_CASE: "userName" -> "USER_NAME"
export function toConstantCase(str: string): string {
  return toSnakeCase(str).toUpperCase();
}

// Convert to Title Case: "user name" -> "User Name"
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Pluralize a word: "user" -> "users", "person" -> "people"
export function pluralize(word: string): string {
  const irregulars: Record<string, string> = {
    person: 'people',
    child: 'children',
    man: 'men',
    woman: 'women',
    tooth: 'teeth',
    foot: 'feet',
    mouse: 'mice',
    goose: 'geese'
  };

  const lowerWord = word.toLowerCase();
  
  // Check irregular plurals
  if (irregulars[lowerWord]) {
    return word.charAt(0) === word.charAt(0).toUpperCase() 
      ? irregulars[lowerWord].charAt(0).toUpperCase() + irregulars[lowerWord].slice(1)
      : irregulars[lowerWord];
  }

  // Rules for regular plurals
  if (word.match(/[sxz]$/) || word.match(/[cs]h$/)) {
    return word + 'es';
  }
  
  if (word.match(/[^aeiou]y$/)) {
    return word.slice(0, -1) + 'ies';
  }
  
  if (word.match(/f$/)) {
    return word.slice(0, -1) + 'ves';
  }
  
  if (word.match(/fe$/)) {
    return word.slice(0, -2) + 'ves';
  }
  
  return word + 's';
}

// Singularize a word: "users" -> "user", "people" -> "person"
export function singularize(word: string): string {
  const irregulars: Record<string, string> = {
    people: 'person',
    children: 'child',
    men: 'man',
    women: 'woman',
    teeth: 'tooth',
    feet: 'foot',
    mice: 'mouse',
    geese: 'goose'
  };

  const lowerWord = word.toLowerCase();
  
  // Check irregular plurals
  if (irregulars[lowerWord]) {
    return word.charAt(0) === word.charAt(0).toUpperCase() 
      ? irregulars[lowerWord].charAt(0).toUpperCase() + irregulars[lowerWord].slice(1)
      : irregulars[lowerWord];
  }

  // Rules for regular singulars
  if (word.match(/ies$/)) {
    return word.slice(0, -3) + 'y';
  }
  
  if (word.match(/ves$/)) {
    return word.slice(0, -3) + 'f';
  }
  
  if (word.match(/([^aeious])es$/)) {
    return word.slice(0, -2);
  }
  
  if (word.match(/s$/) && !word.match(/ss$/)) {
    return word.slice(0, -1);
  }
  
  return word;
}

// Check if a word is plural
export function isPlural(word: string): boolean {
  return pluralize(singularize(word)) === word;
}

// Truncate string with ellipsis
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

// Generate a slug from string: "Hello World!" -> "hello-world"
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Extract initials: "Prometheus Doe" -> "JD"
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

// Capitalize first letter: "hello" -> "Hello"
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Escape special regex characters
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

## TypeScript Type Mappings

```typescript
// Map field types to TypeScript types
export function mapToTypeScriptType(field: FieldDefinition): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    date: 'Date',
    objectId: 'string',
    array: 'any[]',
    object: 'Record<string, any>'
  };

  let baseType = typeMap[field.type] || 'any';

  // Handle enums
  if (field.enum && field.enum.length > 0) {
    baseType = field.enum.map(v => `'${v}'`).join(' | ');
  }

  // Handle arrays of specific types
  if (field.type === 'array' && field.items) {
    baseType = `${mapToTypeScriptType(field.items)}[]`;
  }

  return baseType;
}

// Map field types to Mongoose types
export function mapToMongooseType(fieldType: string): string {
  const typeMap: Record<string, string> = {
    string: 'String',
    number: 'Number',
    boolean: 'Boolean',
    date: 'Date',
    objectId: 'Schema.Types.ObjectId',
    array: 'Array',
    object: 'Schema.Types.Mixed'
  };

  return typeMap[fieldType] || 'String';
}

// Map field types to Prisma types
export function mapToPrismaType(field: FieldDefinition): string {
  const typeMap: Record<string, string> = {
    string: 'String',
    number: 'Int',
    boolean: 'Boolean',
    date: 'DateTime',
    objectId: 'String',
    array: 'Json',
    object: 'Json'
  };

  let baseType = typeMap[field.type] || 'String';

  // Handle special cases
  if (field.type === 'number' && field.name.toLowerCase().includes('price')) {
    baseType = 'Float';
  }

  return baseType;
}

// Format default values for Prisma
export function formatPrismaDefault(value: any): string {
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  if (typeof value === 'boolean') {
    return value.toString();
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (value instanceof Date) {
    return 'now()';
  }
  if (value === 'now' || value === 'NOW') {
    return 'now()';
  }
  if (value === 'uuid' || value === 'UUID') {
    return 'uuid()';
  }
  if (value === 'cuid' || value === 'CUID') {
    return 'cuid()';
  }
  return JSON.stringify(value);
}
```

## Validation Helpers

```typescript
// Check if string is valid identifier (variable name)
export function isValidIdentifier(str: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(str);
}

// Sanitize string to be valid identifier
export function toValidIdentifier(str: string): string {
  // Remove invalid characters
  let sanitized = str.replace(/[^a-zA-Z0-9_$]/g, '_');
  
  // Ensure it doesn't start with a number
  if (/^\d/.test(sanitized)) {
    sanitized = '_' + sanitized;
  }
  
  // Ensure it's not empty
  if (!sanitized) {
    sanitized = '_field';
  }
  
  return sanitized;
}

// Check if string is reserved keyword
export function isReservedKeyword(str: string): boolean {
  const reserved = new Set([
    'break', 'case', 'catch', 'class', 'const', 'continue',
    'debugger', 'default', 'delete', 'do', 'else', 'export',
    'extends', 'finally', 'for', 'function', 'if', 'import',
    'in', 'instanceof', 'new', 'return', 'super', 'switch',
    'this', 'throw', 'try', 'typeof', 'var', 'void', 'while',
    'with', 'yield', 'let', 'static', 'enum', 'await',
    'implements', 'interface', 'package', 'private', 'protected',
    'public', 'abstract', 'boolean', 'byte', 'char', 'double',
    'final', 'float', 'goto', 'int', 'long', 'native', 'short',
    'synchronized', 'throws', 'transient', 'volatile'
  ]);
  
  return reserved.has(str.toLowerCase());
}

// Ensure identifier is not reserved
export function ensureNotReserved(str: string): string {
  if (isReservedKeyword(str)) {
    return str + '_';
  }
  return str;
}
```

## Usage Examples

```typescript
// Case conversions
toCamelCase('user_name')        // 'userName'
toPascalCase('user-name')       // 'UserName'
toSnakeCase('userName')         // 'user_name'
toKebabCase('UserName')         // 'user-name'
toConstantCase('user name')     // 'USER_NAME'

// Pluralization
pluralize('user')               // 'users'
pluralize('person')             // 'people'
pluralize('category')           // 'categories'
singularize('users')            // 'user'
singularize('people')           // 'person'

// Type mappings
mapToTypeScriptType({ type: 'string', enum: ['a', 'b'] })  // "'a' | 'b'"
mapToMongooseType('date')       // 'Date'
mapToPrismaType({ type: 'number', name: 'price' })  // 'Float'

// Validation
isValidIdentifier('userName')   // true
isValidIdentifier('123name')    // false
toValidIdentifier('my-field')   // 'my_field'
ensureNotReserved('class')      // 'class_'
```
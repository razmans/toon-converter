import { ToonConverter } from "./index";
import { JsonObject } from "./util/util";

// Helper function to compare outputs
const assertEqual = (actual: string, expected: string, testName: string) => {
  if (actual === expected) {
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.log(`❌ FAIL: ${testName}`);
    console.log("Expected:", expected);
    console.log("Actual:", actual);
  }
};

const assertDeepEqual = (
  actual: JsonObject,
  expected: JsonObject,
  testName: string,
) => {
  const actualStr = JSON.stringify(actual, null, 2);
  const expectedStr = JSON.stringify(expected, null, 2);
  if (actualStr === expectedStr) {
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.log(`❌ FAIL: ${testName}`);
    console.log("Expected:", expectedStr);
    console.log("Actual:", actualStr);
  }
};

console.log("=== Testing ToonConverter ===\n");

// ========================================
// Test 1: jsonConvertToToonStyle - Basic
// ========================================
console.log("--- Test 1: jsonConvertToToonStyle (Basic) ---");
const jsonData1: JsonObject = {
  users: [
    { id: 1, name: "Alice", role: "admin" },
    { id: 2, name: "Bob", role: "user" },
  ],
};

const toonResult1 = ToonConverter.jsonConvertToToonStyle(jsonData1);
const expectedToon1 = `users[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user`;
assertEqual(toonResult1, expectedToon1, "Basic JSON to TOON conversion");
console.log();

// ========================================
// Test 2: jsonConvertToToonStyle - Multiple Arrays
// ========================================
console.log("--- Test 2: jsonConvertToToonStyle (Multiple Arrays) ---");
const jsonData2: JsonObject = {
  users: [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ],
  products: [{ sku: "ABC123", price: 29.99, stock: 100 }],
};

const toonResult2 = ToonConverter.jsonConvertToToonStyle(jsonData2);
console.log(toonResult2);
console.log();

// ========================================
// Test 3: jsonConvertToToonStyle - Empty and Null Values
// ========================================
console.log("--- Test 3: jsonConvertToToonStyle (Null Values) ---");
const jsonData3: JsonObject = {
  entries: [
    { id: 1, value: "test", optional: null },
    { id: 2, value: null, optional: "data" },
  ],
};

const toonResult3 = ToonConverter.jsonConvertToToonStyle(jsonData3);
console.log(toonResult3);
console.log();

// ========================================
// Test 4: toonToJsonConvert - Basic
// ========================================
console.log("--- Test 4: toonToJsonConvert (Basic) ---");
const toonData1 = `users[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user`;

const jsonResult1 = ToonConverter.toonToJsonConvert(toonData1);
assertDeepEqual(
  jsonResult1,
  {
    users: [
      { id: 1, name: "Alice", role: "admin" },
      { id: 2, name: "Bob", role: "user" },
    ],
  },
  "Basic TOON to JSON conversion",
);
console.log();

// ========================================
// Test 5: toonToJsonConvert - Multiple Arrays
// ========================================
console.log("--- Test 5: toonToJsonConvert (Multiple Arrays) ---");
const toonData2 = `users[2]{id,name}:
  1,Alice
  2,Bob

products[1]{sku,price,stock}:
  ABC123,29.99,100`;

const jsonResult2 = ToonConverter.toonToJsonConvert(toonData2);
console.log(JSON.stringify(jsonResult2, null, 2));
console.log();

// ========================================
// Test 6: toonToJsonConvert - With Booleans and Numbers
// ========================================
console.log("--- Test 6: toonToJsonConvert (Type Parsing) ---");
const toonData3 = `items[2]{id,active,score}:
  1,true,95.5
  2,false,87.3`;

const jsonResult3 = ToonConverter.toonToJsonConvert(toonData3);
assertDeepEqual(
  jsonResult3,
  {
    items: [
      { id: 1, active: true, score: 95.5 },
      { id: 2, active: false, score: 87.3 },
    ],
  },
  "TOON to JSON with type parsing",
);
console.log();

// ========================================
// Test 7: Round-trip (JSON → TOON → JSON)
// ========================================
console.log("--- Test 7: Round-trip (JSON → TOON → JSON) ---");
const originalJson: JsonObject = {
  people: [
    { id: 1, name: "Charlie", age: 30 },
    { id: 2, name: "Diana", age: 25 },
  ],
};

const toonRoundTrip = ToonConverter.jsonConvertToToonStyle(originalJson);
const jsonRoundTrip = ToonConverter.toonToJsonConvert(toonRoundTrip);
assertDeepEqual(jsonRoundTrip, originalJson, "JSON → TOON → JSON round-trip");
console.log();

// ========================================
// Test 8: xmlToToonConvert - Basic
// ========================================
console.log("--- Test 8: xmlToToonConvert (Basic) ---");
const xmlData1 = `<root>
  <user id="1" name="Alice" role="admin"/>
  <user id="2" name="Bob" role="user"/>
</root>`;

try {
  const toonFromXml1 = ToonConverter.xmlToToonConvert(xmlData1);
  console.log(toonFromXml1);
} catch (e) {
  console.log("Error:", (e as Error).message);
}
console.log();

// ========================================
// Test 9: xmlToToonConvert - Nested Elements
// ========================================
console.log("--- Test 9: xmlToToonConvert (Nested) ---");
const xmlData2 = `<root>
  <product sku="ABC123">
    <price>29.99</price>
    <stock>100</stock>
  </product>
</root>`;

try {
  const toonFromXml2 = ToonConverter.xmlToToonConvert(xmlData2);
  console.log(toonFromXml2);
} catch (e) {
  console.log("Error:", (e as Error).message);
}
console.log();

// ========================================
// Test 10: toonToXMLConvert - Basic
// ========================================
console.log("--- Test 10: toonToXMLConvert (Basic) ---");
const toonForXml = `users[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user`;

try {
  const xmlFromToon = ToonConverter.toonToXMLConvert(toonForXml);
  console.log(xmlFromToon);
} catch (e) {
  console.log("Error:", (e as Error).message);
}
console.log();

// ========================================
// Test 11: Round-trip (TOON → XML → TOON)
// ========================================
console.log("--- Test 11: Round-trip (TOON → XML → TOON) ---");
const originalToon = `items[2]{id,name}:
  1,Item1
  2,Item2`;

try {
  const xmlRoundTrip = ToonConverter.toonToXMLConvert(originalToon);
  console.log("XML:", xmlRoundTrip);
  const toonRoundTrip2 = ToonConverter.xmlToToonConvert(xmlRoundTrip);
  console.log("TOON:", toonRoundTrip2);
} catch (e) {
  console.log("Error:", (e as Error).message);
}
console.log();

// ========================================
// Test 12: Invalid XML
// ========================================
console.log("--- Test 12: Invalid XML Error Handling ---");
const invalidXml = `<root><unclosed>`;

try {
  ToonConverter.xmlToToonConvert(invalidXml);
  console.log("❌ FAIL: Should have thrown error for invalid XML");
} catch (e) {
  console.log("✅ PASS: Correctly threw error:", (e as Error).message);
}
console.log();

// ========================================
// Test 13: Empty Arrays Handling
// ========================================
console.log("--- Test 13: Empty Arrays (should be filtered out) ---");
const jsonWithEmpty: JsonObject = {
  users: [{ id: 1, name: "Alice" }],
  emptyArray: [],
};

const toonWithEmpty = ToonConverter.jsonConvertToToonStyle(jsonWithEmpty);
console.log(toonWithEmpty);
console.log("Should only show users, not emptyArray");
console.log();

// ========================================
// Test 14: Nested Objects in TOON
// ========================================
console.log("--- Test 14: Nested Objects ---");
const jsonWithNested: JsonObject = {
  records: [
    { id: 1, data: { x: 10, y: 20 } },
    { id: 2, data: { x: 30, y: 40 } },
  ],
};

const toonWithNested = ToonConverter.jsonConvertToToonStyle(jsonWithNested);
console.log(toonWithNested);
console.log();

console.log("\n=== All Tests Completed ===");

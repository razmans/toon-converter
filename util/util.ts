import { DOMImplementation, XMLSerializer } from "@xmldom/xmldom";

// Types
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

// Helper to convert an array to TOON format
export const arrayToToon = (name: string, array: JsonArray): string => {
  const keys = [
    ...new Set(
      array.flatMap((item) =>
        typeof item === "object" && item ? Object.keys(item) : [],
      ),
    ),
  ];

  const header = `${name}[${array.length}]{${keys.join(",")}}:`;
  const rows = array.map(
    (item) =>
      `  ${keys.map((k) => formatValue((item as JsonObject)[k])).join(",")}`,
  );

  return [header, ...rows].join("\n");
};

// Helper to format individual values
export const formatValue = (val: JsonValue): string => {
  if (val == null) return "";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
};

// Helper to parse a CSV line considering nested structures
export const parseCSV = (line: string): string[] => {
  const values: string[] = [];
  let current = "";
  let depth = { quotes: false, braces: 0 };

  for (const char of line) {
    if (char === "{") depth.braces++;
    else if (char === "}") depth.braces--;
    else if (char === '"') depth.quotes = !depth.quotes;

    if (char === "," && !depth.quotes && depth.braces === 0) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
};

// Helper to parse individual values
export const parseValue = (val: string): JsonValue => {
  const v = val.trim();
  if (!v) return null;
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+\.?\d*$/.test(v)) return Number(v);
  if (
    (v.startsWith("{") || v.startsWith("[")) &&
    (v.endsWith("}") || v.endsWith("]"))
  ) {
    try {
      return JSON.parse(v) as JsonValue;
    } catch {}
  }
  return v;
};

// XML to JSON conversion
export const xmlToJson = (node: Element): JsonObject => {
  const children = node.childNodes
    ? Array.from(node.childNodes).filter(
        (child): child is Element => child.nodeType === 1, // Element nodes only
      )
    : [];

  return Object.fromEntries(
    Object.entries(
      children.reduce((acc, child) => {
        (acc[child.tagName] ||= []).push(child);
        return acc;
      }, {} as Record<string, Element[]>),
    ).map(([tag, elems]) => [tag, elems.map(xmlElemToObj)]),
  );
};

export const xmlElemToObj = (elem: Element): JsonValue => {
  const obj: JsonObject = Object.fromEntries(
    elem.attributes
      ? Array.from(elem.attributes).map((a) => [a.name, a.value])
      : [],
  );

  const children = elem.childNodes
    ? Array.from(elem.childNodes).filter(
        (child): child is Element => child.nodeType === 1,
      )
    : [];

  if (children.length > 0) {
    children.forEach((child) => {
      const childObj = xmlElemToObj(child);
      const existingValue = obj[child.tagName];
      obj[child.tagName] = existingValue
        ? Array.isArray(existingValue)
          ? [...existingValue, childObj]
          : [existingValue, childObj]
        : childObj;
    });
  } else {
    const text = elem.textContent?.trim() || "";
    return Object.keys(obj).length === 0 ? text : text ? { ...obj, text } : obj;
  }

  return obj;
};

// JSON to XML conversion
export const jsonToXml = (data: JsonObject, rootName = "root"): string => {
  const domImpl = new DOMImplementation();
  const doc = domImpl.createDocument("", "", null);
  const root = doc.createElement(rootName);

  Object.entries(data).forEach(([key, value]) =>
    (Array.isArray(value) ? value : [value]).forEach((item) =>
      root.appendChild(objToXmlElem(doc, key, item)),
    ),
  );

  doc.appendChild(root);
  return new XMLSerializer().serializeToString(doc);
};

export const objToXmlElem = (
  doc: Document,
  tag: string,
  obj: JsonValue,
): Element => {
  const elem = doc.createElement(tag);

  if (typeof obj !== "object" || obj === null) {
    elem.textContent = String(obj);
    return elem;
  }

  if (Array.isArray(obj)) {
    // Handle arrays
    obj.forEach((item) => elem.appendChild(objToXmlElem(doc, "item", item)));
  } else {
    // Handle objects
    Object.entries(obj).forEach(([key, value]) => {
      if (key === "text") elem.textContent = String(value);
      else if (Array.isArray(value))
        value.forEach((item) => elem.appendChild(objToXmlElem(doc, key, item)));
      else if (typeof value === "object" && value !== null)
        elem.appendChild(objToXmlElem(doc, key, value));
      else elem.setAttribute(key, String(value));
    });
  }

  return elem;
};

import {
  arrayToToon,
  jsonToXml,
  parseCSV,
  parseValue,
  xmlToJson,
  JsonObject,
  JsonArray,
  JsonValue,
} from "./util/util";
import { DOMParser } from "@xmldom/xmldom";

export class ToonConverter {
  // JSON to TOON
  public static jsonConvertToToonStyle(data: JsonObject): string {
    return Object.entries(data)
      .filter(([_, value]) => Array.isArray(value) && value.length > 0)
      .map(([key, value]) => arrayToToon(key, value as JsonArray))
      .join("\n\n");
  }

  // TOON to JSON
  public static toonToJsonConvert(toonData: string): JsonObject {
    return toonData
      .split(/\n\n+/)
      .filter((s) => s.trim())
      .reduce((result, section) => {
        const [header, ...dataLines] = section
          .split("\n")
          .filter((l) => l.trim());
        const match = header?.match(/^(\w+)\[(\d+)\]\{([^}]*)\}:$/);

        if (match) {
          const [_, name, __, keysStr] = match;
          const keys = keysStr.split(",").filter((k) => k);

          result[name] = dataLines.map((line) =>
            parseCSV(line.trim()).reduce((obj, val, i) => {
              if (keys[i]) obj[keys[i]] = parseValue(val);
              return obj;
            }, {} as JsonObject),
          );
        }

        return result;
      }, {} as JsonObject);
  }

  // XML to TOON
  public static xmlToToonConvert(xml: string): string {
    const parser = new DOMParser({
      errorHandler: {
        warning: () => {},
        error: (msg: string) => {
          throw new Error("Invalid XML: " + msg);
        },
        fatalError: (msg: string) => {
          throw new Error("Invalid XML: " + msg);
        },
      },
    });
    const doc = parser.parseFromString(xml, "text/xml");

    // Check for parsing errors in xmldom
    const documentElement = doc.documentElement;
    if (!documentElement || documentElement.nodeName === "parsererror") {
      throw new Error("Invalid XML");
    }

    return this.jsonConvertToToonStyle(xmlToJson(documentElement));
  }

  // TOON to XML
  public static toonToXMLConvert(toonData: string): string {
    return jsonToXml(this.toonToJsonConvert(toonData));
  }
}

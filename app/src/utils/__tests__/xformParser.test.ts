import { describe, it, expect } from "vitest";
import { parseXFormFields, extractVarRefs, getDefaultText, parseFormLanguages, extractPulldataFiles } from "../xformParser";

const SIMPLE_XFORM = `<?xml version="1.0"?>
<h:html xmlns="http://www.w3.org/2002/xforms" xmlns:h="http://www.w3.org/1999/xhtml">
  <h:head>
    <model>
      <instance>
        <data id="test">
          <name/>
          <age/>
          <calc/>
        </data>
      </instance>
      <bind nodeset="/data/name" type="string"/>
      <bind nodeset="/data/age" type="int" constraint=". &gt; 0" required="true()"/>
      <bind nodeset="/data/calc" type="string" calculate="concat(/data/name, ' is ', /data/age)"/>
    </model>
  </h:head>
  <h:body>
    <input ref="/data/name"><label>Your Name</label></input>
    <input ref="/data/age"><label>Your Age</label><hint>Enter a positive number</hint></input>
  </h:body>
</h:html>`;

const ITEXT_XFORM = `<?xml version="1.0"?>
<h:html xmlns="http://www.w3.org/2002/xforms" xmlns:h="http://www.w3.org/1999/xhtml">
  <h:head>
    <model>
      <itext>
        <translation lang="English">
          <text id="/data/q1:label"><value>Question 1</value></text>
          <text id="/data/q1:hint"><value>Help text</value></text>
        </translation>
        <translation lang="French">
          <text id="/data/q1:label"><value>Question un</value></text>
          <text id="/data/q1:hint"><value>Texte d'aide</value></text>
        </translation>
      </itext>
      <instance><data id="test"><q1/></data></instance>
      <bind nodeset="/data/q1" type="string"/>
    </model>
  </h:head>
  <h:body>
    <input ref="/data/q1">
      <label ref="jr:itext('/data/q1:label')"/>
      <hint ref="jr:itext('/data/q1:hint')"/>
    </input>
  </h:body>
</h:html>`;

describe("parseXFormFields", () => {
  it("parses inline-label fields", () => {
    const fields = parseXFormFields(SIMPLE_XFORM);
    expect(fields.size).toBe(3);

    const name = fields.get("name")!;
    expect(name.type).toBe("string");
    expect(name.bodyTag).toBe("input");
    expect(name.labels).toEqual({ default: "Your Name" });

    const age = fields.get("age")!;
    expect(age.type).toBe("int");
    expect(age.constraint).toContain("> 0");
    expect(age.required).toBe("true()");
    expect(age.hints).toEqual({ default: "Enter a positive number" });
  });

  it("parses calculate-only fields (no body)", () => {
    const fields = parseXFormFields(SIMPLE_XFORM);
    const calc = fields.get("calc")!;
    expect(calc.bodyTag).toBe("");
    expect(calc.calculation).toContain("concat");
  });

  it("parses itext localized labels and hints", () => {
    const fields = parseXFormFields(ITEXT_XFORM);
    const q1 = fields.get("q1")!;
    expect(q1.labels).toEqual({ English: "Question 1", French: "Question un" });
    expect(q1.hints).toEqual({ English: "Help text", French: "Texte d'aide" });
  });
});

describe("extractVarRefs", () => {
  it("extracts variable references from expressions", () => {
    expect(extractVarRefs("${name} = 'foo' and ${age} > 0")).toEqual(["name", "age"]);
  });

  it("returns empty for no refs", () => {
    expect(extractVarRefs("1 + 2")).toEqual([]);
  });
});

describe("getDefaultText", () => {
  it("returns first language value", () => {
    expect(getDefaultText({ English: "Hello", French: "Bonjour" })).toBe("Hello");
  });

  it("returns empty for empty object", () => {
    expect(getDefaultText({})).toBe("");
  });
});

describe("parseFormLanguages", () => {
  it("returns languages from itext", () => {
    const langs = parseFormLanguages(ITEXT_XFORM);
    expect(langs).toEqual(["English", "French"]);
  });

  it("returns empty for non-itext forms", () => {
    expect(parseFormLanguages(SIMPLE_XFORM)).toEqual([]);
  });
});

describe("parseXFormFields - new properties", () => {
  it("parses repeat_count from jr:count", () => {
    const xml = `<?xml version="1.0"?>
<h:html xmlns="http://www.w3.org/2002/xforms" xmlns:h="http://www.w3.org/1999/xhtml" xmlns:jr="http://openrosa.org/javarosa">
  <h:head><model>
    <instance><data id="test"><rpt_grp/></data></instance>
    <bind nodeset="/data/rpt_grp" type="string"/>
  </model></h:head>
  <h:body>
    <repeat nodeset="/data/rpt_grp" jr:count="5">
    </repeat>
  </h:body>
</h:html>`;
    const fields = parseXFormFields(xml);
    const rpt = fields.get("rpt_grp");
    expect(rpt).toBeDefined();
    expect(rpt!.repeatCount).toBe("5");
  });

  it("parses odk:calculate attribute variant", () => {
    const xml = `<?xml version="1.0"?>
<h:html xmlns="http://www.w3.org/2002/xforms" xmlns:h="http://www.w3.org/1999/xhtml" xmlns:odk="http://www.opendatakit.org/xforms">
  <h:head><model>
    <instance><data id="test"><calc1/></data></instance>
    <bind nodeset="/data/calc1" type="string" odk:calculate="concat('a','b')"/>
  </model></h:head>
  <h:body></h:body>
</h:html>`;
    const fields = parseXFormFields(xml);
    expect(fields.get("calc1")!.calculation).toBe("concat('a','b')");
  });

  it("parses setvalue trigger", () => {
    const xml = `<?xml version="1.0"?>
<h:html xmlns="http://www.w3.org/2002/xforms" xmlns:h="http://www.w3.org/1999/xhtml">
  <h:head><model>
    <instance><data id="test"><ts/></data></instance>
    <bind nodeset="/data/ts" type="string"/>
    <setvalue ref="/data/ts" event="odk-instance-first-load" value="now()"/>
  </model></h:head>
  <h:body><input ref="/data/ts"><label>Timestamp</label></input></h:body>
</h:html>`;
    const fields = parseXFormFields(xml);
    expect(fields.get("ts")!.trigger).toContain("now()");
  });

  it("parses media::image from itext", () => {
    const xml = `<?xml version="1.0"?>
<h:html xmlns="http://www.w3.org/2002/xforms" xmlns:h="http://www.w3.org/1999/xhtml" xmlns:jr="http://openrosa.org/javarosa">
  <h:head><model>
    <itext>
      <translation lang="en">
        <text id="/data/q1:label">
          <value>Q1</value>
          <value form="image">jr://images/q1.png</value>
        </text>
      </translation>
    </itext>
    <instance><data id="test"><q1/></data></instance>
    <bind nodeset="/data/q1" type="string"/>
  </model></h:head>
  <h:body>
    <input ref="/data/q1"><label ref="jr:itext('/data/q1:label')"/></input>
  </h:body>
</h:html>`;
    const fields = parseXFormFields(xml);
    expect(fields.get("q1")!.mediaImages).toEqual({ en: "jr://images/q1.png" });
  });

  it("parses parameters from body element attributes", () => {
    const xml = `<?xml version="1.0"?>
<h:html xmlns="http://www.w3.org/2002/xforms" xmlns:h="http://www.w3.org/1999/xhtml">
  <h:head><model>
    <instance><data id="test"><photo/></data></instance>
    <bind nodeset="/data/photo" type="binary"/>
  </model></h:head>
  <h:body>
    <upload ref="/data/photo" mediatype="image/*" max-pixels="1024"><label>Photo</label></upload>
  </h:body>
</h:html>`;
    const fields = parseXFormFields(xml);
    expect(fields.get("photo")!.parameters).toContain("max-pixels=1024");
  });

  it("bind-only fields get empty new properties", () => {
    const fields = parseXFormFields(SIMPLE_XFORM);
    const calc = fields.get("calc")!;
    expect(calc.repeatCount).toBe("");
    expect(calc.parameters).toBe("");
    expect(calc.trigger).toBe("");
    expect(calc.mediaImages).toEqual({});
  });
});

describe("extractPulldataFiles", () => {
  it("extracts pulldata file references", () => {
    const xml = `<bind calculate="pulldata('households', 'name', 'id', ${String.fromCharCode(36)}{hh_id})"/>`;
    expect(extractPulldataFiles(xml)).toEqual(["households"]);
  });

  it("returns empty when no pulldata", () => {
    expect(extractPulldataFiles(SIMPLE_XFORM)).toEqual([]);
  });
});

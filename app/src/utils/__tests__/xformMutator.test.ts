import { describe, it, expect } from "vitest";
import { applyEditsToXform } from "../xformMutator";

const SIMPLE_XFORM = `<?xml version="1.0"?>
<h:html xmlns="http://www.w3.org/2002/xforms" xmlns:h="http://www.w3.org/1999/xhtml" xmlns:jr="http://openrosa.org/javarosa">
  <h:head>
    <model>
      <instance>
        <data id="test">
          <name/>
          <age/>
        </data>
      </instance>
      <bind nodeset="/data/name" type="string"/>
      <bind nodeset="/data/age" type="int"/>
    </model>
  </h:head>
  <h:body>
    <input ref="/data/name"><label>Name</label></input>
    <input ref="/data/age"><label>Age</label></input>
  </h:body>
</h:html>`;

describe("applyEditsToXform", () => {
  it("returns unchanged XML for empty edits", () => {
    const result = applyEditsToXform(SIMPLE_XFORM, new Map());
    expect(result).toContain("Name");
    expect(result).toContain("Age");
  });

  it("modifies bind attributes", () => {
    const edits = new Map([
      ["age", { constraint: ". > 0", required: "true()" }],
    ]);
    const result = applyEditsToXform(SIMPLE_XFORM, edits);
    expect(result).toContain('constraint=". &gt; 0"');
    expect(result).toContain('required="true()"');
  });

  it("modifies inline label text", () => {
    const edits = new Map([
      ["name", { labels: { default: "Full Name" } }],
    ]);
    const result = applyEditsToXform(SIMPLE_XFORM, edits);
    expect(result).toContain("Full Name");
    expect(result).not.toContain(">Name<");
  });

  it("modifies appearance attribute", () => {
    const edits = new Map([
      ["name", { appearance: "multiline" }],
    ]);
    const result = applyEditsToXform(SIMPLE_XFORM, edits);
    expect(result).toContain('appearance="multiline"');
  });

  it("removes attribute when set to empty string", () => {
    const editAdd = new Map([["age", { required: "true()" }]]);
    const withRequired = applyEditsToXform(SIMPLE_XFORM, editAdd);
    expect(withRequired).toContain('required="true()"');

    const editRemove = new Map([["age", { required: "" }]]);
    const withoutRequired = applyEditsToXform(withRequired, editRemove);
    expect(withoutRequired).not.toContain("required=");
  });

  it("sets default value", () => {
    const edits = new Map([
      ["name", { defaultValue: "John" }],
    ]);
    const result = applyEditsToXform(SIMPLE_XFORM, edits);
    expect(result).toContain(">John<");
  });

  it("throws on invalid XML", () => {
    expect(() => applyEditsToXform("<bad", new Map())).toThrow("Invalid XML");
  });

  it("modifies readonly attribute on bind", () => {
    const edits = new Map([["name", { readonly: "true()" }]]);
    const result = applyEditsToXform(SIMPLE_XFORM, edits);
    expect(result).toContain('readonly="true()"');
  });

  it("removes readonly when set to empty string", () => {
    const addReadonly = new Map([["name", { readonly: "true()" }]]);
    const withReadonly = applyEditsToXform(SIMPLE_XFORM, addReadonly);
    expect(withReadonly).toContain('readonly="true()"');

    const removeReadonly = new Map([["name", { readonly: "" }]]);
    const withoutReadonly = applyEditsToXform(withReadonly, removeReadonly);
    expect(withoutReadonly).not.toContain("readonly=");
  });
});

describe("applyEditsToXform - repeat and parameters", () => {
  const REPEAT_XFORM = `<?xml version="1.0"?>
<h:html xmlns="http://www.w3.org/2002/xforms" xmlns:h="http://www.w3.org/1999/xhtml" xmlns:jr="http://openrosa.org/javarosa">
  <h:head>
    <model>
      <instance>
        <data id="test"><rpt/></data>
      </instance>
      <bind nodeset="/data/rpt" type="string"/>
    </model>
  </h:head>
  <h:body>
    <repeat nodeset="/data/rpt" jr:count="3">
    </repeat>
  </h:body>
</h:html>`;

  it("modifies repeat jr:count via repeatCount edit", () => {
    const edits = new Map([["rpt", { repeatCount: "10" }]]);
    const result = applyEditsToXform(REPEAT_XFORM, edits);
    expect(result).toContain("10");
  });
});

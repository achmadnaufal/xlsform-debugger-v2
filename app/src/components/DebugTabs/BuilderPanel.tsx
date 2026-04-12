import { useState, useCallback, useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import type { XlsRows } from "../../types";

const FIELD_TYPES = [
  "text",
  "integer",
  "decimal",
  "date",
  "select_one",
  "select_multiple",
  "note",
  "calculate",
  "geopoint",
  "geoshape",
  "begin_group",
  "end_group",
  "begin_repeat",
  "end_repeat",
] as const;

const EDITABLE_COLUMNS = [
  "name",
  "label",
  "type",
  "required",
  "relevant",
  "constraint",
  "calculation",
  "hint",
] as const;

type EditableColumn = (typeof EDITABLE_COLUMNS)[number];

interface BuilderPanelProps {
  readonly xlsRows: XlsRows;
  readonly onRowsChange: (rows: XlsRows) => void;
}

function makeDefaultRow(type: string, index: number): Record<string, string> {
  const name = `question_${index}`;
  const base: Record<string, string> = {
    type,
    name,
    label: "",
    required: "",
    relevant: "",
    constraint: "",
    calculation: "",
    hint: "",
  };
  if (type === "begin_group" || type === "begin_repeat") {
    base.name = `group_${index}`;
    base.label = `Group ${index}`;
  }
  if (type === "end_group" || type === "end_repeat") {
    base.name = "";
    base.label = "";
  }
  if (type === "calculate") {
    base.name = `calc_${index}`;
  }
  return base;
}

function isSelectType(type: string): boolean {
  return type.startsWith("select_one") || type.startsWith("select_multiple");
}

function getListName(type: string): string {
  const parts = type.split(/\s+/);
  return parts.length > 1 ? parts[1] : "";
}

function setListName(type: string, listName: string): string {
  const base = type.startsWith("select_multiple")
    ? "select_multiple"
    : "select_one";
  return listName ? `${base} ${listName}` : base;
}

function ChoicesEditor({
  listName,
  choices,
  onChoicesChange,
}: {
  readonly listName: string;
  readonly choices: readonly Record<string, string>[];
  readonly onChoicesChange: (choices: readonly Record<string, string>[]) => void;
}) {
  const listChoices = useMemo(
    () => choices.filter((c) => c.list_name === listName),
    [choices, listName]
  );

  const handleAdd = useCallback(() => {
    const newChoice: Record<string, string> = {
      list_name: listName,
      name: `option_${listChoices.length + 1}`,
      label: `Option ${listChoices.length + 1}`,
    };
    onChoicesChange([...choices, newChoice]);
  }, [choices, listChoices.length, listName, onChoicesChange]);

  const handleUpdate = useCallback(
    (idx: number, field: string, value: string) => {
      let listIdx = 0;
      const updated = choices.map((c) => {
        if (c.list_name !== listName) return c;
        if (listIdx === idx) {
          listIdx++;
          return { ...c, [field]: value };
        }
        listIdx++;
        return c;
      });
      onChoicesChange(updated);
    },
    [choices, listName, onChoicesChange]
  );

  const handleRemove = useCallback(
    (idx: number) => {
      let listIdx = 0;
      const updated = choices.filter((c) => {
        if (c.list_name !== listName) return true;
        const keep = listIdx !== idx;
        listIdx++;
        return keep;
      });
      onChoicesChange(updated);
    },
    [choices, listName, onChoicesChange]
  );

  return (
    <div className="border-t border-gray-200 bg-amber-50 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-amber-800">
          Choices for "{listName}"
        </span>
        <button
          type="button"
          onClick={handleAdd}
          className="text-xs px-2 py-0.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded"
        >
          + Choice
        </button>
      </div>
      {listChoices.length === 0 && (
        <p className="text-xs text-amber-600 italic">
          No choices yet. Click "+ Choice" to add one.
        </p>
      )}
      <div className="space-y-1">
        {listChoices.map((choice, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              className="flex-1 text-xs border border-amber-300 rounded px-2 py-1 bg-white"
              placeholder="name"
              value={choice.name ?? ""}
              onChange={(e) => handleUpdate(idx, "name", e.target.value)}
            />
            <input
              className="flex-1 text-xs border border-amber-300 rounded px-2 py-1 bg-white"
              placeholder="label"
              value={choice.label ?? ""}
              onChange={(e) => handleUpdate(idx, "label", e.target.value)}
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="text-amber-400 hover:text-red-500 text-sm leading-none"
              title="Remove choice"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FieldEditor({
  row,
  onUpdate,
}: {
  readonly row: Record<string, string>;
  readonly onUpdate: (field: string, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50 border-t border-blue-200">
      {EDITABLE_COLUMNS.map((col) => {
        if (col === "type") {
          return (
            <label key={col} className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium text-gray-500 uppercase">
                {col}
              </span>
              <select
                className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                value={
                  row.type?.startsWith("select_")
                    ? row.type.split(/\s+/)[0]
                    : row.type ?? ""
                }
                onChange={(e) => {
                  const newType = e.target.value;
                  if (isSelectType(newType)) {
                    const existingList = getListName(row.type ?? "");
                    onUpdate(
                      "type",
                      setListName(newType, existingList || row.name || "list")
                    );
                  } else {
                    onUpdate("type", newType);
                  }
                }}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          );
        }
        if (col === "required") {
          return (
            <label key={col} className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium text-gray-500 uppercase">
                {col}
              </span>
              <select
                className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                value={row.required ?? ""}
                onChange={(e) => onUpdate("required", e.target.value)}
              >
                <option value="">no</option>
                <option value="yes">yes</option>
              </select>
            </label>
          );
        }
        return (
          <label key={col} className="flex flex-col gap-0.5">
            <span className="text-[10px] font-medium text-gray-500 uppercase">
              {col}
            </span>
            <input
              className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
              value={row[col] ?? ""}
              onChange={(e) => onUpdate(col, e.target.value)}
              placeholder={col}
            />
          </label>
        );
      })}
      {isSelectType(row.type ?? "") && (
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium text-gray-500 uppercase">
            list name
          </span>
          <input
            className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
            value={getListName(row.type ?? "")}
            onChange={(e) =>
              onUpdate(
                "type",
                setListName(row.type ?? "select_one", e.target.value)
              )
            }
            placeholder="list_name"
          />
        </label>
      )}
    </div>
  );
}

function typeIcon(type: string): string {
  if (type.startsWith("select_one")) return "○";
  if (type.startsWith("select_multiple")) return "☐";
  if (type === "integer" || type === "decimal") return "#";
  if (type === "date") return "📅";
  if (type === "note") return "📝";
  if (type === "calculate") return "fx";
  if (type === "geopoint" || type === "geoshape") return "📍";
  if (type === "begin_group") return "┌";
  if (type === "end_group") return "└";
  if (type === "begin_repeat") return "↻┌";
  if (type === "end_repeat") return "↻└";
  return "Aa";
}

function groupDepth(survey: readonly Record<string, string>[], idx: number): number {
  let depth = 0;
  for (let i = 0; i < idx; i++) {
    const t = survey[i].type ?? "";
    if (t === "begin_group" || t === "begin_repeat") depth++;
    if (t === "end_group" || t === "end_repeat") depth--;
  }
  return Math.max(0, depth);
}

export function BuilderPanel({ xlsRows, onRowsChange }: BuilderPanelProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [addType, setAddType] = useState<string>("text");

  const survey = xlsRows.survey;
  const selectedRow = selectedIdx !== null ? survey[selectedIdx] : null;

  const handleAddQuestion = useCallback(() => {
    const newRow = makeDefaultRow(addType, survey.length + 1);
    if (isSelectType(addType)) {
      const listName = newRow.name || `list_${survey.length + 1}`;
      newRow.type = setListName(addType, listName);
    }
    const newSurvey = [...survey, newRow];
    onRowsChange({ ...xlsRows, survey: newSurvey });
    setSelectedIdx(newSurvey.length - 1);
  }, [addType, onRowsChange, survey, xlsRows]);

  const handleAddGroup = useCallback(() => {
    const idx = survey.length + 1;
    const beginRow = makeDefaultRow("begin_group", idx);
    const endRow = makeDefaultRow("end_group", idx);
    const newSurvey = [...survey, beginRow, endRow];
    onRowsChange({ ...xlsRows, survey: newSurvey });
    setSelectedIdx(newSurvey.length - 2);
  }, [onRowsChange, survey, xlsRows]);

  const handleAddRepeat = useCallback(() => {
    const idx = survey.length + 1;
    const beginRow = makeDefaultRow("begin_repeat", idx);
    const endRow = makeDefaultRow("end_repeat", idx);
    const newSurvey = [...survey, beginRow, endRow];
    onRowsChange({ ...xlsRows, survey: newSurvey });
    setSelectedIdx(newSurvey.length - 2);
  }, [onRowsChange, survey, xlsRows]);

  const handleUpdateField = useCallback(
    (field: string, value: string) => {
      if (selectedIdx === null) return;
      const updated = survey.map((row, i) =>
        i === selectedIdx ? { ...row, [field]: value } : row
      );
      onRowsChange({ ...xlsRows, survey: updated });
    },
    [selectedIdx, onRowsChange, survey, xlsRows]
  );

  const handleRemoveRow = useCallback(
    (idx: number) => {
      const row = survey[idx];
      const type = row.type ?? "";
      let newSurvey = [...survey];

      // If removing begin_group/repeat, also remove matching end
      if (type === "begin_group" || type === "begin_repeat") {
        const endType = type.replace("begin_", "end_");
        let depth = 0;
        for (let i = idx + 1; i < newSurvey.length; i++) {
          const t = newSurvey[i].type ?? "";
          if (t === type) depth++;
          if (t === endType) {
            if (depth === 0) {
              newSurvey.splice(i, 1);
              break;
            }
            depth--;
          }
        }
      }
      newSurvey.splice(idx, 1);
      onRowsChange({ ...xlsRows, survey: newSurvey });
      setSelectedIdx(null);
    },
    [onRowsChange, survey, xlsRows]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      const from = result.source.index;
      const to = result.destination.index;
      if (from === to) return;

      const newSurvey = [...survey];
      const [moved] = newSurvey.splice(from, 1);
      newSurvey.splice(to, 0, moved);
      onRowsChange({ ...xlsRows, survey: newSurvey });

      if (selectedIdx === from) {
        setSelectedIdx(to);
      } else if (selectedIdx !== null) {
        if (from < selectedIdx && to >= selectedIdx) {
          setSelectedIdx(selectedIdx - 1);
        } else if (from > selectedIdx && to <= selectedIdx) {
          setSelectedIdx(selectedIdx + 1);
        }
      }
    },
    [onRowsChange, selectedIdx, survey, xlsRows]
  );

  const handleChoicesChange = useCallback(
    (newChoices: readonly Record<string, string>[]) => {
      onRowsChange({ ...xlsRows, choices: newChoices });
    },
    [onRowsChange, xlsRows]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50 shrink-0">
        <select
          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
          value={addType}
          onChange={(e) => setAddType(e.target.value)}
        >
          {FIELD_TYPES.filter(
            (t) => !t.startsWith("end_") && !t.startsWith("begin_")
          ).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAddQuestion}
          className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium"
        >
          + Add Question
        </button>
        <button
          type="button"
          onClick={handleAddGroup}
          className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
        >
          + Group
        </button>
        <button
          type="button"
          onClick={handleAddRepeat}
          className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
        >
          + Repeat
        </button>
      </div>

      {/* Question list + editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: question list */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
          {survey.length === 0 && (
            <p className="text-xs text-gray-400 italic p-4 text-center">
              No questions yet. Use the toolbar above to add fields.
            </p>
          )}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="builder-survey">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {survey.map((row, idx) => {
                    const depth = groupDepth(survey, idx);
                    const type = row.type ?? "";
                    const isEnd =
                      type === "end_group" || type === "end_repeat";
                    const isSelected = selectedIdx === idx;
                    return (
                      <Draggable
                        key={`row-${idx}`}
                        draggableId={`row-${idx}`}
                        index={idx}
                      >
                        {(dragProvided, snapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            onClick={() => setSelectedIdx(idx)}
                            className={`flex items-center gap-2 px-2 py-1.5 border-b border-gray-100 cursor-pointer text-xs transition-colors ${
                              isSelected
                                ? "bg-blue-100 border-blue-300"
                                : snapshot.isDragging
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                            }`}
                            style={{
                              ...dragProvided.draggableProps.style,
                              paddingLeft: `${depth * 16 + 8}px`,
                            }}
                          >
                            <span className="text-gray-400 cursor-grab shrink-0">
                              ⠿
                            </span>
                            <span
                              className={`shrink-0 w-5 text-center font-mono ${
                                isEnd
                                  ? "text-gray-300"
                                  : "text-blue-500"
                              }`}
                            >
                              {typeIcon(type)}
                            </span>
                            <span className="font-medium text-gray-800 truncate">
                              {row.name || "(unnamed)"}
                            </span>
                            {row.label && (
                              <span className="text-gray-400 truncate ml-1">
                                — {row.label}
                              </span>
                            )}
                            <span className="ml-auto text-[10px] text-gray-400 shrink-0">
                              {type.split(/\s+/)[0]}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveRow(idx);
                              }}
                              className="text-gray-300 hover:text-red-500 ml-1 shrink-0"
                              title="Remove"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Right: field editor */}
        <div className="w-1/2 overflow-y-auto">
          {selectedRow ? (
            <div>
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-xs font-semibold text-gray-700">
                  Edit: {selectedRow.name || "(unnamed)"}
                </h3>
              </div>
              <FieldEditor row={selectedRow} onUpdate={handleUpdateField} />
              {isSelectType(selectedRow.type ?? "") &&
                getListName(selectedRow.type ?? "") && (
                  <ChoicesEditor
                    listName={getListName(selectedRow.type ?? "")}
                    choices={xlsRows.choices}
                    onChoicesChange={handleChoicesChange}
                  />
                )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400 italic">
              Select a question to edit its properties
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

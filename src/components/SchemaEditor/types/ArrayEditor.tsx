import { useId, useMemo, useState } from "react";
import { Input } from "../../../components/ui/input.tsx";
import { Label } from "../../../components/ui/label.tsx";
import { Switch } from "../../../components/ui/switch.tsx";
import { useTranslation } from "../../../hooks/use-translation.ts";
import { getArrayItemsSchema } from "../../../lib/schemaEditor.ts";
import { cn } from "../../../lib/utils.ts";
import type {
  ObjectJSONSchema,
  SchemaType,
} from "../../../types/jsonSchema.ts";
import {
  isBooleanSchema,
  withObjectSchema,
} from "../../../types/jsonSchema.ts";
import TypeDropdown from "../TypeDropdown.tsx";
import type { TypeEditorProps } from "../TypeEditor.tsx";
import TypeEditor from "../TypeEditor.tsx";

const ArrayEditor: React.FC<TypeEditorProps> = ({
  schema,
  readOnly = false,
  validationNode,
  onChange,
  depth = 0,
}) => {
  const t = useTranslation();
  const [minItems, setMinItems] = useState<number | undefined>(
    withObjectSchema(schema, (s) => s.minItems, undefined),
  );
  const [maxItems, setMaxItems] = useState<number | undefined>(
    withObjectSchema(schema, (s) => s.maxItems, undefined),
  );
  const [uniqueItems, setUniqueItems] = useState<boolean>(
    withObjectSchema(schema, (s) => s.uniqueItems || false, false),
  );
  const [containsEnabled, setContainsEnabled] = useState<boolean>(
    withObjectSchema(schema, (s) => !!s.contains, false),
  );
  const [containsSchema, setContainsSchema] = useState<ObjectJSONSchema>(
    withObjectSchema(
      schema,
      (s) => (s.contains as ObjectJSONSchema) || { type: "string" },
      { type: "string" },
    ),
  );
  const [minContains, setMinContains] = useState<number | undefined>(
    withObjectSchema(schema, (s) => s.minContains, undefined),
  );
  const [maxContains, setMaxContains] = useState<number | undefined>(
    withObjectSchema(schema, (s) => s.maxContains, undefined),
  );

  const minItemsId = useId();
  const maxItemsId = useId();
  const uniqueItemsId = useId();
  const containsId = useId();
  const minContainsId = useId();
  const maxContainsId = useId();

  const itemsSchema = getArrayItemsSchema(schema) || { type: "string" };

  const itemType = withObjectSchema(
    itemsSchema,
    (s) => (s.type || "string") as SchemaType,
    "string" as SchemaType,
  );

  const containsType = withObjectSchema(
    containsSchema,
    (s) => (s.type || "string") as SchemaType,
    "string" as SchemaType,
  );

  const buildValidationProps = ({
    minItems: overrideMinItems,
    maxItems: overrideMaxItems,
    uniqueItems: overrideUniqueItems,
    contains: overrideContains,
    containsEnabled: overrideContainsEnabled,
    minContains: overrideMinContains,
    maxContains: overrideMaxContains,
  }: {
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
    contains?: ObjectJSONSchema;
    containsEnabled?: boolean;
    minContains?: number;
    maxContains?: number;
  } = {}) => {
    const isContainsActive = overrideContainsEnabled ?? containsEnabled;

    const validationProps: ObjectJSONSchema = {
      type: "array",
      ...(isBooleanSchema(schema) ? {} : schema),
      minItems: overrideMinItems ?? minItems,
      maxItems: overrideMaxItems ?? maxItems,
      uniqueItems: (overrideUniqueItems ?? uniqueItems) || undefined,
    };

    if (validationProps.items === undefined && itemsSchema) {
      validationProps.items = itemsSchema;
    }

    if (isContainsActive) {
      validationProps.contains = overrideContains ?? containsSchema;
      validationProps.minContains = overrideMinContains ?? minContains;
      validationProps.maxContains = overrideMaxContains ?? maxContains;
    } else {
      delete validationProps.contains;
      delete validationProps.minContains;
      delete validationProps.maxContains;
    }

    const propsToKeep: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(validationProps)) {
      if (value !== undefined) {
        propsToKeep[key] = value;
      }
    }

    return propsToKeep as ObjectJSONSchema;
  };

  const handleValidationChange = () => {
    onChange(buildValidationProps());
  };

  const handleItemSchemaChange = (updatedItemSchema: ObjectJSONSchema) => {
    const updatedSchema: ObjectJSONSchema = {
      type: "array",
      ...(isBooleanSchema(schema) ? {} : schema),
      items: updatedItemSchema,
    };
    onChange(updatedSchema);
  };

  const handleContainsSchemaChange = (updated: ObjectJSONSchema) => {
    setContainsSchema(updated);
    onChange(buildValidationProps({ contains: updated }));
  };

  const handleContainsToggle = (checked: boolean) => {
    setContainsEnabled(checked);
    if (!checked) {
      setMinContains(undefined);
      setMaxContains(undefined);
    }
    onChange(buildValidationProps({ containsEnabled: checked }));
  };

  const minMaxError = useMemo(
    () =>
      validationNode?.validation.errors?.find((err) => err.path[0] === "minmax")
        ?.message,
    [validationNode],
  );

  const minItemsError = useMemo(
    () =>
      validationNode?.validation.errors?.find(
        (err) => err.path[0] === "minItems",
      )?.message,
    [validationNode],
  );

  const maxItemsError = useMemo(
    () =>
      validationNode?.validation.errors?.find(
        (err) => err.path[0] === "maxItems",
      )?.message,
    [validationNode],
  );

  const containsMinMaxError = useMemo(
    () =>
      validationNode?.validation.errors?.find(
        (err) => err.path[0] === "minmaxContains",
      )?.message,
    [validationNode],
  );

  return (
    <div className="space-y-6">
      {(!readOnly || !!maxItems || !!minItems) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(!readOnly || !!minItems) && (
            <div className="space-y-2">
              <Label
                htmlFor={minItemsId}
                className={
                  (!!minMaxError || !!minItemsError) && "text-destructive"
                }
              >
                {t.arrayMinimumLabel}
              </Label>
              <Input
                id={minItemsId}
                type="number"
                min={0}
                value={minItems ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                    ? Number(e.target.value)
                    : undefined;
                  setMinItems(value);
                }}
                onBlur={handleValidationChange}
                placeholder={t.arrayMinimumPlaceholder}
                className={cn("h-8", !!minMaxError && "border-destructive")}
              />
            </div>
          )}

          {(!readOnly || !!maxItems) && (
            <div className="space-y-2">
              <Label
                htmlFor={maxItemsId}
                className={
                  (!!minMaxError || !!maxItemsError) && "text-destructive"
                }
              >
                {t.arrayMaximumLabel}
              </Label>
              <Input
                id={maxItemsId}
                type="number"
                min={0}
                value={maxItems ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                    ? Number(e.target.value)
                    : undefined;
                  setMaxItems(value);
                }}
                onBlur={handleValidationChange}
                placeholder={t.arrayMaximumPlaceholder}
                className={cn("h-8", !!minMaxError && "border-destructive")}
              />
            </div>
          )}
          {(!!minMaxError || !!minItemsError || !!maxItemsError) && (
            <div className="text-xs text-destructive italic md:col-span-2 whitespace-pre-line">
              {[minMaxError, minItemsError ?? maxItemsError]
                .filter(Boolean)
                .join("\n")}
            </div>
          )}
        </div>
      )}

      {(!readOnly || !!uniqueItems) && (
        <div className="flex items-center space-x-2">
          <Switch
            id={uniqueItemsId}
            checked={uniqueItems}
            onCheckedChange={(checked) => {
              setUniqueItems(checked);
              onChange(buildValidationProps({ uniqueItems: checked }));
            }}
          />
          <Label htmlFor={uniqueItemsId} className="cursor-pointer">
            {t.arrayForceUniqueItemsLabel}
          </Label>
        </div>
      )}

      {/* Contains constraint */}
      {(!readOnly || containsEnabled) && (
        <div
          className={cn(
            "space-y-4 pt-4 border-border/40",
            !readOnly || !!minItems || !!maxItems || !!uniqueItems
              ? "border-t"
              : null,
          )}
        >
          <div className="flex items-center space-x-2">
            <Switch
              id={containsId}
              checked={containsEnabled}
              disabled={readOnly}
              onCheckedChange={handleContainsToggle}
            />
            <div>
              <Label htmlFor={containsId} className="cursor-pointer">
                {t.arrayContainsLabel}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t.arrayContainsDescription}
              </p>
            </div>
          </div>

          {containsEnabled && (
            <div className="space-y-4 pl-4 border-l-2 border-border/40">
              <div className="flex items-center justify-between mb-4">
                <Label>{t.arrayContainsTypeLabel}</Label>
                <TypeDropdown
                  readOnly={readOnly}
                  value={containsType}
                  onChange={(newType) => {
                    const updated: ObjectJSONSchema = {
                      ...withObjectSchema(containsSchema, (s) => s, {}),
                      type: newType,
                    };
                    setContainsSchema(updated);
                    onChange(buildValidationProps({ contains: updated }));
                  }}
                />
              </div>

              <TypeEditor
                readOnly={readOnly}
                schema={containsSchema}
                validationNode={validationNode?.children?.contains}
                onChange={handleContainsSchemaChange}
                depth={depth + 1}
              />

              {(!readOnly || !!minContains || !!maxContains) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(!readOnly || !!minContains) && (
                    <div className="space-y-2">
                      <Label
                        htmlFor={minContainsId}
                        className={!!containsMinMaxError && "text-destructive"}
                      >
                        {t.arrayMinContainsLabel}
                      </Label>
                      <Input
                        id={minContainsId}
                        type="number"
                        min={0}
                        value={minContains ?? ""}
                        onChange={(e) => {
                          const value = e.target.value
                            ? Number(e.target.value)
                            : undefined;
                          setMinContains(value);
                        }}
                        onBlur={handleValidationChange}
                        placeholder={t.arrayMinContainsPlaceholder}
                        className={cn(
                          "h-8",
                          !!containsMinMaxError && "border-destructive",
                        )}
                      />
                    </div>
                  )}

                  {(!readOnly || !!maxContains) && (
                    <div className="space-y-2">
                      <Label
                        htmlFor={maxContainsId}
                        className={!!containsMinMaxError && "text-destructive"}
                      >
                        {t.arrayMaxContainsLabel}
                      </Label>
                      <Input
                        id={maxContainsId}
                        type="number"
                        min={0}
                        value={maxContains ?? ""}
                        onChange={(e) => {
                          const value = e.target.value
                            ? Number(e.target.value)
                            : undefined;
                          setMaxContains(value);
                        }}
                        onBlur={handleValidationChange}
                        placeholder={t.arrayMaxContainsPlaceholder}
                        className={cn(
                          "h-8",
                          !!containsMinMaxError && "border-destructive",
                        )}
                      />
                    </div>
                  )}

                  {!!containsMinMaxError && (
                    <div className="text-xs text-destructive italic md:col-span-2">
                      {containsMinMaxError}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Array item type editor */}
      <div
        className={cn(
          "space-y-2 pt-4 border-border/40",
          !readOnly ||
            !!minItems ||
            !!maxItems ||
            !!uniqueItems ||
            containsEnabled
            ? "border-t"
            : null,
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <Label>{t.arrayItemTypeLabel}</Label>
          <TypeDropdown
            readOnly={readOnly}
            value={itemType}
            onChange={(newType) => {
              handleItemSchemaChange({
                ...withObjectSchema(itemsSchema, (s) => s, {}),
                type: newType,
              });
            }}
          />
        </div>

        <TypeEditor
          readOnly={readOnly}
          schema={itemsSchema}
          validationNode={validationNode}
          onChange={handleItemSchemaChange}
          depth={depth + 1}
        />
      </div>
    </div>
  );
};

export default ArrayEditor;

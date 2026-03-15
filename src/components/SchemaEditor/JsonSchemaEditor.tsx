import { Maximize2 } from "lucide-react";
import { type FC, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs.tsx";
import { useTranslation } from "../../hooks/use-translation.ts";
import { cn } from "../../lib/utils.ts";
import type { JSONSchema } from "../../types/jsonSchema.ts";
import JsonSchemaVisualizer from "./JsonSchemaVisualizer.tsx";
import SchemaVisualEditor from "./SchemaVisualEditor.tsx";

/** @public */
export interface JsonSchemaEditorProps {
  schema?: JSONSchema;
  readOnly: boolean;
  setSchema?: (schema: JSONSchema) => void;
  className?: string;
  defaultMode?: "visual" | "json";
}

/** @public */
const JsonSchemaEditor: FC<JsonSchemaEditorProps> = ({
  schema = { type: "object" },
  readOnly = false,
  setSchema,
  className,
  defaultMode = "visual",
}) => {
  const handleSchemaChange = (newSchema: JSONSchema) => {
    setSchema(newSchema);
  };

  const t = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const fullscreenClass = isFullscreen
    ? "fixed inset-0 z-50 bg-background"
    : "";

  return (
    <div
      className={cn(
        "json-editor-container w-full",
        fullscreenClass,
        className,
        "jsonjoy",
      )}
    >
      <Tabs defaultValue={defaultMode} className="flex flex-col w-full h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b w-full shrink-0">
          <h3 className="font-medium">{t.schemaEditorTitle}</h3>
          <div className="flex items-center gap-2">
            <TabsList className="grid grid-cols-2 w-[200px]">
              <TabsTrigger value="visual">
                {t.schemaEditorEditModeVisual}
              </TabsTrigger>
              <TabsTrigger value="json">
                {t.schemaEditorEditModeJson}
              </TabsTrigger>
            </TabsList>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-md hover:bg-secondary transition-colors"
              aria-label={t.schemaEditorToggleFullscreen}
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        <TabsContent
          value="visual"
          className={cn(
            "focus:outline-hidden w-full grow min-h-0",
            isFullscreen ? "h-0" : "h-[600px]",
          )}
        >
          <SchemaVisualEditor
            readOnly={readOnly}
            schema={schema}
            onChange={handleSchemaChange}
          />
        </TabsContent>

        <TabsContent
          value="json"
          className={cn(
            "focus:outline-hidden w-full grow min-h-0",
            isFullscreen ? "h-0" : "h-[600px]",
          )}
        >
          <JsonSchemaVisualizer schema={schema} onChange={handleSchemaChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JsonSchemaEditor;

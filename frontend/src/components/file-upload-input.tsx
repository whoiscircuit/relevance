import React, { useRef } from "react";
import { Cloud, CloudUploadIcon, ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";

interface FileWithPreview extends File {
  preview?: string;
}

interface FileUploadInputProps {
  value?: FileWithPreview[];
  onChange?: (files: FileWithPreview[]) => void;
  multiple?: boolean;
  accepts?: string;
  defaultItemIcon?: React.ReactNode;
}

export function FileUploadInput({
  value: controlledValue,
  onChange,
  multiple = false,
  accepts = "*",
  defaultItemIcon = <ImageIcon color="gray" />,
}: FileUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<FileWithPreview[]>(
    [],
  );

  // Use controlled value if provided, otherwise use internal state
  const isControlled = controlledValue !== undefined && onChange !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const updateFiles = (files: FileWithPreview[]) => {
    if (isControlled && onChange) {
      onChange(files);
    } else {
      setInternalValue(files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files) as FileWithPreview[];
    addFiles(multiple ? files : files.slice(0, 1));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as FileWithPreview[];
    addFiles(multiple ? files : files.slice(0, 1));
  };

  const addFiles = (newFiles: FileWithPreview[]) => {
    newFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        file.preview = URL.createObjectURL(file);
      }
    });
    updateFiles(multiple ? [...value, ...newFiles] : newFiles);
  };

  const removeFile = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    updated.forEach((file) => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    updateFiles(updated);
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer",
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
          accept={accepts}
        />

        <div
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 py-8"
        >
          <CloudUploadIcon
            className={cn(
              "w-12 h-12 transition-colors",
              isDragActive ? "text-blue-500" : "text-gray-400",
            )}
          />
          <p className="text-gray-600 text-center">
            Drop your files or select whatever whatever
          </p>
        </div>
        {/* Files List */}
        {value.length > 0 && (
          <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
            {value.map((file, index) => (
              <Card
                key={`${file.name}-${index}`}
                className="shrink-0 w-30 gap-0 bg-white border border-gray-200 rounded-lg overflow-hidden p-0 cursor-default"
              >
                <CardContent className="relative w-full h-30 bg-gray-100 flex items-center justify-center">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : defaultItemIcon ? (
                    <div className="flex items-center justify-center">
                      {defaultItemIcon}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">No preview</span>
                  )}
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 p-1 rounded transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </CardContent>
                <CardFooter className="p-2 text-xs font-medium text-gray-700 truncate text-center">
                  {file.name.substring(0, 18)}
                  {file.name.length > 18 ? "..." : ""}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Camera, Upload, Loader2, Save, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface InventoryItem {
  nombre: string;
  cantidad: number;
}

export function InventoryImageUploadModal({
  trigger,
}: {
  trigger: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"initial" | "loading" | "results" | "error">(
    "initial"
  );
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [isDragError, setIsDragError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URI prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStep("initial");
      setItems([]);
      setSelectedIds(new Set());
      setIsDragging(false);
      setIsDragError(false);
    }
  }, [isOpen]);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor sube un archivo de imagen válido.");
      return;
    }
    setSelectedFile(file);
    startLoadingProcess(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if dragged item is an image
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const item = e.dataTransfer.items[0];
      if (item.kind === 'file' && !item.type.startsWith('image/')) {
        setIsDragError(true);
        setIsDragging(true);
        return;
      }
    }

    setIsDragError(false);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsDragError(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsDragError(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const startLoadingProcess = async (fileToProcess?: File) => {
    const file = fileToProcess || selectedFile;
    if (!file) return;

    setStep("loading");

    try {
      const imageBase64 = await fileToBase64(file);

      const { data, error } = await supabase.functions.invoke(
        "escanear-repuestos",
        {
          body: { imageBase64 },
        }
      );

      if (error) {
        console.error("Error invoking function:", error);
        toast.error("Error al procesar la imagen. Por favor, intenta de nuevo.");
        setStep("error");
        return;
      }

      if (Array.isArray(data)) {
        setItems(data);
        setStep("results");
      } else {
        console.error("Invalid data format from function:", data);
        toast.error("La respuesta del servidor no es válida.");
        setStep("error");
      }
    } catch (base64Error) {
      console.error("Error converting file to Base64:", base64Error);
      toast.error("No se pudo leer el archivo de imagen.");
      setStep("error");
    }
  };

  const toggleSelection = (itemName: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(itemName)) {
      newSelected.delete(itemName);
    } else {
      newSelected.add(itemName);
    }
    setSelectedIds(newSelected);
  };

  const handleSave = () => {
    setIsOpen(false);
    toast.success("Repuestos cargados al inventario correctamente");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={`sm:max-w-md transition-all duration-300 ${
          step === "results" ? "sm:max-w-2xl max-h-[80vh] overflow-y-auto" : ""
        }`}
      >
        <DialogHeader>
          <DialogTitle>Cargar Inventario por Imagen</DialogTitle>
          <DialogDescription>
            {step === "initial" &&
              "Selecciona una imagen o toma una foto para procesar el inventario."}
            {step === "loading" && "Procesando imagen..."}
            {step === "results" &&
              "Verifica los items detectados y selecciona los que deseas guardar."}
            {step === "error" &&
              "Ocurrió un error al procesar la imagen. Puedes intentarlo de nuevo."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-4 min-h-[200px]">
          {step === "initial" && (
            <div className="flex flex-col gap-4 w-full max-w-xs">
              {/* Hidden Inputs */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
              />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                className="hidden"
                onChange={handleFileSelect}
              />

              {isMobile ? (
                 <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      Cargar Imagen
                    </Button>

                    <Button
                      size="lg"
                      variant="secondary"
                      className="w-full"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <Camera className="mr-2 h-5 w-5" />
                      Tomar Foto
                    </Button>
                 </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors w-full",
                    isDragError
                      ? "border-destructive bg-destructive/10"
                      : isDragging
                        ? "border-primary bg-primary/10"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className={cn(
                      "p-4 rounded-full bg-background border",
                      isDragError ? "border-destructive text-destructive" : "border-muted-foreground/20 text-muted-foreground"
                    )}>
                       <Upload className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                       <p className="text-lg font-medium">
                         Arrastra y suelta una imagen aquí
                       </p>
                       <p className="text-sm text-muted-foreground">
                         o haz clic para seleccionar
                       </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPG, WEBP
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground text-center">
                Analizando imagen...
                <br />
                Por favor espere.
              </p>
            </div>
          )}

          {step === "error" && selectedFile && (
            <div className="flex flex-col items-center gap-4 w-full">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Vista previa de la imagen seleccionada"
                className="max-h-48 rounded-md border"
              />
              <p className="text-destructive text-center">
                No se pudo procesar la imagen.
              </p>
              <Button
                onClick={() => startLoadingProcess()}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          )}

          {step === "results" && (
            <div className="w-full space-y-4">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Select</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => {
                      const isSelected = selectedIds.has(item.nombre);
                      return (
                        <TableRow
                          key={`${item.nombre}-${index}`}
                          className={
                            isSelected
                              ? "bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50"
                              : ""
                          }
                          onClick={() => toggleSelection(item.nombre)}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelection(item.nombre)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.nombre}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.cantidad}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSave} className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar ({selectedIds.size})
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

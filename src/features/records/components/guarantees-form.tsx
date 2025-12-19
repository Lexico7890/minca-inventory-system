import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AutocompleteInput from "@/components/AutocompleteInput";
import { useTechnicians } from "../queries";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";

const guaranteesSchema = z.object({
  fecha: z.string(), // We'll use a string for the date input
  orden: z.string().min(1, "El número de orden es requerido"),
  kilometraje: z.string().min(1, "El kilometraje es requerido"),
  id_taller: z.string().min(1, "El taller es requerido"),
  observaciones_cliente: z.string().optional(),
  solicitante: z.string().min(1, "El solicitante es requerido"),
  id_tecnico: z.string().min(1, "El técnico es requerido"),
  observaciones_garantia: z.string().min(1, "La observación de garantía es requerida"),
  // id_repuesto and imagen will be handled separately or via manual validation if needed
});

type GuaranteesFormValues = z.infer<typeof guaranteesSchema>;

export default function GuaranteesForm() {
  const { sessionData } = useUserStore();
  const locations = sessionData?.locations || [];

  // State for AutocompleteInput (Repuesto)
  const [selectedRepuesto, setSelectedRepuesto] = useState<{ id_repuesto: string, referencia: string, nombre: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<GuaranteesFormValues>({
    resolver: zodResolver(guaranteesSchema),
    defaultValues: {
      fecha: new Date().toISOString().split("T")[0],
      orden: "",
      kilometraje: "",
      id_taller: locations.length > 0 ? locations[0].id_localizacion : "",
      observaciones_cliente: "",
      solicitante: "",
      id_tecnico: "",
      observaciones_garantia: "",
    },
  });

  // Watch id_taller to fetch technicians for that location
  const selectedLocationId = form.watch("id_taller");
  const { data: technicians } = useTechnicians(selectedLocationId);

  const onSubmit = (data: GuaranteesFormValues) => {
    if (!selectedRepuesto) {
      toast.error("Debe seleccionar un repuesto");
      return;
    }

    // TODO: Upload image to Supabase bucket 'guarantee-images' (placeholder name)
    // const bucketName = "guarantee-images";

    const payload = {
      ...data,
      id_repuesto: selectedRepuesto.id_repuesto,
      imagen: selectedFile,
    };

    console.log("Formulario Garantías enviado:", payload);
    toast.success("Formulario enviado (simulado)");

    // Reset form
    form.reset();
    setSelectedRepuesto(null);
    setSelectedFile(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Formulario Garantías</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha */}
              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Orden */}
              <FormField
                control={form.control}
                name="orden"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de orden" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kilometraje */}
              <FormField
                control={form.control}
                name="kilometraje"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilometraje</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 15000 o 'Apagada'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Taller */}
              <FormField
                control={form.control}
                name="id_taller"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taller</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un taller" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((loc: any) => (
                          <SelectItem key={loc.id_localizacion} value={loc.id_localizacion}>
                            {loc.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Observaciones Cliente */}
            <FormField
              control={form.control}
              name="observaciones_cliente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones del cliente</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa las observaciones del cliente..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Repuesto (Autocomplete) */}
               <FormItem>
                  <FormLabel>Repuesto</FormLabel>
                  <AutocompleteInput
                    setSelected={setSelectedRepuesto}
                    selected={selectedRepuesto}
                    id_localizacion={selectedLocationId} // Pass selected location to filter parts if needed
                  />
                  {!selectedRepuesto && <p className="text-sm text-muted-foreground">Seleccione un repuesto de la lista</p>}
               </FormItem>

              {/* Solicitante */}
              <FormField
                control={form.control}
                name="solicitante"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Solicitante (Dueño del vehículo)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del solicitante" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Técnico */}
               <FormField
                control={form.control}
                name="id_tecnico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Técnico</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un técnico" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {technicians?.map((tech: any) => (
                          <SelectItem key={tech.id_usuario} value={tech.id_usuario}>
                            {tech.nombre_usuario}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Imagen Upload */}
              <FormItem>
                <FormLabel>Imagen (Evidencia)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                </FormControl>
                {/* TODO: Bucket name for Supabase storage needs to be defined */}
                <p className="text-xs text-muted-foreground">Cargar imagen de la garantía.</p>
              </FormItem>
            </div>

            {/* Observaciones Garantía */}
            <FormField
              control={form.control}
              name="observaciones_garantia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observación de por qué es garantía</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalles técnicos de la garantía..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">Enviar Garantía</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

import { useForm } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select";
import { useEffect, useState } from "react";
import type { Repuesto, RepuestoFormData } from "@/entities/repuestos";

type ActionType = 'solicitar' | null;

interface RepuestosFormProps {
    initialData?: Repuesto;
    onSubmit: (data: RepuestoFormData, selectedAction: ActionType) => void;
    isLoading?: boolean;
    onCancel: () => void;
    readOnly?: boolean;
}

export function RepuestosForm({
    initialData,
    onSubmit,
    isLoading,
    onCancel,
    readOnly = false,
}: RepuestosFormProps) {
    const [selectedAction, setSelectedAction] = useState<ActionType>(null);
    const form = useForm<RepuestoFormData>({
        defaultValues: {
            referencia: "",
            nombre: "",
            descontinuado: false,
            tipo: "General",
            fecha_estimada: null,
            url_imagen: "",
            marca: "MINCA",
            descripcion: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                referencia: initialData.referencia,
                nombre: initialData.nombre,
                descontinuado: initialData.descontinuado,
                tipo: initialData.tipo,
                fecha_estimada: initialData.fecha_estimada,
                url_imagen: initialData.url_imagen || "",
                marca: initialData.marca || "MINCA",
                descripcion: initialData.descripcion || "",
            });
        }
        setSelectedAction(null);
    }, [initialData]);

    const handleFormSubmit = (data: RepuestoFormData) => {
        onSubmit(data, selectedAction);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 p-4">
                <fieldset disabled={readOnly} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="referencia"
                        rules={{ required: "La referencia es obligatoria" }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Referencia</FormLabel>
                                <FormControl>
                                    <Input placeholder="REF-123" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="nombre"
                        rules={{ required: "El nombre es obligatorio" }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nombre del repuesto" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="tipo"
                            rules={{ required: "El tipo es obligatorio" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo</FormLabel>
                                    <Select
                                        key={field.value} // ✅ Agregar key para forzar re-render
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione un tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="General">General</SelectItem>
                                            <SelectItem value="Motor">Motor</SelectItem>
                                            <SelectItem value="Transmision">Transmisión</SelectItem>
                                            <SelectItem value="Frenos">Frenos</SelectItem>
                                            <SelectItem value="Suspension">Suspensión</SelectItem>
                                            <SelectItem value="Electrico">Eléctrico</SelectItem>
                                            <SelectItem value="Carrocería">Carrocería</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="marca"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Marca</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Marca del repuesto" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Descripción del repuesto" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="fecha_estimada"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha Estimada (Opcional)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="url_imagen"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>URL Imagen (Opcional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://..." {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="descontinuado"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Descontinuado
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />

                </fieldset>
                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" type="button" onClick={onCancel}>
                        {readOnly ? "Cerrar" : "Cancelar"}
                    </Button>
                    {!readOnly && (
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    );
}

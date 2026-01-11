import { useLocation } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface CountResult {
  referencia: string;
  nombre: string;
  cantidad_csa: number;
  cantidad_sistema: number;
  diferencia: number;
  existe_en_bd: boolean;
  existe_en_ubicacion: boolean;
}

export function ResultadosConteoPage() {
  const location = useLocation();
  const results: CountResult[] = location.state?.results || [];

  // Filter states
  const [referenciaFilter, setReferenciaFilter] = useState('');
  const [diferenciaFilter, setDiferenciaFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const [existeEnBdFilter, setExisteEnBdFilter] = useState<'all' | 'true' | 'false'>('all');
  const [existeEnUbicacionFilter, setExisteEnUbicacionFilter] = useState<'all' | 'true' | 'false'>('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Apply filters
  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      // Filter by referencia
      if (referenciaFilter && !item.referencia.toLowerCase().includes(referenciaFilter.toLowerCase())) {
        return false;
      }

      // Filter by diferencia
      if (diferenciaFilter === 'positive' && item.diferencia <= 0) {
        return false;
      }
      if (diferenciaFilter === 'negative' && item.diferencia >= 0) {
        return false;
      }

      // Filter by existe_en_bd
      if (existeEnBdFilter === 'true' && !item.existe_en_bd) {
        return false;
      }
      if (existeEnBdFilter === 'false' && item.existe_en_bd) {
        return false;
      }

      // Filter by existe_en_ubicacion
      if (existeEnUbicacionFilter === 'true' && !item.existe_en_ubicacion) {
        return false;
      }
      if (existeEnUbicacionFilter === 'false' && item.existe_en_ubicacion) {
        return false;
      }

      return true;
    });
  }, [results, referenciaFilter, diferenciaFilter, existeEnBdFilter, existeEnUbicacionFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const getRowClass = (result: CountResult) => {
    if (!result.existe_en_bd) {
      return 'bg-red-500/20 hover:bg-red-500/30';
    }
    if (!result.existe_en_ubicacion) {
      return 'bg-orange-500/20 hover:bg-orange-500/30';
    }
    return '';
  };

  return (
    <div className="container mx-auto p-2 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-4xl font-bold">Resultados del Conteo</h1>
        <Popover>
          <PopoverTrigger asChild>
            <button className="focus:outline-none mt-1">
              <HelpCircle className="h-6 w-6 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Leyenda de Colores</h4>
              </div>
              <div className="grid gap-2">
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 mt-1" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-primary">Rojo:</span> El producto no existe en la base de datos.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mt-1" />
                  <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-primary">Naranja:</span> El producto no se encontró en la ubicación esperada.
                  </p>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Referencia</label>
              <Input
                placeholder="Buscar por referencia..."
                value={referenciaFilter}
                onChange={(e) => {
                  setReferenciaFilter(e.target.value);
                  handleFilterChange();
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Diferencia</label>
              <Select
                value={diferenciaFilter}
                onValueChange={(value: 'all' | 'positive' | 'negative') => {
                  setDiferenciaFilter(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="positive">Positiva</SelectItem>
                  <SelectItem value="negative">Negativa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Existe en BD</label>
              <Select
                value={existeEnBdFilter}
                onValueChange={(value: 'all' | 'true' | 'false') => {
                  setExisteEnBdFilter(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Sí</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Existe en Ubicación</label>
              <Select
                value={existeEnUbicacionFilter}
                onValueChange={(value: 'all' | 'true' | 'false') => {
                  setExisteEnUbicacionFilter(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Sí</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Conteo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cant. Contada</TableHead>
                  <TableHead>Cant. Sistema</TableHead>
                  <TableHead>Diferencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedResults.length > 0 ? (
                  paginatedResults.map((item) => (
                    <TableRow key={item.referencia} className={getRowClass(item)}>
                      <TableCell>{item.referencia}</TableCell>
                      <TableCell>{item.nombre}</TableCell>
                      <TableCell>{item.cantidad_csa}</TableCell>
                      <TableCell>{item.cantidad_sistema}</TableCell>
                      <TableCell>{item.diferencia}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No hay resultados para mostrar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {filteredResults.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredResults.length)} de {filteredResults.length} resultados
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="text-sm">
                  Página {currentPage} de {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useBeers, useCreateBeer, useUpdateBeer, useDeleteBeer, type Beer } from "@/hooks/useBeers";
import { getFilters, addFilterOption, updateFilterOption, deleteFilterOption, type FilterOption, type Filters } from "@/lib/filterStorage";
import { uploadBeerImage, replaceBeerImage } from "@/lib/uploadImage";
import { toast } from "sonner";
import { Trash2, Edit, Plus, LogOut, Beer as BeerIcon, Filter, Loader2, Upload, X, MessageSquare, TrendingUp } from "lucide-react";
import { ReviewsManagement } from "@/components/ReviewsManagement";
import { AIStatsChart } from "@/components/AIStatsChart";

const DASHBOARD_PASSWORD = "CDERF";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { data: beers = [], isLoading: beersLoading } = useBeers();
  const createBeerMutation = useCreateBeer();
  const updateBeerMutation = useUpdateBeer();
  const deleteBeerMutation = useDeleteBeer();
  const [editingBeer, setEditingBeer] = useState<Beer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [filters, setFilters] = useState<Filters | null>(null);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<{ category: string; option: FilterOption } | null>(null);
  const [filterFormData, setFilterFormData] = useState({
    category: "style" as keyof Filters,
    id: "",
    label: "",
    icon: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    brewery: "",
    style: "",
    abv: "",
    ibu: "",
    color: "",
    flavor: [] as string[],
    description: "",
    image: "",
    origin: "",
    status: "disponible" as "disponible" | "agotado",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("dashboard_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    // Cargar filtros al montar el componente
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const loadedFilters = await getFilters();
      setFilters(loadedFilters);
    } catch (error) {
      console.error('Error cargando filtros:', error);
      toast.error('Error cargando filtros');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DASHBOARD_PASSWORD) {
      sessionStorage.setItem("dashboard_auth", "true");
      setIsAuthenticated(true);
      toast.success("Acceso concedido");
    } else {
      toast.error("Contraseña incorrecta");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("dashboard_auth");
    setIsAuthenticated(false);
    navigate("/");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      brewery: "",
      style: "",
      abv: "",
      ibu: "",
      color: "",
      flavor: [],
      description: "",
      image: "",
      origin: "",
      status: "disponible",
    });
    setEditingBeer(null);
    setImageFile(null);
    setImagePreview("");
  };

  const handleEdit = (beer: Beer) => {
    setEditingBeer(beer);
    setFormData({
      name: beer.name,
      brewery: beer.brewery,
      style: beer.style,
      abv: beer.abv.toString(),
      ibu: beer.ibu?.toString() || "0",
      color: beer.color,
      flavor: Array.isArray(beer.flavor) ? beer.flavor : [beer.flavor],
      description: beer.description,
      image: beer.image || "",
      origin: beer.origin || "",
      status: beer.status || "disponible",
    });
    setImagePreview(beer.image || "");
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Limpiar URL si hay archivo
      setFormData({ ...formData, image: "" });
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ ...formData, image: "" });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta cerveza?")) {
      deleteBeerMutation.mutate(id);
    }
  };

  const handleToggleStatus = (beer: Beer) => {
    const newStatus = beer.status === 'disponible' ? 'agotado' : 'disponible';
    updateBeerMutation.mutate(
      { id: beer.id, updates: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success(`Cerveza marcada como ${newStatus}`);
        }
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que haya al menos un sabor seleccionado
    if (formData.flavor.length === 0) {
      toast.error("Debes seleccionar al menos un sabor");
      return;
    }
    
    try {
      setIsUploadingImage(true);
      let imageUrl = formData.image || null;

      // Si hay un archivo de imagen, subirlo primero
      if (imageFile) {
        if (editingBeer && editingBeer.image) {
          // Reemplazar imagen existente
          imageUrl = await replaceBeerImage(imageFile, editingBeer.image, editingBeer.id);
        } else {
          // Subir nueva imagen
          imageUrl = await uploadBeerImage(imageFile);
        }
      }

      const beerData = {
        name: formData.name,
        brewery: formData.brewery,
        style: formData.style,
        abv: parseFloat(formData.abv),
        ibu: parseInt(formData.ibu),
        color: formData.color,
        flavor: formData.flavor,
        description: formData.description,
        image: imageUrl,
        origin: formData.origin || null,
        status: formData.status,
      };

      if (editingBeer) {
        updateBeerMutation.mutate(
          { id: editingBeer.id, updates: beerData },
          {
            onSuccess: () => {
              setIsDialogOpen(false);
              resetForm();
            }
          }
        );
      } else {
        createBeerMutation.mutate(beerData, {
          onSuccess: () => {
            setIsDialogOpen(false);
            resetForm();
          }
        });
      }
    } catch (error) {
      console.error("Error al procesar imagen:", error);
      toast.error(error instanceof Error ? error.message : "Error al subir imagen");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const resetFilterForm = () => {
    setFilterFormData({
      category: "style",
      id: "",
      label: "",
      icon: "",
    });
    setEditingFilter(null);
  };

  const handleFilterEdit = (category: string, option: FilterOption) => {
    setEditingFilter({ category, option });
    setFilterFormData({
      category: category as keyof Filters,
      id: option.id,
      label: option.label,
      icon: option.icon,
    });
    setIsFilterDialogOpen(true);
  };

  const handleFilterDelete = async (category: keyof Filters, optionId: string) => {
    if (window.confirm("¿Estás seguro de eliminar este filtro?")) {
      try {
        await deleteFilterOption(category, optionId);
        // Recargar filtros y forzar actualización del estado
        const updatedFilters = await getFilters();
        setFilters(updatedFilters);
        toast.success("Filtro eliminado");
      } catch (error) {
        console.error('Error eliminando filtro:', error);
        toast.error('Error eliminando filtro');
      }
    }
  };

  const handleFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingFilter) {
        // Solo enviamos label e icon para actualizar
        await updateFilterOption(filterFormData.category, editingFilter.option.id, {
          label: filterFormData.label,
          icon: filterFormData.icon,
        });
        toast.success("Filtro actualizado");
      } else {
        // Para crear, enviamos el objeto completo
        const filterOption: FilterOption = {
          id: filterFormData.id,
          label: filterFormData.label,
          icon: filterFormData.icon,
        };
        await addFilterOption(filterFormData.category, filterOption);
        toast.success("Filtro añadido");
      }

      // Recargar filtros y forzar actualización del estado
      const updatedFilters = await getFilters();
      setFilters(updatedFilters);
      setIsFilterDialogOpen(false);
      resetFilterForm();
    } catch (error) {
      console.error('Error guardando filtro:', error);
      toast.error('Error guardando filtro');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-beer)] mb-4">
              <BeerIcon className="text-primary-foreground" size={32} />
            </div>
            <h1 className="text-2xl font-bold">Dashboard de Administración</h1>
            <p className="text-muted-foreground mt-2">Ingresa la contraseña para acceder</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full">
              Acceder
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/")}
            >
              Volver al inicio
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Administración</h1>
            <p className="text-muted-foreground mt-1">{beers.length} cervezas • {filters ? Object.values(filters).reduce((acc, cat) => acc + cat.options.length, 0) : 0} filtros</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2" size={16} />
            Salir
          </Button>
        </div>

        <Tabs defaultValue="beers" className="w-full">
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4 mb-8">
            <TabsTrigger value="beers">
              <BeerIcon className="mr-2 h-4 w-4" />
              Cervezas
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <MessageSquare className="mr-2 h-4 w-4" />
              Reseñas
            </TabsTrigger>
            <TabsTrigger value="filters">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </TabsTrigger>
            <TabsTrigger value="stats">
              <TrendingUp className="mr-2 h-4 w-4" />
              Estadísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="beers">
            <div className="flex justify-end mb-6">
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-accent">
                    <Plus className="mr-2" size={16} />
                    Nueva Cerveza
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingBeer ? "Editar Cerveza" : "Nueva Cerveza"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="brewery">Cervecería *</Label>
                      <Input
                        id="brewery"
                        value={formData.brewery}
                        onChange={(e) => setFormData({...formData, brewery: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="style">Estilo *</Label>
                      <Select
                        value={formData.style}
                        onValueChange={(value) => setFormData({...formData, style: value})}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          {filters?.style?.options?.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.icon} {option.label}
                            </SelectItem>
                          )) || <SelectItem value="" disabled>Cargando...</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="color">Color *</Label>
                      <Select
                        value={formData.color}
                        onValueChange={(value) => setFormData({...formData, color: value})}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un color" />
                        </SelectTrigger>
                        <SelectContent>
                          {filters?.color?.options?.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.icon} {option.label}
                            </SelectItem>
                          )) || <SelectItem value="" disabled>Cargando...</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="abv">ABV (%) *</Label>
                      <Input
                        id="abv"
                        type="number"
                        step="0.1"
                        value={formData.abv}
                        onChange={(e) => setFormData({...formData, abv: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ibu">IBU *</Label>
                      <Input
                        id="ibu"
                        type="number"
                        value={formData.ibu}
                        onChange={(e) => setFormData({...formData, ibu: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="mb-3 block">Sabores * (selecciona uno o varios)</Label>
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 border rounded-md">
                      {filters?.flavor?.options?.length > 0 ? (
                        filters?.flavor?.options?.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`flavor-${option.id}`}
                              checked={formData.flavor.includes(option.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    flavor: [...formData.flavor, option.id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    flavor: formData.flavor.filter(f => f !== option.id)
                                  });
                                }
                              }}
                            />
                            <label
                              htmlFor={`flavor-${option.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {option.icon} {option.label}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="col-span-2 text-sm text-muted-foreground text-center py-4">
                          Cargando sabores...
                        </p>
                      )}
                    </div>
                    {formData.flavor.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Debes seleccionar al menos un sabor
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="image-file" className="mb-2 block">
                        Subir Imagen
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="image-file"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={handleImageFileChange}
                          disabled={!!formData.image}
                          className="flex-1"
                        />
                        {imageFile && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleRemoveImage}
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, WEBP o GIF (máx. 10MB). Las imágenes se optimizan automáticamente.
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          O
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="image">URL de Imagen</Label>
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => {
                          setFormData({...formData, image: e.target.value});
                          if (e.target.value) {
                            setImagePreview(e.target.value);
                            setImageFile(null);
                          }
                        }}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        disabled={!!imageFile}
                      />
                    </div>

                    {imagePreview && (
                      <div className="relative w-full h-64 bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden border-2 border-primary/20">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={() => {
                            setImagePreview("");
                            toast.error("Error al cargar la imagen");
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 shadow-lg"
                            onClick={handleRemoveImage}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="origin">Origen</Label>
                      <Select
                        value={formData.origin}
                        onValueChange={(value) => setFormData({...formData, origin: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el país de origen" />
                        </SelectTrigger>
                        <SelectContent>
                          {filters?.origin?.options?.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.icon} {option.label}
                            </SelectItem>
                          )) || (
                            <SelectItem value="" disabled>No hay opciones disponibles</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Estado *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({...formData, status: value as "disponible" | "agotado"})}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disponible">✅ Disponible</SelectItem>
                          <SelectItem value="agotado">❌ Agotado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createBeerMutation.isPending || updateBeerMutation.isPending || isUploadingImage}
                    >
                      {(createBeerMutation.isPending || updateBeerMutation.isPending || isUploadingImage) ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" size={16} />
                          {isUploadingImage ? "Subiendo imagen..." : editingBeer ? "Actualizando..." : "Creando..."}
                        </>
                      ) : (
                        <>
                          {imageFile && <Upload className="mr-2" size={16} />}
                          {editingBeer ? "Actualizar" : "Crear"}
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            </div>

            {beersLoading ? (
              <div className="text-center py-16">
                <Loader2 className="animate-spin mx-auto text-primary mb-4" size={48} />
                <p className="text-muted-foreground">Cargando cervezas...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {beers.map((beer) => (
                  <Card key={beer.id} className="overflow-hidden group">
                    <OptimizedImage
                      src={beer.image}
                      alt={beer.name}
                      containerClassName="beer-image-container h-48 img-container-gradient"
                      className="beer-image beer-image-transition group-hover:scale-105"
                      loading="lazy"
                      objectFit="contain"
                    />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-lg line-clamp-1 flex-1">{beer.name}</h3>
                        <Badge 
                          variant={beer.status === 'disponible' ? 'default' : 'destructive'}
                          className="flex-shrink-0"
                        >
                          {beer.status === 'disponible' ? '✅ Disponible' : '❌ Agotado'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{beer.brewery}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                        <span>{beer.style}</span>
                        <span>•</span>
                        <span>{beer.abv}% ABV</span>
                        <span>•</span>
                        <span>{beer.ibu} IBU</span>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <Button 
                          size="sm" 
                          variant={beer.status === 'disponible' ? 'outline' : 'default'}
                          onClick={() => handleToggleStatus(beer)}
                          className="flex-1"
                          disabled={updateBeerMutation.isPending}
                        >
                          {beer.status === 'disponible' ? '❌ Marcar Agotado' : '✅ Marcar Disponible'}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(beer)}
                          className="flex-1"
                          disabled={deleteBeerMutation.isPending || updateBeerMutation.isPending}
                        >
                          <Edit size={14} className="mr-1" />
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDelete(beer.id)}
                          className="flex-1"
                          disabled={deleteBeerMutation.isPending || updateBeerMutation.isPending}
                        >
                          {deleteBeerMutation.isPending ? (
                            <Loader2 size={14} className="mr-1 animate-spin" />
                          ) : (
                            <Trash2 size={14} className="mr-1" />
                          )}
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsManagement />
          </TabsContent>

          <TabsContent value="filters">
            <div className="flex justify-end mb-6">
              <Dialog open={isFilterDialogOpen} onOpenChange={(open) => {
                setIsFilterDialogOpen(open);
                if (!open) resetFilterForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-accent">
                    <Plus className="mr-2" size={16} />
                    Nuevo Filtro
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingFilter ? "Editar Filtro" : "Nuevo Filtro"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleFilterSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="filter-category">Categoría *</Label>
                      <Select
                        value={filterFormData.category}
                        onValueChange={(value) => setFilterFormData({ ...filterFormData, category: value as keyof Filters })}
                        disabled={!!editingFilter}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="style">Estilo</SelectItem>
                          <SelectItem value="color">Color</SelectItem>
                          <SelectItem value="flavor">Sabor</SelectItem>
                          <SelectItem value="strength">Intensidad</SelectItem>
                          <SelectItem value="bitterness">Amargor</SelectItem>
                          <SelectItem value="origin">Origen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="filter-id">ID *</Label>
                      <Input
                        id="filter-id"
                        value={filterFormData.id}
                        onChange={(e) => setFilterFormData({ ...filterFormData, id: e.target.value })}
                        placeholder="ej: IPA, Rubia, Cítrico"
                        required
                        disabled={!!editingFilter}
                      />
                    </div>

                    <div>
                      <Label htmlFor="filter-label">Etiqueta *</Label>
                      <Input
                        id="filter-label"
                        value={filterFormData.label}
                        onChange={(e) => setFilterFormData({ ...filterFormData, label: e.target.value })}
                        placeholder="Nombre visible"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="filter-icon">Emoji/Icono *</Label>
                      <Input
                        id="filter-icon"
                        value={filterFormData.icon}
                        onChange={(e) => setFilterFormData({ ...filterFormData, icon: e.target.value })}
                        placeholder="🍺"
                        required
                        maxLength={2}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingFilter ? "Actualizar" : "Crear"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsFilterDialogOpen(false);
                          resetFilterForm();
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-6">
              {filters ? Object.entries(filters).map(([category, data]) => (
                <Card key={category} className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Filter size={20} className="text-primary" />
                    {data.title}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({data.options.length})
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{option.icon}</span>
                          <div>
                            <p className="font-medium">{option.label}</p>
                            <p className="text-xs text-muted-foreground">{option.id}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFilterEdit(category, option)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleFilterDelete(category as keyof Filters, option.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )) : (
                <Card className="p-6">
                  <div className="text-center py-8">
                    <Loader2 className="animate-spin mx-auto mb-4" size={32} />
                    <p className="text-muted-foreground">Cargando filtros...</p>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <AIStatsChart />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

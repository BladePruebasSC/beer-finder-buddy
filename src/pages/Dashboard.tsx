import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getBeersList, addBeer, updateBeer, deleteBeer, type Beer } from "@/lib/beerStorage";
import { getFilters, addFilterOption, updateFilterOption, deleteFilterOption, type FilterOption } from "@/lib/filterStorage";
import { toast } from "sonner";
import { Trash2, Edit, Plus, LogOut, Beer as BeerIcon, Filter } from "lucide-react";

const DASHBOARD_PASSWORD = "CDERF";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [beers, setBeers] = useState<Beer[]>([]);
  const [editingBeer, setEditingBeer] = useState<Beer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [filters, setFilters] = useState(getFilters());
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<{ category: string; option: FilterOption } | null>(null);
  const [filterFormData, setFilterFormData] = useState({
    category: "style" as keyof typeof filters,
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
    flavor: "",
    description: "",
    image: "",
    origin: "",
  });

  useEffect(() => {
    const auth = sessionStorage.getItem("dashboard_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      loadBeers();
    }
  }, []);

  const loadBeers = () => {
    setBeers(getBeersList());
  };

  const loadFilters = () => {
    setFilters(getFilters());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DASHBOARD_PASSWORD) {
      sessionStorage.setItem("dashboard_auth", "true");
      setIsAuthenticated(true);
      loadBeers();
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
      flavor: "",
      description: "",
      image: "",
      origin: "",
    });
    setEditingBeer(null);
  };

  const handleEdit = (beer: Beer) => {
    setEditingBeer(beer);
    setFormData({
      name: beer.name,
      brewery: beer.brewery,
      style: beer.style,
      abv: beer.abv.toString(),
      ibu: beer.ibu.toString(),
      color: beer.color,
      flavor: beer.flavor.join(", "),
      description: beer.description,
      image: beer.image || "",
      origin: beer.origin || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta cerveza?")) {
      deleteBeer(id);
      loadBeers();
      toast.success("Cerveza eliminada");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const beerData = {
      name: formData.name,
      brewery: formData.brewery,
      style: formData.style,
      abv: parseFloat(formData.abv),
      ibu: parseInt(formData.ibu),
      color: formData.color,
      flavor: formData.flavor.split(",").map(f => f.trim()).filter(f => f),
      description: formData.description,
      image: formData.image || undefined,
      origin: formData.origin || undefined,
    };

    if (editingBeer) {
      updateBeer(editingBeer.id, beerData);
      toast.success("Cerveza actualizada");
    } else {
      addBeer(beerData);
      toast.success("Cerveza añadida");
    }

    loadBeers();
    setIsDialogOpen(false);
    resetForm();
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
      category: category as keyof typeof filters,
      id: option.id,
      label: option.label,
      icon: option.icon,
    });
    setIsFilterDialogOpen(true);
  };

  const handleFilterDelete = (category: keyof typeof filters, optionId: string) => {
    if (window.confirm("¿Estás seguro de eliminar este filtro?")) {
      deleteFilterOption(category, optionId);
      loadFilters();
      toast.success("Filtro eliminado");
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filterOption: FilterOption = {
      id: filterFormData.id,
      label: filterFormData.label,
      icon: filterFormData.icon,
    };

    if (editingFilter) {
      updateFilterOption(filterFormData.category, editingFilter.option.id, filterOption);
      toast.success("Filtro actualizado");
    } else {
      addFilterOption(filterFormData.category, filterOption);
      toast.success("Filtro añadido");
    }

    loadFilters();
    setIsFilterDialogOpen(false);
    resetFilterForm();
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
            <p className="text-muted-foreground mt-1">{beers.length} cervezas • {Object.values(filters).reduce((acc, cat) => acc + cat.options.length, 0)} filtros</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2" size={16} />
            Salir
          </Button>
        </div>

        <Tabs defaultValue="beers" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="beers">Cervezas</TabsTrigger>
            <TabsTrigger value="filters">Filtros</TabsTrigger>
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
                      <Input
                        id="style"
                        value={formData.style}
                        onChange={(e) => setFormData({...formData, style: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="color">Color *</Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        required
                      />
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
                    <Label htmlFor="flavor">Sabores (separados por comas) *</Label>
                    <Input
                      id="flavor"
                      value={formData.flavor}
                      onChange={(e) => setFormData({...formData, flavor: e.target.value})}
                      placeholder="Cítrico, Tropical, Amargo"
                      required
                    />
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

                  <div>
                    <Label htmlFor="image">URL de Imagen</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="origin">Origen</Label>
                    <Input
                      id="origin"
                      value={formData.origin}
                      onChange={(e) => setFormData({...formData, origin: e.target.value})}
                      placeholder="País o región"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingBeer ? "Actualizar" : "Crear"}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {beers.map((beer) => (
            <Card key={beer.id} className="p-4">
              {beer.image && (
                <div className="w-full h-32 bg-muted rounded-md mb-3 overflow-hidden">
                  <img src={beer.image} alt={beer.name} className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="font-bold text-lg mb-1">{beer.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{beer.brewery}</p>
              <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                <span>{beer.style}</span>
                <span>•</span>
                <span>{beer.abv}% ABV</span>
                <span>•</span>
                <span>{beer.ibu} IBU</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleEdit(beer)}
                  className="flex-1"
                >
                  <Edit size={14} className="mr-1" />
                  Editar
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleDelete(beer.id)}
                  className="flex-1"
                >
                  <Trash2 size={14} className="mr-1" />
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
            </div>
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
                        onValueChange={(value) => setFilterFormData({ ...filterFormData, category: value as keyof typeof filters })}
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
              {Object.entries(filters).map(([category, data]) => (
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
                            onClick={() => handleFilterDelete(category as keyof typeof filters, option.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

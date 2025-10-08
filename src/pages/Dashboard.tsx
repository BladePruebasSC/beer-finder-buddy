import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getBeersList, addBeer, updateBeer, deleteBeer, type Beer } from "@/lib/beerStorage";
import { toast } from "sonner";
import { Trash2, Edit, Plus, LogOut, Beer as BeerIcon } from "lucide-react";

const DASHBOARD_PASSWORD = "CDERF";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [beers, setBeers] = useState<Beer[]>([]);
  const [editingBeer, setEditingBeer] = useState<Beer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
            <h1 className="text-3xl font-bold">Dashboard de Cervezas</h1>
            <p className="text-muted-foreground mt-1">{beers.length} cervezas en total</p>
          </div>
          <div className="flex gap-2">
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
            
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2" size={16} />
              Salir
            </Button>
          </div>
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
      </div>
    </div>
  );
};

export default Dashboard;

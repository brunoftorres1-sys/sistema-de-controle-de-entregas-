import { useState, useMemo, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Package, MapPin, Users, BarChart3, Settings,
  Bell, Search, ChevronDown, ChevronRight, LogOut, Plus, Eye, Edit2,
  CheckCircle, Clock, Truck, AlertTriangle, Ban, Download,
  Phone, Mail, MapPinned, FileText, TrendingUp, TrendingDown, ArrowUpRight,
  Star, Hash, Building2, Navigation, RefreshCw,
  ChevronLeft, MoreHorizontal, Shield, Car, X, AlertCircle,
  Check, Loader2, Package2, Activity, Zap, Filter, SortAsc,
  Calendar, ClipboardList, UserCheck, Globe
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type Page = "login" | "dashboard" | "orders" | "order-detail" | "tracking" | "drivers" | "clients" | "reports" | "new-order" | "new-driver" | "new-client" | "settings";
type OrderStatus = "received" | "separating" | "in-transit" | "out-for-delivery" | "delivered" | "delayed" | "cancelled";
type ToastType = "success" | "error" | "info" | "warning";

interface Toast { id: number; type: ToastType; title: string; message?: string; }
interface Order {
  id: string; client: string; destination: string; city: string; state: string;
  cep: string; product: string; qty: number; weight: string; dueDate: string;
  driver: string; carrier: string; status: OrderStatus; createdAt: string; notes: string;
}
interface Driver {
  id: string; name: string; cpf: string; phone: string; cnh: string;
  vehicle: string; plate: string; carrier: string; status: "active" | "inactive" | "on-route";
  deliveries: number; rating: number; onTime: number;
}
interface Client {
  id: string; name: string; company: string; cnpj: string; phone: string;
  email: string; city: string; state: string; address: string; orders: number; volume: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ORDERS: Order[] = [
  { id: "PED-2024-001", client: "Supermercados BomPreço", destination: "Av. Paulista, 1578", city: "São Paulo", state: "SP", cep: "01310-200", product: "Alimentos não perecíveis", qty: 200, weight: "850 kg", dueDate: "28/06/2024", driver: "Carlos Mendes", carrier: "LogFast Transportes", status: "in-transit", createdAt: "25/06/2024", notes: "Entregar na doca B" },
  { id: "PED-2024-002", client: "Farmácias Saúde+", destination: "Rua Augusta, 300", city: "Campinas", state: "SP", cep: "13010-110", product: "Medicamentos", qty: 50, weight: "120 kg", dueDate: "27/06/2024", driver: "Roberto Silva", carrier: "SpeedLog", status: "delayed", createdAt: "24/06/2024", notes: "Carga refrigerada" },
  { id: "PED-2024-003", client: "Construtora Horizonte", destination: "Rodovia BR-116, km 45", city: "Curitiba", state: "PR", cep: "80000-000", product: "Materiais de construção", qty: 500, weight: "2.400 kg", dueDate: "30/06/2024", driver: "Marcos Oliveira", carrier: "CargoBrasil", status: "out-for-delivery", createdAt: "25/06/2024", notes: "" },
  { id: "PED-2024-004", client: "Loja TechStore", destination: "Shopping Iguatemi, L3", city: "Porto Alegre", state: "RS", cep: "90160-092", product: "Eletrônicos", qty: 30, weight: "95 kg", dueDate: "26/06/2024", driver: "Ana Paula Costa", carrier: "PrimeLog", status: "delivered", createdAt: "23/06/2024", notes: "Produto frágil" },
  { id: "PED-2024-005", client: "Restaurante Sabor Gourmet", destination: "Rua das Flores, 88", city: "Belo Horizonte", state: "MG", cep: "30120-030", product: "Insumos alimentícios", qty: 80, weight: "310 kg", dueDate: "29/06/2024", driver: "José Ferreira", carrier: "LogFast Transportes", status: "separating", createdAt: "25/06/2024", notes: "" },
  { id: "PED-2024-006", client: "Indústria MetalMax", destination: "Distrito Industrial, Q2", city: "São Bernardo do Campo", state: "SP", cep: "09790-500", product: "Peças industriais", qty: 120, weight: "1.800 kg", dueDate: "28/06/2024", driver: "Carlos Mendes", carrier: "LogFast Transportes", status: "received", createdAt: "26/06/2024", notes: "Verificar integridade da embalagem" },
  { id: "PED-2024-007", client: "Hospital Regional Norte", destination: "Av. Saúde, 500", city: "Fortaleza", state: "CE", cep: "60055-050", product: "Equipamentos médicos", qty: 15, weight: "280 kg", dueDate: "25/06/2024", driver: "Roberto Silva", carrier: "SpeedLog", status: "cancelled", createdAt: "22/06/2024", notes: "Cancelado pelo cliente" },
  { id: "PED-2024-008", client: "Livraria Cultura", destination: "Rua Direita, 455", city: "Ribeirão Preto", state: "SP", cep: "14010-050", product: "Livros e papelaria", qty: 300, weight: "420 kg", dueDate: "30/06/2024", driver: "Marcos Oliveira", carrier: "CargoBrasil", status: "in-transit", createdAt: "25/06/2024", notes: "" },
];

const DRIVERS: Driver[] = [
  { id: "MOT-001", name: "Carlos Mendes", cpf: "123.456.789-00", phone: "(11) 99876-5432", cnh: "12345678901", vehicle: "VW Constellation", plate: "ABC-1D23", carrier: "LogFast Transportes", status: "on-route", deliveries: 342, rating: 4.8, onTime: 97 },
  { id: "MOT-002", name: "Roberto Silva", cpf: "987.654.321-00", phone: "(11) 98765-4321", cnh: "98765432109", vehicle: "Mercedes Atego", plate: "DEF-4E56", carrier: "SpeedLog", status: "active", deliveries: 218, rating: 4.5, onTime: 91 },
  { id: "MOT-003", name: "Marcos Oliveira", cpf: "456.789.123-00", phone: "(41) 97654-3210", cnh: "45678912301", vehicle: "Iveco Daily", plate: "GHI-7F89", carrier: "CargoBrasil", status: "on-route", deliveries: 289, rating: 4.7, onTime: 94 },
  { id: "MOT-004", name: "Ana Paula Costa", cpf: "321.654.987-00", phone: "(51) 96543-2109", cnh: "32165498700", vehicle: "Fiat Ducato", plate: "JKL-0G12", carrier: "PrimeLog", status: "active", deliveries: 175, rating: 4.9, onTime: 98 },
  { id: "MOT-005", name: "José Ferreira", cpf: "654.321.987-00", phone: "(31) 95432-1098", cnh: "65432198700", vehicle: "Renault Master", plate: "MNO-3H45", carrier: "LogFast Transportes", status: "inactive", deliveries: 94, rating: 4.2, onTime: 83 },
];

const CLIENTS: Client[] = [
  { id: "CLI-001", name: "Eduardo Bastos", company: "Supermercados BomPreço", cnpj: "12.345.678/0001-00", phone: "(11) 3456-7890", email: "eduardo@bompreco.com.br", city: "São Paulo", state: "SP", address: "Av. Paulista, 1578", orders: 48, volume: "R$ 284.600" },
  { id: "CLI-002", name: "Fernanda Lima", company: "Farmácias Saúde+", cnpj: "98.765.432/0001-00", phone: "(19) 3876-5432", email: "fernanda@saudemais.com.br", city: "Campinas", state: "SP", address: "Rua Augusta, 300", orders: 32, volume: "R$ 96.400" },
  { id: "CLI-003", name: "Ricardo Nunes", company: "Construtora Horizonte", cnpj: "45.678.912/0001-00", phone: "(41) 3765-4321", email: "ricardo@horizonte.com.br", city: "Curitiba", state: "PR", address: "Rodovia BR-116, km 45", orders: 17, volume: "R$ 512.000" },
  { id: "CLI-004", name: "Patrícia Torres", company: "Loja TechStore", cnpj: "32.165.498/0001-00", phone: "(51) 3654-3210", email: "patricia@techstore.com.br", city: "Porto Alegre", state: "RS", address: "Shopping Iguatemi, L3", orders: 24, volume: "R$ 138.200" },
  { id: "CLI-005", name: "Bruno Almeida", company: "Restaurante Sabor Gourmet", cnpj: "65.432.198/0001-00", phone: "(31) 3543-2109", email: "bruno@saborgourmet.com.br", city: "Belo Horizonte", state: "MG", address: "Rua das Flores, 88", orders: 61, volume: "R$ 74.500" },
];

const MONTHLY_DATA = [
  { month: "Jan", delivered: 145, delayed: 12, target: 160 },
  { month: "Fev", delivered: 168, delayed: 8, target: 165 },
  { month: "Mar", delivered: 192, delayed: 15, target: 180 },
  { month: "Abr", delivered: 221, delayed: 10, target: 200 },
  { month: "Mai", delivered: 248, delayed: 18, target: 230 },
  { month: "Jun", delivered: 189, delayed: 14, target: 220 },
];

const PIE_DATA = [
  { name: "Entregues", value: 68, color: "#0e9f6e" },
  { name: "Em Transporte", value: 18, color: "#1a56db" },
  { name: "Atrasados", value: 9, color: "#e02424" },
  { name: "Outros", value: 5, color: "#e3a008" },
];

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_MAP: Record<OrderStatus, { label: string; color: string; bg: string; border: string }> = {
  received:            { label: "Recebido",         color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
  separating:          { label: "Em Separação",     color: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe" },
  "in-transit":        { label: "Em Transporte",    color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" },
  "out-for-delivery":  { label: "Saiu p/ Entrega",  color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  delivered:           { label: "Entregue",         color: "#065f46", bg: "#ecfdf5", border: "#a7f3d0" },
  delayed:             { label: "Atrasado",         color: "#991b1b", bg: "#fef2f2", border: "#fecaca" },
  cancelled:           { label: "Cancelado",        color: "#374151", bg: "#f9fafb", border: "#e5e7eb" },
};

const DRIVER_STATUS_MAP: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  active:     { label: "Disponível", color: "#065f46", bg: "#ecfdf5", dot: "#0e9f6e" },
  "on-route": { label: "Em Rota",    color: "#0369a1", bg: "#f0f9ff", dot: "#0284c7" },
  inactive:   { label: "Inativo",    color: "#374151", bg: "#f9fafb", dot: "#9ca3af" },
};

// ─── Primitive Components ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS_MAP[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-md text-xs font-semibold border"
      style={{ color: s.color, backgroundColor: s.bg, borderColor: s.border }}
    >
      {s.label}
    </span>
  );
}

function Avatar({ name, size = "md", color = "#1a56db" }: { name: string; size?: "sm" | "md" | "lg"; color?: string }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const sz = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-base" }[size];
  return (
    <div className={`${sz} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`} style={{ backgroundColor: color }}>
      {initials}
    </div>
  );
}

function Btn({
  children, variant = "primary", size = "md", onClick, disabled, loading, icon: Icon, className = ""
}: {
  children?: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md"; onClick?: () => void; disabled?: boolean; loading?: boolean;
  icon?: any; className?: string;
}) {
  const base = "inline-flex items-center gap-2 font-semibold rounded-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-white text-foreground border border-border hover:bg-muted shadow-sm",
    ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
    danger: "text-red-600 border border-red-200 bg-red-50 hover:bg-red-100",
    success: "text-white shadow-sm",
  };
  return (
    <button
      onClick={onClick} disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${variant === "success" ? "bg-emerald-600 hover:bg-emerald-700" : ""} ${className}`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : Icon ? <Icon size={size === "sm" ? 13 : 15} /> : null}
      {children}
    </button>
  );
}

function FormField({
  label, placeholder, type = "text", required, span, hint, error
}: {
  label: string; placeholder?: string; type?: string; required?: boolean;
  span?: number; hint?: string; error?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const hasError = error || (required && !value && focused);
  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <label className="flex items-center gap-1 text-xs font-semibold text-foreground mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(true)}
        className={`w-full rounded-lg px-3 py-2.5 text-sm bg-card text-foreground outline-none border transition-all placeholder:text-muted-foreground/60 ${
          hasError ? "border-red-400 ring-2 ring-red-100" : "border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        }`}
      />
      {hint && !hasError && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      {hasError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} /> {error || "Campo obrigatório"}</p>}
    </div>
  );
}

function SelectField({ label, options, required }: { label: string; options: string[]; required?: boolean }) {
  return (
    <div>
      <label className="flex items-center gap-1 text-xs font-semibold text-foreground mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-card text-foreground outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none cursor-pointer">
        <option value="">Selecione...</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── Toast System ─────────────────────────────────────────────────────────────

function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  const icons = { success: CheckCircle, error: AlertCircle, info: Zap, warning: AlertTriangle };
  const colors = {
    success: { bg: "#ecfdf5", border: "#a7f3d0", icon: "#0e9f6e", text: "#065f46" },
    error:   { bg: "#fef2f2", border: "#fecaca", icon: "#e02424", text: "#991b1b" },
    info:    { bg: "#eff6ff", border: "#bfdbfe", icon: "#1a56db", text: "#1d4ed8" },
    warning: { bg: "#fffbeb", border: "#fde68a", icon: "#d97706", text: "#92400e" },
  };
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const Icon = icons[t.type];
        const c = colors[t.type];
        return (
          <div key={t.id} className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm animate-in fade-in slide-in-from-right-4 duration-300"
            style={{ backgroundColor: c.bg, borderColor: c.border }}>
            <Icon size={16} style={{ color: c.icon }} className="mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: c.text }}>{t.title}</p>
              {t.message && <p className="text-xs mt-0.5" style={{ color: c.text, opacity: 0.8 }}>{t.message}</p>}
            </div>
            <button onClick={() => remove(t.id)} className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity">
              <X size={14} style={{ color: c.text }} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Date.now();
    setToasts(p => [...p, { id, type, title, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  const remove = useCallback((id: number) => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, add, remove };
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({
  open, title, message, confirmLabel = "Confirmar", danger = false,
  onConfirm, onCancel, loading
}: {
  open: boolean; title: string; message: string; confirmLabel?: string;
  danger?: boolean; onConfirm: () => void; onCancel: () => void; loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${danger ? "bg-red-100" : "bg-blue-100"}`}>
          {danger ? <AlertTriangle size={22} className="text-red-600" /> : <AlertCircle size={22} className="text-blue-600" />}
        </div>
        <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <Btn variant="secondary" onClick={onCancel} className="flex-1">Cancelar</Btn>
          <button
            onClick={onConfirm} disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-70 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, description, action }: {
  icon: any; title: string; description: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon size={28} className="text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs mb-4">{description}</p>
      {action}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: "Principal",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "orders", label: "Pedidos", icon: Package },
      { id: "tracking", label: "Rastreamento", icon: MapPin },
    ]
  },
  {
    label: "Gestão",
    items: [
      { id: "drivers", label: "Motoristas", icon: Truck },
      { id: "clients", label: "Clientes", icon: Users },
    ]
  },
  {
    label: "Análise",
    items: [
      { id: "reports", label: "Relatórios", icon: BarChart3 },
      { id: "settings", label: "Configurações", icon: Settings },
    ]
  },
];

function Sidebar({ page, setPage, collapsed, setCollapsed }: {
  page: Page; setPage: (p: Page) => void; collapsed: boolean; setCollapsed: (v: boolean) => void;
}) {
  const isActive = (id: string) =>
    page === id ||
    (id === "orders" && ["orders", "order-detail", "new-order"].includes(page)) ||
    (id === "drivers" && ["drivers", "new-driver"].includes(page)) ||
    (id === "clients" && ["clients", "new-client"].includes(page));

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 z-20 transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? 64 : 232, minWidth: collapsed ? 64 : 232, backgroundColor: "#0c1520", borderRight: "1px solid #1a2942" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b flex-shrink-0" style={{ borderColor: "#1a2942" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: "linear-gradient(135deg, #1a56db, #3b82f6)" }}>
          <Truck size={16} color="#fff" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-white font-bold text-[15px] tracking-tight block leading-none">LogiTrack</span>
            <span className="text-[10px] font-medium tracking-widest uppercase" style={{ color: "#3b82f6" }}>Enterprise</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto flex flex-col gap-4">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-1.5" style={{ color: "#334d6a" }}>{group.label}</p>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map(({ id, label, icon: Icon }) => {
                const active = isActive(id);
                return (
                  <button
                    key={id}
                    onClick={() => setPage(id as Page)}
                    title={collapsed ? label : undefined}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left relative group"
                    style={{
                      backgroundColor: active ? "rgba(26,86,219,0.18)" : "transparent",
                      color: active ? "#60a5fa" : "#64748b",
                    }}
                  >
                    {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-blue-500" />}
                    <Icon size={17} className="flex-shrink-0" />
                    {!collapsed && <span className="text-[13px] font-medium">{label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse */}
      <div className="px-2 pb-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center h-8 rounded-lg transition-colors"
          style={{ backgroundColor: "#1a2942", color: "#64748b" }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* User */}
      <div className="border-t px-3 py-3 flex items-center gap-2.5 flex-shrink-0" style={{ borderColor: "#1a2942" }}>
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, #1a56db, #3b82f6)" }}>
          AM
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate leading-none">Ana Martins</p>
              <p className="text-[11px] truncate mt-0.5" style={{ color: "#64748b" }}>Administrador</p>
            </div>
            <button className="p-1 rounded transition-colors hover:bg-white/10">
              <LogOut size={13} style={{ color: "#64748b" }} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ title, sub, breadcrumb }: { title: string; sub?: string; breadcrumb?: { label: string; onClick: () => void }[] }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifs = [
    { msg: "PED-2024-002 está com atraso de 8h", time: "há 5 min", type: "error" as const },
    { msg: "PED-2024-004 entregue com sucesso", time: "há 1 h", type: "success" as const },
    { msg: "Novo pedido PED-2024-008 cadastrado", time: "há 2 h", type: "info" as const },
  ];
  const colors = { error: "#e02424", success: "#0e9f6e", info: "#1a56db" };
  return (
    <header className="h-14 flex items-center justify-between px-6 bg-card border-b border-border sticky top-0 z-10 flex-shrink-0">
      <div className="flex flex-col justify-center">
        {breadcrumb && breadcrumb.length > 0 ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
            {breadcrumb.map((b, i) => (
              <span key={b.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={10} />}
                <button onClick={b.onClick} className="hover:text-blue-600 transition-colors">{b.label}</button>
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <h1 className="text-[15px] font-bold text-foreground">{title}</h1>
          {sub && <span className="text-xs text-muted-foreground hidden sm:block">— {sub}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 bg-muted border border-border/50 rounded-lg px-3 py-2 w-52">
          <Search size={14} className="text-muted-foreground" />
          <input placeholder="Pesquisar..." className="bg-transparent text-xs outline-none flex-1 text-foreground placeholder:text-muted-foreground" />
          <kbd className="text-[10px] text-muted-foreground bg-border/50 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </div>

        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Bell size={16} className="text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-card" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30">
                <div>
                  <span className="text-sm font-bold text-foreground">Notificações</span>
                  <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">3</span>
                </div>
                <button className="text-xs text-blue-600 hover:underline font-medium">Marcar lidas</button>
              </div>
              {notifs.map((n, i) => (
                <div key={i} className="px-4 py-3 border-b border-border last:border-0 flex items-start gap-3 hover:bg-muted/40 cursor-pointer transition-colors">
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: colors[n.type] }} />
                  <div className="flex-1">
                    <p className="text-[13px] text-foreground leading-snug">{n.msg}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2 bg-muted/20 border-t border-border">
                <button className="text-xs text-blue-600 font-medium hover:underline">Ver todas as notificações</button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-border cursor-pointer group">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: "linear-gradient(135deg, #1a56db, #3b82f6)" }}>
            AM
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-foreground leading-none">Ana Martins</p>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Administrador</p>
          </div>
          <ChevronDown size={12} className="text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("ana.martins@logitrack.com.br");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1200);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f0f4f8" }}>
      <div className="hidden lg:flex w-[52%] relative overflow-hidden flex-col" style={{ backgroundColor: "#0c1520" }}>
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&h=1400&fit=crop&auto=format"
          alt="Logística"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(12,21,32,0.5) 0%, rgba(12,21,32,0.95) 100%)" }} />
        <div className="relative z-10 flex flex-col h-full p-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #1a56db, #3b82f6)" }}>
              <Truck size={20} color="#fff" />
            </div>
            <div>
              <span className="text-white font-bold text-lg block leading-none">LogiTrack</span>
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#3b82f6" }}>Enterprise</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <p className="text-5xl font-black text-white leading-[1.1] mb-5 tracking-tight">
              Operação<br />logística<br /><span style={{ color: "#60a5fa" }}>sob controle.</span>
            </p>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm mb-10">
              Rastreamento em tempo real, gestão de frota e visibilidade completa das suas entregas — tudo em uma plataforma.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { v: "98,4%", l: "Pontualidade", icon: CheckCircle },
                { v: "1.247", l: "Pedidos / mês", icon: Package },
                { v: "< 2min", l: "Resp. suporte", icon: Zap },
              ].map(s => (
                <div key={s.l} className="rounded-xl p-4 border" style={{ backgroundColor: "rgba(26,41,66,0.6)", borderColor: "#1a2942" }}>
                  <s.icon size={16} style={{ color: "#3b82f6" }} className="mb-2" />
                  <p className="text-white font-bold text-xl">{s.v}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-slate-600 text-xs">© 2024 LogiTrack Enterprise · CNPJ 00.000.000/0001-00</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px]">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a56db, #3b82f6)" }}>
              <Truck size={18} color="#fff" />
            </div>
            <span className="font-bold text-lg text-foreground">LogiTrack</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Bem-vindo de volta</h2>
            <p className="text-muted-foreground mt-1.5 text-sm">Acesse o painel de controle logístico</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">E-mail corporativo</label>
              <div className="flex items-center gap-2.5 border border-border rounded-xl px-3.5 py-3 bg-card focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <Mail size={15} className="text-muted-foreground flex-shrink-0" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-foreground"
                  placeholder="seu@empresa.com.br" required
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Senha</label>
                <button type="button" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Esqueceu?</button>
              </div>
              <div className="flex items-center gap-2.5 border border-border rounded-xl px-3.5 py-3 bg-card focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <Shield size={15} className="text-muted-foreground flex-shrink-0" />
                <input
                  type={showPassword ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-foreground"
                  placeholder="••••••••" required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Eye size={14} />
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer mt-0.5">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border accent-blue-600" />
              <span className="text-sm text-muted-foreground">Manter sessão ativa por 30 dias</span>
            </label>

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all mt-1 hover:opacity-90 active:scale-[0.99] disabled:opacity-70 shadow-md"
              style={{ background: loading ? "#1a56db" : "linear-gradient(135deg, #1a56db, #2563eb)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Autenticando...
                </span>
              ) : "Entrar no sistema"}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">Acesso seguro</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-4">
            Protegido por SSL · © 2024 LogiTrack Enterprise
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon: Icon, color, trend, detail }: {
  title: string; value: string; sub: string; icon: any; color: string;
  trend: { value: string; up: boolean; label: string }; detail?: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
          <p className="text-[2rem] font-black text-foreground mt-1.5 leading-none tracking-tight">{value}</p>
          {detail && <p className="text-xs text-muted-foreground mt-1">{detail}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${color}18, ${color}30)` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${trend.up ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
          {trend.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {trend.value}
        </span>
        <span className="text-[11px] text-muted-foreground">{trend.label}</span>
      </div>
    </div>
  );
}

function Dashboard({ setPage, setSelectedOrder, toast }: {
  setPage: (p: Page) => void; setSelectedOrder: (o: Order) => void;
  toast: (type: ToastType, title: string, message?: string) => void;
}) {
  const kpis = [
    { title: "Total de Pedidos", value: "1.247", sub: "este mês", icon: Package, color: "#1a56db", detail: "↑ 143 vs mês anterior", trend: { value: "+12,9%", up: true, label: "vs mês anterior" } },
    { title: "Entregues", value: "847", sub: "concluídas", icon: CheckCircle, color: "#0e9f6e", detail: "Taxa: 93,8% de pontualidade", trend: { value: "+8,4%", up: true, label: "vs mês anterior" } },
    { title: "Em Transporte", value: "312", sub: "em andamento", icon: Truck, color: "#0284c7", detail: "5 motoristas ativos agora", trend: { value: "+5,2%", up: true, label: "vs semana passada" } },
    { title: "Atrasados", value: "88", sub: "requerem atenção", icon: AlertTriangle, color: "#e02424", detail: "7,1% do total — meta: < 5%", trend: { value: "-2,8%", up: false, label: "vs mês anterior" } },
  ];

  const [chartPeriod, setChartPeriod] = useState("6m");
  const recent = ORDERS.slice(0, 6);

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Visão Geral</p>
          <p className="text-xs text-muted-foreground">Dados atualizados em 26/06/2024 às 16:48 · <span className="text-emerald-600 font-semibold">● Ao vivo</span></p>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="secondary" size="sm" icon={Download}>Exportar</Btn>
          <Btn variant="secondary" size="sm" icon={RefreshCw}>Atualizar</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(k => <KpiCard key={k.title} {...k} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground">Desempenho de Entregas</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Entregas realizadas vs. alvo mensal</p>
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {["3m", "6m", "1y"].map(p => (
                <button key={p} onClick={() => setChartPeriod(p)} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${chartPeriod === p ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4 mb-4">
              {[{ l: "Entregues", c: "#0e9f6e" }, { l: "Atrasados", c: "#e02424" }, { l: "Meta", c: "#94a3b8" }].map(s => (
                <div key={s.l} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2 rounded-sm" style={{ backgroundColor: s.c }} />
                  <span className="text-[11px] text-muted-foreground">{s.l}</span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={MONTHLY_DATA} margin={{ left: -20, right: 0 }}>
                <defs>
                  <linearGradient id="gDeliv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0e9f6e" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#0e9f6e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDelay" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e02424" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#e02424" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }} />
                <Area key="a-delivered" type="monotone" dataKey="delivered" stroke="#0e9f6e" strokeWidth={2.5} fill="url(#gDeliv)" name="Entregues" />
                <Area key="a-delayed" type="monotone" dataKey="delayed" stroke="#e02424" strokeWidth={2} fill="url(#gDelay)" name="Atrasados" strokeDasharray="4 2" />
                <Area key="a-target" type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={1.5} fill="none" name="Meta" strokeDasharray="6 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Status dos Pedidos</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Distribuição atual</p>
          </div>
          <div className="p-5">
            <div className="flex justify-center mb-2">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                    {PIE_DATA.map(e => <Cell key={`dp-${e.name}`} fill={e.color} strokeWidth={0} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2.5">
              {PIE_DATA.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-muted-foreground flex-1">{d.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${d.value}%`, backgroundColor: d.color }} />
                    </div>
                    <span className="text-xs font-bold text-foreground w-8 text-right">{d.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity + recent orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent orders */}
        <div className="xl:col-span-2 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Pedidos Recentes</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Últimas atualizações</p>
            </div>
            <button onClick={() => setPage("orders")} className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors">
              Ver todos <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  {["ID do Pedido", "Cliente", "Destino", "Status", "Vencimento"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map(o => (
                  <tr
                    key={o.id}
                    className="border-t border-border hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => { setSelectedOrder(o); setPage("order-detail"); }}
                  >
                    <td className="px-4 py-3 text-xs font-mono font-bold text-blue-600 group-hover:text-blue-700">{o.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={o.client} size="sm" color="#1a56db" />
                        <span className="text-xs font-medium text-foreground whitespace-nowrap">{o.client.split(" ").slice(0, 2).join(" ")}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{o.city}, {o.state}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{o.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Atividade Recente</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Últimas 6 horas</p>
          </div>
          <div className="p-4 flex flex-col gap-0">
            {[
              { icon: CheckCircle, msg: "PED-2024-004 entregue", sub: "Ana Costa · Porto Alegre", time: "há 12 min", color: "#0e9f6e" },
              { icon: AlertTriangle, msg: "PED-2024-002 atrasado", sub: "8h além do prazo previsto", time: "há 1h", color: "#e02424" },
              { icon: Truck, msg: "PED-2024-001 em transporte", sub: "Carlos Mendes · Rota SP", time: "há 2h", color: "#0284c7" },
              { icon: Package, msg: "PED-2024-006 recebido", sub: "Indústria MetalMax", time: "há 3h", color: "#1a56db" },
              { icon: Hash, msg: "3 pedidos em separação", sub: "Armazém SP-02", time: "há 4h", color: "#7e3af2" },
            ].map((a, i) => (
              <div key={i} className="flex gap-3 py-3 border-b border-border last:border-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: a.color + "15" }}>
                  <a.icon size={13} style={{ color: a.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-snug">{a.msg}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{a.sub}</p>
                </div>
                <p className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">{a.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Orders ───────────────────────────────────────────────────────────────────

function Orders({ setPage, setSelectedOrder, toast }: {
  setPage: (p: Page) => void; setSelectedOrder: (o: Order) => void;
  toast: (type: ToastType, title: string, message?: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");

  const filtered = useMemo(() => ORDERS.filter(o => {
    const m = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.client.toLowerCase().includes(search.toLowerCase()) ||
      o.city.toLowerCase().includes(search.toLowerCase()) ||
      o.driver.toLowerCase().includes(search.toLowerCase());
    const s = filterStatus === "all" || o.status === filterStatus;
    return m && s;
  }), [search, filterStatus]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    ORDERS.forEach(o => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, []);

  return (
    <div className="p-6 flex flex-col gap-4">
      {/* Status overview pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filterStatus === "all" ? "bg-foreground text-card border-foreground" : "bg-card text-muted-foreground border-border hover:border-foreground/30"}`}
        >
          Todos ({ORDERS.length})
        </button>
        {(["delayed", "in-transit", "out-for-delivery", "delivered"] as OrderStatus[]).map(s => {
          const sm = STATUS_MAP[s];
          const count = statusCounts[s] || 0;
          const active = filterStatus === s;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
              style={{
                backgroundColor: active ? sm.bg : "#fff",
                color: active ? sm.color : "#6b7a99",
                borderColor: active ? sm.border : "#e2e8f0",
              }}
            >
              {sm.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 min-w-[200px] flex-1 max-w-xs focus-within:border-blue-400 transition-colors">
            <Search size={14} className="text-muted-foreground flex-shrink-0" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por ID, cliente, cidade..."
              className="bg-transparent text-xs outline-none flex-1 text-foreground placeholder:text-muted-foreground"
            />
            {search && <button onClick={() => setSearch("")}><X size={12} className="text-muted-foreground hover:text-foreground" /></button>}
          </div>
          <select
            value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none cursor-pointer"
          >
            <option value="createdAt">Ordenar: Mais recentes</option>
            <option value="dueDate">Ordenar: Vencimento</option>
            <option value="client">Ordenar: Cliente</option>
          </select>
        </div>
        <Btn icon={Plus} onClick={() => setPage("new-order")}>Novo Pedido</Btn>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                {["Pedido", "Cliente", "Destino", "Motorista", "Produto", "Vencimento", "Status", "Ações"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, idx) => (
                <tr
                  key={o.id}
                  className="border-t border-border hover:bg-blue-50/20 transition-colors group"
                  style={{ backgroundColor: idx % 2 === 0 ? "transparent" : "rgba(248,250,252,0.5)" }}
                >
                  <td className="px-4 py-3.5">
                    <button onClick={() => { setSelectedOrder(o); setPage("order-detail"); }} className="text-xs font-mono font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">{o.id}</button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Avatar name={o.client} size="sm" />
                      <span className="text-xs font-medium text-foreground">{o.client}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={11} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{o.city}, {o.state}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-foreground whitespace-nowrap">{o.driver}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap max-w-[140px] truncate">{o.product}</td>
                  <td className="px-4 py-3.5">
                    <div className={`text-xs whitespace-nowrap font-medium ${o.status === "delayed" ? "text-red-600" : "text-muted-foreground"}`}>
                      {o.status === "delayed" && <AlertTriangle size={10} className="inline mr-1" />}
                      {o.dueDate}
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setSelectedOrder(o); setPage("order-detail"); }}
                        className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" title="Ver detalhes"
                      ><Eye size={13} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="Editar"><Edit2 size={13} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="Mais"><MoreHorizontal size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8}>
                  <EmptyState
                    icon={Package2}
                    title="Nenhum pedido encontrado"
                    description={search ? `Sem resultados para "${search}". Tente outros termos.` : "Não há pedidos com os filtros selecionados."}
                    action={<Btn variant="secondary" size="sm" onClick={() => { setSearch(""); setFilterStatus("all"); }}>Limpar filtros</Btn>}
                  />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/20">
          <p className="text-[11px] text-muted-foreground">
            Exibindo <span className="font-semibold text-foreground">{filtered.length}</span> de <span className="font-semibold text-foreground">{ORDERS.length}</span> pedidos
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(n => (
              <button key={n} className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${n === 1 ? "bg-blue-600 text-white" : "border border-border text-muted-foreground hover:bg-muted"}`}>{n}</button>
            ))}
            <span className="text-xs text-muted-foreground px-1">...</span>
            <button className="px-2.5 h-7 rounded-lg text-xs border border-border text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1">
              Próximo <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Order Detail ─────────────────────────────────────────────────────────────

function OrderDetail({ order, setPage, toast }: {
  order: Order; setPage: (p: Page) => void;
  toast: (type: ToastType, title: string, message?: string) => void;
}) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDeliver, setConfirmDeliver] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleDeliver = () => {
    setActionLoading(true);
    setTimeout(() => {
      setActionLoading(false);
      setConfirmDeliver(false);
      toast("success", "Entrega confirmada!", `${order.id} foi marcado como entregue.`);
      setPage("orders");
    }, 1200);
  };

  const handleCancel = () => {
    setActionLoading(true);
    setTimeout(() => {
      setActionLoading(false);
      setConfirmCancel(false);
      toast("info", "Pedido cancelado", `${order.id} foi cancelado com sucesso.`);
      setPage("orders");
    }, 1000);
  };

  const statusSteps: { status: OrderStatus; label: string; desc: string; date: string; done: boolean }[] = [
    { status: "received", label: "Pedido Recebido", desc: "Cadastrado e validado no sistema", date: `${order.createdAt} · 08:15`, done: true },
    { status: "separating", label: "Em Separação", desc: "Mercadoria separada no armazém SP-02", date: `${order.createdAt} · 10:30`, done: ["separating", "in-transit", "out-for-delivery", "delivered"].includes(order.status) },
    { status: "in-transit", label: "Em Transporte", desc: `${order.driver} coletou a carga`, date: `${order.createdAt} · 14:00`, done: ["in-transit", "out-for-delivery", "delivered"].includes(order.status) },
    { status: "out-for-delivery", label: "Saiu p/ Entrega", desc: "Motorista a caminho do destino final", date: "—", done: ["out-for-delivery", "delivered"].includes(order.status) },
    { status: "delivered", label: "Entregue", desc: "Assinatura coletada pelo destinatário", date: "—", done: order.status === "delivered" },
  ];

  const currentStep = statusSteps.findIndex(s => s.status === order.status);

  return (
    <div className="p-6 flex flex-col gap-5">
      <ConfirmModal
        open={confirmDeliver} title="Confirmar entrega"
        message={`Você está confirmando que o pedido ${order.id} foi entregue ao destinatário. Esta ação não pode ser desfeita.`}
        confirmLabel="Confirmar entrega" onConfirm={handleDeliver} onCancel={() => setConfirmDeliver(false)} loading={actionLoading}
      />
      <ConfirmModal
        open={confirmCancel} title="Cancelar pedido" danger
        message={`Tem certeza que deseja cancelar o pedido ${order.id}? O cliente será notificado e a operação não poderá ser revertida.`}
        confirmLabel="Cancelar pedido" onConfirm={handleCancel} onCancel={() => setConfirmCancel(false)} loading={actionLoading}
      />

      {/* Header */}
      <div className="flex items-start gap-3 flex-wrap">
        <button onClick={() => setPage("orders")} className="p-2 rounded-lg hover:bg-muted transition-colors mt-0.5">
          <ChevronLeft size={16} className="text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg font-black text-foreground tracking-tight">{order.id}</h2>
            <StatusBadge status={order.status} />
            {order.status === "delayed" && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                <AlertTriangle size={11} /> Atenção requerida
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Criado em {order.createdAt} · Transportadora: <span className="font-semibold text-foreground">{order.carrier}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Btn variant="secondary" size="sm" icon={Edit2}>Editar</Btn>
          <Btn variant="success" size="sm" icon={CheckCircle} onClick={() => setConfirmDeliver(true)}>Marcar Entregue</Btn>
          <Btn variant="danger" size="sm" icon={Ban} onClick={() => setConfirmCancel(true)}>Cancelar</Btn>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Info card */}
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <FileText size={14} className="text-blue-600" />
              <h3 className="text-sm font-bold text-foreground">Informações do Pedido</h3>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-3 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar name={order.client} size="lg" />
                  <div>
                    <p className="text-sm font-bold text-foreground">{order.client}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.destination}</p>
                    <p className="text-xs text-muted-foreground">{order.city}, {order.state} — CEP {order.cep}</p>
                  </div>
                </div>
              </div>
              {[
                { l: "Produto", v: order.product, icon: Package },
                { l: "Quantidade", v: `${order.qty} unidades`, icon: Hash },
                { l: "Peso total", v: order.weight, icon: Activity },
                { l: "Data prevista", v: order.dueDate, icon: Calendar },
                { l: "Motorista resp.", v: order.driver, icon: Truck },
                { l: "Transportadora", v: order.carrier, icon: Building2 },
              ].map(({ l, v, icon: Icon }) => (
                <div key={l}>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    <Icon size={10} /> {l}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{v}</p>
                </div>
              ))}
              {order.notes && (
                <div className="sm:col-span-3 pt-4 border-t border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Observações</p>
                  <p className="text-sm text-foreground bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">⚠️ {order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Navigation size={14} className="text-blue-600" />
              <h3 className="text-sm font-bold text-foreground">Linha do Tempo</h3>
              <span className="ml-auto text-[11px] text-muted-foreground">Etapa {Math.min(currentStep + 1, statusSteps.length)} de {statusSteps.length}</span>
            </div>
            <div className="p-5">
              {/* Progress bar */}
              <div className="mb-6 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / statusSteps.length) * 100}%`, background: "linear-gradient(90deg, #0e9f6e, #10b981)" }}
                />
              </div>
              <div className="flex flex-col gap-0">
                {statusSteps.map((step, i) => {
                  const isActive = step.status === order.status;
                  const isPending = !step.done && !isActive;
                  return (
                    <div key={step.status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${step.done ? "border-emerald-500 bg-emerald-500" : isActive ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50"}`}>
                          {step.done
                            ? <Check size={16} color="#fff" strokeWidth={3} />
                            : isActive
                              ? <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                              : <span className="w-2 h-2 rounded-full bg-slate-300" />
                          }
                        </div>
                        {i < statusSteps.length - 1 && (
                          <div className="w-0.5 flex-1 my-1 rounded-full" style={{ backgroundColor: step.done ? "#0e9f6e" : "#e2e8f0", minHeight: 24 }} />
                        )}
                      </div>
                      <div className="pb-5 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className={`text-sm font-bold ${step.done ? "text-emerald-700" : isActive ? "text-blue-700" : "text-muted-foreground"}`}>
                              {step.label}
                              {isActive && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Atual</span>
                              )}
                            </p>
                            <p className={`text-xs mt-0.5 ${isPending ? "text-muted-foreground/50" : "text-muted-foreground"}`}>{step.desc}</p>
                          </div>
                          {step.done && <p className="text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0">{step.date}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Map */}
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=400&h=200&fit=crop&auto=format" alt="Mapa" className="w-full h-40 object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,25,35,0.7) 0%, transparent 60%)" }} />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white text-xs font-bold">{order.city}, {order.state}</p>
                <p className="text-white/70 text-[11px] mt-0.5 truncate">{order.destination}</p>
              </div>
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                <p className="text-[10px] font-bold text-foreground">~45 km</p>
              </div>
            </div>
            <div className="px-4 py-3 flex items-center gap-2">
              <MapPinned size={14} className="text-blue-600" />
              <div>
                <p className="text-xs font-semibold text-foreground">Localização em tempo real</p>
                <p className="text-[11px] text-muted-foreground">Veículo a ~45 km do destino</p>
              </div>
            </div>
          </div>

          {/* Driver */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Motorista Responsável</p>
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={order.driver} size="lg" color="#0e9f6e" />
              <div>
                <p className="text-sm font-bold text-foreground">{order.driver}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= 4 ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"} />)}
                  <span className="text-[11px] text-muted-foreground ml-1">4.8</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone size={11} className="flex-shrink-0" /> (11) 99876-5432
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Car size={11} className="flex-shrink-0" /> VW Constellation · ABC-1D23
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 size={11} className="flex-shrink-0" /> {order.carrier}
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Histórico</p>
            {[
              { t: "14:00", msg: "Carga coletada no CD São Paulo", icon: Truck, c: "#0284c7" },
              { t: "11:45", msg: "Nota fiscal emitida (NF-e 4521)", icon: FileText, c: "#7e3af2" },
              { t: "10:30", msg: `Separação concluída — ${order.qty} un.`, icon: CheckCircle, c: "#0e9f6e" },
              { t: "08:15", msg: "Pedido registrado no sistema", icon: Hash, c: "#1a56db" },
            ].map((h, i) => (
              <div key={i} className="flex items-start gap-2.5 mb-3 last:mb-0">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: h.c + "15" }}>
                  <h.icon size={11} style={{ color: h.c }} />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground leading-snug">{h.msg}</p>
                  <p className="text-[11px] text-muted-foreground">{order.createdAt} às {h.t}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tracking ────────────────────────────────────────────────────────────────

function Tracking({ toast }: { toast: (type: ToastType, title: string, message?: string) => void }) {
  const [selected, setSelected] = useState("PED-2024-001");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast("info", "Rastreamento atualizado", "Dados sincronizados às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    }, 1500);
  };

  const steps = [
    { label: "Pedido Recebido", desc: `${selected} registrado no sistema`, date: "25/06/2024", time: "08:15", icon: Hash, done: true },
    { label: "Em Separação", desc: "Mercadoria separada — Armazém SP-02", date: "25/06/2024", time: "10:30", icon: Package, done: true },
    { label: "Saiu do CD", desc: "Veículo ABC-1D23 coletou a carga", date: "25/06/2024", time: "14:00", icon: Truck, done: true },
    { label: "Em Transporte", desc: "Em trânsito — Rodovia Anhanguera km 80", date: "25/06/2024", time: "16:45", icon: Navigation, done: false, active: true },
    { label: "Próximo ao Destino", desc: "Estimativa de chegada: ~45 minutos", date: "—", time: "—", icon: MapPin, done: false },
    { label: "Entregue", desc: "Assinatura coletada pelo responsável", date: "—", time: "—", icon: CheckCircle, done: false },
  ];

  const doneCount = steps.filter(s => s.done).length;
  const progress = (doneCount / steps.length) * 100;

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Selector */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#e8eef8" }}>
            <Search size={14} style={{ color: "#1a56db" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Rastrear pedido</p>
            <select
              value={selected} onChange={e => setSelected(e.target.value)}
              className="bg-transparent text-sm font-semibold text-foreground outline-none w-full cursor-pointer"
            >
              {ORDERS.filter(o => !["cancelled"].includes(o.status)).map(o => (
                <option key={o.id} value={o.id}>{o.id} — {o.client}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Progresso</p>
            <p className="text-sm font-bold text-foreground">{doneCount}/{steps.length} etapas</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-foreground">Progresso da entrega</p>
          <p className="text-xs font-bold text-blue-600">{Math.round(progress)}%</p>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #1a56db, #0e9f6e)" }} />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[10px] text-muted-foreground">Coletado em São Paulo</p>
          <p className="text-[10px] text-muted-foreground">Destino: São Paulo, SP</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Steps */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Etapas da Entrega</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{selected} · Atualizado às 16:48</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> Em andamento
            </span>
          </div>
          <div className="p-6">
            {steps.map((step, i) => (
              <div key={step.label} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all"
                    style={{
                      backgroundColor: step.done ? "#0e9f6e" : (step as any).active ? "#eff6ff" : "#f8fafc",
                      borderColor: step.done ? "#0e9f6e" : (step as any).active ? "#1a56db" : "#e2e8f0",
                    }}
                  >
                    {step.done
                      ? <Check size={16} color="#fff" strokeWidth={3} />
                      : <step.icon size={16} color={(step as any).active ? "#1a56db" : "#cbd5e1"} />
                    }
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 my-1 rounded-full" style={{ height: 40, backgroundColor: step.done ? "#0e9f6e" : "#f1f5f9" }} />
                  )}
                </div>
                <div className="pb-6 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-bold ${step.done ? "text-emerald-700" : (step as any).active ? "text-blue-700" : "text-muted-foreground/50"}`}>
                          {step.label}
                        </p>
                        {(step as any).active && (
                          <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Atual</span>
                        )}
                        {step.done && <Check size={12} className="text-emerald-600" />}
                      </div>
                      <p className={`text-xs mt-0.5 ${step.done || (step as any).active ? "text-muted-foreground" : "text-muted-foreground/40"}`}>{step.desc}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xs font-semibold ${step.done ? "text-foreground" : "text-muted-foreground/40"}`}>{step.date}</p>
                      <p className={`text-[11px] ${step.done ? "text-muted-foreground" : "text-muted-foreground/40"}`}>{step.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4">
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=400&h=180&fit=crop&auto=format" alt="Mapa" className="w-full h-36 object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,25,35,0.6) 0%, transparent 50%)" }} />
              <div className="absolute bottom-2 left-3 right-3">
                <p className="text-white text-xs font-bold">Rodovia Anhanguera</p>
                <p className="text-white/70 text-[11px]">km 80 — São Paulo, SP</p>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground">Localização atual</p>
                <p className="text-[11px] text-muted-foreground">GPS atualizado às 16:47</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Online</span>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Motorista</p>
            <div className="flex items-center gap-3 mb-3">
              <Avatar name="Carlos Mendes" size="md" color="#0e9f6e" />
              <div>
                <p className="text-sm font-bold text-foreground">Carlos Mendes</p>
                <p className="text-[11px] text-muted-foreground">VW Constellation · ABC-1D23</p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 bg-muted/40 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone size={11} /> (11) 99876-5432</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {[1,2,3,4,5].map(s => <Star key={s} size={9} className={s <= 4 ? "text-yellow-400 fill-yellow-400" : "text-slate-300 fill-slate-300"} />)}
                <span className="ml-0.5">4.8 · 342 entregas</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-4 border" style={{ backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }}>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} style={{ color: "#1a56db" }} />
              <p className="text-sm font-bold" style={{ color: "#1d4ed8" }}>Previsão de chegada</p>
            </div>
            <p className="text-2xl font-black" style={{ color: "#1d4ed8" }}>18:30</p>
            <p className="text-xs mt-1" style={{ color: "#3b82f6" }}>Hoje · em aproximadamente 45 minutos</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Drivers ─────────────────────────────────────────────────────────────────

function Drivers({ setPage, toast }: { setPage: (p: Page) => void; toast: (type: ToastType, title: string, message?: string) => void }) {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const filtered = DRIVERS.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.carrier.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-2 w-56 focus-within:border-blue-400 transition-colors">
            <Search size={13} className="text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar motoristas..." className="bg-transparent text-xs outline-none flex-1" />
          </div>
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
            <button onClick={() => setView("grid")} className={`px-2.5 py-1.5 rounded-md transition-colors ${view === "grid" ? "bg-foreground text-card" : "text-muted-foreground"}`}>
              <LayoutDashboard size={13} />
            </button>
            <button onClick={() => setView("table")} className={`px-2.5 py-1.5 rounded-md transition-colors ${view === "table" ? "bg-foreground text-card" : "text-muted-foreground"}`}>
              <ClipboardList size={13} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[11px] text-muted-foreground hidden sm:block">{filtered.length} motoristas</p>
          <Btn icon={Plus} onClick={() => setPage("new-driver")}>Novo Motorista</Btn>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { l: "Em Rota", c: "#0284c7", bg: "#f0f9ff", n: DRIVERS.filter(d => d.status === "on-route").length },
          { l: "Disponíveis", c: "#0e9f6e", bg: "#ecfdf5", n: DRIVERS.filter(d => d.status === "active").length },
          { l: "Inativos", c: "#6b7280", bg: "#f9fafb", n: DRIVERS.filter(d => d.status === "inactive").length },
        ].map(s => (
          <div key={s.l} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold" style={{ backgroundColor: s.bg, borderColor: s.c + "40", color: s.c }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.c }} />{s.n} {s.l}
          </div>
        ))}
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(d => {
            const st = DRIVER_STATUS_MAP[d.status];
            const initial = d.name.split(" ").map(n => n[0]).join("").slice(0, 2);
            const colors = ["#1a56db", "#0e9f6e", "#7e3af2", "#0284c7", "#d97706"];
            const color = colors[DRIVERS.indexOf(d) % colors.length];
            return (
              <div key={d.id} className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                        {initial}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{d.name}</p>
                        <p className="text-[11px] text-muted-foreground">{d.id}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border" style={{ color: st.color, backgroundColor: st.bg, borderColor: st.dot + "40" }}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: st.dot }} />
                      {st.label}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone size={11} />{d.phone}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Car size={11} />{d.vehicle} · <span className="font-mono font-semibold text-foreground">{d.plate}</span></div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Building2 size={11} />{d.carrier}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/40">
                    <div className="text-center">
                      <p className="text-base font-black text-foreground">{d.deliveries}</p>
                      <p className="text-[10px] text-muted-foreground">Entregas</p>
                    </div>
                    <div className="text-center border-x border-border">
                      <div className="flex items-center justify-center gap-0.5">
                        <Star size={11} className="text-yellow-400 fill-yellow-400" />
                        <p className="text-base font-black text-foreground">{d.rating}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Avaliação</p>
                    </div>
                    <div className="text-center">
                      <p className="text-base font-black" style={{ color: d.onTime >= 95 ? "#0e9f6e" : d.onTime >= 85 ? "#d97706" : "#e02424" }}>{d.onTime}%</p>
                      <p className="text-[10px] text-muted-foreground">Pontual</p>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
                  <button className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1">
                    Ver perfil <ChevronRight size={11} />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><MoreHorizontal size={14} className="text-muted-foreground" /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Motorista", "Veículo / Placa", "Transportadora", "Status", "Entregas", "Avaliação", "Pontualidade", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => {
                const st = DRIVER_STATUS_MAP[d.status];
                const color = ["#1a56db", "#0e9f6e", "#7e3af2", "#0284c7", "#d97706"][i % 5];
                return (
                  <tr key={d.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={d.name} size="sm" color={color} />
                        <div>
                          <p className="text-xs font-bold text-foreground">{d.name}</p>
                          <p className="text-[10px] text-muted-foreground">{d.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground"><span className="font-mono font-semibold text-foreground">{d.plate}</span> · {d.vehicle}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{d.carrier}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border" style={{ color: st.color, backgroundColor: st.bg, borderColor: st.dot + "40" }}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-bold text-foreground">{d.deliveries}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <Star size={11} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-foreground">{d.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${d.onTime}%`, backgroundColor: d.onTime >= 95 ? "#0e9f6e" : d.onTime >= 85 ? "#d97706" : "#e02424" }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: d.onTime >= 95 ? "#0e9f6e" : d.onTime >= 85 ? "#d97706" : "#e02424" }}>{d.onTime}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Eye size={13} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><Edit2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Clients ─────────────────────────────────────────────────────────────────

function Clients({ setPage, toast }: { setPage: (p: Page) => void; toast: (type: ToastType, title: string, message?: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = CLIENTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 w-64 focus-within:border-blue-400 transition-colors">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar clientes..." className="bg-transparent text-xs outline-none flex-1" />
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="secondary" size="sm" icon={Download}>Exportar</Btn>
          <Btn icon={Plus} onClick={() => setPage("new-client")}>Novo Cliente</Btn>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted/20">
          <p className="text-[11px] text-muted-foreground"><span className="font-semibold text-foreground">{filtered.length}</span> clientes cadastrados</p>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <SortAsc size={11} /> Ordenado por: Volume
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Cliente / Responsável", "CNPJ", "Contato", "Localização", "Pedidos", "Volume faturado", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <EmptyState
                    icon={Users}
                    title="Nenhum cliente encontrado"
                    description={`Sem resultados para "${search}"`}
                    action={<Btn variant="secondary" size="sm" onClick={() => setSearch("")}>Limpar busca</Btn>}
                  />
                </td></tr>
              ) : filtered.map((c, i) => {
                const colors = ["#1a56db", "#0e9f6e", "#7e3af2", "#0284c7", "#d97706"];
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-blue-50/20 transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.company} size="md" color={colors[i % colors.length]} />
                        <div>
                          <p className="text-xs font-bold text-foreground">{c.company}</p>
                          <p className="text-[11px] text-muted-foreground">{c.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[11px] font-mono text-muted-foreground">{c.cnpj}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-foreground flex items-center gap-1"><Phone size={10} className="text-muted-foreground" />{c.phone}</span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Mail size={10} />{c.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Globe size={11} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{c.city}, {c.state}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{c.orders}</span>
                        <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${(c.orders / 65) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-bold text-emerald-700">{c.volume}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Eye size={13} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><Edit2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────

function Reports({ toast }: { toast: (type: ToastType, title: string, message?: string) => void }) {
  const [period, setPeriod] = useState("6m");

  const topClients = [
    { name: "Restaurante Sabor Gourmet", orders: 61, growth: "+12%" },
    { name: "Supermercados BomPreço", orders: 48, growth: "+5%" },
    { name: "Farmácias Saúde+", orders: 32, growth: "-3%" },
    { name: "Loja TechStore", orders: 24, growth: "+18%" },
    { name: "Construtora Horizonte", orders: 17, growth: "+2%" },
  ];

  const topDrivers = [
    { name: "Carlos Mendes", deliveries: 342, onTime: 97 },
    { name: "Marcos Oliveira", deliveries: 289, onTime: 94 },
    { name: "Roberto Silva", deliveries: 218, onTime: 91 },
    { name: "Ana Paula Costa", deliveries: 175, onTime: 98 },
    { name: "José Ferreira", deliveries: 94, onTime: 83 },
  ];

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Período atual</p>
          <p className="text-sm font-bold text-foreground">Janeiro – Junho 2024</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
            {[{ v: "1m", l: "1 mês" }, { v: "3m", l: "3 meses" }, { v: "6m", l: "6 meses" }, { v: "1y", l: "1 ano" }].map(p => (
              <button key={p.v} onClick={() => setPeriod(p.v)} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${period === p.v ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {p.l}
              </button>
            ))}
          </div>
          <Btn
            variant="secondary" size="sm" icon={Download}
            onClick={() => toast("success", "Relatório exportado", "PDF gerado com sucesso. Download iniciado.")}
          >
            Exportar PDF
          </Btn>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Total Entregues", v: "1.163", vs: "+127 vs período anterior", c: "#0e9f6e", bg: "#ecfdf5", icon: CheckCircle },
          { l: "Pedidos Atrasados", v: "77", vs: "-14 vs período anterior", c: "#e02424", bg: "#fef2f2", icon: AlertTriangle },
          { l: "Taxa de Pontualidade", v: "93,8%", vs: "+2,1pp vs período anterior", c: "#1a56db", bg: "#eff6ff", icon: Activity },
          { l: "Ticket Médio / Pedido", v: "R$ 1.240", vs: "+R$80 vs período anterior", c: "#7e3af2", bg: "#f5f3ff", icon: TrendingUp },
        ].map(k => (
          <div key={k.l} className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{k.l}</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: k.bg }}>
                <k.icon size={14} style={{ color: k.c }} />
              </div>
            </div>
            <p className="text-2xl font-black" style={{ color: k.c }}>{k.v}</p>
            <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">{k.vs}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Entregas por Mês</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Realizadas vs. alvo mensal</p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={MONTHLY_DATA} barSize={24} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                <Bar key="rb-delivered" dataKey="delivered" fill="#1a56db" radius={[4, 4, 0, 0]} name="Entregues" />
                <Bar key="rb-delayed" dataKey="delayed" fill="#fecaca" radius={[4, 4, 0, 0]} name="Atrasados" />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Distribuição de Status</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Pedidos no período</p>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div className="flex justify-center">
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                    {PIE_DATA.map(e => <Cell key={`rp-${e.name}`} fill={e.color} strokeWidth={0} />)}
                  </Pie>
                  <Tooltip contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2">
              {PIE_DATA.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-muted-foreground flex-1">{d.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${d.value}%`, backgroundColor: d.color }} />
                    </div>
                    <span className="text-xs font-bold text-foreground w-8 text-right">{d.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Top Clientes</h3>
            <span className="text-[11px] text-muted-foreground">Por volume de pedidos</span>
          </div>
          <div className="p-5 flex flex-col gap-3">
            {topClients.map((c, i) => {
              const isUp = c.growth.startsWith("+");
              return (
                <div key={c.name} className="flex items-center gap-3">
                  <span className={`text-xs font-black w-5 text-center ${i === 0 ? "text-yellow-500" : "text-muted-foreground"}`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-semibold text-foreground truncate">{c.name}</p>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className={`text-[10px] font-bold ${isUp ? "text-emerald-600" : "text-red-600"}`}>{c.growth}</span>
                        <span className="text-xs font-bold text-foreground">{c.orders}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(c.orders / 65) * 100}%`, backgroundColor: "#1a56db" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Performance de Motoristas</h3>
            <span className="text-[11px] text-muted-foreground">Entregas + pontualidade</span>
          </div>
          <div className="p-5 flex flex-col gap-3">
            {topDrivers.map((d, i) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className={`text-xs font-black w-5 text-center ${i === 0 ? "text-yellow-500" : "text-muted-foreground"}`}>{i + 1}</span>
                <Avatar name={d.name} size="sm" color={["#1a56db", "#0e9f6e", "#7e3af2", "#0284c7", "#d97706"][i]} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-foreground truncate">{d.name}</p>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-[10px] font-bold" style={{ color: d.onTime >= 95 ? "#0e9f6e" : d.onTime >= 85 ? "#d97706" : "#e02424" }}>{d.onTime}%</span>
                      <span className="text-xs font-bold text-foreground">{d.deliveries}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(d.deliveries / 360) * 100}%`, backgroundColor: "#0e9f6e" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Form Pages ───────────────────────────────────────────────────────────────

function FormPage({ title, back, sections, onSave, toast }: {
  title: string; back: () => void;
  sections: { title: string; icon: any; fields: React.ReactNode }[];
  onSave: () => void;
  toast: (type: ToastType, title: string, message?: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast("success", "Salvo com sucesso!", `${title} registrado no sistema.`);
      onSave();
    }, 1200);
  };

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={back} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft size={16} className="text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h2 className="text-base font-black text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Preencha todos os campos obrigatórios marcados com *</p>
          </div>
          <div className="flex items-center gap-1.5">
            {sections.map((_, i) => (
              <button key={i} onClick={() => setStep(i)} className={`w-2 h-2 rounded-full transition-all ${i === step ? "w-6 bg-blue-600" : i < step ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {sections.map((section, i) => (
            <div key={section.title} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2 bg-muted/20">
                <section.icon size={14} className="text-blue-600" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{section.title}</h3>
              </div>
              <div className="p-5">{section.fields}</div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <Btn variant="ghost" onClick={back}>Cancelar</Btn>
            <div className="flex items-center gap-3">
              <Btn variant="secondary" icon={FileText}>Salvar rascunho</Btn>
              <Btn loading={loading} onClick={handleSave} icon={loading ? undefined : Check}>
                {loading ? "Salvando..." : "Salvar"}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewOrder({ setPage, toast }: { setPage: (p: Page) => void; toast: (type: ToastType, title: string, message?: string) => void }) {
  return (
    <FormPage
      title="Novo Pedido"
      back={() => setPage("orders")}
      onSave={() => setPage("orders")}
      toast={toast}
      sections={[
        {
          title: "Identificação do Pedido", icon: Hash,
          fields: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Número do Pedido" placeholder="PED-2024-009" hint="Gerado automaticamente se deixado em branco" />
              <SelectField label="Status Inicial" options={["Recebido", "Em Separação"]} required />
            </div>
          )
        },
        {
          title: "Cliente e Destino", icon: Users,
          fields: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField label="Cliente" options={CLIENTS.map(c => c.company)} required />
              <FormField label="Endereço Completo" placeholder="Rua, número, complemento" required />
              <FormField label="Cidade" placeholder="São Paulo" required />
              <FormField label="Estado (UF)" placeholder="SP" required />
              <FormField label="CEP" placeholder="01310-200" required />
            </div>
          )
        },
        {
          title: "Produto e Carga", icon: Package,
          fields: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Descrição do Produto" placeholder="Ex: Alimentos não perecíveis" required span={2} />
              <FormField label="Quantidade" placeholder="0" type="number" required />
              <FormField label="Peso total (kg)" placeholder="0,00" type="number" required />
              <FormField label="Data Prevista de Entrega" type="date" required />
            </div>
          )
        },
        {
          title: "Logística e Transporte", icon: Truck,
          fields: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField label="Motorista Responsável" options={DRIVERS.map(d => d.name)} required />
              <SelectField label="Transportadora" options={["LogFast Transportes", "SpeedLog", "CargoBrasil", "PrimeLog"]} required />
              <FormField label="Observações" placeholder="Informações adicionais, instruções de entrega..." span={2} />
            </div>
          )
        },
      ]}
    />
  );
}

function NewDriver({ setPage, toast }: { setPage: (p: Page) => void; toast: (type: ToastType, title: string, message?: string) => void }) {
  return (
    <FormPage
      title="Novo Motorista"
      back={() => setPage("drivers")}
      onSave={() => setPage("drivers")}
      toast={toast}
      sections={[
        {
          title: "Dados Pessoais", icon: UserCheck,
          fields: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Nome Completo" placeholder="Nome do motorista" required />
              <FormField label="CPF" placeholder="000.000.000-00" required hint="Apenas números" />
              <FormField label="Telefone / WhatsApp" placeholder="(11) 99999-9999" required />
              <FormField label="Número da CNH" placeholder="00000000000" required />
              <SelectField label="Categoria da CNH" options={["A", "B", "AB", "C", "D", "E"]} required />
              <FormField label="Validade da CNH" type="date" required />
            </div>
          )
        },
        {
          title: "Veículo e Empresa", icon: Truck,
          fields: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Modelo do Veículo" placeholder="Ex: VW Constellation" required />
              <FormField label="Placa" placeholder="ABC-1D23" required />
              <SelectField label="Transportadora" options={["LogFast Transportes", "SpeedLog", "CargoBrasil", "PrimeLog"]} required />
              <SelectField label="Status Inicial" options={["Disponível", "Em Rota", "Inativo"]} required />
            </div>
          )
        },
      ]}
    />
  );
}

function NewClient({ setPage, toast }: { setPage: (p: Page) => void; toast: (type: ToastType, title: string, message?: string) => void }) {
  return (
    <FormPage
      title="Novo Cliente"
      back={() => setPage("clients")}
      onSave={() => setPage("clients")}
      toast={toast}
      sections={[
        {
          title: "Dados Empresariais", icon: Building2,
          fields: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Razão Social" placeholder="Nome da empresa" required />
              <FormField label="CNPJ" placeholder="00.000.000/0001-00" required />
              <FormField label="Nome do Responsável" placeholder="Nome completo" required />
              <FormField label="Cargo" placeholder="Ex: Gerente de Compras" />
            </div>
          )
        },
        {
          title: "Contato", icon: Phone,
          fields: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Telefone" placeholder="(11) 3000-0000" required />
              <FormField label="E-mail corporativo" placeholder="contato@empresa.com.br" type="email" required />
            </div>
          )
        },
        {
          title: "Endereço", icon: MapPin,
          fields: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Endereço" placeholder="Rua, número, complemento" required span={2} />
              <FormField label="Cidade" placeholder="São Paulo" required />
              <FormField label="Estado (UF)" placeholder="SP" required />
              <FormField label="CEP" placeholder="00000-000" required />
            </div>
          )
        },
      ]}
    />
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function SettingsPage({ toast }: { toast: (type: ToastType, title: string, message?: string) => void }) {
  const [saving, setSaving] = useState(false);
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast("success", "Configurações salvas", "Todas as alterações foram aplicadas."); }, 1000);
  };

  return (
    <div className="p-6 max-w-4xl flex flex-col gap-5">
      {[
        {
          title: "Informações da Empresa", icon: Building2,
          content: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Nome da Empresa" placeholder="LogiTrack Logística Ltda" />
              <FormField label="CNPJ" placeholder="00.000.000/0001-00" />
              <FormField label="E-mail de suporte" placeholder="suporte@logitrack.com.br" type="email" />
              <SelectField label="Fuso horário" options={["America/Sao_Paulo (GMT-3)", "America/Manaus (GMT-4)", "America/Belem (GMT-3)"]} />
            </div>
          )
        },
        {
          title: "Notificações", icon: Bell,
          content: (
            <div className="flex flex-col gap-3">
              {[
                { l: "Pedidos atrasados", s: "Receba alertas imediatos quando um pedido ultrapassar o prazo" },
                { l: "Confirmação de entrega", s: "Notificação automática ao marcar pedido como entregue" },
                { l: "Novos pedidos", s: "Alerta ao cadastrar um novo pedido no sistema" },
                { l: "Relatório semanal", s: "Resumo de desempenho toda segunda-feira às 08h" },
              ].map(({ l, s }) => (
                <div key={l} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{l}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s}</p>
                  </div>
                  <button className="w-10 h-6 rounded-full transition-all relative" style={{ backgroundColor: "#1a56db" }}>
                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all" />
                  </button>
                </div>
              ))}
            </div>
          )
        },
        {
          title: "Segurança", icon: Shield,
          content: (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Senha atual" type="password" placeholder="••••••••" />
                <FormField label="Nova senha" type="password" placeholder="••••••••" />
                <FormField label="Confirmar nova senha" type="password" placeholder="••••••••" />
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-2">
                <Shield size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">Autenticação em dois fatores está <strong>ativa</strong>. Sua conta está protegida.</p>
              </div>
            </div>
          )
        },
      ].map(section => (
        <div key={section.title} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2 bg-muted/20">
            <section.icon size={14} className="text-blue-600" />
            <h3 className="text-sm font-bold text-foreground">{section.title}</h3>
          </div>
          <div className="p-5">{section.content}</div>
        </div>
      ))}

      <div className="flex justify-end">
        <Btn loading={saving} onClick={handleSave} icon={saving ? undefined : Check}>
          {saving ? "Salvando..." : "Salvar configurações"}
        </Btn>
      </div>
    </div>
  );
}

// ─── Page Config ──────────────────────────────────────────────────────────────

const PAGE_META: Record<Page, { title: string; sub?: string; breadcrumb?: string[] }> = {
  login:        { title: "" },
  dashboard:    { title: "Dashboard", sub: "Visão geral — Jun 2024" },
  orders:       { title: "Pedidos", sub: "Gestão de entregas" },
  "order-detail": { title: "Detalhes do Pedido", breadcrumb: ["Pedidos"] },
  tracking:     { title: "Rastreamento", sub: "Monitoramento em tempo real" },
  drivers:      { title: "Motoristas", sub: "Gestão de frota" },
  clients:      { title: "Clientes", sub: "Base de clientes" },
  reports:      { title: "Relatórios", sub: "Análise operacional" },
  settings:     { title: "Configurações" },
  "new-order":  { title: "Novo Pedido", breadcrumb: ["Pedidos"] },
  "new-driver": { title: "Novo Motorista", breadcrumb: ["Motoristas"] },
  "new-client": { title: "Novo Cliente", breadcrumb: ["Clientes"] },
};

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>("login");
  const [collapsed, setCollapsed] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order>(ORDERS[0]);
  const { toasts, add: addToast, remove: removeToast } = useToast();

  const toast = useCallback((type: ToastType, title: string, message?: string) => addToast(type, title, message), [addToast]);

  if (page === "login") return <Login onLogin={() => setPage("dashboard")} />;

  const meta = PAGE_META[page];

  return (
    <div className="flex h-screen overflow-hidden bg-background" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <ToastContainer toasts={toasts} remove={removeToast} />
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title={meta.title}
          sub={meta.sub}
          breadcrumb={meta.breadcrumb?.map(b => ({
            label: b,
            onClick: () => setPage(b === "Pedidos" ? "orders" : b === "Motoristas" ? "drivers" : "clients")
          }))}
        />
        <main className="flex-1 overflow-y-auto bg-background">
          {page === "dashboard"    && <Dashboard setPage={setPage} setSelectedOrder={setSelectedOrder} toast={toast} />}
          {page === "orders"       && <Orders setPage={setPage} setSelectedOrder={setSelectedOrder} toast={toast} />}
          {page === "order-detail" && <OrderDetail order={selectedOrder} setPage={setPage} toast={toast} />}
          {page === "tracking"     && <Tracking toast={toast} />}
          {page === "drivers"      && <Drivers setPage={setPage} toast={toast} />}
          {page === "clients"      && <Clients setPage={setPage} toast={toast} />}
          {page === "reports"      && <Reports toast={toast} />}
          {page === "settings"     && <SettingsPage toast={toast} />}
          {page === "new-order"    && <NewOrder setPage={setPage} toast={toast} />}
          {page === "new-driver"   && <NewDriver setPage={setPage} toast={toast} />}
          {page === "new-client"   && <NewClient setPage={setPage} toast={toast} />}
        </main>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser
} from "firebase/auth";
import { db, auth } from "../firebase";
import { Registration, PaymentStatus } from "../types";
import {
  Users,
  Search,
  TrendingUp,
  Calendar,
  Smartphone,
  Mail,
  Trash2,
  Loader2,
  DollarSign,
  Download,
  ShieldCheck,
  RefreshCw,
  Lock,
  LogOut,
  AlertCircle
} from "lucide-react";

function StatusBadge({ status }: { status: PaymentStatus }) {
  const styles: Record<PaymentStatus, string> = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    underpaid: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium border uppercase ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

export default function AdminPanel() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // --- Admin auth gate ---
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      setLoginPassword("");
    } catch (err: any) {
      setLoginError("Invalid credentials or unauthorized account.");
      console.warn("Admin login failed:", err?.code || err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setRegistrations([]);
  };

  const fetchRegistrations = async () => {
    setIsRefreshing(true);
    try {
      const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data: Registration[] = [];
      querySnapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Registration);
      });
      setRegistrations(data);
    } catch (error) {
      console.error("Error fetching registrations: ", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchRegistrations();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this registration record?")) return;
    try {
      await deleteDoc(doc(db, "registrations", id));
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) return;
    
    const headers = ["ID", "Full Name", "Email", "Phone", "Quantity", "Amount", "Currency", "Status", "Ref", "Method", "Date"];
    const rows = registrations.map((r) => [
      r.id || "",
      `"${r.fullName.replace(/"/g, '""')}"`,
      r.email,
      r.phone,
      r.quantity || 1,
      r.amount ?? "",
      r.currency ?? "",
      r.paymentStatus,
      r.reference ?? "",
      r.paymentMethod,
      r.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `two_men_one_naira_buyers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = registrations.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.fullName.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term) ||
      r.phone.toLowerCase().includes(term) ||
      (r.reference || "").toLowerCase().includes(term)
    );
  });

  // Only confirmed (paid) registrations count toward revenue.
  const paid = registrations.filter((r) => r.paymentStatus === "success");
  const totalRevenue = paid.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const revenueCurrency = paid.find((r) => r.currency)?.currency || "";

  // Wait until Firebase resolves the current session before deciding what to show
  if (!authChecked) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        <span className="text-xs text-stone-400 font-mono">Checking admin session...</span>
      </div>
    );
  }

  // GATE: no authenticated admin → show login only, never the ledger
  if (!authUser) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-teal-950/40 via-stone-900 to-stone-900 px-6 py-5 border-b border-stone-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0 text-teal-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded font-mono font-bold tracking-wider border border-teal-500/20 uppercase">
                Restricted
              </span>
              <h3 className="text-stone-100 font-serif font-semibold text-lg mt-0.5">
                Merchant Dashboard Login
              </h3>
            </div>
          </div>

          <form onSubmit={handleLogin} className="p-6 md:p-8 space-y-5">
            <p className="text-xs text-stone-400 leading-relaxed">
              Sign in with your authorized admin account to view the sales ledger. Buyer records are protected and not publicly accessible.
            </p>

            {loginError && (
              <div className="p-3.5 bg-red-950/20 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block">Admin Email</label>
              <div className="relative">
                <input
                  required
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-11 pr-4 py-3.5 text-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder-stone-600 font-sans"
                />
                <Mail className="absolute left-4 top-4 w-4 h-4 text-stone-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block">Password</label>
              <div className="relative">
                <input
                  required
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-11 pr-4 py-3.5 text-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder-stone-600 font-mono"
                />
                <Lock className="absolute left-4 top-4 w-4 h-4 text-stone-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-stone-800 disabled:text-stone-600 text-black font-semibold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Access Sales Ledger</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">

      {/* Header section with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-400" />
            Merchant Sales Ledger
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Real-time track records from Firebase Firestore database
          </p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchRegistrations}
            disabled={isRefreshing}
            className="p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-all flex items-center gap-1.5 text-xs font-mono disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={registrations.length === 0}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:bg-stone-800 disabled:text-stone-600 text-black font-semibold rounded-xl transition-all text-xs flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-400 hover:text-red-400 hover:bg-red-500/5 transition-all flex items-center gap-1.5 text-xs font-mono"
            title={authUser?.email ? `Signed in as ${authUser.email}` : "Sign out"}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-mono block">Total Readers</span>
            <span className="text-2xl font-bold text-stone-100 font-mono mt-0.5 block">
              {loading ? "..." : registrations.length}
            </span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-mono block">Gross Revenue (paid)</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono mt-0.5 block">
              {loading ? "..." : `${revenueCurrency ? revenueCurrency + " " : ""}${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-mono block">Status Verification</span>
            <span className="text-xs font-semibold text-stone-200 mt-1 block flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Bachs API Node Online
            </span>
          </div>
        </div>

      </div>

      {/* Main Table Container */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
        
        {/* Search Bar */}
        <div className="p-4 bg-stone-950/40 border-b border-stone-800 flex items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-500" />
            <input
              type="text"
              placeholder="Search by name, email, phone or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder-stone-600"
            />
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
            <span className="text-xs text-stone-400 font-mono">Loading merchant database...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <Users className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <h4 className="text-stone-300 font-medium font-serif">No sales records found</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
              {searchTerm ? "Try adjusting your search query." : "When customers buy the book and register, their records will pop up here instantly."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-800 bg-stone-950/20 font-mono text-[10px] text-stone-400 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Reader Name</th>
                  <th className="p-4 font-semibold">Contact Info</th>
                  <th className="p-4 font-semibold">Payment Details</th>
                  <th className="p-4 font-semibold">Transaction ID</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-xs">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-950/20 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-stone-200">{item.fullName}</div>
                      <div className="text-[10px] text-stone-500 font-mono flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-stone-600" />
                        {new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="text-stone-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        <span className="select-all">{item.email}</span>
                      </div>
                      <div className="text-stone-400 flex items-center gap-1.5 font-mono text-[11px]">
                        <Smartphone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        <span className="select-all">{item.phone}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-stone-200 font-mono text-xs">
                        {item.amount != null
                          ? `${item.currency ? item.currency + " " : ""}${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : <span className="text-stone-500">—</span>}
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                        {item.quantity || 1} { (item.quantity || 1) === 1 ? "copy" : "copies" }
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <StatusBadge status={item.paymentStatus} />
                        <span className="text-[9px] bg-stone-950 text-teal-400 px-1.5 py-0.5 rounded font-mono font-medium border border-stone-800">
                          {item.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-stone-400 bg-stone-950 px-2.5 py-1 rounded select-all border border-stone-800">
                        {item.reference || "—"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id!)}
                        className="p-2 text-stone-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}

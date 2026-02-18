"use client";

import { useEffect, useState } from "react";
import { passesApi } from "@/lib/api/passes";
import { Pass } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Ban, Trash2, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const TYPE_TABS = ["ALL", "WEEKLY", "MONTHLY"] as const;
type TypeTab = (typeof TYPE_TABS)[number];
type PassWithUser = Pass & { user?: { name?: string; email?: string } };

export default function PassesPage() {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TypeTab>("ALL");

  useEffect(() => {
    loadPasses();
  }, []);

  const loadPasses = async () => {
    try {
      setLoading(true);
      const data = await passesApi.getAll();
      setPasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load passes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await passesApi.updateStatus(id, status);
      await loadPasses();
    } catch (error) {
      console.error("Failed to update pass status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pass?")) return;
    try {
      await passesApi.delete(id);
      await loadPasses();
    } catch (error) {
      console.error("Failed to delete pass:", error);
    }
  };

  const filteredPasses = passes.filter((pass) => {
    const user = (pass as PassWithUser).user;
    const matchesSearch =
      (user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      pass.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "ALL" || pass.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Travel Passes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage weekly and monthly active passes ({passes.length} total)
          </p>
        </div>
      </div>

      {/* Type filter tabs */}
      <div className="mb-4 flex gap-2">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === tab
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by user name, email, or pass type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-lg border bg-white dark:bg-gray-800 shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pass Type</TableHead>
              <TableHead>Passenger</TableHead>
              <TableHead>Purchase Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredPasses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  No passes found
                </TableCell>
              </TableRow>
            ) : (
              filteredPasses.map((pass) => {
                const user = (pass as PassWithUser).user;
                return (
                  <TableRow key={pass.id}>
                    <TableCell className="font-medium">
                      <Badge
                        variant={
                          pass.type === "MONTHLY" ? "default" : "secondary"
                        }
                      >
                        {pass.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user ? (
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-gray-400">
                          {pass.userId.substring(0, 8)}...
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(pass.purchaseDate), "PPP")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(pass.expiryDate), "PPP")}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("rw-RW", {
                        style: "currency",
                        currency: "RWF",
                      }).format(pass.price)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          pass.status === "ACTIVE" ? "default" : "destructive"
                        }
                      >
                        {pass.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {pass.status === "ACTIVE" ? (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                handleStatusUpdate(pass.id, "EXPIRED")
                              }
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(pass.id, "ACTIVE")
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(pass.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

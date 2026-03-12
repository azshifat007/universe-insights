import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { OverviewTab } from "@/components/admin/OverviewTab";
import { UniversityManagerTab } from "@/components/admin/UniversityManagerTab";
import { AlgorithmSettingsTab } from "@/components/admin/AlgorithmSettingsTab";
import { NewsManagerTab } from "@/components/admin/NewsManagerTab";
import { NoticeManagerTab } from "@/components/admin/NoticeManagerTab";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }
    if (!loading && user && !isAdmin) {
      toast({ title: "Permission Denied", description: "You don't have admin access.", variant: "destructive" });
      navigate("/");
    }
  }, [loading, user, isAdmin, navigate, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b bg-card/50 backdrop-blur-sm px-4 gap-3">
            <SidebarTrigger />
            <h1 className="font-display font-bold text-lg">Admin Dashboard</h1>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "universities" && <UniversityManagerTab />}
            {activeTab === "algorithm" && <AlgorithmSettingsTab />}
            {activeTab === "news" && <NewsManagerTab />}
            {activeTab === "notices" && <NoticeManagerTab />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;

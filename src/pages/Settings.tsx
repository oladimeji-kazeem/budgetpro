import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RegionsTab from "@/components/settings/RegionsTab";
import StatesTab from "@/components/settings/StatesTab";
import LocationsTab from "@/components/settings/LocationsTab";
import DepartmentsTab from "@/components/settings/DepartmentsTab";
import FundsTab from "@/components/settings/FundsTab";
import SectorsTab from "@/components/settings/SectorsTab";
import AccountsTab from "@/components/settings/AccountsTab";
import ScenariosTab from "@/components/settings/ScenariosTab";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage setup tables, master data, and system configurations
        </p>
      </div>

      <Tabs defaultValue="regions" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="funds">Funds</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="regions" className="mt-6">
          <RegionsTab />
        </TabsContent>

        <TabsContent value="states" className="mt-6">
          <StatesTab />
        </TabsContent>

        <TabsContent value="locations" className="mt-6">
          <LocationsTab />
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <DepartmentsTab />
        </TabsContent>

        <TabsContent value="funds" className="mt-6">
          <FundsTab />
        </TabsContent>

        <TabsContent value="sectors" className="mt-6">
          <SectorsTab />
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          <AccountsTab />
        </TabsContent>

        <TabsContent value="scenarios" className="mt-6">
          <ScenariosTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

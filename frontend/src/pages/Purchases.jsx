import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function Purchases() {
  // This would be replaced with actual data from your API
  const purchases = [
    { id: 1, supplier: "ABC Supplies", date: "2023-04-15", status: "Received", total: "$450.00" },
    { id: 2, supplier: "XYZ Distributors", date: "2023-04-14", status: "In Transit", total: "$320.50" },
    { id: 3, supplier: "Global Imports", date: "2023-04-13", status: "Ordered", total: "$780.75" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Purchases</h1>
        <p className="text-muted-foreground">Manage your supplier purchases</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Purchases</CardTitle>
          <CardDescription>View and manage your recent purchases</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Purchase ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>#{purchase.id}</TableCell>
                  <TableCell>{purchase.supplier}</TableCell>
                  <TableCell>{purchase.date}</TableCell>
                  <TableCell>{purchase.status}</TableCell>
                  <TableCell className="text-right">{purchase.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 
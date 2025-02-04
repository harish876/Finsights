import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
};

type TransactionsSummaryProps = {
  transactions: Transaction[];
};

export function TransactionsSummary({
  transactions,
}: TransactionsSummaryProps) {
  return (
    <div className="p-4 overflow-auto h-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.date}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{transaction.amount.toFixed(2)}</TableCell>
              <TableCell>{transaction.category}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

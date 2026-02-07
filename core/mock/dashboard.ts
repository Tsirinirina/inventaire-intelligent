export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  type: "income" | "expense";
  category: string;
  date: string;
  icon: string;
}

export interface WalletCard {
  id: string;
  name: string;
  number: string;
  balance: string;
  type: "visa" | "mastercard";
  color: string;
}

export const recentTransactions: Transaction[] = [
  {
    id: "1",
    title: "Apple Store",
    subtitle: "Electronics",
    amount: "-$999.00",
    type: "expense",
    category: "shopping",
    date: "Today",
    icon: "laptop",
  },
  {
    id: "2",
    title: "Salary Deposit",
    subtitle: "Monthly Pay",
    amount: "+$8,450.00",
    type: "income",
    category: "salary",
    date: "Today",
    icon: "briefcase",
  },
  {
    id: "3",
    title: "Netflix",
    subtitle: "Entertainment",
    amount: "-$15.99",
    type: "expense",
    category: "subscription",
    date: "Yesterday",
    icon: "tv",
  },
  {
    id: "4",
    title: "Uber Ride",
    subtitle: "Transportation",
    amount: "-$24.50",
    type: "expense",
    category: "transport",
    date: "Yesterday",
    icon: "car",
  },
  {
    id: "5",
    title: "Freelance Payment",
    subtitle: "Design Work",
    amount: "+$1,200.00",
    type: "income",
    category: "freelance",
    date: "Feb 4",
    icon: "palette",
  },
  {
    id: "6",
    title: "Spotify",
    subtitle: "Entertainment",
    amount: "-$9.99",
    type: "expense",
    category: "subscription",
    date: "Feb 3",
    icon: "music",
  },
  {
    id: "7",
    title: "Whole Foods",
    subtitle: "Groceries",
    amount: "-$87.30",
    type: "expense",
    category: "grocery",
    date: "Feb 3",
    icon: "shopping-cart",
  },
  {
    id: "8",
    title: "Investment Return",
    subtitle: "Stock Dividend",
    amount: "+$340.00",
    type: "income",
    category: "investment",
    date: "Feb 2",
    icon: "trending-up",
  },
];

export const walletCards: WalletCard[] = [
  {
    id: "1",
    name: "Personal Card",
    number: "•••• •••• •••• 4892",
    balance: "$12,580.40",
    type: "visa",
    color: "#00D09E",
  },
  {
    id: "2",
    name: "Business Card",
    number: "•••• •••• •••• 7231",
    balance: "$34,210.00",
    type: "mastercard",
    color: "#5B7BF5",
  },
];

export const monthlyExpenses = [
  { label: "Jan", value: 2400 },
  { label: "Feb", value: 1800 },
  { label: "Mar", value: 3200 },
  { label: "Apr", value: 2800 },
  { label: "May", value: 2100 },
  { label: "Jun", value: 3500 },
];

export const spendingCategories = [
  { name: "Shopping", amount: "$2,340", percent: 35, color: "#5B7BF5" },
  { name: "Food & Drink", amount: "$1,230", percent: 25, color: "#00D09E" },
  { name: "Transport", amount: "$890", percent: 15, color: "#FFB347" },
  { name: "Entertainment", amount: "$650", percent: 12, color: "#9B6DFF" },
  { name: "Bills", amount: "$430", percent: 8, color: "#FF5A65" },
  { name: "Other", amount: "$260", percent: 5, color: "#64748B" },
];

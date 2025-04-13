import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RecentSales() {
  return (
    <div className="space-y-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://avatar.vercel.sh/user${i}.png`} alt="Avatar" />
            <AvatarFallback>U{i}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">User {i}</p>
            <p className="text-sm text-muted-foreground">user{i}@example.com</p>
          </div>
          <div className="ml-auto font-medium">
            +${Math.floor(Math.random() * 1000)}.00
          </div>
        </div>
      ))}
    </div>
  );
} 
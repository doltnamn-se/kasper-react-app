import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="text-xl font-bold text-primary">YourApp</div>
        <div className="flex gap-4">
          <Button variant="ghost">About</Button>
          <Button variant="ghost">Features</Button>
          <Button variant="ghost">Contact</Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;